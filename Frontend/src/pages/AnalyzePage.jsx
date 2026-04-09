import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Search, Download, Clock, Database, Zap, ChevronDown, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { analyzeSector } from '../utils/api'
import { SECTORS } from '../utils/Constants'
import { format } from 'date-fns'

function SkeletonReport() {
  return (
    <div className="space-y-4 animate-pulse">
      {[80, 60, 100, 50, 90, 70, 85, 55].map((w, i) => (
        <div key={i} className={`h-4 shimmer rounded w-[${w}%]`} style={{width:`${w}%`}} />
      ))}
    </div>
  )
}

export default function AnalyzePage() {
  const [searchParams]            = useSearchParams()
  const [sector, setSector]       = useState(searchParams.get('sector') || '')
  const [dropdownOpen, setDropdown] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [history, setHistory]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('report_history') || '[]') } catch { return [] }
  })

  // Auto-trigger if sector from URL
  
  useEffect(() => {
    const s = searchParams.get('sector')
    if (s) { setSector(s); handleAnalyze(s) }
  }, [])

  const handleAnalyze = async (s = sector) => {
    if (!s) { toast.error('Please select a sector'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await analyzeSector(s)
      setResult(res.data)

      // Save to history

      const entry = { ...res.data, id: Date.now() }
      const newHistory = [entry, ...history].slice(0, 20)
      setHistory(newHistory)
      localStorage.setItem('report_history', JSON.stringify(newHistory))
      toast.success(`Report generated for ${s}!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!result) return
    const blob = new Blob([result.report], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `trade-report-${result.sector}-${format(new Date(result.generated_at), 'yyyy-MM-dd')}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded!')
  }

  const selected = SECTORS.find(s => s.value === sector)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

    <div className="bg-[#020617] border border-slate-800 rounded-2xl p-6 animate-fade-in">

    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
      Sector <span className="text-primary-400">Analysis</span>
    </h1>

    <p className="text-slate-400 max-w-lg">
      Select a sector to generate an AI-powered trade intelligence report
      powered by Gemini AI. Discover trends, opportunities, and market insights.
    </p>

    </div>


      {/* Controls */}

    <div className="bg-[#020617] border border-slate-800 rounded-xl p-4 animate-slide-up flex flex-col sm:flex-row gap-4 items-center">

    {/* Sector dropdown */}
    <div className="relative flex-1 w-full">

    <button
      onClick={() => setDropdown(p => !p)}
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg
      bg-slate-900 border border-slate-800 text-sm
      hover:border-primary-500 transition">
      <span className={selected ? "text-slate-200" : "text-slate-500"}>
        {selected ? `${selected.icon} ${selected.label}` : "Select a sector"}
      </span>

      <ChevronDown
        className={`w-4 h-4 text-slate-400 transition-transform ${
          dropdownOpen ? "rotate-180" : ""
        }`}
      />
    </button>

    {dropdownOpen && (
      <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#020617]
      border border-slate-800 rounded-lg shadow-xl max-h-64 overflow-y-auto">

        {SECTORS.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => {
              setSector(value);
              setDropdown(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
            hover:bg-slate-900 transition
            ${sector === value ? "bg-primary-900/30 text-primary-300" : "text-slate-300"}`}
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    )}
  </div>

  {/* Analyze button */}
    <button
    onClick={handleAnalyze}
    disabled={loading || !sector}
    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg
    bg-primary-600 hover:bg-primary-900 text-white text-sm font-medium
    transition disabled:opacity-50 disabled:cursor-not-allowed">
    {loading ? (
      <>
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        Analyzing...
      </>
    ) : (
      <>
        <Search className="w-4 h-4" />
        Analyze Sector
      </>
    )}
    </button>
    </div>



      {/* Result */}

    {(loading || result) && (
    <div className="bg-[#020617] border border-slate-800 rounded-xl p-5 animate-fade-in space-y-5">

    {/* Result header */}
    {result && (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">

        {/* Left */}
        <div>
          <h2 className="text-xl font-semibold text-white capitalize">
            {result.sector} Market Report
          </h2>

          <div className="flex flex-wrap gap-2 mt-2 text-xs">

            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
              <Clock className="w-3 h-3" />
              {format(new Date(result.generated_at), "MMM dd, yyyy HH:mm")}
            </span>

            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
              <Database className="w-3 h-3" />
              {result.sources_used} sources
            </span>

            {result.cached && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-yellow-900/20 border border-yellow-700/40 text-yellow-400">
                <Zap className="w-3 h-3" />
                Cached
              </span>
            )}

          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          <button
            onClick={handleAnalyze}
            className="flex items-center gap-1 px-3 py-2 rounded-md text-sm
            bg-slate-900 border border-slate-800 text-slate-300
            hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={downloadReport}
            className="flex items-center gap-1 px-3 py-2 rounded-md text-sm
            bg-primary-600 hover:bg-primary-500 text-white transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>

        </div>
      </div>
    )}

    {/* Report body */}
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 max-h-[600px] overflow-y-auto">

      {loading ? (
        <SkeletonReport />
      ) : (
        <div className="prose prose-invert max-w-none text-sm">
          <ReactMarkdown>{result?.report}</ReactMarkdown>
        </div>
      )}

    </div>

    </div>
    )}



      {/* Empty state */}
      {!loading && !result && (
     <div className="bg-[#020617] border border-slate-800 rounded-xl py-16 px-6 text-center animate-fade-in">

    <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary-500/10 flex items-center justify-center">
      <Search className="w-7 h-7 text-primary-400" />
    </div>

    <h3 className="text-lg font-semibold text-white mb-2">
      No Analysis Yet
    </h3>

    <p className="text-slate-400 text-sm max-w-md mx-auto">
      Choose a sector from the dropdown above and click
      <span className="text-primary-400 font-medium"> Analyze </span>
      to generate an AI-powered market report.
    </p>

    </div>
    )}

    </div>
  )
}