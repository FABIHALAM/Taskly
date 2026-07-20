import { useState, useEffect } from 'react'
import { User, Shield, Briefcase, Mail, CheckCircle, Clock, Crown, UserCheck, Sparkles } from 'lucide-react'
import DashboardLayout from '../layout/DashboardLayout'
import { getDashboardAnalytics } from '../services/analyticsService'
import { motion } from 'framer-motion'

function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats, setStats] = useState(null)
  const isManager = user.role === 'manager' || user.role === 'admin'

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <Sparkles size={12} />
            <span>User Identity</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">User Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Account information, role permissions, and productivity metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar & Roles Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-line rounded-3xl p-7 flex flex-col items-center text-center shadow-sm relative overflow-hidden"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 border-4 border-surface shadow-xl flex items-center justify-center text-white text-3xl font-extrabold font-display mb-4">
              {userInitial}
            </div>
            <h2 className="font-display font-extrabold text-xl text-ink">{user.name || 'User'}</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</p>

            <div className="mt-5">
              {isManager ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
                  <Crown size={12} /> Manager Role
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
                  <UserCheck size={12} /> Member Role
                </span>
              )}
            </div>
          </motion.div>

          {/* Details & Performance Card */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-surface border border-line rounded-3xl p-7 shadow-sm"
            >
              <h3 className="font-display font-bold text-base text-ink mb-4">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Full Name</span>
                  <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-ink">
                    <User size={14} className="text-indigo-500" />
                    <span>{user.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Email Address</span>
                  <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-ink">
                    <Mail size={14} className="text-indigo-500" />
                    <span>{user.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Workspace Role</span>
                  <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-ink">
                    <Briefcase size={14} className="text-indigo-500" />
                    <span>{user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Project Manager' : 'Team Member'}</span>
                  </div>
                </div>

                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Account Status</span>
                  <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-emerald-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active & Verified</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Performance metrics */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface border border-line rounded-3xl p-7 shadow-sm"
            >
              <h3 className="font-display font-bold text-base text-ink mb-4">Task Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <CheckCircle size={22} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-3xl font-extrabold font-display text-ink">
                    {stats?.byStatus?.['Done'] || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Completed Tasks</p>
                </div>

                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <Clock size={22} className="text-indigo-500 mx-auto mb-2" />
                  <p className="text-3xl font-extrabold font-display text-ink">
                    {stats?.totalTasksAssigned || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Assigned Tasks</p>
                </div>

                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <Clock size={22} className="text-rose-500 mx-auto mb-2" />
                  <p className="text-3xl font-extrabold font-display text-ink">
                    {stats?.overdueTasks?.length || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Overdue Tasks</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile