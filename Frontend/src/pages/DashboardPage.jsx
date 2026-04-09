import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Globe2, Zap, Shield, BarChart3, ArrowRight, Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getHealth } from '../utils/api'
import { SECTORS } from '../utils/Constants'

export default function DashboardPage() {
  const { user }       = useAuth()
  const navigate       = useNavigate()
  const [health, setHealth] = useState(null)

  useEffect(() => {
    getHealth().then(r => setHealth(r.data)).catch(() => {})
  }, [])

  const featured = SECTORS.slice(0, 6)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

    {/* Hero */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] p-8 shadow-xl animate-fade-in">

    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-transparent to-transparent"></div>

    <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">

    <div>
      <p className="text-primary-400 font-mono text-sm mb-2">
        Welcome back,
        <span className="text-primary-300 ml-1">{user?.username}</span>
      </p>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
        India Trade
        <span className="block text-primary-400">Intelligence</span>
      </h1>

      <p className="text-slate-400 max-w-lg leading-relaxed">
        AI-powered market intelligence for India's fastest-growing sectors.
        Discover real-time trade opportunities, export insights, and
        strategic analysis powered by Gemini AI.
      </p>

      <button
        onClick={() => navigate("/analyze")}
        className="mt-6 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg transition"
      >
        Start Analysis
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>

    <div className="flex flex-col gap-3">
      {health && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/30 border border-green-700/40">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-mono">
            API Online
          </span>
        </div>
      )}

        <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm">
        {health?.active_sessions ?? 0} Active Sessions
        </div>
        </div>
       </div>
    </div> 


      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-slide-up" style={{ animationDelay: "0.1s" }}>
  {[
    { icon: Globe2, label: "Sectors", value: "20+", color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: Zap, label: "AI Powered", value: "Gemini", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { icon: Shield, label: "Secured", value: "JWT", color: "text-green-400", bg: "bg-green-500/10" },
    { icon: BarChart3, label: "Reports Today", value: health?.active_sessions ?? "—", color: "text-purple-400", bg: "bg-purple-500/10" },
  ].map(({ icon: Icon, label, value, color, bg }) => (
    <div
      key={label}
      className="relative bg-[#020617] border border-slate-800 rounded-xl p-5 text-center
      hover:border-primary-500 hover:-translate-y-1 transition-all duration-300 cursor-default group"
    >

      {/* Icon */}
      <div className={`w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>

      {/* Value */}
      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>

      {/* Label */}
      <p className="text-slate-500 text-xs mt-1">
        {label}
      </p>

    </div>
  ))}
    </div>

      {/* Quick analyze */}
    <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
    <h2 className="text-xl font-semibold text-white mb-5">Quick Analyze</h2>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
    {featured.map(({ value, label, icon }) => (
      <button
        key={value}
        onClick={() => navigate(`/analyze?sector=${value}`)}
        className="bg-[#020617] border border-slate-800 rounded-xl p-4
        text-center hover:border-primary-500 hover:bg-slate-900
        transition-all duration-300 hover:-translate-y-1 group"
      >

        {/* Icon */}
        <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary-500/10 
        flex items-center justify-center text-xl">
          {icon}
        </div>

        {/* Label */}
        <p className="text-xs text-slate-400 group-hover:text-primary-400 transition">
          {label}
        </p>

      </button>
    ))}
  </div>
    </div>


      {/* All sectors */}
    <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
  
    <div className="flex items-center justify-between mb-5">
    <h2 className="text-xl font-semibold text-white">All Sectors</h2>

    <button
      onClick={() => navigate("/analyze")}
      className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition"
    >
      View All
      <ArrowRight className="w-4 h-4" />
    </button>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {SECTORS.map(({ value, label, icon }) => (
      <button
        key={value}
        onClick={() => navigate(`/analyze?sector=${value}`)}
        className="flex items-center gap-3 p-3 rounded-lg
        bg-[#020617] border border-slate-800
        hover:border-primary-500 hover:bg-slate-900
        transition-all duration-300 group text-left"
      >

        {/* Icon */}
        <div className="w-9 h-9 rounded-md bg-primary-500/10 flex items-center justify-center text-lg">
          {icon}
        </div>

        {/* Label */}
        <span className="text-sm text-slate-300 group-hover:text-primary-400 transition truncate">
          {label}
        </span>

      </button>
    ))}
    </div>

    </div>

    </div>
  )
}