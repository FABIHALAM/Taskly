import { Moon, Sun, Bell, Shield, Palette, Sparkles } from 'lucide-react'
import DashboardLayout from '../layout/DashboardLayout'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'

function Settings() {
  const { dark, setDark } = useTheme()

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <Sparkles size={12} />
            <span>System Preferences</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Customize application theme, notification alerts, and account preferences
          </p>
        </div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-line rounded-3xl p-7 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-ink">Appearance & Theme</h2>
              <p className="text-xs text-slate-400 font-medium">Choose your preferred workspace aesthetic</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-line">
            <div>
              <p className="text-xs font-bold text-ink">Dark Mode Experience</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Toggle ambient dark mode mesh theme</p>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={() => setDark(!dark)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer ${dark ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${dark ? 'translate-x-7' : ''}`}
              >
                {dark ? <Moon size={11} className="text-indigo-600" /> : <Sun size={11} className="text-amber-500" />}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 pt-3 text-xs text-slate-400 font-medium">
            <span>Active mode:</span>
            <span className={`font-bold px-3 py-1 rounded-full text-[11px] ${dark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
              {dark ? '🌙 Ambient Dark Theme' : '☀️ Clean Light Theme'}
            </span>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface border border-line rounded-3xl p-7 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-ink">Notification Alerts</h2>
              <p className="text-xs text-slate-400 font-medium">Configure real-time workspace updates</p>
            </div>
          </div>
          <div className="space-y-4 border-t border-line pt-2">
            {[
              { label: 'Task assigned to me', desc: 'Receive instant notification when assigned to a task' },
              { label: 'Comment on my task', desc: 'Receive notification when team members comment on your tasks' },
              { label: 'Added to new project', desc: 'Receive notification when invited to a project board' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
                <div>
                  <p className="text-xs font-bold text-ink">{item.label}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-indigo-600 w-4 h-4 cursor-pointer" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-line rounded-3xl p-7 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-ink">Security & Account</h2>
              <p className="text-xs text-slate-400 font-medium">Manage credentials and session details</p>
            </div>
          </div>
          <div className="space-y-3 border-t border-line pt-2 text-xs text-slate-500 font-medium">
            <div className="flex items-center justify-between py-2.5 border-b border-line">
              <span className="font-bold text-ink">Password Security</span>
              <span className="text-xs font-mono text-slate-400">••••••••••••</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-bold text-ink">System Version</span>
              <span className="text-xs font-mono text-indigo-500 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full">Taskly v2.4 Enterprise</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default Settings