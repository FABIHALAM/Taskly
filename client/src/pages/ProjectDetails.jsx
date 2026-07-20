import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Users, UserPlus, X,
  LayoutGrid, AlignLeft, Calendar, Flag, Crown, UserCheck
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
  { key: 'To Do',       color: 'border-t-slate-400',   bg: 'bg-slate-50',   badge: 'bg-slate-100 text-slate-600'  },
  { key: 'In Progress', color: 'border-t-violet-500',  bg: 'bg-violet-50',  badge: 'bg-violet-100 text-violet-700' },
  { key: 'Done',        color: 'border-t-emerald-500', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
]

const PRIORITY_STYLE = {
  High:   'bg-red-100 text-red-600 border border-red-200',
  Medium: 'bg-amber-100 text-amber-600 border border-amber-200',
  Low:    'bg-emerald-100 text-emerald-600 border border-emerald-200',
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
      toast.error('Failed to load project')
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
      toast.success('Member added!')
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
    const widthPct = Math.min(100 - leftPct, Math.max(5, ((end - start) / totalMs) * 100))
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

    return { leftPct, widthPct, isOverdue }
  }

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="max-w-7xl">

        {/* Back Button */}
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              {project?.name || 'Project Board'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {tasks.length} tasks •{' '}
              <span className={isOwner ? 'text-violet-600 font-medium' : 'text-emerald-600 font-medium'}>
                {isOwner ? '👔 You are the Manager' : '👷 You are a Member'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Members Button */}
            <button
              onClick={() => setShowMembers(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-line text-sm font-medium text-gray-600 hover:bg-canvas transition-colors"
            >
              <Users size={15} />
              Members ({members.length})
            </button>

            {/* View Toggle */}
            <div className="flex rounded-xl border border-line overflow-hidden text-sm font-medium">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${viewMode === 'board' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-canvas'}`}
              >
                <LayoutGrid size={14} /> Board
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${viewMode === 'timeline' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-canvas'}`}
              >
                <AlignLeft size={14} /> Timeline
              </button>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm border border-line rounded-xl px-3 py-2 bg-canvas focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>

            {/* Create Task — Owner Only */}
            {isOwner && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-opacity shadow-lg shadow-primary/20"
              >
                <Plus size={16} /> New Task
              </button>
            )}
          </div>
        </div>

        {/* ─── BOARD VIEW ─────────────────────────────────────────────── */}
        {viewMode === 'board' && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-4">
              {COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.key)
                return (
                  <div key={col.key} className={`bg-surface border-t-2 ${col.color} border border-line rounded-2xl overflow-hidden`}>
                    {/* Column Header */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-line">
                      <span className="font-semibold text-sm text-ink">{col.key}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    <Droppable droppableId={col.key}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 min-h-[200px] space-y-2.5 transition-colors ${snapshot.isDraggingOver ? col.bg : ''}`}
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
                                    className={`bg-white rounded-xl p-3.5 border cursor-pointer group transition-all ${
                                      snap.isDragging
                                        ? 'shadow-2xl border-primary/30 rotate-2 scale-105'
                                        : isOverdue
                                          ? 'border-red-300 hover:shadow-md hover:border-red-400'
                                          : 'border-line hover:shadow-md hover:border-primary/30'
                                    }`}
                                  >
                                    {/* Priority + Tags */}
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[task.priority]}`}>
                                        {task.priority}
                                      </span>
                                      {task.tags?.slice(0,2).map((tag) => (
                                        <span key={tag} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 uppercase tracking-wide">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>

                                    {/* Title */}
                                    <p className="text-sm font-semibold text-ink leading-snug mb-2">{task.title}</p>

                                    {/* Due Date + Assignee + Delete */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {task.dueDate && (
                                          <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Calendar size={9} />
                                            {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                            {isOverdue && ' ⚠️'}
                                          </span>
                                        )}
                                        {task.assignee && (
                                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                            <UserCheck size={10} />
                                            {task.assignee.name || 'Assigned'}
                                          </span>
                                        )}
                                      </div>
                                      {isOwner && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setDeleteTargetId(task._id) }}
                                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all"
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
                            <p className="text-xs text-gray-300 text-center py-6 italic">Drop tasks here</p>
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
          <div className="bg-surface border border-line rounded-2xl overflow-hidden">
            <div className="flex border-b border-line">
              <div className="w-48 shrink-0 px-4 py-3 border-r border-line font-semibold text-sm text-gray-500">Task</div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex" style={{ minWidth: `${timelineDates.length * 60}px` }}>
                  {timelineDates.map((date, i) => {
                    const isToday = date.toDateString() === new Date().toDateString()
                    return (
                      <div
                        key={i}
                        className={`flex-1 text-center text-[11px] py-3 border-r border-line font-medium ${isToday ? 'text-violet-600 bg-violet-50 font-bold' : 'text-gray-400'}`}
                        style={{ minWidth: 60 }}
                      >
                        {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {tasks.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-12">No tasks to display in timeline</p>
            ) : (
              tasks.map((task) => {
                const { leftPct, widthPct, isOverdue } = getTaskBar(task)
                return (
                  <div key={task._id} className="flex border-b border-line hover:bg-canvas/50 transition-colors">
                    <div className="w-48 shrink-0 px-4 py-3 border-r border-line flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span
                        className="text-sm text-ink font-medium truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/projects/${id}/tasks/${task._id}`)}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div className="flex-1 relative py-2.5 overflow-x-auto">
                      <div style={{ minWidth: `${timelineDates.length * 60}px`, position: 'relative', height: '100%' }}>
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-full flex items-center px-2.5 text-[11px] font-semibold text-white shadow-sm transition-all ${
                            task.status === 'Done'
                              ? 'bg-emerald-500'
                              : isOverdue
                                ? 'bg-red-500 animate-pulse'
                                : 'bg-violet-500'
                          }`}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: 40 }}
                        >
                          {task.status === 'Done' ? '✓ ' : isOverdue ? '⚠ ' : ''}{task.title.slice(0, 14)}{task.title.length > 14 ? '...' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ─── MEMBERS PANEL (Slide-in) ────────────────────────────── */}
        <AnimatePresence>
          {showMembers && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setShowMembers(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-80 bg-surface border-l border-line shadow-2xl z-50 flex flex-col"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    <h3 className="font-display font-semibold text-ink">Project Members</h3>
                  </div>
                  <button onClick={() => setShowMembers(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-ink hover:bg-canvas transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Member List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {members.map((m) => {
                    const u = m.user || m
                    const memberIsOwner = m.role === 'owner'
                    return (
                      <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl bg-canvas border border-line group">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${memberIsOwner ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        {/* Role Badge */}
                        <div className="flex items-center gap-1 shrink-0">
                          {memberIsOwner ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                              <Crown size={9} /> Manager
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              <UserCheck size={9} /> Member
                            </span>
                          )}
                          {/* Remove button — owner only, can't remove themselves */}
                          {isOwner && !memberIsOwner && (
                            <button
                              onClick={() => handleRemoveMember(u._id)}
                              className="opacity-0 group-hover:opacity-100 ml-1 p-1 rounded text-gray-300 hover:text-red-500 transition-all"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add Member — Owner Only */}
                {isOwner && (
                  <div className="p-4 border-t border-line">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Add Member by Email</p>
                    <form onSubmit={handleAddMember} className="flex gap-2">
                      <input
                        type="email"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="member@email.com"
                        className="flex-1 text-sm border border-line rounded-xl px-3 py-2 bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={addingMember || !memberEmail.trim()}
                        className="p-2 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
                      >
                        {addingMember
                          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <UserPlus size={16} />
                        }
                      </button>
                    </form>
                    <p className="text-[11px] text-gray-400 mt-2">The user must already have a Taskly account</p>
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
            message="Delete this task? This action cannot be undone."
            onConfirm={confirmDeleteTask}
            onCancel={() => setDeleteTargetId(null)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProjectDetails