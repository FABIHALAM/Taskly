import { useState, useEffect } from 'react'
import { FolderKanban, Clock, CheckCircle2, Plus, Calendar, AlertTriangle, ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import DashboardLayout from '../layout/DashboardLayout'
import { getRecentActivity } from '../services/activityService'
import { getDashboardAnalytics } from '../services/analyticsService'
import { getMyProjects, createProject } from '../services/projectService'
import CreateProjectModal from '../components/CreateProjectModal'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isManager = user.role === 'manager' || user.role === 'admin'

  const [activities, setActivities] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [projects, setProjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const [activityRes, analyticsRes, projectsRes] = await Promise.all([
        getRecentActivity(),
        getDashboardAnalytics(),
        getMyProjects(),
      ])

      setActivities(activityRes.data || [])
      setAnalytics(analyticsRes.data || null)
      setProjects(projectsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch dashboard statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleCreateProject = async (data) => {
    try {
      await createProject(data)
      toast.success('Project created successfully!')
      setIsModalOpen(false)
      fetchDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project')
    }
  }

  const completedCount = analytics?.byStatus?.['Done'] || 0
  const assignedCount = analytics?.totalTasksAssigned || 0
  const weeklyProgress = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0

  const circumference = 2 * Math.PI * 34
  const offset = circumference - (weeklyProgress / 100) * circumference

  const actionLabels = {
    task_created: 'created a task',
    task_status_changed: 'updated task status',
    task_deleted: 'deleted a task',
    project_created: 'created a project',
    project_updated: 'updated a project',
    member_added: 'added a team member',
    comment_added: 'commented on a task',
  }

  const stats = [
    {
      label: 'Active Projects',
      value: projects.length.toString(),
      icon: FolderKanban,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'My Assigned Tasks',
      value: assignedCount.toString(),
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Overdue Tasks',
      value: (analytics?.overdueTasks?.length || 0).toString(),
      icon: Clock,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface border border-line rounded-3xl p-7 flex items-center justify-between shadow-sm relative overflow-hidden group"
        >
          {/* Subtle Ambient Accent Gradient */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-500" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3">
              <Sparkles size={12} />
              <span>Workspace Overview</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
              Welcome back, {user.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
              Track project progress, review assigned tasks, and monitor workspace activity.
            </p>
          </div>

          {/* Radial Completion Meter */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0 z-10">
            <svg className="w-24 h-24 -rotate-90">
              <circle cx="48" cy="48" r="38" stroke="var(--color-line)" strokeWidth="7" fill="none" />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="url(#progress-gradient)"
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference + 25}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="font-display text-base font-extrabold text-ink block leading-none">{weeklyProgress}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Done</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * idx }}
                className="bg-surface border border-line rounded-2xl p-5 flex items-center justify-between shadow-sm glow-card"
              >
                <div>
                  <p className="text-3xl font-extrabold font-display tracking-tight text-ink">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
                <div className={`p-3.5 rounded-2xl border ${stat.color} shadow-sm`}>
                  <Icon size={22} />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Overdue Tasks Warning Banner */}
        {analytics?.overdueTasks && analytics.overdueTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <AlertTriangle size={18} className="animate-pulse" />
                <span>Action Required: {analytics.overdueTasks.length} Overdue Task(s)</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.overdueTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/projects/${task.projectId || projects[0]?._id || ''}/tasks/${task.id}`)}
                  className="bg-surface border border-rose-500/20 rounded-xl p-3.5 hover:shadow-md cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="pr-3">
                    <p className="text-xs font-bold text-ink group-hover:text-indigo-500 transition-colors line-clamp-1">{task.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{task.project || 'Project'}</p>
                  </div>
                  <span className="text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full shrink-0">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Projects Display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-bold text-lg text-ink">Active Projects</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Projects you are leading or assigned to</p>
                </div>
                {isManager && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    <Plus size={14} /> New Project
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-line rounded-2xl bg-canvas">
                  <FolderKanban className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={36} />
                  <h4 className="text-sm font-bold text-ink">No Active Projects</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isManager ? 'Create your first project to start organizing tasks.' : 'Ask your manager to invite you to a project.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.slice(0, 4).map((p) => (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/projects/${p._id}`)}
                      className="border border-line rounded-2xl p-4.5 hover:shadow-lg transition-all cursor-pointer bg-canvas border-l-4 border-l-indigo-500 group glow-card"
                    >
                      <h4 className="font-bold text-sm text-ink truncate group-hover:text-indigo-500 transition-colors">{p.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[2rem]">
                        {p.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-3 text-[11px] font-semibold text-slate-400 border-t border-line">
                        <span>👥 {p.members?.length || 1} members</span>
                        <div className="flex items-center gap-1 text-indigo-500 group-hover:translate-x-1 transition-transform">
                          <span>View Board</span>
                          <ArrowRight size={11} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks Due Soon */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-500" />
                  Upcoming Tasks (Due Soon)
                </h3>
              </div>
              {!analytics?.dueSoonTasks || analytics.dueSoonTasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 border border-dashed border-line rounded-2xl bg-canvas italic">
                  No tasks due in the next 3 days. Good job!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {analytics.dueSoonTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/projects/${task.projectId || projects[0]?._id || ''}/tasks/${task.id}`)}
                      className="flex items-center justify-between p-3.5 border border-line rounded-2xl hover:shadow-sm cursor-pointer transition-all bg-canvas hover:border-indigo-500/30 group"
                    >
                      <div>
                        <p className="text-xs font-bold text-ink group-hover:text-indigo-500 transition-colors">{task.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{task.project || 'Project'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full shrink-0">
                        <Calendar size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Stream Sidebar */}
          <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="font-display font-bold text-base text-ink mb-4">Workspace Activity</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10 border border-dashed border-line rounded-2xl bg-canvas italic">
                No recent activities reported yet.
              </p>
            ) : (
              <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-line">
                {activities.slice(0, 8).map((log) => (
                  <div key={log._id} className="text-xs flex gap-3 items-start relative pl-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-surface absolute left-0 top-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-600 dark:text-slate-300 leading-snug">
                        <span className="font-bold text-ink">{log.performedBy?.name || 'Someone'}</span>{' '}
                        {actionLabels[log.action] || log.action}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">
                        {new Date(log.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </DashboardLayout>
  )
}

export default Dashboard