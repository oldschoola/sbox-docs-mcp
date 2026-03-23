import MiniSearch from 'minisearch'
import { fetchPage } from './fetcher.js'

export interface SearchResult {
  title: string
  url: string
  snippet: string
}

interface DocEntry {
  id: string
  title: string
  url: string
  content: string
}

const KNOWN_PAGES: { title: string; url: string }[] = [
  // Getting Started
  { title: 'First Steps', url: 'https://docs.facepunch.com/s/sbox-dev/doc/first-steps-7IyiSplYmn' },
  { title: 'Development', url: 'https://docs.facepunch.com/s/sbox-dev/doc/development-5GTpzPsBCz' },
  { title: 'Project Types', url: 'https://docs.facepunch.com/s/sbox-dev/doc/project-types-WX9qrDXXoq' },
  { title: 'Reporting Errors', url: 'https://docs.facepunch.com/s/sbox-dev/doc/reporting-errors-2OTPIafqCJ' },
  { title: 'Monetization', url: 'https://docs.facepunch.com/s/sbox-dev/doc/monetization-Ij0zuH9XMV' },

  // Code
  { title: 'Code Basics', url: 'https://docs.facepunch.com/s/sbox-dev/doc/code-basics-3W3PHk1tD3' },
  { title: 'Cheat Sheet', url: 'https://docs.facepunch.com/s/sbox-dev/doc/cheat-sheet-CH6MPz8N2j' },
  { title: 'Math Types', url: 'https://docs.facepunch.com/s/sbox-dev/doc/math-types-rlXO4lYosl' },
  { title: 'API Whitelist', url: 'https://docs.facepunch.com/s/sbox-dev/doc/api-whitelist-0eSDcO6qDI' },
  { title: 'Console Variables', url: 'https://docs.facepunch.com/s/sbox-dev/doc/console-variables-7ZIbxHBMq4' },
  { title: 'Advanced Topics', url: 'https://docs.facepunch.com/s/sbox-dev/doc/advanced-topics-1zflcHI1nT' },
  { title: 'Libraries', url: 'https://docs.facepunch.com/s/sbox-dev/doc/libraries-6Y6EtLMvQN' },

  // Scene
  { title: 'Scenes', url: 'https://docs.facepunch.com/s/sbox-dev/doc/scenes-LT2kjsMBy4' },
  { title: 'GameObject', url: 'https://docs.facepunch.com/s/sbox-dev/doc/gameobject-oUVQQzT4IO' },
  { title: 'Components', url: 'https://docs.facepunch.com/s/sbox-dev/doc/components-zIujvXKpIl' },
  { title: 'GameObjectSystem', url: 'https://docs.facepunch.com/s/sbox-dev/doc/gameobjectsystem-6vakGETtA4' },
  { title: 'Prefabs', url: 'https://docs.facepunch.com/s/sbox-dev/doc/prefabs-Tiq5GBWmm3' },
  { title: 'Code Generation', url: 'https://docs.facepunch.com/s/sbox-dev/doc/code-generation-zhqowLeADO' },

  // Systems
  { title: 'Input', url: 'https://docs.facepunch.com/s/sbox-dev/doc/input-Hhi5KoJOnF' },
  { title: 'Raw Input', url: 'https://docs.facepunch.com/s/sbox-dev/doc/raw-input-HgxwlXos4O' },
  { title: 'Controller Input', url: 'https://docs.facepunch.com/s/sbox-dev/doc/controller-input-T0B8XRcyf1' },
  { title: 'Glyphs', url: 'https://docs.facepunch.com/s/sbox-dev/doc/glyphs-PMVrIKYbx3' },
  { title: 'Networking & Multiplayer', url: 'https://docs.facepunch.com/s/sbox-dev/doc/networking-multiplayer-kaVboe3yRD' },
  { title: 'Navigation', url: 'https://docs.facepunch.com/s/sbox-dev/doc/navigation-vwoSUsEPJ9' },
  { title: 'Shaders', url: 'https://docs.facepunch.com/s/sbox-dev/doc/shaders-oRSxPSL2n6' },
  { title: 'Shader Graph', url: 'https://docs.facepunch.com/s/sbox-dev/doc/shader-graph-O1KJlOQ8Pe' },
  { title: 'Post Processing', url: 'https://docs.facepunch.com/s/sbox-dev/doc/post-processing-oRlAHNS6bK' },
  { title: 'Effects', url: 'https://docs.facepunch.com/s/sbox-dev/doc/effects-mxZGUPQ268' },
  { title: 'Terrain', url: 'https://docs.facepunch.com/s/sbox-dev/doc/terrain-RoH8crPRmG' },
  { title: 'UI', url: 'https://docs.facepunch.com/s/sbox-dev/doc/ui-kM9biZcQrj' },
  { title: 'VR', url: 'https://docs.facepunch.com/s/sbox-dev/doc/vr-GPhXAmcHLM' },
  { title: 'Clutter', url: 'https://docs.facepunch.com/s/sbox-dev/doc/clutter-7AxAOzUC6s' },
  { title: 'ActionGraph', url: 'https://docs.facepunch.com/s/sbox-dev/doc/actiongraph-CUMGi4q3sS' },
  { title: 'Assets/Resources', url: 'https://docs.facepunch.com/s/sbox-dev/doc/assetsresources-vfClHodkqi' },
  { title: 'File System', url: 'https://docs.facepunch.com/s/sbox-dev/doc/file-system-0LoS75PRwn' },
  { title: 'Movie Maker', url: 'https://docs.facepunch.com/s/sbox-dev/doc/movie-maker-2cytsbFsGX' },
  { title: 'Services', url: 'https://docs.facepunch.com/s/sbox-dev/doc/services-YeAaAhdzVo' },
  { title: 'Storage (UGC)', url: 'https://docs.facepunch.com/s/sbox-dev/doc/storage-ugc-hSgsh1Dvog' },
  { title: 'Game Exporting', url: 'https://docs.facepunch.com/s/sbox-dev/doc/game-exporting-mFcXDhYAib' },

  // Editor
  { title: 'Editor', url: 'https://docs.facepunch.com/s/sbox-dev/doc/editor-tuqJFIQJaj' },
  { title: 'Assets', url: 'https://docs.facepunch.com/s/sbox-dev/doc/assets-z1oJZIPLTr' },

  // About
  { title: 'About', url: 'https://docs.facepunch.com/s/sbox-dev/doc/about-QGgSEpJhxe' },
]

