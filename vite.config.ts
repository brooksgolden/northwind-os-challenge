import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { generateDraftReply } from './server/draftReply'

/**
 * Tiny dev-only API for the AI "draft a reply" feature.
 *
 * Keeping it as Vite middleware means the whole app still runs from a single
 * `npm run dev` (no separate server process), which matters for "runs first try".
 * The provider is pluggable (see server/draftReply.ts):
 *   - cli  (default): drafts via the local Claude Code CLI on your subscription
 *   - api  (later)  : Anthropic API with ANTHROPIC_API_KEY
 *   - template       : deterministic offline fallback (always works)
 */
function draftReplyApi(): Plugin {
  return {
    name: 'northwind-draft-reply-api',
    configureServer(server) {
      server.middlewares.use('/api/draft-reply', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const payload = JSON.parse(body || '{}')
            const result = await generateDraftReply(payload)
            res.end(JSON.stringify(result))
          } catch (err) {
            // Never 500 the client — the UI also has its own template fallback.
            res.end(JSON.stringify({ reply: '', provider: 'error', error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), draftReplyApi()],
})
