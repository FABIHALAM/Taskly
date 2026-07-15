import { useNavigate, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, User, Settings, LogOut } from 'lucide-react'

function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="w-60 bg-sidebar text-white flex flex-col fixed h-screen">
        <div className="px-6 py-6">
          <h1 className="font-display text-xl font-bold tracking-tight">Taskly</h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-6 border-t border-white/10 pt-4">
          <div className="px-3 pb-3">
            <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white w-full transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 p-8">{children}</main>
    </div>
  )
}

export default DashboardLayout