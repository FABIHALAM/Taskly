import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function AppLoader({ message = 'Initializing Taskly Workspace...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0814] text-white selection:bg-cyan-500/20 font-body">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-7 relative z-10"
      >
        {/* Sleek Minimal 3D Geometric Ring Mark (Inspired by Ref Image 1) */}
        <div className="relative flex items-center justify-center">
          {/* Outer Ring */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#06b6d4] p-[2px] shadow-[0_0_40px_rgba(79,70,229,0.35)]">
            <div className="w-full h-full bg-[#0e0b1f] rounded-[22px] flex items-center justify-center">
              <span className="font-display font-black text-2xl bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                T
              </span>
            </div>
          </div>

          {/* Rotating Subtle Accent Orbit */}
          <div className="absolute -inset-2.5 rounded-[28px] border border-cyan-400/30 border-t-cyan-400 animate-spin" style={{ animationDuration: '2.5s' }} />
        </div>

        {/* Brand Name & Typography */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <h2 className="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
            Taskly <Sparkles className="w-4 h-4 text-cyan-400" />
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            {message}
          </p>
        </div>

        {/* Premium Progress Bar */}
        <div className="w-52 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          />
        </div>
      </motion.div>
    </div>
  )
}

export default AppLoader
