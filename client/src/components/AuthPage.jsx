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
        // Attempt GPS Geolocation
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

            // Reverse Geocode
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

        // Fallback to IP Geolocation if GPS not granted
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
    <div className="min-h-screen w-full bg-[#07080f] text-slate-100 flex items-center justify-center p-4 md:p-8 font-body selection:bg-indigo-500/20 selection:text-indigo-200 relative overflow-hidden">
      {/* Universal Background Radial Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.08)1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      {/* Vibrant Cyber Ambient Backlight */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Split Container (Obsidian High Contrast - Matches Dashboard Sidebar branding) */}
      <div className="w-full max-w-5xl bg-[#0f111a]/95 backdrop-blur-2xl border border-white/5 rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* ─── LEFT SHOWCASE PANEL (Obsidian Charcoal with Indigo/Cyan gradients) ─────────────────── */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-[#0c0d15] via-[#0f111a] to-[#161825] relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">

          {/* Abstract 3D Geometric Ribbon Art (Cyber style) */}
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 opacity-30 blur-2xl pointer-events-none" />

          {/* Top Brand Mark */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/15">
                <div className="w-full h-full bg-[#07080f] rounded-[14px] flex items-center justify-center font-display font-black text-xl text-white">
                  T
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-white block leading-none">Taskly™</span>
                <span className="text-[10px] text-cyan-400 font-mono tracking-wider">WORKSPACE ENTERPRISE</span>
              </div>
            </div>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5 backdrop-blur-md">
              <Zap size={12} className="text-cyan-400" /> Version 2.0
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold shadow-sm">
                  <FeatureIcon size={14} className="text-cyan-400" />
                  <span>{currentFeature.title}</span>
                </div>

                <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                  High-performance team management software
                </h2>

                <p className="text-slate-400 text-xs lg:text-sm leading-relaxed font-medium">
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
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-500/5'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {f.title}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Info Note */}
          <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-semibold font-mono">
            <span>SECURE AES ENCRYPTION</span>
            <span className="text-cyan-500">v2.0 PRODUCTION</span>
          </div>
        </div>

        {/* ─── RIGHT FORM PANEL (Brightened & High Contrast) ─────────────────── */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-[#0f111a] flex flex-col justify-center relative">

          {/* Header Title */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3 uppercase tracking-wider">
              Secure Sign In
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Log In to Taskly™
            </h1>
            <p className="text-slate-400 text-xs lg:text-sm mt-1.5 font-medium">
              Access is restricted to registered users only. Use the credentials provided by your Administrator.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Your Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...regInput('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  className="w-full bg-[#161824] border border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  placeholder="alex@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Your Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...regInput('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                  className="w-full bg-[#161824] border border-white/5 rounded-xl pl-10 pr-10 py-3.5 text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
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
              {errors.password && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            {/* Electric Cyan/Indigo Gradient Button (Cyber style) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-xs bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 active:scale-[0.99] transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Secure Admin Note */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Authorized personnel only
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
