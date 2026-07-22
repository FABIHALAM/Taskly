import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  User,
  Flag,
  Trash2,
  Edit3,
  Send,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Tag,
  Clock,
  Play,
  Pause,
  Save,
  CheckSquare,
  Square,
  Mic,
  Square as StopSquare,
  Volume2,
  ListTodo,
  MessageSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../layout/DashboardLayout'
import { getTasksByProject, updateTask, deleteTask, toggleSubtask } from '../services/taskService'
import { getComments, addComment, deleteComment } from '../services/commentService'
import AppLoader from '../components/AppLoader'

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

  // Live Stopwatch State
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef(null)

  // Voice Note State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin'

  const loadTask = async () => {
    try {
      const res = await getTasksByProject(projectId, {})
      const found = res.data?.tasks?.find((t) => t._id === taskId)
      if (!found) {
        toast.error('Task not found')
        navigate(-1)
        return
      }
      setTask(found)
      setEditData({
        title: found.title,
        description: found.description || '',
        priority: found.priority,
        status: found.status,
        dueDate: found.dueDate ? new Date(found.dueDate).toISOString().split('T')[0] : '',
        tagsInput: found.tags ? found.tags.join(', ') : '',
        estimatedHours: found.estimatedHours || 8,
        loggedHours: found.loggedHours || 0,
      })
    } catch {
      toast.error('Failed to load task')
    } finally {
      setIsLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const res = await getComments(taskId)
      setComments(res.data || [])
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    loadTask()
    loadComments()
  }, [taskId])

  // Stopwatch interval handler
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isTimerRunning])

  const handleSaveTimer = async () => {
    const additionalHours = Number((elapsedSeconds / 3600).toFixed(2))
    if (additionalHours <= 0) return toast.error('Timer has not logged any time yet')

    const newLoggedHours = Number(((task.loggedHours || 0) + additionalHours).toFixed(2))
    try {
      await updateTask(taskId, { loggedHours: newLoggedHours })
      toast.success(`Logged +${additionalHours} hrs successfully!`)
      setIsTimerRunning(false)
      setElapsedSeconds(0)
      loadTask()
    } catch {
      toast.error('Failed to log hours')
    }
  }

  const handleToggleSubtaskItem = async (subtaskId) => {
    try {
      await toggleSubtask(taskId, subtaskId)
      loadTask()
    } catch {
      toast.error('Failed to toggle subtask')
    }
  }

  // Voice Note Recording Handlers
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = async () => {
          const base64Audio = reader.result
          try {
            await addComment(taskId, { text: '🎙️ Voice Note Comment', audioUrl: base64Audio })
            toast.success('Voice note comment posted!')
            loadComments()
          } catch {
            toast.error('Failed to post voice comment')
          }
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch {
      toast.error('Microphone access denied or unsupported')
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
      clearInterval(recordingIntervalRef.current)
    }
  }

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
        estimatedHours: Number(editData.estimatedHours),
        loggedHours: Number(editData.loggedHours),
      })
      toast.success('Task updated successfully!')
      setIsEditing(false)
      loadTask()
    } catch {
      toast.error('Failed to update task')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      toast.success('Task deleted')
      navigate(`/projects/${projectId}`)
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await addComment(taskId, { text: newComment.trim() })
      setNewComment('')
      loadComments()
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId)
      loadComments()
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  if (isLoading) return <AppLoader message="Loading task details..." />
  if (!task) return null

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'
  const subtasksList = task.subtasks || []
  const completedSubtasks = subtasksList.filter((s) => s.isCompleted).length

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    const secs = totalSec % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Back Link */}
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Board
        </button>

        {/* Task Header Card */}
        <div className="bg-surface border border-line rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${statusColors[task.status]}`}>
                  {task.status}
                </span>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${priorityColors[task.priority]}`}>
                  {task.priority} Priority
                </span>
                {isOverdue && (
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
                    <AlertTriangle size={11} /> Overdue
                  </span>
                )}
              </div>

              {isEditing ? (
                <input
                  value={editData.title}
                  onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full font-display font-extrabold text-xl border border-line rounded-xl px-3 py-2 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <h1 className="font-display font-extrabold text-2xl text-ink tracking-tight">{task.title}</h1>
              )}
            </div>

            {/* Manager vs Member Action Badge */}
            <div className="flex items-center gap-2">
              {isManager ? (
                isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-2 border border-line text-xs font-bold text-slate-400 rounded-xl hover:bg-canvas transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2.5 border border-line rounded-xl text-slate-400 hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
                      title="Edit Task (Manager Only)"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2.5 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Delete Task (Manager Only)"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )
              ) : (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <UserCheck size={13} /> Member Execution Mode
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="pt-2 border-t border-line/60">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            {isEditing ? (
              <textarea
                rows={3}
                value={editData.description}
                onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                className="w-full text-xs border border-line rounded-xl p-3 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-line/60 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Assignee
              </span>
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <User size={13} className="text-indigo-400" />
                <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Due Date
              </span>
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <Calendar size={13} className="text-amber-400" />
                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Logged Hours
              </span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Clock size={13} />
                <span>{task.loggedHours || 0} / {task.estimatedHours || 8} hrs</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Subtask Ratio
              </span>
              <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                <ListTodo size={13} />
                <span>{completedSubtasks}/{subtasksList.length} Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── LIVE TIME TRACKER STOPWATCH CARD ─────────────────────────────────── */}
        <div className="bg-surface border border-line rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="font-display font-bold text-sm text-ink">Live Task Stopwatch Timer</h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isTimerRunning ? (
              <button
                onClick={() => setIsTimerRunning(true)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
              >
                <Play size={14} /> Start Timer
              </button>
            ) : (
              <button
                onClick={() => setIsTimerRunning(false)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Pause size={14} /> Pause Timer
              </button>
            )}

            <button
              onClick={handleSaveTimer}
              disabled={elapsedSeconds === 0}
              className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save size={14} /> Log Hours
            </button>
          </div>
        </div>

        {/* ─── SUBTASKS CHECKLIST CARD ────────────────────────────────────────────── */}
        <div className="bg-surface border border-line rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-cyan-400" />
              <h2 className="font-display font-bold text-sm text-ink">Subtasks Checklist</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {completedSubtasks} of {subtasksList.length} completed
            </span>
          </div>

          {/* Subtask Progress Bar */}
          {subtasksList.length > 0 && (
            <div className="w-full h-1.5 bg-line/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                style={{ width: `${(completedSubtasks / subtasksList.length) * 100}%` }}
              />
            </div>
          )}

          {subtasksList.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium italic">No subtasks added for this task.</p>
          ) : (
            <div className="space-y-2">
              {subtasksList.map((st) => (
                <button
                  key={st._id}
                  onClick={() => handleToggleSubtaskItem(st._id)}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    st.isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through'
                      : 'bg-canvas border-line text-ink hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {st.isCompleted ? (
                      <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Square size={16} className="text-slate-400 shrink-0" />
                    )}
                    <span>{st.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── MANAGER ↔ MEMBER DEDICATED TASK CHAT SECTION ─────────────────────── */}
        <div className="bg-surface border border-line rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="font-display font-bold text-base text-ink flex items-center gap-2">
                <MessageSquare className="text-cyan-400" size={18} /> Manager ↔ Assignee Direct Conversation
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Dedicated task discussion thread for Manager & Assignee ({task.assignee ? task.assignee.name : 'Unassigned'}).
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              {comments.length} Messages
            </span>
          </div>

          {/* Add Comment & Voice Note Bar */}
          <form onSubmit={handleAddComment} className="space-y-3">
            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a message to manager/assignee..."
                className="flex-1 text-xs border border-line rounded-xl px-4 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send size={13} /> Send
              </button>
            </div>

            {/* Voice Recorder Button */}
            <div className="flex items-center gap-3 pt-1">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <Mic size={13} /> Record Voice Message
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-xl transition-all animate-pulse cursor-pointer"
                >
                  <StopSquare size={13} /> Stop Recording ({recordingTime}s)
                </button>
              )}
            </div>
          </form>

          {/* Comments / Messages List with Role Badges */}
          <div className="space-y-3 pt-2">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No discussion messages yet. Start the conversation!</p>
            ) : (
              comments.map((c) => {
                const authorRole = c.author?.role
                const isAssignee = task.assignee && (c.author?._id === task.assignee._id || c.author?.id === task.assignee._id)
                const isTaskOwner = authorRole === 'manager' || authorRole === 'admin'

                return (
                  <div key={c._id} className="bg-canvas border border-line/60 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink font-display">{c.author?.name || 'User'}</span>
                        {isTaskOwner ? (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            👔 Manager
                          </span>
                        ) : isAssignee ? (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            👷 Assignee
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
                            👤 Member
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {c.text && <p className="text-xs text-slate-300 font-medium leading-relaxed">{c.text}</p>}

                    {/* Inline Voice Note Audio Player */}
                    {c.audioUrl && (
                      <div className="flex items-center gap-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mt-2">
                        <Volume2 size={16} className="text-cyan-400 shrink-0" />
                        <audio controls src={c.audioUrl} className="w-full h-8" />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TaskDetail
