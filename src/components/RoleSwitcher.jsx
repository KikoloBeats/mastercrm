export const ROLES = {
  assistente: {
    id: 'assistente',
    label: 'Julia',
    fullLabel: 'Julia Armando',
    description: 'Outreach e gestao de leads',
    gradient: 'linear-gradient(135deg, #2D5BE3 0%, #1A3DAD 100%)',
    defaultView: 'leads',
    canEdit: true,
    canImport: true,
    canViewDashboard: true,
  },
  victor: {
    id: 'victor',
    label: 'Victor',
    fullLabel: 'Victor',
    description: 'Coordenacao e pipeline',
    gradient: 'linear-gradient(135deg, #7B42F6 0%, #5522CC 100%)',
    defaultView: 'dashboard',
    canEdit: true,
    canImport: true,
    canViewDashboard: true,
  },
  carla: {
    id: 'carla',
    label: 'Carla / Juandro',
    fullLabel: 'Carla / Juandro',
    description: 'Dashboard — so leitura',
    gradient: 'linear-gradient(135deg, #17A865 0%, #0D7A4A 100%)',
    defaultView: 'dashboard',
    canEdit: false,
    canImport: false,
    canViewDashboard: true,
  },
}

function IconJulia() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function IconVictor() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
}

function IconCarla() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

const ROLE_ICONS = { assistente: IconJulia, victor: IconVictor, carla: IconCarla }

export default function RoleSwitcher({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--navy)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--blue)', boxShadow: '0 6px 24px rgba(45,91,227,0.45)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.025em' }}>
            Kalakala
          </h1>
          <p className="text-sm mt-2 tracking-wide" style={{ color: 'rgba(255,255,255,0.32)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}>
            MasterPlan management system
          </p>
        </div>

        {/* Divider label */}
        <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: 'rgba(255,255,255,0.20)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.12em' }}>
          Seleccionar perfil
        </p>

        <div className="flex flex-col gap-2.5">
          {Object.values(ROLES).map((role) => {
            const Icon = ROLE_ICONS[role.id]
            return (
              <button
                key={role.id}
                onClick={() => onSelect(role.id)}
                className="w-full rounded-xl p-4 text-left transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(45,91,227,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(45,91,227,0.38)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: role.gradient }}
                  >
                    <Icon />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {role.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>
                      {role.description}
                    </div>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-center text-xs mt-10" style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'Inter, sans-serif' }}>
          Lancamento 28 abr 2026
        </p>
      </div>
    </div>
  )
}
