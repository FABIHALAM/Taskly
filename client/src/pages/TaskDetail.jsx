import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Flag, Trash2, Edit3, Send, AlertTriangle, Sparkles, CheckCircle2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../layout/DashboardLayout'
import { getTasksByProject, updateTask, deleteTask } from '../services/taskService'
import { getComments, addComment, deleteComment } from '../services/commentService'

const STATUSES = ['To Do', 'In Progress', 'Done']
const PRIORITIES = ['Low', 'Medium', 'High']

const priorityColors = {
  High: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  Low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
}

const statusColors = {
  'To Do': 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20',
  'In Progress': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  Done: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
}

function TaskDetail() {
  const { id: projectId, taskId } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const loadTask = async () => {
    try {
      const res = await getTasksByProject(projectId, {})
      const found = res.data?.tasks?.find((t) => t._id === taskId)
      if (!found) { toast.error('Task not found'); navigate(-1); return }
      setTask(found)
      setEditData({
        title: found.title,
        description: found.description || '',
        priority: found.priority,
        status: found.status,
        dueDate: found.dueDate ? new Date(found.dueDate).toISOString().split('T')[0] : '',
        tagsInput: found.tags ? found.tags.join(', ') : '',
      })
    } catch { toast.error('Failed to load task') }
    finally { setIsLoading(false) }
  }

  const loadComments = async () => {
    try {
      const res = await getComments(taskId)
      setComments(res.data || [])
    } catch { /* silent */ }
  }

  useEffect(() => { loadTask(); loadComments() }, [taskId])

  const handleSave = async () => {
    try {
      const tags = editData.tagsInput
        ? editData.tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
        : []
      await updateTask(taskId, {
        title: editData.title,
        description: editData.description,
        priority: editData.priority,
        status: editData.status,
        dueDate: editData.dueDate,
        tags,
      })
      toast.success('Task updated successfully!')
      setIsEditing(false)
      loadTask()
    } catch { toast.error('Failed to update task') }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      toast.success('Task deleted')
      navigate(`/projects/${projectId}`)
    } catch { toast.error('Failed to delete task') }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await addComment(taskId, newComment.trim())
      setNewComment('')
      loadComments()
    } catch { toast.error('Failed to add comment') }
    finally { setSubmitting(false) }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId)
      loadComments()
    } catch { toast.error('Failed to delete comment') }
  }

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-xs text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading task details...
      </div>
    </DashboardLayout>
  )

  if (!task) return null

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} /> Back to Project Board
        </button>

        {/* Overdue Warning */}
        {isOverdue && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl px-5 py-3.5 text-xs font-bold shadow-sm">
            <AlertTriangle size={18} className="animate-pulse" />
            <span>Task Overdue: Scheduled due date was {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {/* Task Detail Card */}
        <div className="bg-surface border border-line rounded-3xl p-7 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5">
            {isEditing ? (
              <input
                className="flex-1 text-2xl font-extrabold font-display border-b-2 border-indigo-500 focus:outline-none bg-transparent text-ink"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            ) : (
              <h1 className="font-display text-2xl font-extrabold text-ink flex-1 leading-snug">{task.title}</h1>
            )}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-xl border border-line bg-canvas hover:border-indigo-500/30 text-slate-400 hover:text-ink transition-all cursor-pointer"
                title="Edit Task"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-xl border border-line bg-canvas hover:border-rose-500/30 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                title="Delete Task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Status + Priority + Due Date */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {isEditing ? (
              <>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="text-xs font-semibold border border-line rounded-xl px-3 py-2 bg-canvas text-ink focus:outline-none"
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="text-xs font-semibold border border-line rounded-xl px-3 py-2 bg-canvas text-ink focus:outline-none"
                >
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                  className="text-xs font-semibold border border-line rounded-xl px-3 py-2 bg-canvas text-ink focus:outline-none"
                />
              </>
            ) : (
              <>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${statusColors[task.status]}`}>
                  {task.status}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${priorityColors[task.priority]}`}>
                  <Flag size={11} className="inline mr-1" />{task.priority} Priority
                </span>
                {task.dueDate && (
                  <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold ${isOverdue ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-400'}`}>
                    <Calendar size={11} />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
            {isEditing ? (
              <textarea
                rows={4}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Add task description..."
                className="w-full text-xs font-medium border border-line rounded-2xl px-4 py-3 bg-canvas text-ink focus:outline-none resize-none"
              />
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-canvas p-4 rounded-2xl border border-line">
                {task.description || <span className="text-slate-400 italic">No description provided for this task.</span>}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="mb-6 pt-4 border-t border-line">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <Tag size={12} /> Tags
            </label>
            {isEditing ? (
              <input
                type="text"
                placeholder="frontend, bug, api"
                value={editData.tagsInput || ''}
                onChange={(e) => setEditData({ ...editData, tagsInput: e.target.value })}
                className="w-full text-xs font-medium border border-line rounded-xl px-4 py-2.5 bg-canvas text-ink focus:outline-none"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {task.tags && task.tags.length > 0 ? (
                  task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No tags added.</span>
                )}
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-canvas px-4 py-2.5 rounded-xl border border-line w-fit">
              <User size={14} className="text-indigo-500" />
              <span>Assigned to: <span className="text-ink font-bold">{task.assignee.name || task.assignee}</span></span>
            </div>
          )}

          {/* Save / Cancel */}
          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-slate-400 px-5 py-2.5 rounded-xl hover:bg-canvas transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-surface border border-line rounded-3xl p-7 shadow-sm">
          <h2 className="font-display font-bold text-lg text-ink mb-5">
            Comments Thread <span className="text-slate-400 font-normal text-xs">({comments.length})</span>
          </h2>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
              {currentUser.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 text-xs border border-line rounded-xl px-4 py-2.5 bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-indigo-500/20"
              >
                <Send size={14} />
              </button>
            </div>
          </form>

          {/* Comment List */}
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-line rounded-2xl bg-canvas italic">
              No comments posted yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3 p-4 rounded-2xl bg-canvas border border-line">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 text-xs font-bold shrink-0">
                    {c.author?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-ink">{c.author?.name || 'User'}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{c.text}</p>
                  </div>
                  {c.author?._id === currentUser.id && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Delete comment"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TaskDetail
