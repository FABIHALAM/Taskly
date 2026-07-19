import { useState, useEffect } from 'react'
import { User, Shield, Briefcase, Mail, CheckCircle, Clock } from 'lucide-react'
import DashboardLayout from '../layout/DashboardLayout'
import { getDashboardAnalytics } from '../services/analyticsService'

function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardAnalytics()
        setStats(res.data)
      } catch (err) {
        console.error('Failed to load user statistics', err)
      }
    }
    fetchStats()
  }, [])

  const userInitial = user.name ? user.name[0].toUpperCase() : 'U'

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl font-bold tracking-tight mb-6">User Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar & Roles Card */}
          <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary text-3xl font-bold font-display mb-4">
              {userInitial}
            </div>
            <h2 className="font-display font-semibold text-lg">{user.name || 'User'}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>

            <span className="flex items-center gap-1.5 mt-4 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
              <Shield size={12} />
              {user.role || 'Member'}
            </span>
          </div>

          {/* Details & Performance Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-line rounded-xl bg-canvas">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Full Name</span>
                  <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                    <User size={14} className="text-gray-400" />
                    <span>{user.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3 border border-line rounded-xl bg-canvas">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Email Address</span>
                  <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                    <Mail size={14} className="text-gray-400" />
                    <span>{user.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3 border border-line rounded-xl bg-canvas">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Workspace Role</span>
                  <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                    <Briefcase size={14} className="text-gray-400" />
                    <span>{user.role === 'admin' ? 'Administrator' : 'Standard Member'}</span>
                  </div>
                </div>

                <div className="p-3 border border-line rounded-xl bg-canvas">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">System Status</span>
                  <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance metrics */}
            <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold mb-4">Task Performance Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border border-line rounded-xl">
                  <CheckCircle size={20} className="text-mint mx-auto mb-2" />
                  <p className="text-2xl font-bold font-display">
                    {stats?.byStatus?.['Done'] || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Completed Tasks</p>
                </div>

                <div className="p-4 border border-line rounded-xl">
                  <Clock size={20} className="text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold font-display">
                    {stats?.totalTasksAssigned || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Assigned Tasks</p>
                </div>

                <div className="p-4 border border-line rounded-xl">
                  <Clock size={20} className="text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold font-display">
                    {stats?.overdueCount || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Overdue Tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile