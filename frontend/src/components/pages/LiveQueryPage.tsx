import { useState, type ReactNode } from 'react'
import { queryLive } from '../../api/client'

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

const DEMO_PROMPTS = [
  "What's the best boba at Green Neko?",
  "I'm vegetarian — what should I order?",
  "Is the Salmon Poke Bowl worth it?",
  "What are Green Neko's hours?",
]

export default function LiveQueryPage() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [modelUsed, setModelUsed] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError('')
    setResponse('')
    setModelUsed('')
    try {
      const data = await queryLive(prompt.trim())
      setResponse(data.output)
      setModelUsed(data.model)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="page">
      <div className="live-query-box">
        <div className="placeholder-banner">
          ℹ️ <strong>Live inference</strong> requires pushing the fine-tuned adapter to HuggingFace Hub and setting <code>HF_TOKEN</code> in the backend. See <code>colab/fine_tune_qwen25.ipynb</code> Cell M.
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Try a question:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DEMO_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '6px 14px', fontSize: 13,
                  color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--primary)'
                  ;(e.target as HTMLButtonElement).style.color = 'var(--primary)'
                }}
                onMouseLeave={e => {
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'
                  ;(e.target as HTMLButtonElement).style.color = 'var(--text-muted)'
                }}
              >{p}</button>
            ))}
          </div>
        </div>

        <div className="live-input-wrap">
          <textarea
            className="live-input"
            rows={3}
            placeholder="Ask the fine-tuned Green Neko assistant anything…"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={handleSend} disabled={loading || !prompt.trim()}>
            {loading ? <span className="spinner-sm" /> : '↑'}
          </button>
        </div>

        {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

        {response && (
          <div className="live-response">
            {modelUsed && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                model: {modelUsed}
              </div>
            )}
            <div>{highlightSlang(response)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
