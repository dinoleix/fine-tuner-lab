import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { Results } from '../../types'

interface Props {
  results: Results
}

const BEFORE_COLOR = '#ef4444'
const AFTER_COLOR  = '#10b981'

export default function MetricsPage({ results }: Props) {
  const { metrics, training_history } = results

  const perplexityData = [
    { label: 'Before', value: metrics.perplexity_before },
    { label: 'After',  value: metrics.perplexity_after },
  ]
  const slangData = [
    { label: 'Before', value: metrics.slang_density_before },
    { label: 'After',  value: metrics.slang_density_after },
  ]
  const rougeData = [
    { label: 'Before', value: +(metrics.rouge_l_before * 100).toFixed(1) },
    { label: 'After',  value: +(metrics.rouge_l_after  * 100).toFixed(1) },
  ]
  const lengthData = [
    { label: 'Before', value: metrics.avg_response_tokens_before },
    { label: 'After',  value: metrics.avg_response_tokens_after },
  ]

  const tooltipStyle = {
    backgroundColor: '#1a2236',
    border: '1px solid #1e2d47',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 13,
  }

  return (
    <div className="page">
      <div className="metrics-grid">
        <MetricHero
          label="Perplexity"
          before={metrics.perplexity_before}
          after={metrics.perplexity_after}
          note="Lower = more confident on domain text. Measures how well the model predicts the training distribution."
          suffix=""
          betterDown
        />
        <MetricHero
          label="ROUGE-L"
          before={+(metrics.rouge_l_before * 100).toFixed(1)}
          after={+(metrics.rouge_l_after  * 100).toFixed(1)}
          note="Longest common subsequence overlap with reference answers. Higher = more aligned output."
          suffix="%"
          betterDown={false}
        />
        <MetricHero
          label="Gen Z Slang / 100 tokens"
          before={metrics.slang_density_before}
          after={metrics.slang_density_after}
          note="Number of Gen Z slang terms per 100 tokens in the response. Measures style transfer."
          suffix=""
          betterDown={false}
        />
        <MetricHero
          label="Avg response tokens"
          before={metrics.avg_response_tokens_before}
          after={metrics.avg_response_tokens_after}
          note="Average number of new tokens generated per response. Fine-tuned model tends to be more detailed."
          suffix=""
          betterDown={false}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-panel">
          <div className="chart-panel-title">Training Loss Curve</div>
          <div className="chart-panel-sub">Cross-entropy loss per logging step over 3 epochs. Should decrease smoothly.</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={training_history} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" />
              <XAxis dataKey="step" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toFixed(4), 'Loss']} />
              <Line
                type="monotone" dataKey="loss" stroke="#3d6cff"
                strokeWidth={2} dot={false} activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="chart-panel-title">Perplexity: Before vs After</div>
          <div className="chart-panel-sub">Lower perplexity = more confident on domain text. Fine-tuning should drop this significantly.</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perplexityData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toFixed(1), 'Perplexity']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {perplexityData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? BEFORE_COLOR : AFTER_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="chart-panel-title">Gen Z Slang Density</div>
          <div className="chart-panel-sub">Slang terms per 100 response tokens. The core style-transfer signal.</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={slangData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toFixed(2), 'Per 100 tokens']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {slangData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? BEFORE_COLOR : AFTER_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="chart-panel-title">ROUGE-L Score (%)</div>
          <div className="chart-panel-sub">Overlap with reference Gen Z answers. Fine-tuned model should score higher.</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rougeData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, 'ROUGE-L']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {rougeData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? BEFORE_COLOR : AFTER_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="chart-panel-title">Average Response Length (tokens)</div>
          <div className="chart-panel-sub">Fine-tuned model tends to be more verbose, matching the chatty Gen Z style.</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lengthData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Tokens']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {lengthData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? BEFORE_COLOR : AFTER_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

interface MetricHeroProps {
  label: string
  before: number
  after: number
  note: string
  suffix: string
  betterDown: boolean
}

function MetricHero({ label, before, after, note, suffix, betterDown }: MetricHeroProps) {
  const improved = betterDown ? after < before : after > before
  return (
    <div className="metric-hero">
      <div className="metric-hero-label">{label}</div>
      <div className="metric-hero-values">
        <span className="metric-before">{before}{suffix}</span>
        <span className="metric-arrow">{improved ? '→' : '→'}</span>
        <span className="metric-after">{after}{suffix}</span>
      </div>
      <div className="metric-hero-note">{note}</div>
    </div>
  )
}
