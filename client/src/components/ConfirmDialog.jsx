import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

function ConfirmDialog({ isOpen = true, title = 'Confirm Action', message, onConfirm, onCancel }) {
  if (isOpen === false) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-surface border border-line rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-rose-500" />
            </div>
            <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-medium">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20 cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={onCancel}
              className="px-5 border border-line py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConfirmDialog