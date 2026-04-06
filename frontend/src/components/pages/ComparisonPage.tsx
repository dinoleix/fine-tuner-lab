import type { ReactNode } from 'react'
import type { Results } from '../../types'

interface Props {
  results: Results
}

const SLANG = [
  'no cap', 'lowkey', 'bussin', 'fr fr', 'slay', 'hits different',
  'vibe', 'aesthetic', 'ngl', 'bestie', 'understood the assignment',
  "it's giving", 'slaps', 'rent free', 'main character', 'based',
  'ate that', 'not mid at all', 'W move', 'core',
]

function highlightSlang(text: string): ReactNode[] {
  // Build a regex that matches any slang phrase (case-insensitive)
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

export default function ComparisonPage({ results }: Props) {
  const { comparisons } = results
  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Same 5 questions asked to the base model and the fine-tuned model.
          Gen Z slang words are <mark className="slang-highlight" style={{ display: 'inline' }}>highlighted in cyan</mark> in the fine-tuned outputs.
        </div>
      </div>

      <div className="comparison-list">
        {comparisons.map(c => (
          <div key={c.id} className="comparison-card">
            <div className="comparison-question">Q{c.id + 1}: {c.question}</div>
            <div className="comparison-cols">
              <div className="comparison-col">
                <div className="comparison-col-header">
                  <span className="comparison-col-title before-title">Base Model</span>
                  <div className="comparison-badges">
                    <span className="token-badge">{c.before.tokens} tokens</span>
                    <span className="slang-badge">{c.before.slang_count} slang</span>
                  </div>
                </div>
                <div className="comparison-output">{c.before.output}</div>
              </div>
              <div className="comparison-col">
                <div className="comparison-col-header">
                  <span className="comparison-col-title after-title">Fine-Tuned</span>
                  <div className="comparison-badges">
                    <span className="token-badge">{c.after.tokens} tokens</span>
                    <span className="slang-badge">{c.after.slang_count} slang</span>
                  </div>
                </div>
                <div className="comparison-output">{highlightSlang(c.after.output)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
