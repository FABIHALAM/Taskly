import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function CreateTaskModal({ isOpen, onClose, onCreate }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = (data) => {
    onCreate(data)
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">New Task</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Design the login page"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  {...register('priority')}
                  className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue="Medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-line py-2 rounded-lg text-sm font-medium hover:bg-canvas transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CreateTaskModal