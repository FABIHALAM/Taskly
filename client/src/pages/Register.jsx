import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/authService'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, UserCheck, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react'

function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('member')

  const onSubmit = async (data) => {
    try {
      await registerUser({ ...data, role: selectedRole })
      toast.success('Account created successfully! Please login.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#07080e] overflow-hidden px-4 py-12 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background glowing mesh Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Next-Gen Team Workspace
            </span>
          </motion.div>

          <h1 className="text-4xl font-extrabold text-white font-display tracking-tight">
            Create your account
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Join Taskly to streamline projects, tasks, and team collaboration.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#0f111c]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
          {/* Subtle Glow Top Border */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Select Workspace Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Manager Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('manager')}
                  className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                    selectedRole === 'manager'
                      ? 'border-indigo-500/80 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.2)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${selectedRole === 'manager' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-white block font-display">Manager</span>
                    <span className="text-[11px] text-slate-400 leading-tight block mt-1">
                      Create projects, add members & assign tasks
                    </span>
                  </div>
                  {selectedRole === 'manager' && (
                    <motion.span layoutId="role-indicator" className="absolute top-2.5 right-2.5 text-indigo-400">
                      <CheckCircle2 className="w-4 h-4 fill-indigo-500/20" />
                    </motion.span>
                  )}
                </button>

                {/* Member Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('member')}
                  className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                    selectedRole === 'member'
                      ? 'border-emerald-500/80 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${selectedRole === 'member' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-white block font-display">Member</span>
                    <span className="text-[11px] text-slate-400 leading-tight block mt-1">
                      Execute assigned tasks & add comments
                    </span>
                  </div>
                  {selectedRole === 'member' && (
                    <motion.span layoutId="role-indicator" className="absolute top-2.5 right-2.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                    </motion.span>
                  )}
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Full Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                placeholder="Alex Morgan"
              />
              {errors.name && <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                placeholder="alex@company.com"
              />
              {errors.email && <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                placeholder="••••••••••••"
              />
              {errors.password && <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create {selectedRole === 'manager' ? 'Manager' : 'Member'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-slate-400 text-sm mt-6 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline-offset-4 hover:underline">
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default Register