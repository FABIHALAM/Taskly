import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { loginUser, registerUser } from '../services/authService'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, User, Crown, UserCheck, Sparkles, Check } from 'lucide-react'

export function AuthPage({ defaultMode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isRegister = location.pathname === '/register' || defaultMode === 'register'

  const [selectedRole, setSelectedRole] = useState('member')

  const {
    register: regInput,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  useEffect(() => {
    reset()
  }, [isRegister, reset])

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

  return (
    <div className="min-h-screen w-full bg-[#08090e] text-white flex items-center justify-center p-4 relative overflow-hidden font-body selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Center Focused Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Brand Mark Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-xl shadow-[0_0_25px_rgba(99,102,241,0.35)] mb-3">
            T
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
            Taskly <Sparkles className="w-4 h-4 text-indigo-400" />
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            Enterprise Project Management & Team Collaboration
          </p>
        </div>

        {/* Clean Glass Container */}
        <div className="bg-[#0f111a] border border-white/[0.08] rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Top Subtle Gradient Glow Line */}
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {/* Segmented Tab Control Switcher */}
          <div className="bg-[#151724] border border-white/[0.06] p-1 rounded-2xl flex items-center mb-6 relative">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative z-10 ${
                !isRegister ? 'text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
              {!isRegister && (
                <motion.div
                  layoutId="auth-tab-pill"
                  className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-md shadow-indigo-500/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative z-10 ${
                isRegister ? 'text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
              {isRegister && (
                <motion.div
                  layoutId="auth-tab-pill"
                  className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-md shadow-indigo-500/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selector (Register Only) */}
            <AnimatePresence>
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Workspace Role
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Manager Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('manager')}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        selectedRole === 'manager'
                          ? 'border-indigo-500/70 bg-indigo-500/10 text-white shadow-sm'
                          : 'border-white/[0.06] bg-[#141622] text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Crown size={15} className={selectedRole === 'manager' ? 'text-indigo-400' : 'text-slate-500'} />
                        <div>
                          <p className="text-xs font-bold font-display">Manager</p>
                          <p className="text-[9px] text-slate-400">Full Access</p>
                        </div>
                      </div>
                      {selectedRole === 'manager' && (
                        <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>

                    {/* Member Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('member')}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        selectedRole === 'member'
                          ? 'border-emerald-500/70 bg-emerald-500/10 text-white shadow-sm'
                          : 'border-white/[0.06] bg-[#141622] text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck size={15} className={selectedRole === 'member' ? 'text-emerald-400' : 'text-slate-500'} />
                        <div>
                          <p className="text-xs font-bold font-display">Member</p>
                          <p className="text-[9px] text-slate-400">Task Execution</p>
                        </div>
                      </div>
                      {selectedRole === 'member' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check size={10} className="text-white" />
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...regInput('name', { required: 'Name is required' })}
                    className="w-full bg-[#141622] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="Alex Morgan"
                  />
                </div>
                {errors.name && <p className="text-rose-400 text-[11px] mt-1 font-medium">{errors.name.message}</p>}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...regInput('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  className="w-full bg-[#141622] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="alex@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-[11px] mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                  className="w-full bg-[#141622] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
              {errors.password && <p className="text-rose-400 text-[11px] mt-1 font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-white text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
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
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-500 text-[11px] mt-6 font-medium">
          Protected by Taskly Enterprise Security & Encrypted JWT Sessions.
        </p>
      </motion.div>
    </div>
  )
}
