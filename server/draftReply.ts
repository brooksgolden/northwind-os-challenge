import { spawn } from 'node:child_process'
import { buildPrompt, buildTemplateReply, type InquiryContext } from '../src/lib/draftTemplate'

export interface DraftResponse {
  reply: string
  provider: string
}

type Provider = 'cli' | 'api' | 'template'

/**
 * Provider selection (env DRAFT_PROVIDER):
 *   cli      -> draft via the local Claude Code CLI (your subscription). DEFAULT.
 *   api      -> Anthropic API (needs ANTHROPIC_API_KEY). The "later" path.
 *   template -> deterministic offline draft.
 *
 * Whatever is selected, any failure degrades gracefully to the template so the
 * feature never hard-fails for a reviewer cloning this cold.
 */
function chosenProvider(): Provider {
  const p = (process.env.DRAFT_PROVIDER || 'cli').toLowerCase()
  return p === 'api' ? 'api' : p === 'template' ? 'template' : 'cli'
}

export async function generateDraftReply(ctx: InquiryContext): Promise<DraftResponse> {
  const provider = chosenProvider()

  if (provider === 'template') {
    return { reply: buildTemplateReply(ctx), provider: 'template' }
  }

  if (provider === 'api') {
    const viaApi = await tryAnthropicApi(ctx).catch(() => null)
    return viaApi
      ? { reply: viaApi, provider: 'anthropic-api' }
      : { reply: buildTemplateReply(ctx), provider: 'template (api unavailable)' }
  }

  // default: Claude Code CLI on the user's subscription
  const viaCli = await tryClaudeCli(buildPrompt(ctx)).catch(() => null)
  return viaCli
    ? { reply: viaCli, provider: 'claude-cli (subscription)' }
    : { reply: buildTemplateReply(ctx), provider: 'template (no Claude CLI)' }
}

/** Pipe the prompt to `claude -p` and read the printed response from stdout. */
function tryClaudeCli(prompt: string): Promise<string | null> {
  return new Promise((resolve) => {
    let out = ''
    let settled = false
    const finish = (v: string | null) => {
      if (!settled) {
        settled = true
        resolve(v)
      }
    }

    let child
    try {
      child = spawn('claude', ['-p'], { shell: true })
    } catch {
      finish(null)
      return
    }

    const timer = setTimeout(() => {
      try {
        child.kill()
      } catch {
        /* noop */
      }
      finish(null)
    }, 60_000)

    child.on('error', () => {
      clearTimeout(timer)
      finish(null)
    })
    child.stdout?.on('data', (d) => (out += d.toString()))
    child.on('close', (code) => {
      clearTimeout(timer)
      const text = out.trim()
      finish(code === 0 && text.length > 0 ? text : null)
    })

    try {
      child.stdin?.write(prompt)
      child.stdin?.end()
    } catch {
      clearTimeout(timer)
      finish(null)
    }
  })
}

async function tryAnthropicApi(ctx: InquiryContext): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: buildPrompt(ctx) }],
    }),
  })
  if (!resp.ok) return null
  const data = (await resp.json()) as { content?: Array<{ text?: string }> }
  const text = data?.content?.[0]?.text
  return typeof text === 'string' && text.trim() ? text.trim() : null
}
