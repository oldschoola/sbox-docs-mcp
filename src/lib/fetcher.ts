import * as cheerio from 'cheerio'
import TurndownService from 'turndown'

export interface FetchResult {
  markdown: string
  title: string
  url: string
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

turndown.addRule('skipNav', {
  filter: (node: any) => {
    if (node.nodeName !== '#text') return false
    const text = (node as any).nodeValue?.toLowerCase() || ''
    return text.includes('skip navigation') || text.includes('_menu_')
  },
  replacement: () => '',
})

turndown.addRule('removeFooter', {
  filter: (node: any) => {
    if (node.type !== 'tag' && node.nodeName) return false
    const text = (node as any).textContent?.toLowerCase() || ''
    return (
      text.includes('log in to reply') ||
      (node as any).getAttribute?.('id') === 'footer'
    )
  },
  replacement: () => '',
})

const cache = new Map<string, FetchResult>()

export async function fetchPage(url: string): Promise<FetchResult> {
  const cached = cache.get(url)
  if (cached) return cached

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)

  const html = await res.text()
  const $ = cheerio.load(html)

  // For docs.facepunch.com pages
  const title =
    $('title').text().replace(/<!--!-->/g, '').trim() ||
    $('h1').first().text().trim() ||
    url

  // Remove nav, footer, comments sections
  $('[id="skip-nav"], .footer, nav, .navigation, .comments').remove()

  // Try to get main content area
  let content = ''
  const mainContent =
    $('main').html() ||
    $('article').html() ||
    $('.content').html() ||
    $('body').html() ||
    ''

  content = turndown.turndown(mainContent)

  // Clean up excessive whitespace
  content = content
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+$/gm, '')
    .trim()

  const result: FetchResult = { markdown: content, title, url }
  cache.set(url, result)
  return result
}

export async function fetchApiType(typeName: string): Promise<FetchResult> {
  // Try common namespace prefixes
  const candidates = [
    `https://sbox.game/api/${typeName}`,
    `https://sbox.game/api/Sandbox.${typeName}`,
  ]

  for (const url of candidates) {
    try {
      const result = await fetchPage(url)
      // Verify this is actually an API page (has the type signature)
      if (
        result.markdown.includes(typeName) ||
        result.title.toLowerCase().includes(typeName.toLowerCase())
      ) {
        return result
      }
    } catch {
      // Try next candidate
    }
  }

  throw new Error(
    `Could not find API documentation for type "${typeName}". Tried: ${candidates.join(', ')}`,
  )
}
