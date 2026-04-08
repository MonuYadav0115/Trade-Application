import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { History, Trash2, Eye, Download, Search, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const navigate  = useNavigate()
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('report_history') || '[]') } catch { return [] }
  })
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')

  const filtered = history.filter(h =>
    h.sector.toLowerCase().includes(search.toLowerCase())
  )

  const deleteReport = (id) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem('report_history', JSON.stringify(updated))
    if (selected?.id === id) setSelected(null)
    toast.success('Report deleted')
  }

  const clearAll = () => {
    setHistory([])
    setSelected(null)
    localStorage.removeItem('report_history')
    toast.success('History cleared')
  }

  const downloadReport = (report, sector, generated_at) => {
    const blob = new Blob([report], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `trade-report-${sector}-${format(new Date(generated_at), 'yyyy-MM-dd')}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 border border-slate-800 rounded-xl px-6 py-4 backdrop-blur-sm animate-fade-in">

    {/* Title Section */}

    <div className="flex flex-col">
    <h1 className="text-3xl font-bold text-white tracking-tight">
      Report History
    </h1>

    <p className="text-slate-400 text-sm mt-1">
      {history.length} reports saved locally
    </p>
  </div>

  {/* Actions */}
  <div className="flex items-center gap-3">

    <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
      Local Storage
    </span>

    {history.length > 0 && (
      <button
        onClick={clearAll}
        className="flex items-center gap-2 text-sm text-red-400 border border-red-800/50 px-3 py-1.5 rounded-lg hover:bg-red-900/30 hover:border-red-600 transition"
      >
        <Trash2 className="w-4 h-4" />
        Clear All
      </button>
    )}

  </div>

</div>



{history.length === 0 ? (
  <div className="bg-slate-900/60 border border-slate-800 rounded-xl text-center py-20 animate-fade-in">

    <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />

    <p className="text-slate-400 mb-6 text-sm">
      No reports found. Start analyzing a sector to generate your first report.
    </p>

    <button
      onClick={() => navigate('/analyze')}
      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition"
    >
      <Search className="w-4 h-4" />
      Analyze Sector
    </button>

  </div>
) : (
  <div className="grid md:grid-cols-3 gap-6 animate-slide-up">

    {/* LEFT SIDE - LIST */}
    <div className="space-y-4">

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Reports List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">

        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            className={`p-4 rounded-lg border cursor-pointer transition
            ${
              selected?.id === item.id
                ? "border-blue-500 bg-blue-900/20"
                : "border-slate-800 bg-slate-900 hover:border-slate-700"
            }`}
          >

            <div className="flex justify-between items-start gap-2">

              <div className="flex-1 min-w-0">

                <p className="text-slate-200 font-semibold capitalize truncate">
                  {item.sector}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {format(new Date(item.generated_at), "MMM dd, yyyy HH:mm")}
                </p>

              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteReport(item.id);
                }}
                className="text-slate-500 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>

    {/* RIGHT SIDE - REPORT PREVIEW */}
    <div className="md:col-span-2">

      {selected ? (

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">

            <h2 className="text-lg font-semibold text-white capitalize">
              {selected.sector}
            </h2>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  downloadReport(
                    selected.report,
                    selected.sector,
                    selected.generated_at
                  )
                }
                className="flex items-center gap-1 text-sm border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

          </div>

          {/* Report Content */}
          <div className="max-h-[600px] overflow-y-auto prose prose-invert text-sm">

            <ReactMarkdown>
              {selected.report}
            </ReactMarkdown>

          </div>

        </div>

      ) : (

        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center py-24 text-center h-full">

          <Eye className="w-10 h-10 text-slate-600 mb-3" />

          <p className="text-slate-400">
            Select a report to preview
          </p>

        </div>

      )}

    </div>

  </div>
)}

    </div>
  )
}