import { useState, useEffect } from 'react'
import {
  User,
  Briefcase,
  Mail,
  CheckCircle,
  Clock,
  Crown,
  UserCheck,
  Sparkles,
  Camera,
  Edit3,
  Save,
  Phone,
  FileText,
  Lock,
} from 'lucide-react'
import DashboardLayout from '../layout/DashboardLayout'
import { getDashboardAnalytics } from '../services/analyticsService'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [stats, setStats] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
    password: '',
  })

  const isManager = user.role === 'manager' || user.role === 'admin'

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const [profRes, statsRes] = await Promise.all([
          api.get('/auth/me'),
          getDashboardAnalytics().catch(() => ({ data: null })),
        ])
        const freshUser = profRes.data?.data || user
        setUser(freshUser)
        localStorage.setItem('user', JSON.stringify(freshUser))
        setFormData({
          name: freshUser.name || '',
          bio: freshUser.bio || '',
          phone: freshUser.phone || '',
          avatar: freshUser.avatar || '',
          password: '',
        })
        if (statsRes.data) setStats(statsRes.data)
      } catch (err) {
        console.error('Failed to load profile details', err)
      }
    }
    fetchProfileAndStats()
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 300
        const MAX_HEIGHT = 300
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
        setFormData((prev) => ({ ...prev, avatar: compressedDataUrl }))
        toast.success('Photo uploaded & optimized!')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }))
    toast.success('Photo removed. Save profile to apply changes.')
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await api.put('/auth/me', formData)
      const updatedUser = res.data.data
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const userInitial = user.name ? user.name[0].toUpperCase() : 'U'

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
              <Sparkles size={12} />
              <span>User Identity</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">User Profile</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage personal info, custom avatar, bio, and productivity metrics.
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-surface text-xs font-bold text-ink hover:border-indigo-500/40 transition-all shadow-sm cursor-pointer"
          >
            <Edit3 size={15} className="text-indigo-500" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar & Roles Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-line rounded-3xl p-7 flex flex-col items-center text-center shadow-sm relative overflow-hidden"
          >
            <div className="relative group mb-4">
              {formData.avatar || user.avatar ? (
                <img
                  src={formData.avatar || user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-surface shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 border-4 border-surface shadow-xl flex items-center justify-center text-white text-3xl font-extrabold font-display">
                  {userInitial}
                </div>
              )}

              {isEditing && (
                <label className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs">
                  <Camera size={20} className="mb-1 text-cyan-300" />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            {isEditing && (formData.avatar || user.avatar) && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:underline mb-2 cursor-pointer"
              >
                🗑️ Remove Photo
              </button>
            )}

            <h2 className="font-display font-extrabold text-xl text-ink">{user.name || 'User'}</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</p>
            {user.bio && <p className="text-xs text-slate-300 italic mt-3 max-w-xs">{user.bio}</p>}

            <div className="mt-5">
              {isManager ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
                  <Crown size={12} /> Manager Role
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
                  <UserCheck size={12} /> Member Role
                </span>
              )}
            </div>
          </motion.div>

          {/* Details & Editable Profile Form */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-surface border border-line rounded-3xl p-7 shadow-sm"
            >
              <h3 className="font-display font-bold text-base text-ink mb-4">Account Details & Profile Settings</h3>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +92 300 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Personal Bio / Designation
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell your team about your role, skills, or hobbies..."
                      value={formData.bio}
                      onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                      className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep existing password"
                      value={formData.password}
                      onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                      className="w-full text-xs font-medium border border-line rounded-xl px-3.5 py-2.5 bg-canvas text-ink focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-line rounded-xl text-xs font-bold text-slate-400 hover:bg-canvas cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Save size={14} /> Save Profile
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-line rounded-2xl bg-canvas">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Full Name</span>
                    <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-ink">
                      <User size={14} className="text-indigo-500" />
                      <span>{user.name || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-4 border border-line rounded-2xl bg-canvas">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Email Address</span>
                    <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-ink">
                      <Mail size={14} className="text-indigo-500" />
                      <span>{user.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-4 border border-line rounded-2xl bg-canvas">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Phone Number</span>
                    <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-ink">
                      <Phone size={14} className="text-indigo-500" />
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="p-4 border border-line rounded-2xl bg-canvas">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Workspace Role</span>
                    <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-ink">
                      <Briefcase size={14} className="text-indigo-500" />
                      <span>{user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Project Manager' : 'Team Member'}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Performance metrics */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface border border-line rounded-3xl p-7 shadow-sm"
            >
              <h3 className="font-display font-bold text-base text-ink mb-4">Task Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <CheckCircle size={22} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-3xl font-extrabold font-display text-ink">
                    {stats?.byStatus?.['Done'] || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Completed Tasks</p>
                </div>

                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <Clock size={22} className="text-indigo-500 mx-auto mb-2" />
                  <p className="text-3xl font-extrabold font-display text-ink">
                    {stats?.totalTasksAssigned || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Assigned Tasks</p>
                </div>

                <div className="p-4 border border-line rounded-2xl bg-canvas">
                  <Clock size={22} className="text-rose-500 mx-auto mb-2" />
                  <p className="text-3xl font-extrabold font-display text-ink">
                    {stats?.overdueTasks?.length || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Overdue Tasks</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile