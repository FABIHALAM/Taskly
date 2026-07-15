import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function CreateProjectModal({ isOpen, onClose, onCreate }) {
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
              <h2 className="font-display text-xl font-semibold">New Project</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  {...register('name', { required: 'Project name is required' })}
                  className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Website Redesign"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...register('description')}
                  className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="What is this project about?"
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
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CreateProjectModal