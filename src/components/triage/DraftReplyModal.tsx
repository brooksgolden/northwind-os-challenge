import { useCallback, useEffect, useState } from 'react'
import type { EffectiveInquiry } from '../../lib/useTriage'
import { requestDraftReply } from '../../lib/draftReply'
import { IconCheck, IconClose, IconCopy, IconSparkles } from '../icons'

export function DraftReplyModal({
  inquiry,
  onClose,
  onMarkContacted,
}: {
  inquiry: EffectiveInquiry
  onClose: () => void
  onMarkContacted: (id: string) => void
}) {
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [provider, setProvider] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = useCallback(async () => {
    setLoading(true)
    setCopied(false)
    const res = await requestDraftReply({
      cafe_name: inquiry.cafe_name,
      contact_name: inquiry.contact_name,
      email: inquiry.email,
      region: inquiry.region,
      channel: inquiry.channel,
      requested_volume_lbs_month: inquiry.requested_volume_lbs_month,
      message: inquiry.message,
    })
    setReply(res.reply)
    setProvider(res.provider)
    setLoading(false)
  }, [inquiry])

  useEffect(() => {
    generate()
  }, [generate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reply)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(
    `Northwind Coffee × ${inquiry.cafe_name}`,
  )}&body=${encodeURIComponent(reply)}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="card flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <IconSparkles width={18} height={18} className="text-bean" />
            <div>
              <h3 className="text-sm font-semibold text-ink">Draft a reply</h3>
              <p className="text-xs text-ink-soft">
                to {inquiry.contact_name} · {inquiry.cafe_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-ink-soft transition hover:bg-surface-muted" aria-label="Close">
            <IconClose width={18} height={18} />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="rounded-lg border border-line bg-surface-muted p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-soft">Their message</p>
            <p className="text-sm text-ink">{inquiry.message}</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Draft</p>
              {!loading && provider && (
                <span className="text-[11px] text-ink-soft">via {provider}</span>
              )}
            </div>
            {loading ? (
              <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-muted px-3 py-8 text-sm text-ink-soft">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bean border-t-transparent" />
                Drafting with Claude…
              </div>
            ) : (
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={12}
                className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink outline-none focus:border-bean"
              />
            )}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3">
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-surface-muted disabled:opacity-50"
          >
            Regenerate
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-muted disabled:opacity-50"
            >
              {copied ? <IconCheck width={14} height={14} className="text-leaf" /> : <IconCopy width={14} height={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={mailto}
              onClick={() => onMarkContacted(inquiry.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-bean px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-bean-deep"
            >
              Send & mark contacted
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
