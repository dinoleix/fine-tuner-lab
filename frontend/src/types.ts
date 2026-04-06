export interface TrainingStep {
  step: number
  loss: number
}

export interface Metrics {
  perplexity_before: number
  perplexity_after: number
  rouge_l_before: number
  rouge_l_after: number
  slang_density_before: number
  slang_density_after: number
  avg_response_tokens_before: number
  avg_response_tokens_after: number
}

export interface ComparisonOutput {
  output: string
  tokens: number
  slang_count: number
}

export interface Comparison {
  id: number
  question: string
  reference_answer: string
  before: ComparisonOutput
  after: ComparisonOutput
}

export interface DatasetItem {
  instruction: string
  input: string
  output: string
}

export interface Meta {
  generated_at: string
  base_model: string
  adapter_repo: string
  training_samples: number
  epochs: number
  lora_rank: number
  lora_alpha: number
  is_placeholder?: boolean
}

export interface Results {
  meta: Meta
  training_history: TrainingStep[]
  metrics: Metrics
  comparisons: Comparison[]
  dataset_preview: DatasetItem[]
}
