import { useForm } from 'react-hook-form'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

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
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-line rounded-3xl p-7 w-full max-w-md shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h2 className="font-display text-xl font-bold text-ink">New Project</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Project Name *
                </label>
                <input
                  autoFocus
                  {...register('name', { required: 'Project name is required' })}
                  className="w-full border border-line rounded-xl px-4 py-3 bg-canvas text-ink text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="e.g. Q4 Mobile App Launch"
                />
                {errors.name && (
                  <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="w-full border border-line rounded-xl px-4 py-3 bg-canvas text-ink text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                  rows={3}
                  placeholder="Brief summary of goals, scope, or timeline..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 border border-line py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-canvas transition-colors cursor-pointer"
                >
                  Cancel
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