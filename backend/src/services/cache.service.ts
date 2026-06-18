const cache = new Map<string, { data: any; timestamp: number }>()
const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export function cacheKey(problem: string): string {
  return problem.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getCached(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCached(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}
