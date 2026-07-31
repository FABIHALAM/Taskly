import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, Sparkles, LayoutGrid, AlignLeft, ShieldCheck, Zap, Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function AuthPage() {
  const navigate = useNavigate()
  const { dark, setDark } = useTheme()
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
    <div className={`min-h-screen w-full flex items-center justify-center p-4 md:p-8 font-body selection:bg-indigo-500/20 selection:text-indigo-200 relative overflow-hidden transition-colors duration-300 ${
      dark ? 'bg-[#030408]' : 'bg-[#f8fafc]'
    }`}>
      
      {/* High-Contrast Cyber Grid Pattern */}
      <div className={`absolute inset-0 [background-size:32px_32px] opacity-80 pointer-events-none transition-colors duration-300 ${
        dark 
          ? 'bg-[radial-gradient(rgba(99,102,241,0.12)1.5px,transparent_1.5px)]' 
          : 'bg-[radial-gradient(rgba(99,102,241,0.06)1.5px,transparent_1.5px)]'
      }`} />

      {/* Glowing Neon Aura Backlights (High Contrast glow) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />

      {/* Main Glassmorphic Split Container */}
      <div className={`w-full max-w-5xl rounded-[32px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 transition-all duration-300 ${
        dark 
          ? 'bg-[#0b0c16]/90 border border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.85)]' 
          : 'bg-[#ffffff]/90 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
      }`}>

        {/* ─── LEFT SHOWCASE PANEL (Vibrant Deep Blue/Black Gradient with Neon Glows - Always dark for brand pop) ─────────────────── */}
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

        {/* ─── RIGHT FORM PANEL (Interactive Light/Dark Theme Panel) ─────────────────── */}
        <div className={`lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center relative border-l transition-all duration-300 ${
          dark 
            ? 'bg-[#0c0d16] border-white/5' 
            : 'bg-[#ffffff] border-slate-100'
        }`}>

          {/* Header Title with Theme Toggle (Exactly matching user request) */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 mb-3 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Sparkles size={11} className="text-cyan-400" /> Authorized Access Only
              </div>
              <h1 className={`font-display text-3xl font-black tracking-tight leading-tight transition-colors duration-300 ${
                dark ? 'text-white' : 'text-slate-900'
              }`}>
                Log In to Taskly™
              </h1>
            </div>
            
            <button
              type="button"
              onClick={() => setDark(!dark)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer shadow-sm ${
                dark 
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-950 hover:bg-slate-100'
              }`}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {dark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>
          </div>

          <p className={`text-xs lg:text-sm -mt-4 mb-6 leading-relaxed transition-colors duration-300 ${
            dark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Access is restricted to authorized personnel. Use the secure credentials assigned by your Super Admin.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                dark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Your Email
              </label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...regInput('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  className={`w-full border rounded-2xl pl-10 pr-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 ${
                    dark 
                      ? 'bg-[#121424] border-white/10 text-white placeholder-slate-600 focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                  }`}
                  placeholder="alex@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                dark ? 'text-slate-400' : 'text-slate-500'
              }`}>
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
                  className={`w-full border rounded-2xl pl-10 pr-11 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 ${
                    dark 
                      ? 'bg-[#121424] border-white/10 text-white placeholder-slate-600 focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                  }`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer p-1 ${
                    dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                  }`}
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
            <span className={`text-[9px] font-extrabold uppercase tracking-widest block transition-colors duration-300 ${
              dark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              SECURE WORKSPACE TELEMETRY
            </span>
            <p className={`text-[9px] mt-1 max-w-[280px] mx-auto leading-relaxed transition-colors duration-300 ${
              dark ? 'text-slate-600' : 'text-slate-500'
            }`}>
              If you have lost your credentials, contact the System Administrator to provision your workspace access.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
