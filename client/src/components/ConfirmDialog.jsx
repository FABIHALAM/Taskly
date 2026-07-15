import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <h2 className="font-display text-lg font-semibold">{title}</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 border border-line py-2 rounded-lg text-sm font-medium hover:bg-canvas transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog