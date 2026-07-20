import { useState } from 'react'
import { X, Flag, Calendar, Tag, User, Sparkles, Clock, ListTodo, Plus, Trash2, Wand2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createTask, generateAiSubtasks } from '../services/taskService'

const PRIORITIES = ['Low', 'Medium', 'High']

const priorityColors = {
  Low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  High: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
}

function CreateTaskModal({ projectId, members = [], onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignee: '',
    tagsInput: '',
    estimatedHours: 8,
  })
  const [subtasks, setSubtasks] = useState([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    setSubtasks((prev) => [...prev, { title: newSubtaskTitle.trim(), isCompleted: false }])
    setNewSubtaskTitle('')
  }

  const handleRemoveSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAiAutoBreak = async () => {
    if (!form.title.trim()) {
      return toast.error('Please enter a task title first!')
    }

    setIsAiGenerating(true)
    try {
      const res = await generateAiSubtasks({ title: form.title, description: form.description })
      const data = res.data || {}

      if (data.subtasks && data.subtasks.length > 0) {
        const generated = data.subtasks.map((t) => ({ title: t, isCompleted: false }))
        setSubtasks(generated)
        toast.success(`✨ AI generated ${generated.length} subtasks!`)
      }

      if (data.estimatedHours) {
        handleChange('estimatedHours', data.estimatedHours)
      }

      if (data.suggestedTags && data.suggestedTags.length > 0) {
        handleChange('tagsInput', data.suggestedTags.join(', '))
      }
    } catch {
      toast.error('AI subtask generation failed')
    } finally {
      setIsAiGenerating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Task title is required')

    setIsSubmitting(true)
    try {
      const tags = form.tagsInput
        ? form.tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
        : []

      await createTask(projectId, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        assignee: form.assignee || undefined,
        tags,
        subtasks,
        estimatedHours: Number(form.estimatedHours) || 0,
      })
      toast.success('Task created successfully!')
      onCreated()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-surface border border-line rounded-3xl shadow-2xl w-full max-w-lg my-8 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-canvas/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h2 className="font-display font-bold text-base text-ink">Create Enterprise Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title & AI Auto-Break Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Task Title *
              </label>
              <button
                type="button"
                onClick={handleAiAutoBreak}
                disabled={isAiGenerating || !form.title.trim()}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                <Wand2 size={12} className={isAiGenerating ? 'animate-spin' : ''} />
                <span>{isAiGenerating ? 'Generating...' : '✨ AI Auto-Break Subtasks'}</span>
              </button>
            </div>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Implement user authentication & session management"
              className="w-full text-xs font-medium border border-line rounded-xl px-4 py-3 bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add details, context, or technical requirements..."
              className="w-full text-xs font-medium border border-line rounded-xl px-4 py-2.5 bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Subtasks Checklist Builder */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <ListTodo size={12} /> Subtasks Checklist ({subtasks.length})
            </label>
            <div className="space-y-2 mb-2">
              {subtasks.map((st, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-canvas/60 border border-line/70 px-3 py-2 rounded-xl text-ink"
                >
                  <span className="font-medium">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                placeholder="Add subtask item..."
                className="flex-1 text-xs font-medium border border-line rounded-xl px-3 py-2 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Priority + Due Date + Estimated Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                <Flag size={11} /> Priority
              </label>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleChange('priority', p)}
                    className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-all cursor-pointer ${
                      form.priority === p
                        ? priorityColors[p] + ' shadow-sm'
                        : 'border-line bg-canvas text-slate-400 hover:border-indigo-500/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                <Clock size={11} /> Est. Hours
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.estimatedHours}
                onChange={(e) => handleChange('estimatedHours', e.target.value)}
                className="w-full text-xs font-medium border border-line rounded-xl px-3 py-2 bg-canvas text-ink focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <Calendar size={11} /> Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2 bg-canvas text-ink focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            />
          </div>

          {/* Assignee Dropdown */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <User size={11} /> Assign To
            </label>
            {members.length > 0 ? (
              <select
                value={form.assignee}
                onChange={(e) => handleChange('assignee', e.target.value)}
                className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">— Unassigned —</option>
                {members.map((m) => {
                  const u = m.user || m
                  return (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                      {m.role === 'owner' ? ' 👔 Manager' : ' 👷 Member'}
                    </option>
                  )
                })}
              </select>
            ) : (
              <div className="text-xs text-slate-400 border border-dashed border-line rounded-xl px-3.5 py-2 bg-canvas">
                No members in this project yet
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <Tag size={11} /> Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={form.tagsInput}
              onChange={(e) => handleChange('tagsInput', e.target.value)}
              placeholder="frontend, bug, api"
              className="w-full text-xs font-medium border border-line rounded-xl px-4 py-2 bg-canvas text-ink focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !form.title.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create Enterprise Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 text-xs font-bold text-slate-400 rounded-xl hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal