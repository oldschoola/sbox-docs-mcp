import { Cache } from '../lib/cache.js'
import type { FetchResult } from '../lib/fetcher.js'

export const apiCache = new Cache<FetchResult>(28800000, 300)
