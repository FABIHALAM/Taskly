import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FolderKanban, LayoutDashboard, User, Moon, Sun, Download, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else onClose(true) // Toggle open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  const actions = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Overview stats & assigned tasks',
      icon: LayoutDashboard,
      run: () => { navigate('/dashboard'); onClose() }
    },
    {
      id: 'projects',
      title: 'View Projects',
      subtitle: 'Browse all active workspace projects',
      icon: FolderKanban,
      run: () => { navigate('/projects'); onClose() }
    },
    {
      id: 'profile',
      title: 'View Profile',
      subtitle: 'Manage profile & role details',
      icon: User,
      run: () => { navigate('/profile'); onClose() }
    },
    {
      id: 'theme',
      title: isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle global application theme',
      icon: isDark ? Sun : Moon,
      run: () => { toggleTheme(); onClose() }
    },
  ]

  const filteredActions = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#141624] border border-white/15 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden text-white font-body relative"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#181a2c]">
            <Search className="w-5 h-5 text-indigo-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search workspace... (Esc to close)"
              className="w-full text-xs font-medium bg-transparent text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => onClose()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Actions List */}
          <div className="p-3 max-h-80 overflow-y-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
              Quick Commands
            </span>

            {filteredActions.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center italic">No matching commands found</p>
            ) : (
              filteredActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={action.run}
                    className="w-full p-3 rounded-2xl border border-transparent hover:border-indigo-500/40 hover:bg-indigo-500/10 text-left flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-indigo-500/40 group-hover:text-indigo-400 transition-colors">
                        <Icon size={16} className="text-slate-300 group-hover:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold font-display text-white group-hover:text-indigo-300">
                          {action.title}
                        </p>
                        <p className="text-[10px] text-slate-400">{action.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>
                )
              })
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-5 py-3 border-t border-white/10 bg-[#181a2c] flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">Ctrl+K</span>
              <span>or</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">⌘K</span>
              <span>to toggle anytime</span>
            </div>
            <span className="text-indigo-400 font-bold">Taskly Quick Actions</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CommandPalette
