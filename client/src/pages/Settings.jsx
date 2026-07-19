import { Moon, Sun, Bell, Shield, Palette } from 'lucide-react'
import DashboardLayout from '../layout/DashboardLayout'
import { useTheme } from '../context/ThemeContext'

function Settings() {
  const { dark, setDark } = useTheme()

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-semibold mb-6">Settings</h1>

        {/* Appearance */}
        <div className="bg-surface border border-line rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <Palette size={18} className="text-primary" />
            <h2 className="font-display font-semibold">Appearance</h2>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-line">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark theme</p>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={() => setDark(!dark)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${dark ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center ${dark ? 'translate-x-6' : ''}`}
              >
                {dark ? <Moon size={10} className="text-primary" /> : <Sun size={10} className="text-yellow-500" />}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 py-3 text-sm text-gray-500">
            <span>Current theme:</span>
            <span className={`font-medium px-2 py-0.5 rounded-md text-xs ${dark ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-600'}`}>
              {dark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface border border-line rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <Bell size={18} className="text-primary" />
            <h2 className="font-display font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Task assigned to me', desc: 'Get notified when a task is assigned to you' },
              { label: 'Comment on my task', desc: 'Get notified when someone comments on your task' },
              { label: 'Added to project', desc: 'Get notified when you are added to a project' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-primary w-4 h-4 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="bg-surface border border-line rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <Shield size={18} className="text-primary" />
            <h2 className="font-display font-semibold">Account</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex items-center justify-between py-2 border-b border-line">
              <span>Password</span>
              <span className="text-xs text-gray-400">••••••••</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Account created</span>
              <span className="text-xs text-gray-400">{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Settings