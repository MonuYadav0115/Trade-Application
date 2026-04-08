import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Lock, User, Eye, EyeOff, Globe2, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { loginAPI } from '../utils/api'

export default function LoginPage() {
  const [form, setForm]         = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Please fill all fields')
      return
    }
    setLoading(true)
    try {
      const res = await loginAPI(form.username, form.password)
      login(res.data.access_token, form.username)
      toast.success(`Welcome back, ${form.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-800/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'1.5s'}} />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-500/30 mb-4">
            <TrendingUp className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">
            Trade<span className="text-primary-400">Intel</span>
          </h1>
          <p className="text-slate-400 text-sm">India Market Intelligence Platform</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Globe2,    label: '20+ Sectors',    },
            { icon: BarChart3, label: 'AI Analysis',    },
            { icon: TrendingUp,label: 'Live Reports',   },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass rounded-xl p-3 text-center">
              <Icon className="w-4 h-4 text-primary-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400 font-mono">{label}</p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="card">
          <h2 className="text-xl font-display font-semibold text-white mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-body">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter Your username"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-body">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter Your Password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                <><Lock className="w-4 h-4" />Sign In</>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}