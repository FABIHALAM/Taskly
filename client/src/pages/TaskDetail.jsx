import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Flag, Trash2, Edit3, Send, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../layout/DashboardLayout'
import { getTasksByProject, updateTask, deleteTask } from '../services/taskService'
import { getComments, addComment, deleteComment } from '../services/commentService'

const STATUSES = ['To Do', 'In Progress', 'Done']
const PRIORITIES = ['Low', 'Medium', 'High']

const priorityColors = {
  High: 'bg-red-100 text-red-600',
  Medium: 'bg-yellow-100 text-yellow-600',
  Low: 'bg-gray-100 text-gray-500',
}

const statusColors = {
  'To Do': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-600',
  Done: 'bg-green-100 text-green-600',
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
      await updateTask(taskId, editData)
      toast.success('Task updated!')
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
    } catch { toast.error('Failed to delete') }
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

  if (isLoading) return <DashboardLayout><p className="text-sm text-gray-400">Loading...</p></DashboardLayout>
  if (!task) return null

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        {/* Back */}
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Board
        </button>

        {/* Overdue Warning */}
        {isOverdue && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
            <AlertTriangle size={16} />
            <span>This task is <strong>overdue</strong>! Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {/* Task Header */}
        <div className="bg-surface border border-line rounded-2xl p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            {isEditing ? (
              <input
                className="flex-1 text-xl font-semibold font-display border-b border-primary focus:outline-none bg-transparent"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            ) : (
              <h1 className="font-display text-xl font-semibold flex-1">{task.title}</h1>
            )}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 rounded-lg hover:bg-canvas text-gray-400 hover:text-ink transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Status + Priority + Due Date */}
          <div className="flex flex-wrap gap-3 mb-5">
            {isEditing ? (
              <>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="text-sm border border-line rounded-lg px-3 py-1.5 bg-canvas focus:outline-none"
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="text-sm border border-line rounded-lg px-3 py-1.5 bg-canvas focus:outline-none"
                >
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                  className="text-sm border border-line rounded-lg px-3 py-1.5 bg-canvas focus:outline-none"
                />
              </>
            ) : (
              <>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                  {task.status}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                  <Flag size={10} className="inline mr-1" />{task.priority}
                </span>
                {task.dueDate && (
                  <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Calendar size={10} />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {isOverdue && ' — OVERDUE'}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 font-medium mb-1 block">Description</label>
            {isEditing ? (
              <textarea
                rows={4}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Add a description..."
                className="w-full text-sm border border-line rounded-xl px-3 py-2 bg-canvas focus:outline-none resize-none"
              />
            ) : (
              <p className="text-sm text-gray-600">{task.description || <span className="text-gray-400 italic">No description added.</span>}</p>
            )}
          </div>

          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User size={14} />
              <span>Assigned to <span className="font-medium text-ink">{task.assignee.name || task.assignee}</span></span>
            </div>
          )}

          {/* Save / Cancel */}
          {isEditing && (
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSave}
                className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-canvas transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Comments Section — SRS Phase 4 */}
        <div className="bg-surface border border-line rounded-2xl p-6">
          <h2 className="font-display font-semibold mb-4">
            Comments <span className="text-gray-400 font-normal text-sm">({comments.length})</span>
          </h2>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentUser.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm border border-line rounded-xl px-3 py-2 bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-primary text-white px-3 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </div>
          </form>

          {/* Comment List */}
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                    {c.author?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{c.author?.name || 'User'}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{c.text}</p>
                  </div>
                  {c.author?._id === currentUser.id && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
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
