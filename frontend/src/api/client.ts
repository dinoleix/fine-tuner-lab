import type { Results, DatasetItem } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchResults(): Promise<Results> {
  return get<Results>('/results')
}

export async function fetchDataset(page = 1, size = 10): Promise<{
  total: number
  page: number
  size: number
  items: DatasetItem[]
}> {
  return get(`/dataset?page=${page}&size=${size}`)
}

export async function ping(): Promise<boolean> {
  try {
    await get('/health')
    return true
  } catch {
    return false
  }
}

export async function queryLive(prompt: string): Promise<{ output: string; model: string }> {
  const res = await fetch(`${BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(data.detail ?? `HTTP ${res.status}`)
  }
  return res.json()
}
