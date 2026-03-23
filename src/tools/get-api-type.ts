import type { GetApiTypeParams } from '../schemas/index.js'
import { fetchApiType } from '../lib/fetcher.js'
import { apiCache } from './api-cache.js'

export async function getApiType(params: GetApiTypeParams): Promise<string> {
  const cacheKey = `api:${params.type_name}`
  let cached = apiCache.get(cacheKey)
  if (!cached) {
    cached = await fetchApiType(params.type_name)
    apiCache.set(cacheKey, cached)
  }

  const { markdown, title, url } = cached
  const lines: string[] = []

  lines.push(`# ${title}`)
  lines.push(`> Source: ${url}`)
  lines.push('')

  // Parse the markdown to extract structured sections
  const sections = markdown.split('\n\n')

  for (const section of sections) {
    const trimmed = section.trim()

    // Extract inheritance
    if (trimmed.startsWith('### Inheritence') || trimmed.startsWith('### Inheritance')) {
      lines.push('## Inheritance')
      const inheritLines = trimmed.split('\n').slice(1)
      for (const line of inheritLines) {
        const clean = line.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
        if (clean) lines.push(`- ${clean}`)
      }
      lines.push('')
      continue
    }

    // Extract summary
    if (trimmed.startsWith('### Summary')) {
      lines.push('## Summary')
      const summaryText = trimmed.replace('### Summary', '').trim()
      lines.push(summaryText)
      lines.push('')
      continue
    }

    // Extract properties
    if (
      params.include_properties &&
      (trimmed.startsWith('### Properties') || trimmed.startsWith('### Fields'))
    ) {
      const heading = trimmed.startsWith('### Properties') ? 'Properties' : 'Fields'
      lines.push(`## ${heading}`)
      lines.push('')

      const tableRows = trimmed.split('\n').slice(2) // skip header and separator
      for (const row of tableRows) {
        const cells = row.split('|').map((c) => c.trim()).filter(Boolean)
        if (cells.length >= 2) {
          const name = cells[0]
          let desc = cells[1]
          // Clean up description - remove HTML tags and excessive whitespace
          desc = desc
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
          // Remove the markdown link formatting but keep the name
          const cleanName = name.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
          // Check for obsolete marker
          const isObsolete = name.toLowerCase().includes('obsolete')
          lines.push(
            `- **${cleanName}${isObsolete ? ' *(obsolete)*' : ''}**: ${desc}`,
          )
        }
      }
      lines.push('')
      continue
    }

    // Extract methods
    if (params.include_methods && trimmed.startsWith('### Methods')) {
      lines.push('## Methods')
      lines.push('')

      const tableRows = trimmed.split('\n').slice(2)
      for (const row of tableRows) {
        const cells = row.split('|').map((c) => c.trim()).filter(Boolean)
        if (cells.length >= 2) {
          const name = cells[0]
          let desc = cells[1]
          desc = desc
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
          const cleanName = name.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
          const isObsolete = name.toLowerCase().includes('obsolete')
          lines.push(
            `- **${cleanName}${isObsolete ? ' *(obsolete)*' : ''}**: ${desc}`,
          )
        }
      }
      lines.push('')
      continue
    }

    // Extract constructors
    if (trimmed.startsWith('### Constructors')) {
      lines.push('## Constructors')
      lines.push('')

      const tableRows = trimmed.split('\n').slice(2)
      for (const row of tableRows) {
        const cells = row.split('|').map((c) => c.trim()).filter(Boolean)
        if (cells.length >= 2) {
          const name = cells[0].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
          let desc = cells[1]
          desc = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
          lines.push(`- **${name}**: ${desc}`)
        }
      }
      lines.push('')
      continue
    }

    // Extract static methods
    if (params.include_methods && trimmed.startsWith('### Static Methods')) {
      lines.push('## Static Methods')
      lines.push('')

      const tableRows = trimmed.split('\n').slice(2)
      for (const row of tableRows) {
        const cells = row.split('|').map((c) => c.trim()).filter(Boolean)
        if (cells.length >= 2) {
          const name = cells[0].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
          let desc = cells[1]
          desc = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
          lines.push(`- **${name}**: ${desc}`)
        }
      }
      lines.push('')
      continue
    }

    // Extract static fields
    if (params.include_properties && trimmed.startsWith('### Static Fields')) {
      lines.push('## Static Fields')
      lines.push('')

      const tableRows = trimmed.split('\n').slice(2)
      for (const row of tableRows) {
        const cells = row.split('|').map((c) => c.trim()).filter(Boolean)
        if (cells.length >= 2) {
          const name = cells[0].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
          let desc = cells[1]
          desc = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
          lines.push(`- **${name}**: ${desc}`)
        }
      }
      lines.push('')
      continue
    }
  }

  if (lines.length <= 3) {
    // If structured parsing failed, return raw markdown
    return `# ${title}\n\n> Source: ${url}\n\n${markdown}`
  }

  return lines.join('\n')
}
