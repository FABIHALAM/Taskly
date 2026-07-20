import { useState } from 'react'
import { X, Flag, Calendar, Tag, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { createTask } from '../services/taskService'

const PRIORITIES = ['Low', 'Medium', 'High']

const priorityColors = {
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  High: 'bg-red-100 text-red-700 border-red-200',
}

function CreateTaskModal({ projectId, members = [], onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignee: '',
    tagsInput: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }))

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
      })
      toast.success('Task created!')
      onCreated()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-line rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-display font-semibold text-ink">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-ink hover:bg-canvas transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Task Title *
            </label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-sm border border-line rounded-xl px-3.5 py-2.5 bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add details about this task..."
              className="w-full text-sm border border-line rounded-xl px-3.5 py-2.5 bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <Flag size={11} /> Priority
              </label>
              <div className="flex gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleChange('priority', p)}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-all ${
                      form.priority === p
                        ? priorityColors[p] + ' scale-105 shadow-sm'
                        : 'border-line bg-canvas text-gray-400 hover:border-primary/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <Calendar size={11} /> Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full text-sm border border-line rounded-xl px-3 py-2 bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Assignee Dropdown */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              <User size={11} /> Assign To
            </label>
            {members.length > 0 ? (
              <select
                value={form.assignee}
                onChange={(e) => handleChange('assignee', e.target.value)}
                className="w-full text-sm border border-line rounded-xl px-3.5 py-2.5 bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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
              <div className="text-sm text-gray-400 border border-dashed border-line rounded-xl px-3.5 py-2.5 bg-canvas/50">
                No members in this project yet — add members first
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              <Tag size={11} /> Tags
            </label>
            <input
              type="text"
              value={form.tagsInput}
              onChange={(e) => handleChange('tagsInput', e.target.value)}
              placeholder="frontend, bug, api  (comma separated)"
              className="w-full text-sm border border-line rounded-xl px-3.5 py-2.5 bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !form.title.trim()}
              className="flex-1 bg-primary text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 text-sm font-medium text-gray-500 rounded-xl hover:bg-canvas transition-colors"
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