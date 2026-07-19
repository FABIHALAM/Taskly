import { useState, useEffect } from 'react'
import { FolderKanban, Clock, CheckCircle2, Plus, Calendar, AlertTriangle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../layout/DashboardLayout'
import { getRecentActivity } from '../services/activityService'
import { getDashboardAnalytics } from '../services/analyticsService'
import { getMyProjects, createProject } from '../services/projectService'
import CreateProjectModal from '../components/CreateProjectModal'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

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
    task_status_changed: 'updated a task status',
    task_deleted: 'deleted a task',
    project_created: 'created a project',
    project_updated: 'updated a project',
    member_added: 'added a member',
    comment_added: 'commented on a task',
  }

  const stats = [
    {
      label: 'Active Projects',
      value: projects.length.toString(),
      icon: FolderKanban,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'My Tasks',
      value: assignedCount.toString(),
      icon: CheckCircle2,
      color: 'text-mint bg-mint/10',
    },
    {
      label: 'Overdue Tasks',
      value: (analytics?.overdueCount || 0).toString(),
      icon: Clock,
      color: 'text-red-500 bg-red-500/10',
    },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        {/* Header banner */}
        <div className="bg-surface border border-line rounded-2xl p-6 flex items-center justify-between mb-6 shadow-sm">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Good to see you, {user.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Here is your overview of tasks, projects, and activities today.
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="var(--color-line)" strokeWidth="6" fill="none" />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="var(--color-primary)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute font-display text-sm font-semibold">{weeklyProgress}%</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-surface border border-line rounded-xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Due & Overdue Tasks alerts */}
        {analytics?.overdueCount > 0 && (
          <div className="bg-red-50/50 border border-red-200 rounded-xl p-4 mb-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
              <AlertTriangle size={16} />
              <span>You have {analytics.overdueCount} overdue task(s)!</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.overdueTasks?.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/projects/${projects[0]?._id || ''}/tasks/${task.id}`)}
                  className="bg-surface border border-red-100 rounded-lg p-3 hover:shadow-sm cursor-pointer flex items-center justify-between transition-shadow"
                >
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{task.project}</p>
                  </div>
                  <span className="text-xs font-semibold text-red-500">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Projects display */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">Active Projects</h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> New Project
                </button>
              </div>

              {isLoading ? (
                <p className="text-sm text-gray-400">Loading projects...</p>
              ) : projects.length === 0 ? (
                <div className="text-center py-10">
                  <FolderKanban className="mx-auto text-gray-300 mb-3" size={32} />
                  <h4 className="text-sm font-semibold">No active projects</h4>
                  <p className="text-xs text-gray-400 mt-1">Get started by creating a project.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {projects.slice(0, 4).map((p) => (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/projects/${p._id}`)}
                      className="border border-line rounded-xl p-4 hover:shadow-md transition-all cursor-pointer bg-canvas border-l-4 border-l-primary"
                    >
                      <h4 className="font-semibold text-sm truncate">{p.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2rem]">
                        {p.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400 pt-2 border-t border-line">
                        <span>{p.members?.length || 1} members</span>
                        <ArrowRight size={10} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks Due Soon */}
            <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold mb-4">Upcoming Tasks (Due Soon)</h3>
              {!analytics?.dueSoonTasks || analytics.dueSoonTasks.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No tasks due in the next 3 days.</p>
              ) : (
                <div className="space-y-3">
                  {analytics.dueSoonTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/projects/${projects[0]?._id || ''}/tasks/${task.id}`)}
                      className="flex items-center justify-between p-3 border border-line rounded-xl hover:shadow-sm cursor-pointer transition-shadow bg-canvas"
                    >
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-gray-400">{task.project}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-brass font-semibold">
                        <Calendar size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity log sidebar */}
          <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm h-fit">
            <h3 className="font-display font-semibold mb-4">Workspace Activity</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No workspace activities reported yet.</p>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 8).map((log) => (
                  <div key={log._id} className="text-xs flex gap-2.5 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-ink">{log.performedBy?.name || 'Someone'}</span>{' '}
                        {actionLabels[log.action] || log.action}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
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