#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  SearchDocsInput,
  GetPageInput,
  GetApiTypeInput,
  SearchApiInput,
} from './schemas/index.js'
import { searchDocs } from './tools/search-docs.js'
import { getPage } from './tools/get-page.js'
import { getApiType } from './tools/get-api-type.js'
import { searchApi } from './tools/search-api.js'

const server = new McpServer({
  name: 'sbox-docs-mcp',
  version: '0.2.0',
})

server.tool(
  'sbox_docs_search',
  'Search s&box documentation for guides, tutorials, and concepts. Returns matching pages with titles and URLs.',
  SearchDocsInput.shape,
  async (params) => {
    const text = await searchDocs(params)
    return { content: [{ type: 'text', text }] }
  },
)

server.tool(
  'sbox_docs_get_page',
  'Fetch a specific s&box documentation page and return its content as Markdown. Supports chunked reading for large pages.',
  GetPageInput.shape,
  async (params) => {
    const text = await getPage(params)
    return { content: [{ type: 'text', text }] }
  },
)

server.tool(
  'sbox_api_get_type',
  'Get API documentation for a specific s&box type, class, or struct from sbox.game/api. Returns properties, methods, and descriptions. Use full type name (e.g. Sandbox.Component) or short name (e.g. Component).',
  GetApiTypeInput.shape,
  async (params) => {
    const text = await getApiType(params)
    return { content: [{ type: 'text', text }] }
  },
)

server.tool(
  'sbox_api_search',
  'Search s&box API types by name or description. Useful for discovering available classes, components, and structs. Returns type names with links to full docs.',
  SearchApiInput.shape,
  async (params) => {
    const text = await searchApi(params)
    return { content: [{ type: 'text', text }] }
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)
