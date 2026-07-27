import { useState, useEffect } from 'react'
import {
  Zap,
  Plus,
  Play,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Shield,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Settings,
} from 'lucide-react'
import DashboardLayout from '../layout/DashboardLayout'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import AppLoader from '../components/AppLoader'

function Automations() {
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [rules, setRules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    trigger: 'STATUS_DONE',
    action: 'NOTIFY_MANAGER',
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects')
        const projs = res.data.data || []
        setProjects(projs)
        if (projs.length > 0) {
          const firstId = projs[0]._id || projs[0].id || ''
          setSelectedProjectId(firstId)
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        console.warn('Failed to load projects', err)
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const fetchRules = async (pId) => {
    if (!pId || pId === 'undefined' || pId === 'null') return
    try {
      const res = await api.get(`/automations/project/${pId}`)
      setRules(res.data.data || [])
    } catch (err) {
      // Silent fail on load
      console.error('Automation rules fetch error:', err?.response?.data || err.message)
    }
  }

  useEffect(() => {
    if (selectedProjectId) fetchRules(selectedProjectId)
  }, [selectedProjectId])

  const handleCreateRule = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    try {
      await api.post('/automations', { ...formData, projectId: selectedProjectId })
      toast.success('⚡ Automation Rule Deployed!')
      setFormData({ title: '', trigger: 'STATUS_DONE', action: 'NOTIFY_MANAGER' })
      setIsModalOpen(false)
      fetchRules(selectedProjectId)
    } catch (err) {
      toast.error('Failed to create rule')
    }
  }

  const handleToggleRule = async (id) => {
    try {
      await api.patch(`/automations/${id}/toggle`)
      toast.success('Rule status updated')
      fetchRules(selectedProjectId)
    } catch (err) {
      toast.error('Failed to update rule')
    }
  }

  const triggerLabels = {
    STATUS_DONE: 'Task Status changes to "Done"',
    DUE_SOON: 'Deadline is within 24 Hours',
    PRIORITY_HIGH: 'Task Priority set to "High"',
    TASK_CREATED: 'New Task Created',
  }

  const actionLabels = {
    AUTO_PRIORITY_HIGH: 'Automatically set Task Priority to "High"',
    NOTIFY_MANAGER: 'Send Notification Alert to Project Lead',
    AUTO_ASSIGN_OWNER: 'Auto-Assign Task to Project Lead',
    EMAIL_ALERT: 'Dispatch Gmail Alert to Workspace Manager',
  }

  if (isLoading) return <AppLoader message="Loading Automation Engine..." />

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
              <Zap size={13} />
              <span>Jira-Style Enterprise Automation Engine</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              Workflow Automations & Smart Triggers
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure event-driven IF/THEN automation rules to streamline project execution automatically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs font-bold border border-line rounded-xl px-3.5 py-2.5 bg-surface text-ink focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  📁 {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Plus size={16} /> Create Automation Rule
            </button>
          </div>
        </div>

        {/* Rule List */}
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="bg-surface border border-line rounded-3xl p-12 text-center space-y-3">
              <Zap className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <h3 className="font-display font-bold text-base text-ink">No Active Automation Rules</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Create event triggers (e.g. auto-notifying leads when tasks complete) to make your workspace operate automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((r) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-surface border rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden ${
                    r.isActive ? 'border-cyan-500/30' : 'border-line opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                      Rule #{r._id.slice(-4)}
                    </span>
                    <button
                      onClick={() => handleToggleRule(r._id)}
                      className="text-slate-400 hover:text-cyan-400 cursor-pointer"
                    >
                      {r.isActive ? (
                        <ToggleRight size={24} className="text-cyan-400" />
                      ) : (
                        <ToggleLeft size={24} />
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display font-extrabold text-base text-ink">{r.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Executed <strong>{r.executionCount}</strong> times automatically
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-canvas border border-line space-y-2 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold uppercase text-[9px] tracking-wider">WHEN:</span>
                      <span className="text-slate-200">{triggerLabels[r.trigger]}</span>
                    </div>
                    <div className="flex items-center gap-2 border-t border-line pt-2">
                      <span className="text-indigo-400 font-bold uppercase text-[9px] tracking-wider">THEN:</span>
                      <span className="text-indigo-300 font-bold">{actionLabels[r.action]}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-line rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-5"
              >
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                    <Zap size={20} className="text-cyan-400" /> Build Workflow Rule
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-ink">
                    ✖
                  </button>
                </div>

                <form onSubmit={handleCreateRule} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Rule Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Notify Lead on Done"
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      WHEN (Trigger Event)
                    </label>
                    <select
                      value={formData.trigger}
                      onChange={(e) => setFormData((p) => ({ ...p, trigger: e.target.value }))}
                      className="w-full text-xs font-bold border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none cursor-pointer"
                    >
                      <option value="STATUS_DONE">⚡ Task Status changes to "Done"</option>
                      <option value="PRIORITY_HIGH">⚡ Task Priority set to "High"</option>
                      <option value="TASK_CREATED">⚡ New Task Created</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      THEN EXECUTE (Automated Action)
                    </label>
                    <select
                      value={formData.action}
                      onChange={(e) => setFormData((p) => ({ ...p, action: e.target.value }))}
                      className="w-full text-xs font-bold border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none cursor-pointer"
                    >
                      <option value="NOTIFY_MANAGER">🔔 Notify Project Lead</option>
                      <option value="AUTO_PRIORITY_HIGH">🔥 Auto-Set Task Priority to High</option>
                      <option value="AUTO_ASSIGN_OWNER">👤 Auto-Assign Task to Project Owner</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
                    >
                      Deploy Rule to Workspace
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}

export default Automations
