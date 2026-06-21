import { useState } from 'react'

/** Small circled-i that reveals an explanatory popup on hover/focus. */
export function InfoTip({ text, label = 'More info', align = 'center' }: { text: string; label?: string; align?: 'center' | 'right' }) {
  const [open, setOpen] = useState(false)
  const pos = align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[10px] font-semibold leading-none text-ink-soft transition hover:bg-surface-muted hover:text-ink"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute top-6 z-50 w-72 rounded-lg border border-line bg-surface p-3 text-xs font-normal leading-relaxed text-ink-soft shadow-lg ${pos}`}
        >
          {text}
        </span>
      )}
    </span>
  )
}
