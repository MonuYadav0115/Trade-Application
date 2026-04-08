import { useState, useEffect } from 'react'
import { User, Clock, Activity, Shield, RefreshCw, Zap } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { getSessionInfo, getHealth } from '../utils/api'

function InfoCard({ icon: Icon, label, value, color = 'text-primary-400' }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl bg-primary-900/50 border border-primary-800/40 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-mono mb-1">{label}</p>
        <p className="text-slate-200 font-body font-medium truncate">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export default function SessionPage() {
  const [session, setSession] = useState(null)
  const [health, setHealth]   = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [s, h] = await Promise.all([getSessionInfo(), getHealth()])
      setSession(s.data)
      setHealth(h.data)
    } catch (err) {
      toast.error('Failed to load session info')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

  {/* Header */}
  <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 border border-slate-800 rounded-xl px-6 py-4 backdrop-blur-sm animate-fade-in">
    
    <div>
      <h1 className="text-3xl font-bold text-white tracking-tight">
        Session Info
      </h1>
      <p className="text-slate-400 text-sm mt-1">
        Current session details and server health
      </p>
    </div>

    <button
      onClick={fetchData}
      className="flex items-center gap-2 text-sm border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      Refresh
    </button>

  </div>

  {loading ? (

    <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-xl bg-slate-800 border border-slate-700"
        />
      ))}
    </div>

  ) : (
    <>

      {/* Session Details */}
      <div>

        <h2 className="text-lg font-semibold text-white mb-4">
          Your Session
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 animate-slide-up">

          <InfoCard
            icon={User}
            label="Username"
            value={session?.username}
          />

          <InfoCard
            icon={Shield}
            label="Session ID"
            value={session?.session_id?.slice(0, 18) + "..."}
          />

          <InfoCard
            icon={Activity}
            label="Requests Made"
            value={session?.request_count}
            color="text-green-400"
          />

          <InfoCard
            icon={Clock}
            label="Last Request"
            value={
              session?.last_request
                ? format(new Date(session.last_request), "MMM dd HH:mm:ss")
                : "N/A"
            }
          />

          <InfoCard
            icon={Clock}
            label="Session Created"
            value={
              session?.created_at
                ? format(new Date(session.created_at), "MMM dd, yyyy HH:mm")
                : "N/A"
            }
          />

        </div>

      </div>

      {/* Server Health */}
      {health && (
        <div>

          <h2 className="text-lg font-semibold text-white mb-4">
            Server Health
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 animate-slide-up">

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">

              <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-400" />
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-green-400 font-semibold capitalize">
                    {health.status}
                  </span>
                </div>
              </div>

            </div>

            <InfoCard
              icon={User}
              label="Active Sessions"
              value={health.active_sessions}
              color="text-blue-400"
            />

            <InfoCard
              icon={Clock}
              label="Server Time"
              value={format(
                new Date(health.timestamp),
                "MMM dd, yyyy HH:mm:ss"
              )}
            />

          </div>

        </div>
      )}

      {/* Rate Limit */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-slide-up">

        <h3 className="text-white font-semibold mb-4">
          Rate Limit Policy
        </h3>

        <div className="grid grid-cols-3 gap-4 text-center">

          {[
            { label: "Per User / Hour", value: "10" },
            { label: "Global / Hour", value: "100" },
            { label: "Token Expiry", value: "1 hr" },
          ].map(({ label, value }) => (

            <div
              key={label}
              className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
            >

              <p className="text-xl font-bold text-blue-400">
                {value}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {label}
              </p>

            </div>

          ))}

        </div>

      </div>

    </>
  )}

</div>

  )
}