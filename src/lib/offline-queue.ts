const DB_NAME = 'gounagate-offline'
const DB_VERSION = 1
const STORE = 'checkin-queue'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export type QueueItem = {
  id?: number
  bookingId: string
  guestName: string
  scannedBy: string
  queuedAt: string
}

export async function enqueueCheckIn(item: Omit<QueueItem, 'queuedAt'>): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add({ ...item, queuedAt: new Date().toISOString() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getQueue(): Promise<QueueItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function removeFromQueue(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function syncQueue(processItem: (item: QueueItem) => Promise<boolean>): Promise<{ synced: number; failed: number }> {
  const queue = await getQueue()
  let synced = 0
  let failed = 0

  for (const item of queue) {
    try {
      const ok = await processItem(item)
      if (ok) {
        await removeFromQueue(item.id!)
        synced++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return { synced, failed }
}
