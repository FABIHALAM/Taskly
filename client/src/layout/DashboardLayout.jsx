import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, User, Settings, LogOut, Bell, Search, Sun, Moon, CheckCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { getNotifications, markAllRead } from '../services/notificationService'
import api from '../services/api'
import toast from 'react-hot-toast'

function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, setDark } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

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
    // Poll notifications every 30 seconds
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
    }, 3000) // 300ms debounce

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
      <aside className="w-60 bg-sidebar text-white flex flex-col fixed h-screen z-20">
        <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-mint bg-clip-text text-transparent">
            Taskly
          </h1>
          <button
            onClick={() => setDark(!dark)}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
            title="Toggle theme"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-6 border-t border-white/5 pt-4 bg-sidebar">
          <div className="px-3 pb-3 flex flex-col">
            <p className="text-sm font-semibold truncate text-white">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white w-full transition-colors font-medium"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-line px-8 flex items-center justify-between bg-surface sticky top-0 z-10 shadow-sm">
          {/* Quick Search */}
          <div className="relative w-72" ref={searchRef}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search tasks, projects..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearch(true)
              }}
              onFocus={() => setShowSearch(true)}
              className="w-full text-xs border border-line rounded-lg pl-9 pr-3 py-2 bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />

            {/* Quick Search Dropdown */}
            {showSearch && searchQuery.trim().length >= 2 && (
              <div className="absolute top-12 left-0 w-80 bg-surface border border-line rounded-xl shadow-lg p-3 max-h-96 overflow-y-auto z-30">
                {isSearching ? (
                  <p className="text-xs text-gray-400 py-2 text-center">Searching...</p>
                ) : !searchResults || (searchResults.projects.length === 0 && searchResults.tasks.length === 0) ? (
                  <p className="text-xs text-gray-400 py-2 text-center">No matches found</p>
                ) : (
                  <div className="space-y-3">
                    {/* Projects Section */}
                    {searchResults.projects.length > 0 && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block border-b border-line pb-1 mb-1">
                          Projects
                        </span>
                        {searchResults.projects.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              navigate(`/projects/${p.id}`)
                              setShowSearch(false)
                              setSearchQuery('')
                            }}
                            className="p-1.5 hover:bg-canvas rounded text-xs font-medium cursor-pointer transition-colors"
                          >
                            📁 {p.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tasks Section */}
                    {searchResults.tasks.length > 0 && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block border-b border-line pb-1 mb-1">
                          Tasks
                        </span>
                        {searchResults.tasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              navigate(`/projects/${t.projectId || ''}/tasks/${t.id}`)
                              setShowSearch(false)
                              setSearchQuery('')
                            }}
                            className="p-1.5 hover:bg-canvas rounded cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="truncate pr-2">
                              <p className="text-xs font-medium truncate">{t.title}</p>
                              <p className="text-[10px] text-gray-400 truncate">{t.projectName}</p>
                            </div>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 uppercase ${
                                t.status === 'Done' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header: Notification bell */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg border border-line hover:bg-canvas text-gray-500 hover:text-ink relative transition-colors"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-surface border border-line rounded-xl shadow-lg p-3 max-h-96 overflow-y-auto z-30">
                  <div className="flex items-center justify-between border-b border-line pb-2 mb-2">
                    <span className="text-xs font-bold font-display">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-primary hover:underline font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No notifications yet</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id}
                          className={`p-2 rounded-lg border text-xs flex gap-2 items-start transition-colors ${
                            n.isRead ? 'border-line bg-canvas/30' : 'border-primary/20 bg-primary/5'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-gray-700 dark:text-gray-300">{n.message}</p>
                            <p className="text-[9px] text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!n.isRead && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-8 bg-canvas">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout