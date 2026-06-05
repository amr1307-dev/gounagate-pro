type Stats = {
  total: number
  todayCount: number
  completed: number
}

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Bookings"
        value={stats.total}
        icon="📊"
        color="text-[#0A6E74]"
        bg="bg-teal-50"
      />
      <StatCard
        label="Today"
        value={stats.todayCount}
        icon="📅"
        color="text-blue-600"
        bg="bg-blue-50"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        icon="✅"
        color="text-emerald-600"
        bg="bg-emerald-50"
      />
      <StatCard
        label="Upcoming"
        value={stats.total - stats.completed}
        icon="🟢"
        color="text-amber-600"
        bg="bg-amber-50"
      />
    </div>
  )
}

function StatCard({ label, value, icon, color, bg }: { label: string; value: number; icon: string; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-slate-100`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  )
}