export class SearchIndex {
  private minisearch: MiniSearch<DocEntry> | null = null
  private initialized = false
  private initializing = false

  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initializing) {
      // Wait for the other initialization to finish
      while (this.initializing) {
        await new Promise((r) => setTimeout(r, 100))
      }
      return
    }

    this.initializing = true
    try {
      const docs: DocEntry[] = []

      // First, add the known pages with just titles for quick initial search
      for (const page of KNOWN_PAGES) {
        docs.push({
          id: page.url,
          title: page.title,
          url: page.url,
          content: page.title,
        })
      }

      this.minisearch = new MiniSearch<DocEntry>({
        fields: ['title', 'content'],
        storeFields: ['title', 'url'],
        searchOptions: {
          boost: { title: 3 },
          prefix: true,
          fuzzy: 0.2,
        },
      })

      this.minisearch.addAll(docs)
      this.initialized = true

      // Then lazily fetch content for better search results
      this.enrichIndex()
    } finally {
      this.initializing = false
    }
  }

  private async enrichIndex(): Promise<void> {
    // Fetch page content in batches to avoid hammering the server
    const batchSize = 3
    for (let i = 0; i < KNOWN_PAGES.length; i += batchSize) {
      const batch = KNOWN_PAGES.slice(i, i + batchSize)
      const promises = batch.map(async (page) => {
        try {
          const result = await fetchPage(page.url)
          // Truncate content for index size
          const content = result.markdown.slice(0, 2000)
          this.minisearch?.replace({
            id: page.url,
            title: result.title,
            url: page.url,
            content,
          })
        } catch {
          // Keep the title-only entry
        }
      })
      await Promise.allSettled(promises)
    }
  }

  search(query: string, limit = 10): SearchResult[] {
    if (!this.minisearch) return []

    const results = this.minisearch.search(query, { boost: { title: 3 } })

    return results.slice(0, limit).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.id ? '' : '',
    }))
  }
}
