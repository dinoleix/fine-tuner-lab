import { useState, useEffect } from 'react'
import type { Results } from './types'
import { fetchResults } from './api/client'
import OverviewPage    from './components/pages/OverviewPage'
import MetricsPage     from './components/pages/MetricsPage'
import ComparisonPage  from './components/pages/ComparisonPage'
import DatasetPage     from './components/pages/DatasetPage'
import LiveQueryPage   from './components/pages/LiveQueryPage'

type Tab = 'overview' | 'metrics' | 'comparison' | 'dataset' | 'live'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: '◆ Overview' },
  { id: 'metrics',    label: '📊 Metrics' },
  { id: 'comparison', label: '⚡ Before / After' },
  { id: 'dataset',    label: '📋 Dataset' },
  { id: 'live',       label: '🟢 Live Query' },
]

function getHashTab(): Tab {
  const hash = window.location.hash.replace('#', '') as Tab
  return TABS.some(t => t.id === hash) ? hash : 'overview'
}

export default function App() {
  const [tab, setTab]         = useState<Tab>(getHashTab)
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetchResults()
      .then(setResults)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onHash = () => setTab(getHashTab())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function navigate(id: Tab) {
    window.location.hash = id
    setTab(id)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🍵</span>
            <span className="logo-text">Fine-Tuner Lab</span>
          </div>
          <div className="header-badges">
            <span className="badge">Qwen2.5-0.5B</span>
            <span className="badge badge-green">LoRA / PEFT</span>
            <span className="badge badge-amber">Green Neko</span>
            <span className="badge">FastAPI</span>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        <div className="tab-nav-inner">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn${tab === t.id ? ' active' : ''}`}
              onClick={() => navigate(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {loading && (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      )}

      {error && !loading && (
        <div className="page">
          <div className="error-box">
            <strong>Failed to load results:</strong> {error}
            <br /><br />
            Make sure the backend is running: <code>cd backend &amp;&amp; uvicorn main:app --reload</code>
          </div>
        </div>
      )}

      {!loading && !error && results && (
        <>
          {tab === 'overview'   && <OverviewPage   results={results} />}
          {tab === 'metrics'    && <MetricsPage    results={results} />}
          {tab === 'comparison' && <ComparisonPage results={results} />}
          {tab === 'dataset'    && <DatasetPage />}
          {tab === 'live'       && <LiveQueryPage />}
        </>
      )}
    </div>
  )
}
