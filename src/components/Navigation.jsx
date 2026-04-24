import { ROLES } from './RoleSwitcher'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', roles: ['assistente', 'victor', 'carla'], icon: IconDashboard },
  { id: 'leads',     label: 'Leads',     roles: ['assistente', 'victor'],           icon: IconLeads    },
  { id: 'import',    label: 'Importar',  roles: ['assistente', 'victor'],           icon: IconImport   },
]

const SIDEBAR      = 'var(--navy)'
const SIDEBAR_HOVER  = 'rgba(255,255,255,0.06)'
const SIDEBAR_ACTIVE = 'rgba(45,91,227,0.20)'

function IconDashboard({ active }) {
  const c = active ? '#5B8BF5' : 'rgba(255,255,255,0.38)'
  return (
    <svg width="16" height="16" fill="none" stroke={c} strokeWidth="1.9" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )
}
function IconLeads({ active }) {
  const c = active ? '#5B8BF5' : 'rgba(255,255,255,0.38)'
  return (
    <svg width="16" height="16" fill="none" stroke={c} strokeWidth="1.9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}
function IconImport({ active }) {
  const c = active ? '#5B8BF5' : 'rgba(255,255,255,0.38)'
  return (
    <svg width="16" height="16" fill="none" stroke={c} strokeWidth="1.9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
    </svg>
  )
}

export default function Navigation({ role, currentView, setCurrentView, setRole }) {
  const roleConfig = ROLES[role]
  const visibleItems = NAV_ITEMS.filter(i => i.roles.includes(role))

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-52 z-30"
        style={{ background: SIDEBAR }}
      >
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--blue)', boxShadow: '0 2px 10px rgba(45,91,227,0.35)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.01em' }}>Kalakala</p>
              <p className="leading-tight" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>MasterPlan system</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleItems.map(item => {
            const active = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  letterSpacing: '0.01em',
                  background: active ? SIDEBAR_ACTIVE : 'transparent',
                  color: active ? '#5B8BF5' : 'rgba(255,255,255,0.48)',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = SIDEBAR_HOVER }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <item.icon active={active} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-3 mb-2">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.24)', fontFamily: 'Inter, sans-serif' }}>Perfil activo</p>
            <p className="text-white text-xs font-semibold mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{roleConfig.fullLabel}</p>
          </div>
          <button
            onClick={() => setRole(null)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
            style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.background = SIDEBAR_HOVER; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.28)' }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Mudar perfil
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
        style={{ background: SIDEBAR, borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--blue)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Kalakala</span>
        </div>
        <button
          onClick={() => setRole(null)}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
        >
          {roleConfig.label}
        </button>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex"
        style={{ background: SIDEBAR, borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {visibleItems.map(item => {
          const active = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors min-h-[56px]"
              style={{ color: active ? '#5B8BF5' : 'rgba(255,255,255,0.32)', fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <item.icon active={active} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </>
  )
}
