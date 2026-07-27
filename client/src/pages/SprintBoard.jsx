import { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Play,
  CheckCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  Shield,
  ChevronRight,
} from 'lucide-react'
import DashboardLayout from '../layout/DashboardLayout'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import AppLoader from '../components/AppLoader'

function SprintBoard() {
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [sprints, setSprints] = useState([])
  const [backlogTasks, setBacklogTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
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

  const fetchSprintsAndBacklog = async (pId) => {
    if (!pId || pId === 'undefined' || pId === 'null') return
    try {
      const res = await api.get(`/sprints/project/${pId}`)
      setSprints(res.data.data?.sprints || [])
      setBacklogTasks(res.data.data?.backlogTasks || [])
    } catch (err) {
      // Silent fail — dont spam toast on load error
      console.error('Sprint fetch error:', err?.response?.data || err.message)
    }
  }

  useEffect(() => {
    if (selectedProjectId) fetchSprintsAndBacklog(selectedProjectId)
  }, [selectedProjectId])

  const handleCreateSprint = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Sprint name is required')
      return
    }
    try {
      await api.post('/sprints', { ...formData, projectId: selectedProjectId })
      toast.success('🏃 Sprint Created!')
      setFormData({ name: '', goal: '', startDate: '', endDate: '' })
      setIsModalOpen(false)
      fetchSprintsAndBacklog(selectedProjectId)
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.details
        || err?.message
        || 'Failed to create sprint'
      toast.error(`❌ ${msg}`)
      console.error('Sprint create error:', err?.response?.data)
    }
  }

  const handleSprintStatus = async (sprintId, status) => {
    try {
      await api.patch(`/sprints/${sprintId}/status`, { status })
      toast.success(`Sprint status updated to ${status}`)
      fetchSprintsAndBacklog(selectedProjectId)
    } catch (err) {
      toast.error('Failed to update sprint status')
    }
  }

  const handleAssignTaskToSprint = async (taskId, sprintId) => {
    try {
      await api.patch(`/sprints/tasks/${taskId}/assign`, { sprintId })
      toast.success('Task moved successfully!')
      fetchSprintsAndBacklog(selectedProjectId)
    } catch (err) {
      toast.error('Failed to move task')
    }
  }

  if (isLoading) return <AppLoader message="Loading Sprint & Backlog Board..." />

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
              <Layers size={13} />
              <span>Agile Scrum Sprint & Backlog Planning</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              Sprint Backlog & Release Board
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Plan 2-week iterations, organize backlogs, and start/complete active sprints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs font-bold border border-line rounded-xl px-3.5 py-2.5 bg-surface text-ink focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <Plus size={16} /> Plan New Sprint
            </button>
          </div>
        </div>

        {/* Sprint Iterations */}
        <div className="space-y-6">
          {sprints.map((s) => (
            <div key={s._id} className="bg-surface border border-line rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-lg text-ink">{s.name}</h3>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        s.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : s.status === 'Completed'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-canvas text-slate-400 border-line'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  {s.goal && <p className="text-xs text-slate-300 italic mt-1">Goal: "{s.goal}"</p>}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar size={13} className="text-indigo-400" />
                    {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
                  </span>

                  {s.status === 'Planned' && (
                    <button
                      onClick={() => handleSprintStatus(s._id, 'Active')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Play size={12} /> Start Sprint
                    </button>
                  )}

                  {s.status === 'Active' && (
                    <button
                      onClick={() => handleSprintStatus(s._id, 'Completed')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle size={12} /> Complete Sprint
                    </button>
                  )}
                </div>
              </div>

              {/* Sprint Tasks */}
              <div className="space-y-2">
                {!s.tasks || s.tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 bg-canvas rounded-2xl text-center border border-line">
                    No tasks assigned to this sprint yet. Move tasks from the Backlog below.
                  </p>
                ) : (
                  <div className="divide-y divide-line bg-canvas rounded-2xl border border-line overflow-hidden">
                    {s.tasks.map((t) => (
                      <div key={t._id} className="p-3.5 flex items-center justify-between hover:bg-surface/50 transition-colors text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-ink font-display">{t.title}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {t.priority}
                          </span>
                          <span className="text-[10px] text-slate-400">{t.status}</span>
                        </div>

                        <button
                          onClick={() => handleAssignTaskToSprint(t._id, null)}
                          className="text-[10px] font-bold text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          Move to Backlog ↩
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Product Backlog */}
          <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                📋 Product Backlog ({backlogTasks.length} Unplanned Tasks)
              </h3>
            </div>

            {backlogTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">Backlog is empty!</p>
            ) : (
              <div className="divide-y divide-line bg-canvas rounded-2xl border border-line overflow-hidden">
                {backlogTasks.map((t) => (
                  <div key={t._id} className="p-3.5 flex items-center justify-between hover:bg-surface/50 transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-ink font-display">{t.title}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        {t.priority}
                      </span>
                    </div>

                    {sprints.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleAssignTaskToSprint(t._id, e.target.value)
                        }}
                        className="text-[11px] font-bold border border-line rounded-lg px-2 py-1 bg-surface text-ink cursor-pointer"
                      >
                        <option value="">Move to Sprint...</option>
                        {sprints.map((sp) => (
                          <option key={sp._id} value={sp._id}>
                            🏃 {sp.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Sprint Modal */}
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
                    <Layers size={20} className="text-indigo-400" /> Plan New Sprint Iteration
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-ink">
                    ✖
                  </button>
                </div>

                <form onSubmit={handleCreateSprint} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Sprint Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sprint 1 - Auth & Core API"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Sprint Goal
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ship Enterprise User Provisioning"
                      value={formData.goal}
                      onChange={(e) => setFormData((p) => ({ ...p, goal: e.target.value }))}
                      className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                        className="w-full text-xs font-medium border border-line rounded-xl px-3 py-2.5 bg-canvas text-ink focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                        className="w-full text-xs font-medium border border-line rounded-xl px-3 py-2.5 bg-canvas text-ink focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
                    >
                      Create Sprint
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

export default SprintBoard
