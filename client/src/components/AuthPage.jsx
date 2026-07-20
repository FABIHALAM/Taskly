import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { loginUser, registerUser } from '../services/authService'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, User, Crown, UserCheck, Check, Sparkles, LayoutGrid, AlignLeft, ShieldCheck, Zap } from 'lucide-react'

export function AuthPage({ defaultMode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isRegister = location.pathname === '/register' || defaultMode === 'register'

  const [selectedRole, setSelectedRole] = useState('member')
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)

  const {
    register: regInput,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  useEffect(() => {
    reset()
  }, [isRegister, reset])

  const features = [
    {
      title: 'TasklyIdeas™ Board',
      desc: 'Fluid drag-and-drop Kanban columns for complete task tracking.',
      icon: LayoutGrid,
    },
    {
      title: 'Gantt Timeline Sync',
      desc: 'Interactive 14-day timeline view to monitor deadlines & milestones.',
      icon: AlignLeft,
    },
    {
      title: 'Role-Based Access',
      desc: 'Manager controls project settings while members execute assigned tasks.',
      icon: ShieldCheck,
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [features.length])

  const onSubmit = async (data) => {
    try {
      if (isRegister) {
        await registerUser({ ...data, role: selectedRole })
        toast.success('Account created! Please sign in.')
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
      toast.error(error.response?.data?.message || (isRegister ? 'Registration failed' : 'Sign in failed'))
    }
  }

  const currentFeature = features[activeFeatureIndex]
  const FeatureIcon = currentFeature.icon

  return (
    <div className="min-h-screen w-full bg-[#120d2b] text-white flex items-center justify-center p-4 md:p-8 font-body selection:bg-cyan-400/20 selection:text-cyan-200 relative overflow-hidden">
      {/* Universal Background Radial Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(129,140,248,0.2)1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      {/* Vibrant Ambient Backlight */}
      <div className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Split Container (Brightened & Vibrant - Inspired by Ref Image 1 & 2) */}
      <div className="w-full max-w-5xl bg-[#1a1438]/95 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* ─── LEFT SHOWCASE PANEL (Vibrant Indigo/Purple) ─────────────────── */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-[#3b1c78] via-[#2c135c] to-[#1c0a42] relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-white/15">

          {/* Abstract 3D Geometric Ribbon Art (Ref Image 1) */}
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 opacity-40 blur-2xl pointer-events-none" />

          {/* Top Brand Mark */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-400 to-purple-500 p-[2px] shadow-lg shadow-cyan-500/25">
                <div className="w-full h-full bg-[#1c0a42] rounded-[14px] flex items-center justify-center font-display font-black text-xl text-cyan-300">
                  T
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-white block leading-none">Taskly™</span>
                <span className="text-[10px] text-cyan-300 font-mono tracking-wider">INNOVATION STARTS HERE</span>
              </div>
            </div>

            <span className="text-[11px] font-bold px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white flex items-center gap-1.5 backdrop-blur-md">
              <Zap size={12} className="text-cyan-400" /> Enterprise
            </span>
          </div>

          {/* Middle Headline & Interactive Preview */}
          <div className="relative z-10 my-10 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeatureIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-200 text-xs font-bold shadow-sm">
                  <FeatureIcon size={14} />
                  <span>{currentFeature.title}</span>
                </div>

                <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                  You will be managing core workflows with Taskly Ideas™
                </h2>

                <p className="text-slate-200 text-xs lg:text-sm leading-relaxed font-medium">
                  {currentFeature.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {features.map((f, idx) => (
                <button
                  key={f.title}
                  onClick={() => setActiveFeatureIndex(idx)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeFeatureIndex === idx
                      ? 'bg-cyan-400/25 border-cyan-400 text-cyan-100 shadow-md'
                      : 'bg-white/10 border-white/15 text-slate-300 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {f.title}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Info Note */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Encrypted Authentication</span>
            <span className="text-cyan-300 font-bold">v2.4 Production</span>
          </div>
        </div>

        {/* ─── RIGHT FORM PANEL (Brightened & High Contrast) ─────────────────── */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-[#201844] flex flex-col justify-center relative">

          {/* Segmented Control Tab Switcher */}
          <div className="bg-[#291f54] p-1 rounded-2xl border border-white/15 flex items-center mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer relative z-10 ${
                !isRegister ? 'text-slate-950 font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
              {!isRegister && (
                <motion.div
                  layoutId="auth-active-tab-bright"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 rounded-xl -z-10 shadow-md"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer relative z-10 ${
                isRegister ? 'text-slate-950 font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              Create Account
              {isRegister && (
                <motion.div
                  layoutId="auth-active-tab-bright"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 rounded-xl -z-10 shadow-md"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          </div>

          {/* Header Title */}
          <div className="mb-6">
            <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {isRegister ? 'Create Your Account' : 'Log In to Taskly™'}
            </h1>
            <p className="text-slate-300 text-xs lg:text-sm mt-1 font-medium">
              {isRegister ? 'Select your role and enter credentials to join.' : 'Enter your email and password to access workspace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selector (Register Mode) */}
            <AnimatePresence>
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Workspace Role
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('manager')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        selectedRole === 'manager'
                          ? 'border-cyan-400 bg-cyan-400/20 text-white shadow-sm'
                          : 'border-white/15 bg-[#291f54] text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Crown size={15} className={selectedRole === 'manager' ? 'text-cyan-300' : 'text-slate-400'} />
                        <div>
                          <p className="text-xs font-bold font-display">Manager</p>
                          <p className="text-[9px] text-slate-300">Create & Assign</p>
                        </div>
                      </div>
                      {selectedRole === 'manager' && (
                        <div className="w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center">
                          <Check size={10} className="text-slate-950 font-bold" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('member')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        selectedRole === 'member'
                          ? 'border-emerald-400 bg-emerald-400/20 text-white shadow-sm'
                          : 'border-white/15 bg-[#291f54] text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck size={15} className={selectedRole === 'member' ? 'text-emerald-300' : 'text-slate-400'} />
                        <div>
                          <p className="text-xs font-bold font-display">Member</p>
                          <p className="text-[9px] text-slate-300">Execute Tasks</p>
                        </div>
                      </div>
                      {selectedRole === 'member' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                          <Check size={10} className="text-slate-950 font-bold" />
                        </div>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name Input (Register Only) */}
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...regInput('name', { required: 'Name is required' })}
                    className="w-full bg-[#291f54] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                    placeholder="Alex Morgan"
                  />
                </div>
                {errors.name && <p className="text-rose-300 text-xs mt-1 font-medium">{errors.name.message}</p>}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Your Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...regInput('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  className="w-full bg-[#291f54] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                  placeholder="alex@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-300 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Your Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...regInput('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                  className="w-full bg-[#291f54] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
              {errors.password && <p className="text-rose-300 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            {/* Electric Cyan/Teal CTA Submit Button (Ref Image 1 & 2 Inspired) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-black text-slate-950 text-xs bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 hover:from-cyan-300 hover:to-indigo-200 active:scale-[0.99] transition-all shadow-[0_0_35px_rgba(56,189,248,0.4)] hover:shadow-[0_0_45px_rgba(56,189,248,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? `Create ${selectedRole === 'manager' ? 'Manager' : 'Member'} Account` : 'Log In'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
