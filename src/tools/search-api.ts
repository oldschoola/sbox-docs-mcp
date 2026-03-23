import type { SearchApiParams } from '../schemas/index.js'
import { searchApiIndex } from './search-api-instance.js'

export async function searchApi(params: SearchApiParams): Promise<string> {
  await searchApiIndex.initialize()
  const results = searchApiIndex.search(params.query, params.limit)

  if (results.length === 0) {
    return `No API types found for "${params.query}". Try different search terms or use sbox_api_get_type with a specific type name.`
  }

  const lines = results.map(
    (r, i) => `${i + 1}. **${r.name}** - ${r.summary}\n   https://sbox.game/api/${r.fullName}`,
  )

  return `Found ${results.length} API type(s) for "${params.query}":\n\n${lines.join('\n')}`
}
