import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, differenceInHours, parseISO, subDays } from 'date-fns'
import { pt } from 'date-fns/locale'
import { STATUSES, STATUS_ORDER } from '../constants/statuses'
import { getScoreCategory } from '../lib/scoring'

function MetricCard({ label, value, sub, gradient, icon }) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: gradient, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.08em' }}>{label}</p>
        {icon && <div style={{ opacity: 0.4 }}>{icon}</div>}
      </div>
      <div>
        <p className="text-3xl font-bold text-white leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>{value}</p>
        {sub && <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Inter, sans-serif' }}>{sub}</p>}
      </div>
    </div>
  )
}

const ROUTE_STOPS = [
  { name: 'Desvio do Zango' },
  { name: 'Cacuaco Vila' },
  { name: 'Ngoma' },
  { name: 'São Paulo' },
  { name: '1.º de Maio' },
  { name: 'Aeroporto' },
]

function TaxiSVG() {
  return (
    <svg width="56" height="28" viewBox="0 0 56 28" fill="none" style={{ display: 'block' }}>
      {/* Blue lower body */}
      <rect x="2" y="15" width="52" height="10" rx="2" fill="#1B4FBF"/>
      {/* White upper cab */}
      <path d="M7 15 L10 5 L46 5 L53 15 Z" fill="#F4F4F4"/>
      {/* Windows */}
      <rect x="12" y="7" width="10" height="7" rx="1" fill="#A8CCEE" opacity="0.85"/>
      <rect x="24" y="7" width="10" height="7" rx="1" fill="#A8CCEE" opacity="0.85"/>
      <rect x="36" y="7" width="9" height="7" rx="1" fill="#A8CCEE" opacity="0.85"/>
      {/* Blue/white divider */}
      <line x1="2" y1="15" x2="54" y2="15" stroke="#0D3A9E" strokeWidth="0.75"/>
      {/* Front bumper */}
      <rect x="52" y="17" width="2" height="5" rx="1" fill="#2D5BE3"/>
      {/* Rear bumper */}
      <rect x="2" y="17" width="2" height="5" rx="1" fill="#0D3A9E"/>
      {/* Headlight */}
      <circle cx="53" cy="17" r="1.5" fill="#FFDD55"/>
      {/* Left rear taillight */}
      <circle cx="3" cy="18" r="1.2" fill="#FF4444"/>
      {/* Left wheel */}
      <circle cx="13" cy="25" r="4" fill="#1a1a2e"/>
      <circle cx="13" cy="25" r="2.2" fill="#555"/>
      <circle cx="13" cy="25" r="0.8" fill="#888"/>
      {/* Right wheel */}
      <circle cx="43" cy="25" r="4" fill="#1a1a2e"/>
      <circle cx="43" cy="25" r="2.2" fill="#555"/>
      <circle cx="43" cy="25" r="0.8" fill="#888"/>
    </svg>
  )
}

