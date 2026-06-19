import { useCallback, useEffect, useState } from 'react'
import type { Inquiry, InquiryStatus } from './types'

const KEY = 'northwind.triage.v1'

export const REPS = ['Unassigned', 'Dani Rivera', 'Marcus Tan', 'Priya Shah'] as const

export interface TriagePatch {
  status?: InquiryStatus
  assignee?: string
  contactedAt?: string
}
export type TriageOverlay = Record<string, TriagePatch>

export interface EffectiveInquiry extends Inquiry {
  assignee: string
  contactedAt?: string
  /** true when an operator has changed something about this inquiry */
  touched: boolean
}

function load(): TriageOverlay {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as TriageOverlay) : {}
  } catch {
    return {}
  }
}

/**
 * Triage state lives in localStorage as an *overlay* keyed by inquiry id. The
 * mock data stays read-only; operator changes (status, owner) are merged on top
 * at read time. This keeps "source data" and "our app state" cleanly separated.
 */
export function useTriage(base: Inquiry[]) {
  const [overlay, setOverlay] = useState<TriageOverlay>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setOverlay(load())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(KEY, JSON.stringify(overlay))
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [overlay, hydrated])

  const patch = useCallback((id: string, p: TriagePatch) => {
    setOverlay((prev) => ({ ...prev, [id]: { ...prev[id], ...p } }))
  }, [])

  const markContacted = useCallback((id: string) => {
    setOverlay((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: 'contacted', contactedAt: new Date().toISOString() },
    }))
  }, [])

  const assign = useCallback((id: string, assignee: string) => patch(id, { assignee }), [patch])
  const setStatus = useCallback((id: string, status: InquiryStatus) => patch(id, { status }), [patch])

  const reset = useCallback((id: string) => {
    setOverlay((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const resetAll = useCallback(() => setOverlay({}), [])

  const effective: EffectiveInquiry[] = base.map((inq) => {
    const o = overlay[inq.id]
    return {
      ...inq,
      status: o?.status ?? inq.status,
      assignee: o?.assignee ?? 'Unassigned',
      contactedAt: o?.contactedAt,
      touched: !!o,
    }
  })

  const touchedCount = Object.keys(overlay).length

  return { effective, hydrated, touchedCount, markContacted, assign, setStatus, reset, resetAll }
}
