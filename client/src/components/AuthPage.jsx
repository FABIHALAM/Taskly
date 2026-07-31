import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, Sparkles, LayoutGrid, AlignLeft, ShieldCheck, Zap, Eye, EyeOff } from 'lucide-react'

export function AuthPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)

  const {
    register: regInput,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

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
    }, 4500)
    return () => clearInterval(timer)
  }, [features.length])

  const onSubmit = async (data) => {
    try {
      // Pinpoint GPS Geolocation + IP Lookup
      let locationStr = 'Islamabad, Pakistan'
      let latitude = null
      let longitude = null

      try {
        if ('geolocation' in navigator) {
          const gpsPosition = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve(pos),
              () => resolve(null),
              { timeout: 5000, enableHighAccuracy: true }
            )
          })

          if (gpsPosition && gpsPosition.coords) {
            latitude = gpsPosition.coords.latitude
            longitude = gpsPosition.coords.longitude

            try {
              const revRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              ).then((r) => r.json())

              if (revRes && (revRes.city || revRes.locality)) {
                const district = revRes.locality || revRes.city || ''
                const country = revRes.countryName || 'Pakistan'
                locationStr = `${district}, ${country}`
              }
            } catch (revErr) {
              locationStr = `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`
            }
          }
        }

        if (!latitude) {
          const geoRes = await fetch('https://ipapi.co/json/').then((r) => r.json()).catch(() => null)
          if (geoRes && geoRes.city) {
            locationStr = `${geoRes.city}, ${geoRes.country_name}`
            latitude = geoRes.latitude || null
            longitude = geoRes.longitude || null
          }
        }
      } catch (geoErr) {
        console.warn('Geolocation capture fallback:', geoErr)
      }

      const result = await loginUser({
        ...data,
        clientLocation: locationStr,
        latitude,
        longitude,
      })
      const { accessToken, refreshToken, user } = result.data

      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      const profileRes = await api.get('/auth/me')
      const freshUser = profileRes.data?.data || user
      localStorage.setItem('user', JSON.stringify(freshUser))

      toast.success(`Welcome back, ${freshUser.name || 'User'}!`)
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sign in failed. Check your credentials.')
    }
  }

  const currentFeature = features[activeFeatureIndex]
  const FeatureIcon = currentFeature.icon

  return (
    <div className="min-h-screen w-full bg-[#030408] text-slate-100 flex items-center justify-center p-4 md:p-8 font-body selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
      
      {/* High-Contrast Cyber Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.12)1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-80 pointer-events-none" />

      {/* Massive Glowing Neon Aura Backlights (High Contrast) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/25 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none animate-pulse" />

      {/* Main Glassmorphic Split Container */}
      <div className="w-full max-w-5xl bg-[#0b0c16]/90 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* ─── LEFT SHOWCASE PANEL (Vibrant Deep Blue/Black Gradient with Neon Glows) ─────────────────── */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-[#080915] via-[#0b0d1e] to-[#121635] relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">

          {/* Glowing neon corner overlay */}
          <div className="absolute -top-12 -left-12 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-500/30 to-cyan-500/30 opacity-40 blur-3xl pointer-events-none" />

          {/* Top Brand Mark */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[2px] shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                <div className="w-full h-full bg-[#05060f] rounded-[14px] flex items-center justify-center font-display font-black text-xl text-white">
                  T
                </div>
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-tight text-white block leading-none">Taskly™</span>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest font-extrabold uppercase">Enterprise Portal</span>
              </div>
            </div>

            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Zap size={11} className="text-cyan-400 animate-bounce" /> V2.0 LIVE
            </span>
          </div>

          {/* Middle Headline & Interactive Preview */}
          <div className="relative z-10 my-12 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeatureIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  <FeatureIcon size={14} className="text-cyan-400" />
                  <span>{currentFeature.title}</span>
                </div>

                <h2 className="font-display text-2xl lg:text-3xl font-black text-white leading-tight">
                  High-performance team management software
                </h2>

                <p className="text-slate-300 text-xs lg:text-sm leading-relaxed font-semibold">
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
                  className={`text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeFeatureIndex === idx
                      ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                      : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {f.title}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Info Note */}
          <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-extrabold font-mono tracking-wider">
            <span>SECURE SYSTEM ACCESS</span>
            <span className="text-cyan-400">SSL ENCRYPTED</span>
          </div>
        </div>

        {/* ─── RIGHT FORM PANEL (High Contrast Glow Panel) ─────────────────── */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-[#0c0d16] flex flex-col justify-center relative border-l border-white/5">

          {/* Header Title */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 mb-3.5 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <Sparkles size={11} className="text-cyan-400" /> Authorized Access Only
            </div>
            <h1 className="font-display text-3xl font-black text-white tracking-tight leading-tight">
              Log In to Taskly™
            </h1>
            <p className="text-slate-400 text-xs lg:text-sm mt-2 leading-relaxed">
              Access is restricted to authorized personnel. Use the secure credentials assigned by your Super Admin.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Your Email
              </label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...regInput('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  className="w-full bg-[#121424] border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  placeholder="alex@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Your Password
              </label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...regInput('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                  className="w-full bg-[#121424] border border-white/10 rounded-2xl pl-10 pr-11 py-3.5 text-white placeholder-slate-600 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1 font-semibold">{errors.password.message}</p>}
            </div>

            {/* Glowing High-Contrast Indigo/Cyan Gradient Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-5 rounded-2xl font-black text-white text-xs bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Secure Admin Note */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">
              SECURE WORKSPACE TELEMETRY
            </span>
            <p className="text-[9px] text-slate-600 mt-1 max-w-[280px] mx-auto leading-relaxed">
              If you have lost your credentials, contact the System Administrator to provision your workspace access.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
