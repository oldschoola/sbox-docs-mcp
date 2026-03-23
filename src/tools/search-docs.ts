import type { SearchDocsParams } from '../schemas/index.js'
import { searchIndex } from './search-index-instance.js'

export async function searchDocs(params: SearchDocsParams): Promise<string> {
  await searchIndex.initialize()
  const results = searchIndex.search(params.query, params.limit)

  if (results.length === 0) {
    return `No documentation found for "${params.query}". Try different search terms.`
  }

  const lines = results.map(
    (r: { title: string; url: string }, i: number) => `${i + 1}. **${r.title}**\n   ${r.url}`,
  )

  return `Found ${results.length} result(s) for "${params.query}":\n\n${lines.join('\n')}`
}
