import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  UserPlus,
  X,
  LayoutGrid,
  AlignLeft,
  Calendar,
  Flag,
  Crown,
  UserCheck,
  Sparkles,
  Download,
  ShieldCheck,
  Clock,
  ListTodo,
  History,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import DashboardLayout from '../layout/DashboardLayout'
import CreateTaskModal from '../components/CreateTaskModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { getTasksByProject, updateTaskStatus, deleteTask } from '../services/taskService'
import { getProjectById, addMember, removeMember } from '../services/projectService'
import AppLoader from '../components/AppLoader'

const COLUMNS = [
  { key: 'To Do', color: 'border-t-slate-400', bg: 'bg-slate-500/5', badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-300', wipLimit: 10 },
  { key: 'In Progress', color: 'border-t-indigo-500', bg: 'bg-indigo-500/5', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', wipLimit: 3 },
  { key: 'Done', color: 'border-t-emerald-500', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', wipLimit: null },
]

const PRIORITY_STYLE = {
  High: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  Low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
}

function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sprintFilter, setSprintFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('board') // 'board' | 'timeline' | 'activity'

  // Members Drawer state
  const [showMembers, setShowMembers] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  const isOwner = project && project.owner && (project.owner._id || project.owner) === currentUser.id

  const fetchProjectAndTasks = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        getProjectById(id),
        getTasksByProject(id, priorityFilter ? { priority: priorityFilter } : {}),
      ])
      setProject(projRes.data)
      setTasks(taskRes.data?.tasks || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load project details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectAndTasks()
  }, [id, priorityFilter])

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId

    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    )

    try {
      await updateTaskStatus(draggableId, newStatus)
      toast.success(`Moved to ${newStatus}`)
    } catch {
      toast.error('Failed to update task status')
      fetchProjectAndTasks()
    }
  }

  const handleDeleteTask = async () => {
    if (!deleteTargetId) return
    try {
      await deleteTask(deleteTargetId)
      setTasks((prev) => prev.filter((t) => t._id !== deleteTargetId))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    } finally {
      setDeleteTargetId(null)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!newMemberEmail.trim()) return
    setAddingMember(true)
    try {
      await addMember(id, newMemberEmail.trim())
      toast.success('Member added successfully!')
      setNewMemberEmail('')
      fetchProjectAndTasks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      await removeMember(id, userId)
      toast.success('Member removed')
      fetchProjectAndTasks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleExportCsv = () => {
    if (tasks.length === 0) return toast.error('No tasks to export')
    const headers = ['Title', 'Status', 'Priority', 'Assignee', 'Logged Hours', 'Estimated Hours', 'Due Date']
    const rows = tasks.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      `"${t.assignee?.name || 'Unassigned'}"`,
      t.loggedHours || 0,
      t.estimatedHours || 0,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${project?.name || 'Project'}_Task_Report.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV Report exported successfully!')
  }

  const calculateHealthScore = () => {
    if (tasks.length === 0) return { score: 100, label: 'Optimal Pace', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    const doneTasks = tasks.filter((t) => t.status === 'Done').length
    const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length
    const completionPct = (doneTasks / tasks.length) * 100
    const overduePenalty = (overdueTasks / tasks.length) * 40
    const score = Math.max(0, Math.round(completionPct - overduePenalty + 30))

    if (score >= 80) return { score, label: 'Optimal Pace — High Health', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    if (score >= 50) return { score, label: 'Moderate Workload Pace', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
    return { score, label: 'High Overdue Risk Alert', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
  }

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const members = project?.members || []
  const healthInfo = calculateHealthScore()

  const getTimelineDates = () => {
    const dates = []
    const start = new Date()
    start.setDate(start.getDate() - 3)
    for (let i = 0; i < 14; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      dates.push(d)
    }
    return dates
  }

  const timelineDates = getTimelineDates()

  const getTaskBar = (task) => {
    const start = new Date(task.createdAt)
    const end = task.dueDate ? new Date(task.dueDate) : new Date(Date.now() + 86400000)
    const tStart = timelineDates[0]
    const tEnd = timelineDates[timelineDates.length - 1]
    const totalMs = tEnd - tStart

    const leftPct = Math.max(0, ((start - tStart) / totalMs) * 100)
    const widthPct = Math.min(100 - leftPct, Math.max(6, ((end - start) / totalMs) * 100))
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

    return { leftPct, widthPct, isOverdue }
  }

  if (isLoading) return <AppLoader message="Loading project board..." />

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} /> Back to Projects
        </button>

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
              <Sparkles size={12} />
              <span>Project Board</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              {project?.name || 'Project Board'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2">
              <span>{tasks.length} total tasks</span>
              <span>•</span>
              <span className={isOwner ? 'text-indigo-500 font-bold' : 'text-emerald-500 font-bold'}>
                {isOwner ? '👔 Manager (Owner)' : '👷 Member'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* CSV Export Button */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-line bg-surface text-xs font-bold text-ink hover:border-indigo-500/30 transition-all shadow-sm cursor-pointer"
            >
              <Download size={14} className="text-cyan-400" />
              <span>Export Report</span>
            </button>

            {/* Members Button */}
            <button
              onClick={() => setShowMembers(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-line bg-surface text-xs font-bold text-ink hover:border-indigo-500/30 transition-all shadow-sm cursor-pointer"
            >
              <Users size={15} className="text-indigo-500" />
              <span>Members ({members.length})</span>
            </button>

            {/* View Toggle */}
            <div className="flex rounded-xl border border-line bg-surface p-1 shadow-sm text-xs font-bold">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'board' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-ink'
                }`}
              >
                <LayoutGrid size={14} /> Board
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-ink'
                }`}
              >
                <AlignLeft size={14} /> Timeline
              </button>
              <button
                onClick={() => setViewMode('activity')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'activity' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-ink'
                }`}
              >
                <History size={14} /> Activity
              </button>
            </div>

            {/* Create Task (Manager only) */}
            {isOwner && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Plus size={16} /> New Task
              </button>
            )}
          </div>
        </div>

        {/* ─── PROJECT HEALTH SCORE BANNER ───────────────────────────────────── */}
        <div className="bg-surface border border-line rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${healthInfo.color}`}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg text-ink">Project Health: {healthInfo.score}%</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${healthInfo.color}`}>
                  {healthInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Calculated based on overdue velocity & task completion ratio.</p>
            </div>
          </div>
        </div>

        {/* Filters Bar & Sprint Selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface p-4 border border-line rounded-2xl">
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 text-xs font-medium border border-line rounded-xl px-3.5 py-2 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
          />

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            {/* Sprint Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Sprint:</span>
              <select
                value={sprintFilter}
                onChange={(e) => setSprintFilter(e.target.value)}
                className="text-xs font-semibold border border-line rounded-xl px-3 py-2 bg-canvas text-ink focus:outline-none cursor-pointer"
              >
                <option value="All">All Sprints</option>
                <option value="Sprint 1">Sprint 1 — Core Auth & Setup</option>
                <option value="Sprint 2">Sprint 2 — Real-time Engine</option>
                <option value="Sprint 3">Sprint 3 — Release Candidate</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-semibold border border-line rounded-xl px-3 py-2 bg-canvas text-ink focus:outline-none cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── KANBAN BOARD VIEW ────────────────────────────────────── */}
        {viewMode === 'board' && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COLUMNS.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.key)
                const isWipExceeded = col.wipLimit !== null && colTasks.length > col.wipLimit

                return (
                  <div key={col.key} className={`flex flex-col rounded-3xl border border-line ${col.bg} p-4 min-h-[500px]`}>
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="font-display font-bold text-sm text-ink flex items-center gap-2">
                        <span>{col.key}</span>
                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${col.badge}`}>
                          {colTasks.length}{col.wipLimit ? ` / ${col.wipLimit} max` : ''}
                        </span>
                      </span>

                      {isWipExceeded && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle size={10} /> WIP Limit Exceeded
                        </span>
                      )}
                    </div>

                    <Droppable droppableId={col.key}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 space-y-3 transition-colors rounded-2xl ${
                            snapshot.isDraggingOver ? 'bg-indigo-500/10 p-2 border border-dashed border-indigo-500/30' : ''
                          }`}
                        >
                          {colTasks.map((task, index) => {
                            const subCount = task.subtasks ? task.subtasks.length : 0
                            const subDone = task.subtasks ? task.subtasks.filter((s) => s.isCompleted).length : 0

                            return (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => navigate(`/projects/${id}/tasks/${task._id}`)}
                                    className={`bg-surface border border-line rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3 ${
                                      snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500' : ''
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="font-display font-bold text-xs text-ink line-clamp-2 group-hover:text-indigo-500 transition-colors">
                                        {task.title}
                                      </h4>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_STYLE[task.priority]}`}>
                                        {task.priority}
                                      </span>
                                    </div>

                                    {/* Task Metrics & Subtasks ratio */}
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold pt-1 border-t border-line/50">
                                      {subCount > 0 && (
                                        <span className="flex items-center gap-1 text-cyan-400">
                                          <ListTodo size={11} /> {subDone}/{subCount}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1 text-emerald-400">
                                        <Clock size={11} /> {task.loggedHours || 0}/{task.estimatedHours || 8}h
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                      <div className="flex items-center gap-1 text-slate-400">
                                        <Users size={12} />
                                        <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
                                      </div>
                                      {isOwner && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setDeleteTargetId(task._id)
                                          }}
                                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                                          title="Delete Task"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            )
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        )}

        {/* ─── TIMELINE VIEW ──────────────────────────────────────────── */}
        {viewMode === 'timeline' && (
          <div className="bg-surface border border-line rounded-3xl overflow-hidden shadow-sm">
            <div className="flex border-b border-line bg-canvas/50">
              <div className="w-52 shrink-0 px-5 py-3.5 border-r border-line font-bold text-xs uppercase tracking-wider text-slate-400">
                Task Name
              </div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex" style={{ minWidth: `${timelineDates.length * 64}px` }}>
                  {timelineDates.map((date, i) => {
                    const isToday = date.toDateString() === new Date().toDateString()
                    return (
                      <div
                        key={i}
                        className={`flex-1 text-center text-[10px] py-3.5 border-r border-line font-bold uppercase tracking-wider ${
                          isToday ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-400'
                        }`}
                        style={{ minWidth: 64 }}
                      >
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {tasks.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12 italic">No tasks available for timeline visualization</p>
            ) : (
              tasks.map((task) => {
                const { leftPct, widthPct, isOverdue } = getTaskBar(task)
                return (
                  <div key={task._id} className="flex border-b border-line hover:bg-canvas/50 transition-colors">
                    <div className="w-52 shrink-0 px-5 py-3.5 border-r border-line flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span
                        className="text-xs text-ink font-bold truncate cursor-pointer hover:text-indigo-500 transition-colors"
                        onClick={() => navigate(`/projects/${id}/tasks/${task._id}`)}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div className="flex-1 relative py-3 overflow-x-auto">
                      <div style={{ minWidth: `${timelineDates.length * 64}px`, position: 'relative', height: '100%' }}>
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-7 rounded-full flex items-center px-3 text-[11px] font-bold text-white shadow-md transition-all ${
                            task.status === 'Done' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'
                          }`}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: 50 }}
                        >
                          <span className="truncate">{task.status === 'Done' ? '✓ ' : isOverdue ? '⚠️ ' : ''}{task.title}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ─── PROJECT ACTIVITY AUDIT FEED TAB ──────────────────────────────────── */}
        {viewMode === 'activity' && (
          <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="font-display font-bold text-base text-ink flex items-center gap-2">
                <History className="text-indigo-500" size={18} /> Project Activity Audit Trail
              </h2>
              <span className="text-xs text-slate-400 font-medium">Real-time team audit log</span>
            </div>

            <div className="space-y-3 pt-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-8">No activities recorded yet.</p>
              ) : (
                tasks.map((t) => (
                  <div key={t._id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-canvas border border-line text-xs">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Zap size={15} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-ink">
                        Task <span className="text-indigo-400 font-mono">"{t.title}"</span> updated
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Assigned to: <strong className="text-slate-300">{t.assignee ? t.assignee.name : 'Unassigned'}</strong> • Status: <span className="font-bold text-cyan-400">{t.status}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(t.updatedAt || t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Members Drawer / Modal */}
        <AnimatePresence>
          {showMembers && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-line rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4"
              >
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                    <Users size={18} className="text-indigo-500" /> Project Members
                  </h3>
                  <button onClick={() => setShowMembers(false)} className="text-slate-400 hover:text-ink">
                    <X size={18} />
                  </button>
                </div>

                {isOwner && (
                  <form onSubmit={handleAddMember} className="flex gap-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Add member by email..."
                      className="flex-1 text-xs border border-line rounded-xl px-3.5 py-2 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={addingMember || !newMemberEmail.trim()}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus size={14} /> Add
                    </button>
                  </form>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
                  {members.map((m) => {
                    const u = m.user || m
                    const isMemOwner = m.role === 'owner'
                    return (
                      <div key={u._id} className="flex items-center justify-between p-3 rounded-2xl bg-canvas border border-line text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold flex items-center justify-center uppercase">
                            {u.name ? u.name[0] : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-ink">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isMemOwner ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {isMemOwner ? '👔 Manager' : '👷 Member'}
                          </span>
                          {isOwner && !isMemOwner && (
                            <button
                              onClick={() => handleRemoveMember(u._id)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              title="Remove Member"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Task Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteTargetId}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          onConfirm={handleDeleteTask}
          onCancel={() => setDeleteTargetId(null)}
        />

        {/* Create Task Modal */}
        {isModalOpen && (
          <CreateTaskModal
            projectId={id}
            members={members}
            onClose={() => setIsModalOpen(false)}
            onCreated={fetchProjectAndTasks}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProjectDetails