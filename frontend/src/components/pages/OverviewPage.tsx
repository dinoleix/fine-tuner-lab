import type { Results } from '../../types'

interface Props {
  results: Results
}

export default function OverviewPage({ results }: Props) {
  const { meta, metrics, training_history } = results
  const lastLoss = training_history.length > 0 ? training_history[training_history.length - 1].loss : null
  const pplDrop = Math.round(((metrics.perplexity_before - metrics.perplexity_after) / metrics.perplexity_before) * 100)
  const slangGain = Math.round(((metrics.slang_density_after - metrics.slang_density_before) / Math.max(metrics.slang_density_before, 0.1)) * 100)

  return (
    <div className="page">
      {meta.is_placeholder && (
        <div className="placeholder-banner">
          ⚠️ <strong>Placeholder data</strong> — Run the Colab notebook (<code>colab/fine_tune_qwen25.ipynb</code>) and replace <code>results/results.json</code> with real training output to see actual results.
        </div>
      )}

      <div className="overview-hero">
        <h1>🍵 Fine-Tuner Lab</h1>
        <p>
          Fine-tuning <strong>{meta.base_model}</strong> with LoRA/PEFT on 80 Green Neko Cafe Q&amp;A examples.
          The model learns to answer questions about the Japanese-Hawaiian-Taiwanese fusion cafe in a Gen Z tone —
          tracking every metric from perplexity to slang density before and after training.
        </p>
      </div>

      <div className="overview-grid">
        <div className="overview-stat">
          <div className="overview-stat-value">{meta.training_samples}</div>
          <div className="overview-stat-label">Training examples</div>
        </div>
        <div className="overview-stat">
          <div className="overview-stat-value">{meta.epochs}</div>
          <div className="overview-stat-label">Training epochs</div>
        </div>
        <div className="overview-stat">
          <div className="overview-stat-value">{meta.lora_rank}</div>
          <div className="overview-stat-label">LoRA rank (r)</div>
        </div>
        <div className="overview-stat">
          <div className="overview-stat-value">{lastLoss !== null ? lastLoss.toFixed(3) : '—'}</div>
          <div className="overview-stat-label">Final training loss</div>
        </div>
        <div className="overview-stat">
          <div className="overview-stat-value">−{pplDrop}%</div>
          <div className="overview-stat-label">Perplexity reduction</div>
        </div>
        <div className="overview-stat">
          <div className="overview-stat-value">+{slangGain}%</div>
          <div className="overview-stat-label">Gen Z slang density gain</div>
        </div>
      </div>

      <div className="overview-grid2">
        <div className="tech-note">
          <p className="tech-note-title">How it works</p>
          <ol className="tech-note-steps">
            <li><strong>Dataset:</strong> 80 synthetic Q&amp;A pairs about Green Neko Cafe in Gen Z tone, across 8 topic clusters</li>
            <li><strong>Base model:</strong> Qwen2.5-0.5B-Instruct loaded in 4-bit NF4 quantization on Colab T4</li>
            <li><strong>LoRA:</strong> Low-Rank Adaptation (r=16, α=32) targeting all attention + MLP projection layers</li>
            <li><strong>Training:</strong> 3 epochs with SFTTrainer, effective batch size 16, cosine LR schedule</li>
            <li><strong>Evaluation:</strong> Perplexity, ROUGE-L, slang density, and response length measured before &amp; after</li>
          </ol>
        </div>

        <div className="card">
          <div className="card-title">Model info</div>
          <div className="card-subtitle">Base model and adapter details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Base model</span>
              <code style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--cyan)' }}>{meta.base_model}</code>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Adapter repo</span>
              <code style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--cyan)' }}>{meta.adapter_repo}</code>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Generated</span>
              <span style={{ color: 'var(--text-muted)' }}>{new Date(meta.generated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Tech stack</div>
        <div className="tech-badges">
          {['Qwen2.5-0.5B', 'LoRA / PEFT', 'SFTTrainer (TRL)', 'BitsAndBytes 4-bit', 'Google Colab T4', 'FastAPI', 'React + TypeScript', 'Recharts', 'HuggingFace Hub'].map(t => (
            <span key={t} className="tech-badge">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
