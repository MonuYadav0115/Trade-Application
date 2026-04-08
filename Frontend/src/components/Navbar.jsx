import { Link, useNavigate, useLocation } from 'react-router-dom'
import { TrendingUp, LayoutDashboard, Search, History, Info, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/analyze',   icon: Search,          label: 'Analyze'    },
  { to: '/history',   icon: History,         label: 'History'    },
  { to: '/session',   icon: Info,            label: 'Session'    },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const { pathname }     = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
<nav className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600/30 border border-primary-500/40 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-400" />
          </div>
          <span className="font-display font-bold text-white text-lg">
            Trade<span className="text-primary-400">Intel</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-all duration-200
                ${pathname === to
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-950/50 border border-primary-800/30">
            <User className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-sm text-slate-300 font-mono">{user?.username}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400
                       hover:text-red-400 hover:bg-red-950/30 transition-all duration-200">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}