import { motion } from 'framer-motion'

export function AppLoader({ message = 'Loading workspace...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080e] text-white selection:bg-indigo-500/30">
      {/* Background ambient lighting */}
      <div className="absolute w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-5 relative z-10"
      >
        {/* Animated Brand Logo Icon */}
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] animate-pulse">
            T
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur-sm -z-10" />
        </div>

        {/* Progress Spinner Line */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="w-full h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
          />
        </div>

        {/* Subtext */}
        <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider">
          {message}
        </span>
      </motion.div>
    </div>
  )
}

export default AppLoader