function TaxiProgress({ converted, goal = 100 }) {
  const progress = Math.min(converted / goal, 1)
  const taxiPct = progress * 100
  const stopCount = ROUTE_STOPS.length
  const currentStopIdx = Math.min(Math.floor(progress * (stopCount - 1) + 0.5), stopCount - 1)
  const isComplete = converted >= goal

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.08em' }}>
            Taxi ao aeroporto — objetivo {goal} vendas
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
            Cada paragem = milestone de vendas ao longo de Luanda
          </p>
        </div>
        <span
          className="text-sm font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{
            background: isComplete
              ? 'linear-gradient(135deg, #17A865, #0D7A4A)'
              : 'linear-gradient(135deg, var(--blue), var(--navy-mid))',
            color: 'white',
            fontFamily: 'Montserrat, sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {isComplete ? '🏁 Chegamos!' : `${converted}/${goal}`}
        </span>
      </div>

      {/* Route */}
      <div>
        <div style={{ position: 'relative', paddingTop: 44, paddingBottom: 56, paddingLeft: 36, paddingRight: 36 }}>

          {/* Background road */}
          <div style={{
            position: 'absolute', top: 44, left: 0, right: 0, height: 6,
            background: 'var(--border)', borderRadius: 3,
          }} />
          {/* Progress road */}
          <div style={{
            position: 'absolute', top: 44, left: 0, height: 6,
            width: `${taxiPct}%`,
            background: 'linear-gradient(90deg, var(--blue) 0%, var(--coral) 100%)',
            borderRadius: 3,
            transition: 'width 0.7s ease',
          }} />

          {/* Taxi */}
          <div style={{
            position: 'absolute',
            left: `calc(${taxiPct}% - 28px)`,
            top: 8,
            transition: 'left 0.7s ease',
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
            zIndex: 10,
          }}>
            <TaxiSVG />
          </div>

          {/* Stop markers */}
          {ROUTE_STOPS.map((stop, i) => {
            const pct = (i / (stopCount - 1)) * 100
            const isFirst = i === 0
            const isLast = i === stopCount - 1
            const isExtreme = isFirst || isLast
            const isPassed = i < currentStopIdx || isComplete
            const isCurrent = i === currentStopIdx && converted > 0 && !isComplete

            const dotSize = isExtreme ? 22 : isCurrent ? 18 : 14
            const dotBg = isLast
              ? (isComplete ? 'var(--coral)' : isPassed ? 'var(--coral)' : 'white')
              : isFirst
              ? 'var(--navy)'
              : isPassed ? 'var(--blue)'
              : isCurrent ? 'var(--coral)'
              : 'white'
            const dotBorder = isFirst ? '2.5px solid var(--navy)'
              : isLast ? '2.5px solid var(--coral)'
              : isPassed ? '2px solid var(--blue)'
              : isCurrent ? '2px solid var(--coral)'
              : '2px solid var(--border)'

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  top: 44 - dotSize / 2,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 5,
                }}
              >
                {/* Dot */}
                <div style={{
                  width: dotSize, height: dotSize, borderRadius: '50%',
                  background: dotBg,
                  border: dotBorder,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(240,106,35,0.2)'
                    : isFirst ? '0 0 0 3px rgba(14,28,54,0.12)'
                    : isLast ? '0 0 0 3px rgba(240,106,35,0.18)'
                    : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isExtreme ? 12 : 9,
                  transition: 'all 0.4s ease',
                }}>
                  {isLast ? (
                    <span style={{ fontSize: 12 }}>✈</span>
                  ) : isFirst ? (
                    <span style={{ fontSize: 10 }}>📍</span>
                  ) : isPassed ? (
                    <svg width="7" height="7" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : null}
                </div>

                {/* Label — centered, wraps on spaces */}
                <div style={{
                  position: 'absolute',
                  top: dotSize + 6,
                  width: 76,
                  marginLeft: -38,
                  left: '50%',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  fontSize: isExtreme ? 10 : 9,
                  fontFamily: isExtreme ? 'Montserrat, sans-serif' : 'Inter, sans-serif',
                  fontWeight: isExtreme ? 700 : isCurrent ? 700 : 500,
                  lineHeight: 1.3,
                  color: isFirst ? 'var(--navy)'
                    : isLast ? 'var(--coral)'
                    : isCurrent ? 'var(--coral)'
                    : isPassed ? 'var(--text-mid)'
                    : 'var(--muted)',
                  transition: 'color 0.4s ease',
                }}>
                  {stop.name}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current stop label */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
        <p className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
          {converted === 0
            ? 'Ainda no inicio — vamos la!'
            : isComplete
            ? `Chegamos ao aeroporto! ${converted} vendas!`
            : `Proxima paragem: ${ROUTE_STOPS[currentStopIdx]?.name}`
          }
        </p>
        <p className="text-xs font-bold" style={{ color: 'var(--text-mid)', fontFamily: 'Montserrat, sans-serif' }}>
          {Math.round(progress * 100)}%
        </p>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.08em' }}>{children}</h3>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="surface py-2.5 px-3.5 text-xs shadow-lg">
      <p style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }}>{label}</p>
      <p className="font-bold mt-0.5" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>{payload[0].value} leads</p>
    </div>
  )
}

