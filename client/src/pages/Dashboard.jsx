import { FolderKanban, Clock, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '../layout/DashboardLayout'

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const weeklyProgress = 68 // sample value — Phase 2 mein real data se aayega

  const circumference = 2 * Math.PI * 34
  const offset = circumference - (weeklyProgress / 100) * circumference

  const stats = [
    { label: 'Active Projects', value: '0', icon: FolderKanban, color: 'text-primary' },
    { label: 'Due Today', value: '0', icon: Clock, color: 'text-brass' },
    { label: 'Completed This Week', value: '0', icon: CheckCircle2, color: 'text-mint' },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        {/* Greeting + progress ring */}
        <div className="bg-surface border border-line rounded-2xl p-6 flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              Good to see you, {user.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Here's what's happening across your workspace.
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="var(--color-line)" strokeWidth="6" fill="none" />
              <circle
                cx="40" cy="40" r="34"
                stroke="var(--color-primary)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-display text-sm font-semibold">{weeklyProgress}%</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-surface border border-line rounded-xl p-5">
                <Icon className={stat.color} size={20} />
                <p className="font-display text-2xl font-semibold mt-3">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Empty state for projects */}
        <div className="bg-surface border border-line rounded-2xl p-10 text-center">
          <FolderKanban className="mx-auto text-gray-300" size={32} />
          <h3 className="font-display font-semibold mt-3">No projects yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create your first project to start organizing tasks.
          </p>
          <button className="mt-4 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Create Project
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard