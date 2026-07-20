import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Users, UserPlus, X,
  LayoutGrid, AlignLeft, Calendar, Flag, Crown, UserCheck, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import DashboardLayout from '../layout/DashboardLayout'
import CreateTaskModal from '../components/CreateTaskModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { getTasksByProject, updateTaskStatus, deleteTask } from '../services/taskService'
import { getProjectById, addMember, removeMember } from '../services/projectService'

const COLUMNS = [
  { key: 'To Do',       color: 'border-t-slate-400',   bg: 'bg-slate-500/5',   badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-300' },
  { key: 'In Progress', color: 'border-t-indigo-500',  bg: 'bg-indigo-500/5',  badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  { key: 'Done',        color: 'border-t-emerald-500', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
]

const PRIORITY_STYLE = {
  High:   'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  Low:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
}

function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const [project, setProject]           = useState(null)
  const [tasks, setTasks]               = useState([])
  const [isLoading, setIsLoading]       = useState(true)
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [priorityFilter, setPriorityFilter] = useState('')
  const [viewMode, setViewMode]         = useState('board')

  // Members panel state
  const [showMembers, setShowMembers]   = useState(false)
  const [memberEmail, setMemberEmail]   = useState('')
  const [addingMember, setAddingMember] = useState(false)

  // ─── Data Loading ─────────────────────────────────────────────────────────

  const loadProject = async () => {
    try {
      const res = await getProjectById(id)
      setProject(res.data)
    } catch {
      toast.error('Failed to load project details')
    }
  }

  const fetchTasks = async () => {
    try {
      const filters = { order: 'desc' }
      if (priorityFilter) filters.priority = priorityFilter
      const result = await getTasksByProject(id, filters)
      setTasks(result.data?.tasks || [])
    } catch {
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProject()
    fetchTasks()
  }, [id, priorityFilter])

  // ─── Computed ─────────────────────────────────────────────────────────────

  const isOwner = project?.owner?._id === currentUser.id || project?.owner === currentUser.id
  const members = project?.members || []

  // ─── Task Handlers ────────────────────────────────────────────────────────

  const confirmDeleteTask = async () => {
    try {
      await deleteTask(deleteTargetId)
      setDeleteTargetId(null)
      fetchTasks()
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId
    setTasks((prev) =>
      prev.map((task) => task._id === draggableId ? { ...task, status: newStatus } : task)
    )
    try {
      await updateTaskStatus(draggableId, newStatus)
    } catch {
      fetchTasks()
    }
  }

  // ─── Member Handlers ──────────────────────────────────────────────────────

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!memberEmail.trim()) return
    setAddingMember(true)
    try {
      const res = await addMember(id, memberEmail.trim())
      setProject(res.data)
      setMemberEmail('')
      toast.success('Team member added!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      const res = await removeMember(id, userId)
      setProject(res.data)
      toast.success('Member removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member')
    }
  }

  // ─── Gantt Timeline Helpers ───────────────────────────────────────────────

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
    const end   = task.dueDate ? new Date(task.dueDate) : new Date(Date.now() + 86400000)
    const tStart = timelineDates[0]
    const tEnd   = timelineDates[timelineDates.length - 1]
    const totalMs = tEnd - tStart

    const leftPct = Math.max(0, ((start - tStart) / totalMs) * 100)
    const widthPct = Math.min(100 - leftPct, Math.max(6, ((end - start) / totalMs) * 100))
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

    return { leftPct, widthPct, isOverdue }
  }

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-xs text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading project workspace...
      </div>
    </DashboardLayout>
  )

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

        {/* Header */}
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
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs font-semibold border border-line rounded-xl px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🟢 Low Priority</option>
            </select>

            {/* Create Task — Owner Only */}
            {isOwner && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Plus size={16} /> New Task
              </button>
            )}
          </div>
        </div>

        {/* ─── BOARD VIEW ─────────────────────────────────────────────── */}
        {viewMode === 'board' && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.key)
                return (
                  <div key={col.key} className={`bg-surface border-t-4 ${col.color} border border-line rounded-3xl overflow-hidden shadow-sm flex flex-col`}>
                    {/* Column Header */}
                    <div className="px-5 py-3.5 flex items-center justify-between border-b border-line bg-canvas/40">
                      <span className="font-display font-bold text-xs uppercase tracking-wider text-ink">{col.key}</span>
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${col.badge}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    <Droppable droppableId={col.key}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3.5 flex-1 min-h-[350px] space-y-3 transition-colors ${snapshot.isDraggingOver ? col.bg : ''}`}
                        >
                          {colTasks.map((task, index) => {
                            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'
                            return (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    onClick={() => navigate(`/projects/${id}/tasks/${task._id}`)}
                                    className={`bg-canvas rounded-2xl p-4 border cursor-pointer group transition-all glow-card ${
                                      snap.isDragging
                                        ? 'shadow-2xl border-indigo-500/50 rotate-2 scale-105 z-50 bg-surface'
                                        : isOverdue
                                          ? 'border-rose-500/40 hover:border-rose-500'
                                          : 'border-line hover:border-indigo-500/40'
                                    }`}
                                  >
                                    {/* Priority + Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${PRIORITY_STYLE[task.priority]}`}>
                                        {task.priority}
                                      </span>
                                      {task.tags?.slice(0, 2).map((tag) => (
                                        <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>

                                    {/* Title */}
                                    <p className="text-xs font-bold text-ink leading-relaxed mb-3 group-hover:text-indigo-500 transition-colors">
                                      {task.title}
                                    </p>

                                    {/* Due Date + Assignee + Delete */}
                                    <div className="flex items-center justify-between pt-2 border-t border-line">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {task.dueDate && (
                                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isOverdue ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-400'}`}>
                                            <Calendar size={9} />
                                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            {isOverdue && ' ⚠️'}
                                          </span>
                                        )}
                                        {task.assignee && (
                                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                            <UserCheck size={10} className="text-emerald-500" />
                                            {task.assignee.name || 'Assigned'}
                                          </span>
                                        )}
                                      </div>
                                      {isOwner && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setDeleteTargetId(task._id) }}
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
                          {colTasks.length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-full flex items-center justify-center border border-dashed border-line rounded-2xl p-6 text-center">
                              <p className="text-xs text-slate-400 italic">No tasks in this column</p>
                            </div>
                          )}
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
              <div className="w-52 shrink-0 px-5 py-3.5 border-r border-line font-bold text-xs uppercase tracking-wider text-slate-400">Task Name</div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex" style={{ minWidth: `${timelineDates.length * 64}px` }}>
                  {timelineDates.map((date, i) => {
                    const isToday = date.toDateString() === new Date().toDateString()
                    return (
                      <div
                        key={i}
                        className={`flex-1 text-center text-[10px] py-3.5 border-r border-line font-bold uppercase tracking-wider ${isToday ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-400'}`}
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
                            task.status === 'Done'
                              ? 'bg-emerald-500'
                              : isOverdue
                                ? 'bg-rose-500 animate-pulse'
                                : 'bg-indigo-600'
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

        {/* ─── MEMBERS PANEL (Slide-in Drawer) ────────────────────────────── */}
        <AnimatePresence>
          {showMembers && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setShowMembers(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed right-0 top-0 h-full w-84 bg-surface border-l border-line shadow-2xl z-50 flex flex-col"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-line">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-indigo-500" />
                    <h3 className="font-display font-bold text-base text-ink">Project Members</h3>
                  </div>
                  <button onClick={() => setShowMembers(false)} className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-canvas transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Member List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {members.map((m) => {
                    const u = m.user || m
                    const memberIsOwner = m.role === 'owner'
                    return (
                      <div key={u._id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-canvas border border-line group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${memberIsOwner ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' : 'bg-gradient-to-tr from-emerald-500 to-teal-600'}`}>
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-ink truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {memberIsOwner ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              <Crown size={9} /> Manager
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <UserCheck size={9} /> Member
                            </span>
                          )}
                          {isOwner && !memberIsOwner && (
                            <button
                              onClick={() => handleRemoveMember(u._id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer ml-1"
                              title="Remove member"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add Member Form — Owner Only */}
                {isOwner && (
                  <div className="p-5 border-t border-line bg-canvas/50">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Invite Member by Email</p>
                    <form onSubmit={handleAddMember} className="flex gap-2">
                      <input
                        type="email"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="flex-1 text-xs border border-line rounded-xl px-3.5 py-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                      <button
                        type="submit"
                        disabled={addingMember || !memberEmail.trim()}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-indigo-500/20"
                      >
                        {addingMember
                          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <UserPlus size={16} />
                        }
                      </button>
                    </form>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">User must have an active Taskly account</p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Create Task Modal */}
        {isModalOpen && (
          <CreateTaskModal
            projectId={id}
            members={members}
            onClose={() => setIsModalOpen(false)}
            onCreated={fetchTasks}
          />
        )}

        {/* Delete Confirm */}
        {deleteTargetId && (
          <ConfirmDialog
            message="Are you sure you want to delete this task? This action cannot be undone."
            onConfirm={confirmDeleteTask}
            onCancel={() => setDeleteTargetId(null)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProjectDetails