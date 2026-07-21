import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, User, Settings, LogOut, Bell, Search, Sun, Moon, Sparkles, Crown, UserCheck } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { getNotifications, markAllRead } from '../services/notificationService'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import CommandPalette from '../components/CommandPalette'

function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, setDark } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Role pill text
  const isManager = user.role === 'manager' || user.role === 'admin'

  // Command Palette State
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false)

  // Notification States
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  // Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const notificationRef = useRef(null)
  const searchRef = useRef(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to load notifications', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  // Handle Search Input
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null)
      return
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await api.get(`/search?q=${searchQuery.trim()}`)
        setSearchResults(res.data.data)
      } catch (err) {
        console.error('Global search failed', err)
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <div className={`flex min-h-screen bg-canvas text-ink ${dark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col fixed h-screen z-20 border-r border-white/5 shadow-2xl">
        {/* Brand Logo */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              T
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Taskly <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block -mt-0.5">ENTERPRISE</span>
            </div>
          </Link>
          <button
            onClick={() => setDark(!dark)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="Toggle color theme"
          >
            {dark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Workspace Nav
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3.5 border-t border-white/5 bg-black/20">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-2 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-bold truncate text-white font-display">{user.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email || ''}</p>
            </div>
            {isManager ? (
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Crown size={9} /> Manager
              </span>
            ) : (
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <UserCheck size={9} /> Member
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 w-full transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-line px-8 flex items-center justify-between bg-surface/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm transition-colors">
          {/* Quick Search */}
          <div className="relative w-80 cursor-pointer" onClick={() => setIsCmdPaletteOpen(true)} ref={searchRef}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              readOnly
              placeholder="Search or type command... (Ctrl+K)"
              className="w-full text-xs border border-line rounded-xl pl-9 pr-8 py-2 bg-canvas focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium cursor-pointer"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-surface px-1.5 py-0.5 rounded border border-line">
              ⌘K
            </span>

            {/* Quick Search Dropdown */}
            <AnimatePresence>
              {showSearch && searchQuery.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-12 left-0 w-96 bg-surface border border-line rounded-2xl shadow-2xl p-4 max-h-96 overflow-y-auto z-30"
                >
                  {isSearching ? (
                    <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      Searching workspace...
                    </div>
                  ) : !searchResults || (searchResults.projects.length === 0 && searchResults.tasks.length === 0) ? (
                    <p className="text-xs text-slate-400 py-6 text-center italic">No matching results found</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Projects Section */}
                      {searchResults.projects.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-line pb-1.5 mb-2">
                            Projects ({searchResults.projects.length})
                          </span>
                          <div className="space-y-1">
                            {searchResults.projects.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  navigate(`/projects/${p.id}`)
                                  setShowSearch(false)
                                  setSearchQuery('')
                                }}
                                className="p-2.5 hover:bg-canvas rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2 border border-transparent hover:border-line"
                              >
                                <span>📁</span>
                                <span className="text-ink">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tasks Section */}
                      {searchResults.tasks.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-line pb-1.5 mb-2">
                            Tasks ({searchResults.tasks.length})
                          </span>
                          <div className="space-y-1">
                            {searchResults.tasks.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => {
                                  navigate(`/projects/${t.projectId || ''}/tasks/${t.id}`)
                                  setShowSearch(false)
                                  setSearchQuery('')
                                }}
                                className="p-2.5 hover:bg-canvas rounded-xl cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-line"
                              >
                                <div className="truncate pr-2">
                                  <p className="text-xs font-bold text-ink truncate">{t.title}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{t.projectName}</p>
                                </div>
                                <span
                                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                                    t.status === 'Done'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notification bell */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl border border-line hover:bg-canvas text-slate-500 hover:text-ink relative transition-colors cursor-pointer"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-80 bg-surface border border-line rounded-2xl shadow-2xl p-4 max-h-96 overflow-y-auto z-30"
                  >
                    <div className="flex items-center justify-between border-b border-line pb-2.5 mb-3">
                      <span className="text-xs font-bold font-display uppercase tracking-wider text-ink">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-8 text-center italic">No notifications yet</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.slice(0, 10).map((n) => (
                          <div
                            key={n._id}
                            className={`p-3 rounded-xl border text-xs flex gap-2.5 items-start transition-colors ${
                              n.isRead ? 'border-line bg-canvas/30 text-slate-500' : 'border-indigo-500/20 bg-indigo-500/5 text-ink'
                            }`}
                          >
                            <div className="flex-1">
                              <p className="leading-snug font-medium">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-8 bg-canvas relative">{children}</main>
      </div>

      <CommandPalette isOpen={isCmdPaletteOpen} onClose={(val) => setIsCmdPaletteOpen(typeof val === 'boolean' ? val : false)} />
    </div>
  )
}

export default DashboardLayout