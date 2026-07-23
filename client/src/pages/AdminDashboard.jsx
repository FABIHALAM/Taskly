import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  UserPlus,
  Users,
  Crown,
  UserCheck,
  Ban,
  CheckCircle,
  Search,
  X,
  Sparkles,
  RefreshCw,
  Zap,
  Clock,
  Briefcase,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import DashboardLayout from '../layout/DashboardLayout'
import api from '../services/api'
import AppLoader from '../components/AppLoader'

function AdminDashboard() {
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeTab, setActiveTab] = useState('users') // 'users' | 'analytics'

  // Create User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member',
    department: 'Engineering',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState(null)

  const fetchUsersAndAnalytics = async () => {
    try {
      const [userRes, projRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/projects'),
        api.get('/analytics/overview').catch(() => ({ data: { data: null } })),
      ])
      setUsers(userRes.data.data || [])
      setProjects(projRes.data.data || [])
      setAnalytics(analyticsRes.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load workspace users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser.role !== 'admin') {
      toast.error('Access Denied: Super Admin Privileges Required')
      navigate('/dashboard')
      return
    }
    fetchUsersAndAnalytics()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      toast.success(`User role updated to ${newRole}`)
      fetchUsersAndAnalytics()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active'
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus })
      toast.success(`User account ${newStatus.toLowerCase()} successfully`)
      fetchUsersAndAnalytics()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) return
    setIsSubmitting(true)
    try {
      const res = await api.post('/admin/create-user', formData)
      toast.success('Account provisioned! Credentials sent to Gmail.')
      setCreatedCredentials(res.data.data)
      setFormData({ name: '', email: '', role: 'member', department: 'Engineering' })
      fetchUsersAndAnalytics()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = !roleFilter || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalUsers = users.length
  const totalManagers = users.filter((u) => u.role === 'manager').length
  const totalMembers = users.filter((u) => u.role === 'member').length
  const totalSuspended = users.filter((u) => u.status === 'Suspended').length

  const formatLastLogin = (dateStr) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMins = Math.floor((now - date) / (1000 * 60))
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHrs = Math.floor(diffMins / 60)
    if (diffHrs < 24) return `${diffHrs}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) return <AppLoader message="Loading Super Admin Portal..." />

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
              <ShieldAlert size={13} />
              <span>Enterprise Super Admin Portal</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              Org Control, Live Monitoring & Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live user login tracking, current assigned work deadlines, and full organizational performance metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Tabs */}
            <div className="flex rounded-xl border border-line bg-surface p-1 shadow-sm text-xs font-bold">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-ink'
                }`}
              >
                <Users size={14} /> Live User Control
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-ink'
                }`}
              >
                <BarChart3 size={14} /> Org Analytics
              </button>
            </div>

            <button
              onClick={() => {
                setCreatedCredentials(null)
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer shrink-0"
            >
              <UserPlus size={16} /> Provision User
            </button>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-ink font-display">{totalUsers}</p>
              <p className="text-[11px] font-bold text-slate-400">Total Company Users</p>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Crown size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-ink font-display">{totalManagers}</p>
              <p className="text-[11px] font-bold text-slate-400">Project Managers</p>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-ink font-display">{totalMembers}</p>
              <p className="text-[11px] font-bold text-slate-400">Execution Engineers</p>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <Ban size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-ink font-display">{totalSuspended}</p>
              <p className="text-[11px] font-bold text-slate-400">Suspended Accounts</p>
            </div>
          </div>
        </div>

        {/* ─── TAB 1: LIVE USER CONTROL & WORKFLOW TRACKING ──────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-4 border border-line rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search by name or email address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium border border-line rounded-xl pl-9 pr-3 py-2 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400">Role Filter:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs font-semibold border border-line rounded-xl px-3 py-2 bg-canvas text-ink focus:outline-none cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="admin">👑 Super Admin</option>
                  <option value="manager">👔 Manager</option>
                  <option value="member">👷 Member</option>
                </select>
              </div>
            </div>

            {/* User Management Table */}
            <div className="bg-surface border border-line rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-canvas/50 border-b border-line text-slate-400 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-6 py-4">User Info</th>
                      <th className="px-6 py-4">Last Login</th>
                      <th className="px-6 py-4">Current Active Work & Deadline</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                          No matching company users found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelf = u._id === currentUser.id
                        const task = u.currentTask

                        return (
                          <tr key={u._id} className="hover:bg-canvas/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm uppercase">
                                  {u.name ? u.name[0] : 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-ink font-display">{u.name}</p>
                                  <p className="text-[11px] text-slate-400">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-canvas px-2.5 py-1 rounded-lg border border-line">
                                <Clock size={11} className="text-cyan-400" />
                                {formatLastLogin(u.lastLogin)}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              {task ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-ink truncate max-w-[180px]">{task.title}</span>
                                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                      {task.projectName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px]">
                                    <span className="text-slate-400">Status: <strong className="text-slate-200">{task.status}</strong></span>
                                    {task.dueDate && (
                                      <span className={`font-bold flex items-center gap-0.5 ${task.isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {task.isOverdue && <AlertTriangle size={10} />}
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No active task assigned</span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              {isSelf ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] border border-indigo-500/30">
                                  <Crown size={12} /> Super Admin
                                </span>
                              ) : (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                  className="text-xs font-bold border border-line rounded-xl px-2.5 py-1 bg-canvas text-ink focus:outline-none cursor-pointer"
                                >
                                  <option value="member">👷 Member</option>
                                  <option value="manager">👔 Manager</option>
                                  <option value="admin">👑 Super Admin</option>
                                </select>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                  u.status === 'Suspended'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}
                              >
                                {u.status === 'Suspended' ? <Ban size={11} /> : <CheckCircle size={11} />}
                                {u.status || 'Active'}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-right">
                              {!isSelf && (
                                <button
                                  onClick={() => handleStatusToggle(u._id, u.status)}
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                    u.status === 'Suspended'
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                      : 'border border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                                  }`}
                                >
                                  {u.status === 'Suspended' ? 'Activate' : 'Suspend'}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: ORGANIZATIONAL ANALYTICS DASHBOARD ──────────────────── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Visual Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-ink flex items-center gap-2">
                    <TrendingUp className="text-indigo-400" size={18} /> Task Velocity Ratio
                  </span>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    High Efficiency
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Total Completion</span>
                    <span className="text-emerald-400">{analytics?.completedTasks || 0} / {analytics?.totalTasks || 0} Tasks</span>
                  </div>
                  <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-line">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full"
                      style={{
                        width: `${analytics?.totalTasks ? (analytics.completedTasks / analytics.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-ink flex items-center gap-2">
                    <Activity className="text-cyan-400" size={18} /> Active Projects Velocity
                  </span>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    {projects.length} Active
                  </span>
                </div>
                <p className="text-2xl font-black text-ink font-display">{projects.length} Active Workspaces</p>
                <p className="text-xs text-slate-400">All project workspaces monitored with live health scores.</p>
              </div>

              <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-ink flex items-center gap-2">
                    <PieChart className="text-emerald-400" size={18} /> Role Distribution Ratio
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Balanced
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold pt-1">
                  <div className="flex-1 p-3 rounded-2xl bg-canvas border border-line text-center">
                    <p className="text-indigo-400 text-lg font-black font-display">{totalManagers}</p>
                    <p className="text-[10px] text-slate-400">Managers</p>
                  </div>
                  <div className="flex-1 p-3 rounded-2xl bg-canvas border border-line text-center">
                    <p className="text-cyan-400 text-lg font-black font-display">{totalMembers}</p>
                    <p className="text-[10px] text-slate-400">Engineers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Overview List */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                <Briefcase className="text-indigo-400" size={18} /> Organization Project Directory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div key={p._id} className="p-4 rounded-2xl bg-canvas border border-line space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-sm text-ink">{p.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {p.members ? p.members.length : 1} Members
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{p.description || 'No description provided.'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── PROVISION USER MODAL ────────────────────────────────────── */}
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
                    <UserPlus size={20} className="text-cyan-400" /> Provision Company Account
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-ink">
                    <X size={20} />
                  </button>
                </div>

                {createdCredentials ? (
                  <div className="space-y-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <Sparkles size={16} /> Credentials Dispatched via Gmail!
                    </div>
                    <p className="text-xs text-slate-300">
                      An official welcome email with login credentials has been sent to <strong>{createdCredentials.email}</strong>.
                    </p>
                    <div className="bg-canvas border border-line p-3 rounded-xl space-y-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-400">Email:</span> <strong className="text-white">{createdCredentials.email}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Temp Password:</span>{' '}
                        <strong className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {createdCredentials.tempPassword}
                        </strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setCreatedCredentials(null)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Provision Another User
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Usman Khan"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Corporate Gmail Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. usman@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Assigned Role
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                          className="w-full text-xs font-bold border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none cursor-pointer"
                        >
                          <option value="member">👷 Member (Engineer)</option>
                          <option value="manager">👔 Manager (Lead)</option>
                          <option value="admin">👑 Super Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Department
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Engineering"
                          value={formData.department}
                          onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                          className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> Provisioning & Dispatching Credentials...
                          </>
                        ) : (
                          <>
                            <Zap size={15} /> Create Account & Dispatch Credentials
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
