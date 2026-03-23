import { Cache } from '../lib/cache.js'
import type { FetchResult } from '../lib/fetcher.js'

export const pageCache = new Cache<FetchResult>(14400000, 200)
