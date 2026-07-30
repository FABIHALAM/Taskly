import { useState, useEffect } from 'react'
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  Plus,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  User,
  Search,
  Play,
  Pause,
  Activity,
  CheckSquare,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import DashboardLayout from '../layout/DashboardLayout'
import { getRecentActivity } from '../services/activityService'
import { getDashboardAnalytics } from '../services/analyticsService'
import { getMyProjects, createProject } from '../services/projectService'
import CreateProjectModal from '../components/CreateProjectModal'
import api from '../services/api'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'
  const isManager = user.role === 'manager'
  const canCreateProject = isManager

  const [activities, setActivities] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [projects, setProjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Time Tracker state
  const [isTracking, setIsTracking] = useState(false)
  const [trackedTime, setTrackedTime] = useState(0)

  const fetchDashboardData = async () => {
    try {
      let projectsPromise = getMyProjects()
      if (isAdmin) {
        // Admin sees all workspace projects
        projectsPromise = api.get('/projects/admin/all').catch(() => getMyProjects())
      }
      const [activityRes, analyticsRes, projectsRes] = await Promise.all([
        getRecentActivity(),
        getDashboardAnalytics(),
        projectsPromise,
      ])

      setActivities(activityRes.data || [])
      setAnalytics(analyticsRes.data || null)
      setProjects(projectsRes.data?.data || projectsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch dashboard statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Stopwatch Interval
  useEffect(() => {
    let interval = null
    if (isTracking) {
      interval = setInterval(() => {
        setTrackedTime((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTracking])

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

  const formatStopwatch = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    const secs = totalSec % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getWeekDays = () => {
    const today = new Date()
    const days = []
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push({
        name: day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
        date: day.getDate(),
        isToday: day.toDateString() === today.toDateString(),
      })
    }
    return days
  }

  const completedCount = analytics?.byStatus?.['Done'] || 0
  const assignedCount = analytics?.totalTasksAssigned || 0
  const weeklyProgress = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0

  const actionLabels = {
    task_created: 'created a task',
    task_status_changed: 'updated task status',
    task_deleted: 'deleted a task',
    project_created: 'created a project',
    project_updated: 'updated a project',
    member_added: 'added a team member',
    comment_added: 'commented on a task',
  }

  // Filter projects by search
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Dummy team initials to stack avatars
  const avatarInitials = ['AJ', 'BS', 'DL', 'MK', 'AW']

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2 COLUMNS: Main Dashboard Controls */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 space-y-6"
          >

            {/* Greeting Header Hero (Dribbble High Contrast style with Cyber Gradient) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-line rounded-3xl p-7 flex items-center justify-between shadow-sm relative overflow-hidden group border-l-4 border-l-indigo-500"
            >
              <div className="relative z-10 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-bold mb-3">
                  <Sparkles size={12} />
                  <span>{isAdmin ? 'System Workspace Oversight' : 'Personal Workspace'}</span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
                  Hello, {user.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {isAdmin
                    ? `Monitoring all workspace projects, team logs, and system automations.`
                    : `You have got ${assignedCount} active task${assignedCount !== 1 ? 's' : ''} assigned to you today.`}
                </p>
              </div>

              {/* Weekly progress circle in header (Indigo to Cyan gradient) */}
              {!isAdmin && (
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0 z-10 hidden sm:flex">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle cx="48" cy="48" r="38" stroke="var(--color-line)" strokeWidth="6" fill="none" />
                    <circle
                      cx="48"
                      cy="48"
                      r="38"
                      stroke="url(#header-progress-grad)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 - (weeklyProgress / 100) * 2 * Math.PI * 38}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="header-progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <span className="font-display text-base font-extrabold text-ink block leading-none">{weeklyProgress}%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Done</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Clean Interactive Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search projects by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-line rounded-2xl pl-12 pr-4 py-3 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            {/* Active Projects Directory (High Contrast Elevated Cards) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-ink">Active Projects</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Projects and sprint workspaces</p>
                </div>
                {canCreateProject && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer animate-none"
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
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-line rounded-3xl bg-surface">
                  <FolderKanban className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={36} />
                  <h4 className="text-sm font-bold text-ink">No Active Projects</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {canCreateProject ? 'Create your first project to start organizing tasks.' : isAdmin ? 'No projects in workspace.' : 'Ask your manager to invite you.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredProjects.slice(0, 4).map((p, idx) => {
                    const projectProgress = 35 + (idx * 25) % 65 // Dynamic presentation progress bar
                    return (
                      <div
                        key={p._id}
                        onClick={() => navigate(`/projects/${p._id}`)}
                        className="bg-surface border border-line rounded-3xl p-5 hover:shadow-xl transition-all cursor-pointer group glow-card relative overflow-hidden shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-display font-extrabold text-sm text-ink truncate group-hover:text-indigo-500 transition-colors">
                            {p.name}
                          </h4>
                          <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem] leading-relaxed">
                          {p.description || 'No description provided.'}
                        </p>

                        {/* Stacking Member Avatars (Overlapping circle style) */}
                        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-line/65">
                          <div className="flex -space-x-2.5 overflow-hidden">
                            {avatarInitials.slice(0, 3 + idx % 3).map((initial, i) => (
                              <div
                                key={initial}
                                className={`w-6 h-6 rounded-full border border-surface flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${
                                  i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-cyan-500' : 'bg-emerald-500'
                                }`}
                              >
                                {initial}
                              </div>
                            ))}
                          </div>

                          {/* Progress Line bar (Indigo to Cyan gradient) */}
                          <div className="w-1/2 flex flex-col gap-1 items-end">
                            <span className="text-[10px] font-bold text-slate-400">{projectProgress}% Done</span>
                            <div className="w-full h-1 bg-line/80 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                                style={{ width: `${projectProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Tasks Due Soon / Critical Alerts */}
            {analytics?.overdueTasks && analytics.overdueTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle size={15} className="animate-pulse" />
                  <span>Action Required: {analytics.overdueTasks.length} Overdue Task(s)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analytics.overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/projects/${task.projectId || projects[0]?._id || ''}/tasks/${task.id}`)}
                      className="bg-surface border border-rose-500/15 rounded-2xl p-3.5 hover:shadow-md cursor-pointer flex items-center justify-between transition-all group shadow-sm"
                    >
                      <div className="pr-3">
                        <p className="text-xs font-bold text-ink group-hover:text-indigo-500 transition-colors line-clamp-1">{task.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{task.project || 'Project'}</p>
                      </div>
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full shrink-0">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Upcoming Schedule/Tasks Due Soon */}
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-lg text-ink flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" />
                Upcoming Deadlines
              </h3>
              {!analytics?.dueSoonTasks || analytics.dueSoonTasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 border border-dashed border-line rounded-3xl bg-surface italic shadow-sm">
                  No tasks due in the next 3 days. Clean sheet!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {analytics.dueSoonTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/projects/${task.projectId || projects[0]?._id || ''}/tasks/${task.id}`)}
                      className="flex items-center justify-between p-4 border border-line rounded-3xl hover:shadow-md cursor-pointer transition-all bg-surface hover:border-indigo-500/30 group shadow-sm"
                    >
                      <div>
                        <p className="text-xs font-bold text-ink group-hover:text-indigo-500 transition-colors">{task.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{task.project || 'Project'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full shrink-0">
                        <Calendar size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>

          {/* RIGHT 1 COLUMN: Utility Widgets & Calendar */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >

            {/* Widget 1: Profile Card */}
            <div className="bg-surface border border-line rounded-3xl p-5 shadow-sm flex flex-col items-center text-center space-y-3 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/25">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-ink">{user.name || 'User'}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{user.email || ''}</p>
              </div>

              {/* Role badge */}
              <div className="inline-flex items-center gap-1 text-[9px] font-extrabold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <ShieldCheck size={11} /> {user.role === 'admin' ? 'SUPER ADMIN' : user.role === 'manager' ? 'MANAGER' : 'DEVELOPER'}
              </div>
            </div>

            {/* Widget 2: Project Time Tracker Stopwatch */}
            <div className="bg-surface border border-line rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-4 h-4 transition-colors ${isTracking ? 'text-emerald-500 animate-pulse' : 'text-indigo-500'}`} />
                  <h4 className="font-display font-bold text-xs text-ink">Project Time Tracker</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  {isTracking && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-all ${
                    isTracking
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                  }`}>
                    {formatStopwatch(trackedTime)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {!isTracking ? (
                  <button
                    onClick={() => setIsTracking(true)}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-[10px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10"
                  >
                    <Play size={12} /> Start Tracking
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTracking(false)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pause size={12} /> Stop Timer
                  </button>
                )}
              </div>
            </div>

            {/* Widget 3: Horizontal Weekly Calendar */}
            <div className="bg-surface border border-line rounded-3xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-xs text-ink">Work Schedule</h4>
                <span className="text-[10px] text-slate-400 font-bold">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Horizontal Calendar bar */}
              <div className="flex justify-between gap-1">
                {getWeekDays().map((day) => (
                  <div
                    key={day.name + day.date}
                    className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      day.isToday
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-400 hover:bg-canvas hover:text-ink'
                    }`}
                  >
                    <span className="text-[8px] font-bold uppercase tracking-wider">{day.name}</span>
                    <span className="text-[10px] font-extrabold">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 4: Timeline checklist (Activity stream layout) */}
            <div className="bg-surface border border-line rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-ink flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-500" /> Recent Updates
              </h4>
              {activities.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No updates in workspace.</p>
              ) : (
                <div className="space-y-3.5 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-line">
                  {activities.slice(0, 4).map((log) => (
                    <div key={log._id} className="text-[10px] flex gap-3.5 items-start pl-4 relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-surface absolute left-0 top-0.5 shrink-0 shadow-sm" />
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-400 leading-snug">
                          <strong>{log.performedBy?.name?.split(' ')[0] || 'Someone'}</strong>{' '}
                          {actionLabels[log.action] || log.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>

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