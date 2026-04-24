import { useState, useMemo } from 'react'
import { formatDistanceToNow, differenceInHours, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import { STATUSES, STATUS_ORDER } from '../constants/statuses'
import { getScoreCategory } from '../lib/scoring'

const PAGE_SIZE = 50

function StatusInline({ status }) {
  const cfg = STATUSES[status] || STATUSES.novo
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold"
      style={{ color: cfg.textColor, fontFamily: 'Montserrat, sans-serif' }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function ScoreChip({ score }) {
  const cat = getScoreCategory(score ?? 0)
  const styles = {
    hot:  { color: '#0D7A4A', background: '#D4F7E8' },
    warm: { color: '#92400E', background: '#FEF3C7' },
    cold: { color: '#5A6A88', background: '#E8EDF8' },
  }
  return (
    <span
      className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md"
      style={{ ...styles[cat], fontFamily: 'Montserrat, sans-serif' }}
    >
      {score ?? 0}
    </span>
  )
}

function WaLink({ number }) {
  const digits = number?.replace(/\D/g, '') || ''
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      className="btn-wa"
      title="Abrir WhatsApp"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  )
}

function OverdueFlag() {
  return (
    <span
      className="inline-flex text-xs font-bold px-1.5 py-0.5 rounded ml-1.5"
      style={{ background: '#FEF3C7', color: '#92400E', fontFamily: 'Montserrat, sans-serif' }}
    >
      48h+
    </span>
  )
}

function isOverdue(lead) {
  if (lead.status !== 'contactado') return false
  const ref = lead.last_contacted_at || lead.created_at
  return ref ? differenceInHours(new Date(), parseISO(ref)) > 48 : false
}

function isHighPriority(lead) {
  return ['respondeu', 'interessado'].includes(lead.status)
}

function LastContact({ date }) {
  if (!date) return <span style={{ color: 'var(--border)', fontFamily: 'Inter, sans-serif' }}>—</span>
  return (
    <span className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
      {formatDistanceToNow(parseISO(date), { addSuffix: true, locale: pt })}
    </span>
  )
}

function SortIcon({ active, dir }) {
  if (!active) return null
  return (
    <svg
      className="inline-block ml-1"
      width="9" height="9"
      viewBox="0 0 20 20" fill="currentColor"
      style={{ transform: dir === 'asc' ? 'rotate(180deg)' : '' }}
    >
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
    </svg>
  )
}

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  ...STATUS_ORDER.map(s => ({ value: s, label: STATUSES[s]?.label || s })),
]

export default function LeadList({ leads, onSelectLead }) {
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('novo')
  const [sortBy,       setSortBy]       = useState('score')
  const [sortDir,      setSortDir]      = useState('desc')
  const [page,         setPage]         = useState(1)
  const [showArchived, setShowArchived] = useState(false)

  const active = useMemo(
    () => leads.filter(l => showArchived ? l.is_archived : !l.is_archived),
    [leads, showArchived]
  )

  const filtered = useMemo(() => {
    let r = [...active]
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.whatsapp?.includes(q) ||
        l.email?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') r = r.filter(l => l.status === statusFilter)
    r.sort((a, b) => {
      let va, vb
      if (sortBy === 'score')     { va = a.score ?? 0;       vb = b.score ?? 0 }
      else if (sortBy === 'name') { va = a.name ?? '';       vb = b.name ?? '' }
      else                        { va = a.created_at ?? ''; vb = b.created_at ?? '' }
      return typeof va === 'string'
        ? (sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va))
        : (sortDir === 'asc' ? va - vb : vb - va)
    })
    return r
  }, [active, search, statusFilter, sortBy, sortDir])

  const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const archivedCount = leads.filter(l => l.is_archived).length

  const toggleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
    setPage(1)
  }

  const tabCounts = useMemo(() => {
    const m = { all: active.length }
    STATUS_ORDER.forEach(s => { m[s] = active.filter(l => l.status === s).length })
    return m
  }, [active])

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="field pl-9"
              placeholder="Pesquisar nome, numero ou email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          {archivedCount > 0 && (
            <button
              onClick={() => { setShowArchived(v => !v); setPage(1) }}
              className="btn-ghost text-xs flex-shrink-0"
              style={showArchived ? { background: '#FEF3C7', borderColor: '#E8C96A', color: '#92400E' } : {}}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
              </svg>
              {showArchived ? 'Ver activos' : `Arquivo (${archivedCount})`}
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {STATUS_TABS.map(tab => {
            const active = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1) }}
                className="flex-shrink-0 flex items-center gap-1.5 transition-all"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: active ? 'var(--blue)' : 'white',
                  color: active ? 'white' : 'var(--muted)',
                  border: active ? 'none' : '1px solid var(--border)',
                  boxShadow: active ? '0 2px 8px rgba(45,91,227,0.25)' : 'none',
                  letterSpacing: '0.01em',
                }}
              >
                {tab.label}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 5,
                    background: active ? 'rgba(255,255,255,0.22)' : 'var(--bg)',
                    color: active ? 'white' : 'var(--muted)',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {tabCounts[tab.value] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block surface overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <svg className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border)' }} fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>Nenhum lead encontrado</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')} className="cursor-pointer select-none">
                    Nome <SortIcon active={sortBy === 'name'} dir={sortDir} />
                  </th>
                  <th>Status</th>
                  <th onClick={() => toggleSort('score')} className="cursor-pointer select-none">
                    Score <SortIcon active={sortBy === 'score'} dir={sortDir} />
                  </th>
                  <th>Ultimo contacto</th>
                  <th onClick={() => toggleSort('created_at')} className="cursor-pointer select-none">
                    Inscricao <SortIcon active={sortBy === 'created_at'} dir={sortDir} />
                  </th>
                  <th style={{ width: 48 }} />
                </tr>
              </thead>
              <tbody>
                {paginated.map(lead => {
                  const overdue = isOverdue(lead)
                  const hiPri   = isHighPriority(lead)
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      style={overdue ? { borderLeft: '3px solid #E8A020' } : hiPri ? { borderLeft: '3px solid var(--coral)' } : { borderLeft: '3px solid transparent' }}
                    >
                      <td>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>
                          {lead.name}
                          {overdue && <OverdueFlag />}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                          {lead.whatsapp}
                        </div>
                      </td>
                      <td><StatusInline status={lead.status} /></td>
                      <td><ScoreChip score={lead.score} /></td>
                      <td><LastContact date={lead.last_contacted_at} /></td>
                      <td className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <WaLink number={lead.whatsapp} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <span className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-ghost text-xs px-3 disabled:opacity-40"
                    style={{ minHeight: 30, fontFamily: 'Montserrat, sans-serif' }}
                  >Ant.</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      style={{
                        minHeight: 30,
                        padding: '0 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: 'Montserrat, sans-serif',
                        background: page === n ? 'var(--blue)' : 'white',
                        color: page === n ? 'white' : 'var(--muted)',
                        border: page === n ? 'none' : '1px solid var(--border)',
                        boxShadow: page === n ? '0 2px 6px rgba(45,91,227,0.22)' : 'none',
                      }}
                    >{n}</button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-ghost text-xs px-3 disabled:opacity-40"
                    style={{ minHeight: 30, fontFamily: 'Montserrat, sans-serif' }}
                  >Prox.</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs flex-1" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>{filtered.length} leads</span>
          {[{ id: 'score', l: 'Score' }, { id: 'name', l: 'A-Z' }, { id: 'created_at', l: 'Data' }].map(s => (
            <button
              key={s.id}
              onClick={() => toggleSort(s.id)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: 7,
                fontFamily: 'Montserrat, sans-serif',
                background: sortBy === s.id ? 'var(--blue)' : 'white',
                color: sortBy === s.id ? 'white' : 'var(--muted)',
                border: sortBy === s.id ? 'none' : '1px solid var(--border)',
              }}
            >
              {s.l}
              {sortBy === s.id && <SortIcon active dir={sortDir} />}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--border)' }} fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <p className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>Nenhum lead encontrado</p>
          </div>
        ) : paginated.map(lead => {
          const overdue = isOverdue(lead)
          const hiPri   = isHighPriority(lead)
          return (
            <button
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="w-full text-left surface p-4 transition-colors active:scale-99"
              style={overdue ? { borderLeft: '3px solid #E8A020' } : hiPri ? { borderLeft: '3px solid var(--coral)' } : {}}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>{lead.name}</span>
                    {overdue && <OverdueFlag />}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <StatusInline status={lead.status} />
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <LastContact date={lead.last_contacted_at} />
                  </div>
                  {lead.tally_response && (
                    <p className="text-xs mt-1.5 line-clamp-1" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                      {lead.tally_response}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ScoreChip score={lead.score} />
                  <WaLink number={lead.whatsapp} />
                </div>
              </div>
            </button>
          )
        })}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs disabled:opacity-40" style={{ minHeight: 36, fontFamily: 'Montserrat, sans-serif' }}>Anterior</button>
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost text-xs disabled:opacity-40" style={{ minHeight: 36, fontFamily: 'Montserrat, sans-serif' }}>Seguinte</button>
          </div>
        )}
      </div>
    </div>
  )
}
