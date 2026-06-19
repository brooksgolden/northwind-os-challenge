import { buildTemplateReply, type InquiryContext } from './draftTemplate'

export interface DraftResult {
  reply: string
  provider: string
}

/**
 * Ask the dev API to draft a reply. If the endpoint is unreachable (e.g. the app
 * is served as a static build with no dev middleware), fall back to the local
 * template so the feature always returns something useful.
 */
export async function requestDraftReply(ctx: InquiryContext): Promise<DraftResult> {
  try {
    const resp = await fetch('/api/draft-reply', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(ctx),
    })
    if (resp.ok) {
      const data = (await resp.json()) as Partial<DraftResult>
      if (data.reply && data.reply.trim()) {
        return { reply: data.reply, provider: data.provider ?? 'server' }
      }
    }
  } catch {
    /* fall through to local template */
  }
  return { reply: buildTemplateReply(ctx), provider: 'template (offline)' }
}
