import { motion } from 'framer-motion'

export function AppLoader({ message = 'Loading workspace...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0c10] text-slate-100 selection:bg-indigo-500/20 font-body">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6"
      >
        {/* Minimalist Logo Mark */}
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#141620] border border-white/15 shadow-xl flex items-center justify-center font-display font-black text-xl text-white tracking-tight">
            T
          </div>
          {/* Subtle spinning accent ring */}
          <div className="absolute -inset-2 rounded-3xl border border-indigo-500/30 border-t-indigo-500 animate-spin" />
        </div>

        {/* Status text with clean typography */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-display font-bold text-sm tracking-tight text-white">
            Taskly Enterprise
          </span>
          <span className="text-xs text-slate-400 font-mono tracking-wide">
            {message}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default AppLoader
