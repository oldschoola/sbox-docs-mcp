interface CacheEntry<T> {
  value: T
  expiresAt: number
  lastAccessed: number
}

export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>()
  private readonly ttlMs: number
  private readonly maxEntries: number

  constructor(ttlMs = 14400000, maxEntries = 500) {
    this.ttlMs = ttlMs
    this.maxEntries = maxEntries
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    entry.lastAccessed = Date.now()
    return entry.value
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      let oldestKey: string | undefined
      let oldestTime = Infinity
      for (const [k, v] of this.store) {
        if (v.lastAccessed < oldestTime) {
          oldestTime = v.lastAccessed
          oldestKey = k
        }
      }
      if (oldestKey) this.store.delete(oldestKey)
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
      lastAccessed: Date.now(),
    })
  }

  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return false
    }
    return true
  }

  clear(): void {
    this.store.clear()
  }

  get size(): number {
    return this.store.size
  }
}
