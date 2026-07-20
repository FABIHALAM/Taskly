import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { loginUser, registerUser } from '../services/authService'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User, Crown,
  UserCheck, CheckCircle2, LayoutGrid, AlignLeft, BarChart3, Users, Zap
} from 'lucide-react'

// Feature slides for the showcase carousel
const SHOWCASE_SLIDES = [
  {
    icon: LayoutGrid,
    badge: 'Kanban Workflows',
    title: 'Streamline team tasks with fluid drag-and-drop boards',
    desc: 'Organize project deliverables into customizable status columns with real-time status syncing.',
    previewType: 'kanban',
  },
  {
    icon: AlignLeft,
    badge: 'Gantt Timelines',
    title: 'Visualize project deadlines & milestone schedules',
    desc: 'Interactive 14-day timeline view to track task durations and prevent deadline collisions.',
    previewType: 'timeline',
  },
  {
    icon: Users,
    badge: 'Role Access & Team Sync',
    title: 'Granular Manager & Member permissions',
    desc: 'Managers control project settings and task assignment while members focus on execution.',
    previewType: 'roles',
  },
]

export function AuthPage({ defaultMode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isRegister = location.pathname === '/register' || defaultMode === 'register'

  const [activeSlide, setActiveSlide] = useState(0)
  const [selectedRole, setSelectedRole] = useState('member')

  const {
    register: regInput,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  // Reset form when mode switches
  useEffect(() => {
    reset()
  }, [isRegister, reset])

  // Carousel auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const onSubmit = async (data) => {
    try {
      if (isRegister) {
        await registerUser({ ...data, role: selectedRole })
        toast.success('Account created successfully! Please sign in.')
        navigate('/login')
      } else {
        const result = await loginUser(data)
        const { accessToken, refreshToken, user } = result.data

        localStorage.setItem('token', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        const profileRes = await api.get('/auth/me')
        const freshUser = profileRes.data?.data || user
        localStorage.setItem('user', JSON.stringify(freshUser))

        toast.success(`Welcome back, ${freshUser.name || 'User'}!`)
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || (isRegister ? 'Registration failed' : 'Login failed'))
    }
  }

  const currentSlide = SHOWCASE_SLIDES[activeSlide]
  const SlideIcon = currentSlide.icon

  return (
    <div className="min-h-screen w-full bg-[#06070c] text-white flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-6xl min-h-[680px] bg-[#0d0e17]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* ─── LEFT / SHOWCASE SIDE (Sliding Visual Panel) ─────────────────── */}
        <motion.div
          layout
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-indigo-950/40 via-[#0a0b14] to-[#0d0e1b] relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 ${
            isRegister ? 'lg:order-2 lg:border-l lg:border-white/10' : 'lg:order-1 lg:border-r lg:border-white/10'
          }`}
        >
          {/* Subtle Ambient Mesh Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Info */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30">
                T
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-white block leading-none">Taskly</span>
                <span className="text-[10px] font-mono text-indigo-300 tracking-wider">ENTERPRISE SAAS</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
              <Zap size={12} className="text-amber-400" />
              <span>v2.4 Live</span>
            </div>
          </div>

          {/* Interactive Feature Slider Content */}
          <div className="relative z-10 my-10 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                  <SlideIcon size={14} />
                  <span>{currentSlide.badge}</span>
                </div>

                <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                  {currentSlide.title}
                </h2>

                <p className="text-slate-400 text-xs lg:text-sm leading-relaxed font-medium">
                  {currentSlide.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dynamic Interactive Card Preview Box */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

              {currentSlide.previewType === 'kanban' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-white/10 pb-2">
                    <span className="flex items-center gap-1.5"><LayoutGrid size={13} className="text-indigo-400" /> Project Board</span>
                    <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full">3 Tasks Done</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1.5">
                      <span className="font-bold text-slate-400 block">To Do</span>
                      <div className="bg-[#141625] p-2 rounded-lg border border-white/5 font-medium text-white">API Auth Flow</div>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 space-y-1.5">
                      <span className="font-bold text-indigo-300 block">In Progress</span>
                      <div className="bg-[#141625] p-2 rounded-lg border border-indigo-500/30 font-medium text-white shadow-sm">Gantt Sync</div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 space-y-1.5">
                      <span className="font-bold text-emerald-300 block">Done</span>
                      <div className="bg-[#141625] p-2 rounded-lg border border-emerald-500/30 font-medium text-white">DB Schema</div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide.previewType === 'timeline' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-white/10 pb-2">
                    <span className="flex items-center gap-1.5"><AlignLeft size={13} className="text-purple-400" /> 14-Day Timeline</span>
                    <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full">On Schedule</span>
                  </div>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-16 font-semibold text-slate-400 truncate">Design System</span>
                      <div className="flex-1 bg-white/5 rounded-full h-3 relative">
                        <div className="bg-indigo-500 h-full rounded-full w-3/4 shadow-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 font-semibold text-slate-400 truncate">Backend API</span>
                      <div className="flex-1 bg-white/5 rounded-full h-3 relative">
                        <div className="bg-emerald-500 h-full rounded-full w-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide.previewType === 'roles' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-white/10 pb-2">
                    <span className="flex items-center gap-1.5"><Users size={13} className="text-emerald-400" /> Team Permissions</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl flex items-center gap-2">
                      <Crown size={14} className="text-indigo-400" />
                      <div>
                        <p className="font-bold text-white">Manager</p>
                        <p className="text-[9px] text-slate-400">Full control & assignments</p>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-2">
                      <UserCheck size={14} className="text-emerald-400" />
                      <div>
                        <p className="font-bold text-white">Member</p>
                        <p className="text-[9px] text-slate-400">Execute assigned tasks</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="relative z-10 flex items-center gap-2">
            {SHOWCASE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* ─── RIGHT / FORM SIDE (Sliding Auth Form) ──────────────────────── */}
        <motion.div
          layout
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center relative ${
            isRegister ? 'lg:order-1' : 'lg:order-2'
          }`}
        >
          {/* Top Sliding Tab Switcher */}
          <div className="flex items-center justify-between mb-8">
            <div className="bg-white/[0.04] border border-white/10 p-1 rounded-2xl flex items-center text-xs font-bold w-fit">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  !isRegister ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  isRegister ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Title Header */}
          <div className="mb-6">
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
              {isRegister ? 'Create your workspace account' : 'Welcome back to Taskly'}
            </h1>
            <p className="text-slate-400 text-xs lg:text-sm mt-1.5 font-medium">
              {isRegister
                ? 'Select your role and enter credentials to register.'
                : 'Enter your account details to access your workspace.'
              }
            </p>
          </div>

          {/* Animated Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Role Selection (Register Mode Only) */}
            <AnimatePresence>
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Choose Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('manager')}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center gap-3 ${
                        selectedRole === 'manager'
                          ? 'border-indigo-500/80 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${selectedRole === 'manager' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Crown size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-display">Manager</p>
                        <p className="text-[10px] text-slate-400">Create & Assign</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('member')}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center gap-3 ${
                        selectedRole === 'member'
                          ? 'border-emerald-500/80 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${selectedRole === 'member' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <UserCheck size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-display">Member</p>
                        <p className="text-[10px] text-slate-400">Execute Tasks</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name Field (Register Only) */}
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...regInput('name', { required: 'Name is required' })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="Alex Morgan"
                  />
                </div>
                {errors.name && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.name.message}</p>}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...regInput('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="alex@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...regInput('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-xs bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? `Create ${selectedRole === 'manager' ? 'Manager' : 'Member'} Account` : 'Sign In to Workspace'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Toggle Link */}
            <p className="text-center text-slate-400 text-xs mt-5 font-medium">
              {isRegister ? 'Already registered?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => navigate(isRegister ? '/login' : '/register')}
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline-offset-4 hover:underline cursor-pointer"
              >
                {isRegister ? 'Sign in instead' : 'Create an account'}
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
