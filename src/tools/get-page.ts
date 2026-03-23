import type { GetPageParams } from '../schemas/index.js'
import { fetchPage } from '../lib/fetcher.js'
import { pageCache } from './page-cache.js'

export async function getPage(params: GetPageParams): Promise<string> {
  const cacheKey = params.url
  let cached = pageCache.get(cacheKey)
  if (!cached) {
    cached = await fetchPage(params.url)
    pageCache.set(cacheKey, cached)
  }

  const { markdown, title, url } = cached
  const total = markdown.length

  // Apply chunking
  const content = markdown.slice(
    params.start_index,
    params.start_index + params.max_length,
  )

  const pageInfo = `# ${title}\n\n`
  const pagination =
    total > params.max_length
      ? `\n\n---\n*Showing ${params.start_index}-${params.start_index + content.length} of ${total} characters. Use start_index=${params.start_index + params.max_length} to read more.*`
      : ''

  return pageInfo + content + pagination
}
