import { useState, useCallback } from 'react'
import RoleSwitcher, { ROLES } from './components/RoleSwitcher'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import LeadList from './components/LeadList'
import LeadDetail from './components/LeadDetail'
import ImportScreen from './components/ImportScreen'
import Toast from './components/Toast'
import { useLeads } from './hooks/useLeads'

function PageWrapper({ children, title }) {
  return (
    <div className="animate-fade-in">
      {title && <div className="mb-5"><h1 className="page-title">{title}</h1></div>}
      {children}
    </div>
  )
}

export default function App() {
  const [role, setRole] = useState(() => localStorage.getItem('crm_role') || null)
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('crm_role')
    return ROLES[saved]?.defaultView || 'leads'
  })
  const [selectedLead, setSelectedLead] = useState(null)
  const [toast, setToast] = useState(null)

  const { leads, loading, error, updateLead, deleteLead, archiveLead, exportCSV, exportJSON, refetch } = useLeads()

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() })
  }, [])

  const handleRoleSelect = (r) => {
    localStorage.setItem('crm_role', r)
    setRole(r)
    setCurrentView(ROLES[r]?.defaultView || 'leads')
  }

  const handleRoleClear = () => {
    localStorage.removeItem('crm_role')
    setRole(null)
    setSelectedLead(null)
  }

  const handleLeadUpdate = async (id, updates) => {
    const updated = await updateLead(id, updates)
    if (selectedLead?.id === id && updated) setSelectedLead(updated)
    return updated
  }

  const handleLeadDelete = async (id) => {
    await deleteLead(id)
    if (selectedLead?.id === id) setSelectedLead(null)
  }

  const handleLeadArchive = async (id, archive) => {
    const updated = await archiveLead(id, archive)
    if (selectedLead?.id === id && updated) setSelectedLead(updated)
    return updated
  }

  if (!role) return <RoleSwitcher onSelect={handleRoleSelect} />

  const roleConfig = ROLES[role]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navigation
        role={role}
        currentView={currentView}
        setCurrentView={(v) => { setCurrentView(v); setSelectedLead(null) }}
        setRole={handleRoleClear}
      />

      <div className="md:ml-56 pt-14 md:pt-0">
        <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-5xl">
          {error && (
            <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              Erro de ligacao: {error}. Verifica as variaveis de ambiente Supabase.
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #E2E8F0', borderTopColor: '#F4845F' }} />
              <p className="text-slate-400 text-sm">A carregar leads...</p>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && roleConfig.canViewDashboard && (
                <PageWrapper title="Dashboard">
                  <Dashboard leads={leads} exportCSV={exportCSV} exportJSON={exportJSON} />
                </PageWrapper>
              )}
              {currentView === 'leads' && (
                <PageWrapper title="Leads">
                  <LeadList leads={leads} onSelectLead={setSelectedLead} role={role} />
                </PageWrapper>
              )}
              {currentView === 'import' && roleConfig.canImport && (
                <PageWrapper title="Importar">
                  <ImportScreen onImportDone={(count) => {
                    refetch()
                    if (count > 0) showToast(`${count} lead${count === 1 ? '' : 's'} adicionado${count === 1 ? '' : 's'}!`)
                  }} />
                </PageWrapper>
              )}
            </>
          )}
        </div>
      </div>

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
          onDelete={handleLeadDelete}
          onArchive={handleLeadArchive}
          role={role}
        />
      )}
    </div>
  )
}
