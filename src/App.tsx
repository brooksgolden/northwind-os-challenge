import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Triage from './pages/Triage'
import { inquiries } from './lib/data'
import { IconDashboard, IconInbox } from './components/icons'

type View = 'dashboard' | 'triage'

const openCount = inquiries.filter((i) => i.status !== 'closed').length

export default function App() {
  const [view, setView] = useState<View>('dashboard')

  const nav = (id: View, label: string, Icon: typeof IconDashboard, badge?: number) => {
    const active = view === id
    return (
      <button
        onClick={() => setView(id)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          active ? 'bg-bean text-white shadow-sm' : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
        }`}
      >
        <Icon width={18} height={18} />
        <span className="flex-1 text-left">{label}</span>
        {badge != null && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              active ? 'bg-white/20 text-white' : 'bg-bean/10 text-bean'
            }`}
          >
            {badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-5">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <img src="/coffee.svg" alt="" width={30} height={30} />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink">Northwind</div>
            <div className="text-[11px] text-ink-soft">Command Center</div>
          </div>
        </div>

        <nav className="space-y-1">
          {nav('dashboard', 'Dashboard', IconDashboard)}
          {nav('triage', 'Inquiry Triage', IconInbox, openCount)}
        </nav>

        <div className="mt-auto px-2 text-[11px] leading-relaxed text-ink-soft">
          Internal OS · v0.1
          <br />
          Wholesale coffee, fictional data.
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {view === 'dashboard' ? <Dashboard goToTriage={() => setView('triage')} /> : <Triage />}
      </main>
    </div>
  )
}
