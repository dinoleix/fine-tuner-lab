import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { DatasetItem } from '../../types'
import { fetchDataset } from '../../api/client'

const SLANG = [
  'no cap', 'lowkey', 'bussin', 'fr fr', 'slay', 'hits different',
  'vibe', 'aesthetic', 'ngl', 'bestie', 'understood the assignment',
  "it's giving", 'slaps', 'rent free', 'main character', 'based',
  'ate that', 'not mid at all', 'W move', 'core',
]

function highlightSlang(text: string): ReactNode[] {
  const escaped = SLANG.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(pattern)
  return parts.map((part, i) => {
    const isSlang = SLANG.some(s => s.toLowerCase() === part.toLowerCase())
    return isSlang
      ? <mark key={i} className="slang-highlight">{part}</mark>
      : <span key={i}>{part}</span>
  })
}

const PAGE_SIZE = 10

export default function DatasetPage() {
  const [items, setItems] = useState<DatasetItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    setLoading(true)
    setError('')
    fetchDataset(page, PAGE_SIZE)
      .then(data => {
        setItems(data.items)
        setTotal(data.total)
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [page])

  const displayed = search.trim()
    ? items.filter(it =>
        it.instruction.toLowerCase().includes(search.toLowerCase()) ||
        it.output.toLowerCase().includes(search.toLowerCase())
      )
    : items

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="page">
      <div className="dataset-controls">
        <input
          className="dataset-search"
          placeholder="Search questions or answers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="dataset-count">
          {total} training examples · page {page}/{totalPages}
        </span>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          <div className="dataset-list">
            {displayed.map((item, i) => (
              <div key={i} className="dataset-item">
                <div className="dataset-item-q">💬 {item.instruction}</div>
                <div className="dataset-item-a">{highlightSlang(item.output)}</div>
              </div>
            ))}
            {displayed.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '20px 0' }}>
                No results for "{search}"
              </div>
            )}
          </div>

          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >← Prev</button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button
              className="page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Next →</button>
          </div>
        </>
      )}
    </div>
  )
}