export default function Dashboard({ leads, exportCSV, exportJSON }) {
  const stats = useMemo(() => {
    const total      = leads.length
    const contacted  = leads.filter(l => l.status !== 'novo').length
    const responded  = leads.filter(l => ['respondeu', 'interessado', 'comprou'].includes(l.status)).length
    const converted  = leads.filter(l => l.status === 'comprou').length
    const overdue    = leads.filter(l => {
      if (l.status !== 'contactado') return false
      const ref = l.last_contacted_at || l.created_at
      return ref ? differenceInHours(new Date(), parseISO(ref)) > 48 : false
    })
    const highPriority = leads.filter(l => ['respondeu', 'interessado'].includes(l.status))
    const hot  = leads.filter(l => getScoreCategory(l.score) === 'hot').length
    const warm = leads.filter(l => getScoreCategory(l.score) === 'warm').length
    const cold = leads.filter(l => getScoreCategory(l.score) === 'cold').length
    return { total, contacted, responded, converted, overdue, highPriority, hot, warm, cold }
  }, [leads])

  const pipeline = useMemo(() =>
    STATUS_ORDER.slice(0, 5).map(s => ({
      status: s,
      label: STATUSES[s].label,
      count: leads.filter(l => l.status === s).length,
      color: STATUSES[s].color,
    })), [leads])

  const dailyData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(new Date(), 13 - i)
      const dayStr = format(day, 'yyyy-MM-dd')
      return {
        day: format(day, 'dd/MM', { locale: pt }),
        count: leads.filter(l => l.created_at?.slice(0, 10) === dayStr).length,
        isToday: i === 13,
      }
    })
  }, [leads])

  const daysToLaunch = useMemo(() => {
    const diff = Math.ceil((new Date('2026-04-28') - new Date()) / 86400000)
    return Math.max(0, diff)
  }, [])

  const pct = n => stats.total ? Math.round((n / stats.total) * 100) : 0

  return (
    <div className="space-y-5">

      {/* Top row: launch banner + key metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Launch banner */}
        <div
          className="col-span-2 lg:col-span-1 rounded-xl p-5 flex flex-col justify-between"
          style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', minHeight: 120 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.09em' }}>Lancamento</p>
          <div>
            <p className="font-bold text-4xl leading-none" style={{ color: 'var(--coral)', fontFamily: 'Montserrat, sans-serif' }}>{daysToLaunch}</p>
            <p className="text-white text-xs font-semibold mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>dias para 28 abr</p>
          </div>
        </div>

        <MetricCard
          label="Total leads"
          value={stats.total}
          sub="inscritos no formulario"
          gradient="linear-gradient(135deg, #2D5BE3 0%, #1A3DAD 100%)"
          icon={<svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>}
        />
        <MetricCard
          label="Contactados"
          value={`${pct(stats.contacted)}%`}
          sub={`${stats.contacted} leads contactados`}
          gradient="linear-gradient(135deg, #7B42F6 0%, #5522CC 100%)"
          icon={<svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>}
        />
        <MetricCard
          label="Compraram"
          value={stats.converted}
          sub={`${pct(stats.converted)}% de conversao`}
          gradient="linear-gradient(135deg, #17A865 0%, #0D7A4A 100%)"
          icon={<svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>}
        />
      </div>

      {/* Second row: responded + hot leads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard
          label="Responderam"
          value={`${pct(stats.responded)}%`}
          sub={`${stats.responded} leads`}
          gradient="linear-gradient(135deg, #E8A020 0%, #B87A10 100%)"
        />
        <MetricCard
          label="Leads quentes"
          value={stats.hot}
          sub="score 70+"
          gradient="linear-gradient(135deg, #F06A23 0%, #C94F10 100%)"
        />
        <MetricCard
          label="Alta prioridade"
          value={stats.highPriority.length}
          sub="responderam ou interessados"
          gradient="linear-gradient(135deg, #E8365D 0%, #AA1A3A 100%)"
        />
      </div>

      {/* Taxi journey progress */}
      <TaxiProgress converted={stats.converted} goal={100} />

      {/* Pipeline + score side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pipeline */}
        <div className="surface p-5">
          <SectionTitle>Pipeline por etapa</SectionTitle>
          <div className="space-y-4">
            {pipeline.map(({ status, label, count, color }) => {
              const pctW = stats.total ? (count / stats.total) * 100 : 0
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'var(--text-mid)', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                    <span className="font-bold" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>{count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pctW}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Score distribution */}
        <div className="surface p-5">
          <SectionTitle>Distribuicao de pontuacao</SectionTitle>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Quentes', value: stats.hot,  bg: 'linear-gradient(135deg,#D4F7E8,#B8F0D4)', color: '#0D7A4A', sub: '70+' },
              { label: 'Mornas',  value: stats.warm, bg: 'linear-gradient(135deg,#FEF3C7,#FDEAA0)', color: '#92400E', sub: '40-69' },
              { label: 'Frias',   value: stats.cold, bg: 'linear-gradient(135deg,#E8EDF8,#D8E4F0)', color: '#5A6A88', sub: '0-39' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: s.bg }}>
                <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'Montserrat, sans-serif' }}>{s.value}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: s.color, fontFamily: 'Montserrat, sans-serif' }}>{s.label}</p>
                <p className="text-xs mt-0.5" style={{ color: s.color + '88', fontFamily: 'Inter, sans-serif' }}>{s.sub} pts</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily bar chart */}
      <div className="surface p-5">
        <SectionTitle>Leads por dia — ultimas 2 semanas</SectionTitle>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,91,227,0.05)', radius: 4 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Leads">
              {dailyData.map((d, i) => (
                <Cell key={i} fill={d.isToday ? 'var(--coral)' : 'var(--blue)'} fillOpacity={d.isToday ? 1 : 0.30} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      {stats.overdue.length > 0 && (
        <div className="surface p-5" style={{ borderLeft: '3px solid #E8A020' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#92400E', fontFamily: 'Montserrat, sans-serif' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            {stats.overdue.length} lead{stats.overdue.length > 1 ? 's' : ''} sem actualizacao (+48h)
          </h3>
          <div className="space-y-2">
            {stats.overdue.slice(0, 5).map(l => (
              <div key={l.id} className="flex justify-between text-sm">
                <span className="font-semibold" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>{l.name}</span>
                <span style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                  {l.last_contacted_at ? format(parseISO(l.last_contacted_at), 'dd/MM HH:mm') : 'sem contacto'}
                </span>
              </div>
            ))}
            {stats.overdue.length > 5 && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>+ {stats.overdue.length - 5} mais</p>}
          </div>
        </div>
      )}

      {stats.highPriority.length > 0 && (
        <div className="surface p-5" style={{ borderLeft: '3px solid var(--coral)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--coral)', fontFamily: 'Montserrat, sans-serif' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            {stats.highPriority.length} lead{stats.highPriority.length > 1 ? 's' : ''} prioritarios
          </h3>
          <div className="space-y-2">
            {stats.highPriority.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>{l.name}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0" style={{ background: STATUSES[l.status]?.bg, color: STATUSES[l.status]?.textColor, fontFamily: 'Montserrat, sans-serif' }}>
                  {STATUSES[l.status]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <div className="surface p-5">
        <SectionTitle>Exportar dados</SectionTitle>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost flex-1 justify-center text-xs">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exportar CSV
          </button>
          <button onClick={exportJSON} className="btn-ghost flex-1 justify-center text-xs">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exportar JSON
          </button>
        </div>
      </div>
    </div>
  )
}
