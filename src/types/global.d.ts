interface QRCode {
  new (element: HTMLElement | string, options: {
    text: string
    width: number
    height: number
    colorDark?: string
    colorLight?: string
    correctLevel?: number
  }): QRCode
  CorrectLevel: { H: number; L: number; M: number; Q: number }
}

interface html2canvasOptions {
  backgroundColor?: string
  scale?: number
  useCORS?: boolean
  logging?: boolean
}

declare function html2canvas(element: HTMLElement, options?: html2canvasOptions): Promise<HTMLCanvasElement>

declare var QRCode: QRCode
