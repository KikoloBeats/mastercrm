import { useState, useEffect, useCallback, Fragment } from 'react'
import { format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import { TEMPLATES } from '../constants/templates'
import { STATUSES, STATUS_ORDER } from '../constants/statuses'
import { calculateQualityScore, getScoreCategory } from '../lib/scoring'

const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"

const PIPELINE_STEPS = ['novo', 'contactado', 'respondeu', 'interessado', 'comprou']

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.08em' }}>
      {children}
    </p>
  )
}

function formatWaLink(number, text) {
  const digits = number.replace(/\D/g, '')
  if (text) return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
  return `https://wa.me/${digits}`
}

const SCORE_GRADIENT = {
  hot:  'linear-gradient(90deg, #17A865, #0D7A4A)',
  warm: 'linear-gradient(90deg, #E8A020, #B87A10)',
  cold: 'linear-gradient(90deg, #7A8BAD, #5A6A88)',
}

function StatusTimeline({ currentStatus }) {
  const currentIdx = PIPELINE_STEPS.indexOf(currentStatus)
  const effectiveIdx = currentIdx === -1 ? 0 : currentIdx

  return (
    <div className="px-5 pb-5 flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)' }}>
      <div className="flex items-start">
        {PIPELINE_STEPS.map((step, i) => {
          const cfg = STATUSES[step]
          const isDone = effectiveIdx > i
          const isActive = effectiveIdx === i
          return (
            <Fragment key={step}>
              <div className="flex flex-col items-center" style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDone ? '#17A865' : isActive ? cfg.color : 'rgba(255,255,255,0.12)',
                    border: isActive ? `2px solid ${cfg.color}` : isDone ? '2px solid #17A865' : '1.5px solid rgba(255,255,255,0.18)',
                    boxShadow: isActive ? `0 0 0 3px ${cfg.color}33` : 'none',
                  }}
                >
                  {isDone ? (
                    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : (
                    <span style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>{i + 1}</span>
                  )}
                </div>
                <span style={{
                  color: isActive ? 'white' : isDone ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 8,
                  fontWeight: 600,
                  textAlign: 'center',
                  marginTop: 5,
                  lineHeight: 1.25,
                  padding: '0 1px',
                }}>
                  {cfg.label}
                </span>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div style={{
                  height: 2,
                  flex: 0.8,
                  marginTop: 11,
                  background: isDone ? 'rgba(23,168,101,0.55)' : 'rgba(255,255,255,0.12)',
                  borderRadius: 1,
                  flexShrink: 0,
                }} />
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default function LeadDetail({ lead: initialLead, onClose, onUpdate, onDelete, onArchive, role }) {
  const [lead, setLead]                   = useState(initialLead)
  const [notes, setNotes]                 = useState(initialLead.notes || '')
  const [saving, setSaving]               = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [notesTimeout, setNotesTimeout]   = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied]               = useState(false)
  const [copiedPhone, setCopiedPhone]     = useState(false)
  const [editMode, setEditMode]           = useState(false)
  const [editForm, setEditForm]           = useState({ name: initialLead.name, whatsapp: initialLead.whatsapp, email: initialLead.email || '' })
  const [emailOpen, setEmailOpen]         = useState(false)
  const [emailForm, setEmailForm]         = useState({ subject: '', message: '' })
  const [emailSending, setEmailSending]   = useState(false)
  const [emailSent, setEmailSent]         = useState(false)
  const [emailError, setEmailError]       = useState('')

  useEffect(() => {
    setLead(initialLead)
    setNotes(initialLead.notes || '')
    setSelectedTemplate(0)
    setConfirmDelete(false)
    setEditMode(false)
    setEditForm({ name: initialLead.name, whatsapp: initialLead.whatsapp, email: initialLead.email || '' })
    setEmailOpen(false)
    setEmailSent(false)
    setEmailError('')
  }, [initialLead.id])

  const templates    = TEMPLATES[lead.status] || []
  const currentTpl   = templates[selectedTemplate]
  const templateText = currentTpl ? currentTpl.text(lead.name, lead.tally_response) : ''
  const waLink       = formatWaLink(lead.whatsapp, templateText)
  const scorecat     = getScoreCategory(lead.score ?? 0)
  const qualScore    = calculateQualityScore(lead.tally_response)
  const recScore     = Math.max(0, (lead.score ?? 0) - qualScore)
  const statusCfg    = STATUSES[lead.status] || STATUSES.novo
  const isEditable   = role !== 'carla'

  const logContact = useCallback(async (key, label) => {
    if (!isEditable) return
    const now  = new Date().toISOString()
    const entry = { date: now, template_key: key, template_label: label, status_at_time: lead.status }
    const hist  = Array.isArray(lead.contact_history) ? lead.contact_history : []
    const updates = {
      contact_history: [...hist, entry],
      last_contacted_at: now,
      ...(lead.status === 'novo' ? { status: 'contactado' } : {}),
    }
    try {
      const updated = await onUpdate(lead.id, updates)
      setLead(updated || { ...lead, ...updates })
    } catch (e) { console.error(e) }
  }, [lead, onUpdate, isEditable])

  const handleCopyTemplate = useCallback(async () => {
    try { await navigator.clipboard.writeText(templateText) }
    catch {
      const ta = document.createElement('textarea')
      ta.value = templateText; document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    logContact(currentTpl?.id || 'unknown', currentTpl?.label || '')
  }, [templateText, currentTpl, logContact])

  const handleCopyPhone = useCallback(async () => {
    try { await navigator.clipboard.writeText(lead.whatsapp) }
    catch {
      const ta = document.createElement('textarea')
      ta.value = lead.whatsapp; document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopiedPhone(true); setTimeout(() => setCopiedPhone(false), 2000)
  }, [lead.whatsapp])

  const handleStatusChange = async (newStatus) => {
    if (!isEditable) return
    try {
      const updates = {
        status: newStatus,
        ...(newStatus === 'contactado' && !lead.last_contacted_at ? { last_contacted_at: new Date().toISOString() } : {}),
      }
      const updated = await onUpdate(lead.id, updates)
      setLead(updated || { ...lead, ...updates })
    } catch (e) { console.error(e) }
  }

  const handleNotesChange = (val) => {
    setNotes(val)
    if (notesTimeout) clearTimeout(notesTimeout)
    const t = setTimeout(async () => {
      try { setSaving(true); const up = await onUpdate(lead.id, { notes: val }); if (up) setLead(up) }
      catch (e) { console.error(e) }
      finally { setSaving(false) }
    }, 1000)
    setNotesTimeout(t)
  }

  const handleArchive = async () => {
    try { await onArchive(lead.id, !lead.is_archived); onClose() }
    catch (e) { console.error(e) }
  }

  const handleDelete = async () => {
    try { await onDelete(lead.id); onClose() }
    catch (e) { console.error(e) }
  }

  const handleEditSave = async () => {
    try {
      setSaving(true)
      const updates = {
        name: editForm.name.trim(),
        whatsapp: editForm.whatsapp.trim(),
        email: editForm.email.trim() || null,
      }
      const updated = await onUpdate(lead.id, updates)
      setLead(updated || { ...lead, ...updates })
      setEditMode(false)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleSendEmail = async (e) => {
    e.preventDefault()
    if (!lead.email || !emailForm.subject.trim() || !emailForm.message.trim()) return
    setEmailSending(true); setEmailError('')
    try {
      const res = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: lead.email, subject: emailForm.subject, text: emailForm.message, name: lead.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar')
      setEmailSent(true); setEmailForm({ subject: '', message: '' })
      setTimeout(() => { setEmailSent(false); setEmailOpen(false) }, 3000)
    } catch (err) {
      setEmailError(err.message)
    } finally { setEmailSending(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button onClick={onClose} className="flex-1 bg-black/40 backdrop-blur-sm" aria-label="Fechar" />

      <div className="w-full max-w-md h-full overflow-y-auto flex flex-col shadow-2xl" style={{ background: 'var(--bg)' }}>

        {/* ── Gradient header ── */}
        <div
          className="relative px-5 pt-6 pb-5 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)' }}
        >
          {/* Action buttons top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isEditable && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                title="Editar contacto"
              >
                <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {editMode ? (
            /* ── Edit form ── */
            <div className="space-y-3 pr-20">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Montserrat, sans-serif' }}>Editar contacto</p>
              {[
                { key: 'name',      label: 'Nome',      type: 'text',  placeholder: 'Nome completo' },
                { key: 'whatsapp',  label: 'WhatsApp',  type: 'text',  placeholder: '+244 9XX XXX XXX' },
                { key: 'email',     label: 'Email',     type: 'email', placeholder: 'email@exemplo.com' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Montserrat, sans-serif' }}>{label}</label>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Montserrat, sans-serif' }}
                >Cancelar</button>
                <button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'var(--blue)', color: 'white', fontFamily: 'Montserrat, sans-serif' }}
                >{saving ? 'A guardar...' : 'Guardar'}</button>
              </div>
            </div>
          ) : (
            /* ── Normal header ── */
            <div className="flex items-center gap-3 mb-4 pr-20">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg"
                style={{ background: 'rgba(255,255,255,0.14)', color: 'white', fontFamily: 'Montserrat, sans-serif' }}
              >
                {lead.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="font-bold text-white text-lg leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>{lead.name}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}>{lead.email || lead.whatsapp}</p>
              </div>
            </div>
          )}

          {/* Status + score chips */}
          {!editMode && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', fontFamily: 'Montserrat, sans-serif' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: statusCfg.color }} />
                {statusCfg.label}
              </span>
              <span
                className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{
                  background: scorecat === 'hot' ? 'rgba(23,168,101,0.25)' : scorecat === 'warm' ? 'rgba(232,160,32,0.25)' : 'rgba(122,139,173,0.20)',
                  color: scorecat === 'hot' ? '#6BDFB0' : scorecat === 'warm' ? '#F5C96A' : '#A0B4D0',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {lead.score ?? 0} pts
              </span>
              {lead.is_archived && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                  Arquivado
                </span>
              )}
              {lead.source === 'csv' && (
                <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>CSV</span>
              )}
            </div>
          )}
        </div>

        {/* ── Status timeline ── */}
        {!editMode && <StatusTimeline currentStatus={lead.status} />}

        <div className="flex-1 p-4 space-y-3">

          {/* ── Contact info ── */}
          <div className="surface p-4 space-y-3">
            <SectionLabel>Contacto</SectionLabel>

            {/* WhatsApp row */}
            <div className="flex items-center gap-2">
              <a
                href={formatWaLink(lead.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{ background: '#E3F9EE' }}
                onMouseEnter={e => e.currentTarget.style.background = '#C8F2DA'}
                onMouseLeave={e => e.currentTarget.style.background = '#E3F9EE'}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#25D366">
                  <path d={WA_PATH}/>
                </svg>
                <span className="text-sm font-semibold" style={{ color: '#0D7A4A', fontFamily: 'Montserrat, sans-serif' }}>{lead.whatsapp}</span>
              </a>
              <button
                onClick={handleCopyPhone}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={copiedPhone
                  ? { background: '#E3F9EE', border: '1.5px solid #6BCF8A' }
                  : { background: 'var(--bg)', border: '1.5px solid var(--border)' }
                }
                title="Copiar numero"
              >
                {copiedPhone ? (
                  <svg width="14" height="14" fill="none" stroke="#0D7A4A" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ color: 'var(--muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Email row */}
            {lead.email && (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-1">
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--border)' }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--text-mid)', fontFamily: 'Inter, sans-serif' }}>{lead.email}</span>
                </div>
                <button
                  onClick={() => setEmailOpen(o => !o)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={emailOpen
                    ? { background: 'var(--blue)', border: '1.5px solid var(--blue)' }
                    : { background: 'var(--bg)', border: '1.5px solid var(--border)' }
                  }
                  title="Enviar email"
                >
                  <svg width="14" height="14" fill="none" stroke={emailOpen ? 'white' : 'currentColor'} strokeWidth="1.8" viewBox="0 0 24 24" style={{ color: emailOpen ? 'white' : 'var(--muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Email compose */}
            {lead.email && emailOpen && (
              <form onSubmit={handleSendEmail} className="space-y-3 pt-1">
                <div className="h-px" style={{ background: 'var(--border-light)' }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }}>Compor email</p>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }}>Assunto</label>
                  <input
                    className="field"
                    type="text"
                    placeholder="Informacoes sobre o MasterPlan..."
                    value={emailForm.subject}
                    onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }}>Mensagem</label>
                  <textarea
                    className="field resize-none h-28 leading-relaxed"
                    placeholder={`Ola ${lead.name?.split(' ')[0]}!...`}
                    value={emailForm.message}
                    onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                </div>
                {emailError && <p className="text-xs p-3 rounded-xl" style={{ background: '#FEF2F2', color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>{emailError}</p>}
                {emailSent && <p className="text-xs p-3 rounded-xl font-semibold" style={{ background: '#E3F9EE', color: '#0D7A4A', fontFamily: 'Montserrat, sans-serif' }}>Email enviado!</p>}
                <div className="flex gap-2">
                  <a
                    href={`mailto:${lead.email}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}`}
                    className="flex-none py-2.5 px-4 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    mailto:
                  </a>
                  <button
                    type="submit"
                    disabled={emailSending || emailSent}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--blue) 0%, var(--navy-mid) 100%)', color: 'white', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {emailSent ? 'Enviado!' : emailSending ? 'A enviar...' : 'Enviar via Resend'}
                  </button>
                </div>
              </form>
            )}

            {lead.created_at && (
              <div className="flex items-center gap-3 px-1">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--border)' }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                  Inscrito a {format(parseISO(lead.created_at), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                </span>
              </div>
            )}
          </div>

          {/* ── Score breakdown ── */}
          <div className="surface p-4">
            <SectionLabel>Pontuacao — {lead.score ?? 0}/100</SectionLabel>
            <div className="space-y-3">
              {[
                { label: 'Qualidade da resposta', value: qualScore, max: 60 },
                { label: 'Recencia', value: recScore, max: 40 },
              ].map(({ label, value, max }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>{value}/{max}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(value / max) * 100}%`, background: SCORE_GRADIENT[scorecat] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tally response ── */}
          {lead.tally_response && (
            <div className="surface p-4">
              <SectionLabel>Resposta do formulario</SectionLabel>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-mid)', fontFamily: 'Inter, sans-serif' }}>{lead.tally_response}</p>
            </div>
          )}

          {/* ── Stage selector ── */}
          {isEditable && (
            <div className="surface p-4">
              <SectionLabel>Alterar etapa</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_ORDER.map((status) => {
                  const cfg = STATUSES[status]
                  const isActive = lead.status === status
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="rounded-xl text-xs font-bold py-2.5 px-3 transition-all active:scale-95"
                      style={isActive
                        ? { background: cfg.color, color: '#fff', fontFamily: 'Montserrat, sans-serif', boxShadow: `0 2px 8px ${cfg.color}55` }
                        : { background: 'var(--bg)', color: 'var(--muted)', border: '1.5px solid var(--border)', fontFamily: 'Montserrat, sans-serif' }
                      }
                    >
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── WhatsApp templates ── */}
          {isEditable && templates.length > 0 && (
            <div className="surface p-4 space-y-3">
              <SectionLabel>Mensagem WhatsApp</SectionLabel>

              {templates.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {templates.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(i)}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                      style={selectedTemplate === i
                        ? { background: 'var(--navy)', color: '#fff', fontFamily: 'Montserrat, sans-serif' }
                        : { background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)', fontFamily: 'Montserrat, sans-serif' }
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              <pre
                className="text-sm rounded-xl p-4 whitespace-pre-wrap leading-relaxed font-sans"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-mid)', fontFamily: 'Inter, sans-serif' }}
              >
                {templateText}
              </pre>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logContact(currentTpl?.id || 'unknown', currentTpl?.label || '')}
                className="w-full min-h-[52px] rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C4A 100%)', color: '#fff', fontFamily: 'Montserrat, sans-serif', boxShadow: '0 4px 14px rgba(37,211,102,0.30)' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d={WA_PATH}/></svg>
                Enviar no WhatsApp
              </a>

              <button
                onClick={handleCopyTemplate}
                className="w-full min-h-[44px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={copied
                  ? { background: '#E3F9EE', color: '#0D7A4A', border: '1px solid #6BCF8A', fontFamily: 'Montserrat, sans-serif' }
                  : { background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)', fontFamily: 'Montserrat, sans-serif' }
                }
              >
                {copied ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Copiado!</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>Copiar mensagem</>
                )}
              </button>
            </div>
          )}

          {/* ── Notes ── */}
          <div className="surface p-4">
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Notas internas</SectionLabel>
              {saving && <span className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>A guardar...</span>}
            </div>
            <textarea
              className="field resize-none h-24 leading-relaxed"
              placeholder="Adiciona notas sobre este lead..."
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              disabled={!isEditable}
            />
          </div>

          {/* ── Contact history ── */}
          {lead.contact_history?.length > 0 && (
            <div className="surface p-4">
              <SectionLabel>Historico de contacto</SectionLabel>
              <div className="space-y-3">
                {[...lead.contact_history].reverse().map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-0.5 rounded-full flex-shrink-0 my-1" style={{ background: 'var(--border)' }} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>{entry.template_label || entry.template_key}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                        {entry.date ? format(parseISO(entry.date), "d MMM 'as' HH:mm", { locale: pt }) : ''}
                        {entry.status_at_time && <span className="ml-2 italic">({STATUSES[entry.status_at_time]?.label})</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Ações ── */}
          {isEditable && (
            <div className="surface p-4 space-y-2">
              <SectionLabel>Ações</SectionLabel>
              <button
                onClick={handleArchive}
                className="w-full min-h-[44px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1.5px solid var(--border)', fontFamily: 'Montserrat, sans-serif' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
                {lead.is_archived ? 'Desarquivar lead' : 'Arquivar lead'}
              </button>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full min-h-[44px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', fontFamily: 'Montserrat, sans-serif' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Apagar lead
                </button>
              ) : (
                <div className="rounded-xl p-4 space-y-3" style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
                  <p className="text-sm font-semibold text-center" style={{ color: '#DC2626', fontFamily: 'Montserrat, sans-serif' }}>Tens a certeza? Esta acao e permanente.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(false)} className="flex-1 min-h-[40px] rounded-xl text-sm font-semibold" style={{ background: 'white', color: 'var(--muted)', border: '1px solid var(--border)', fontFamily: 'Montserrat, sans-serif' }}>
                      Cancelar
                    </button>
                    <button onClick={handleDelete} className="flex-1 min-h-[40px] rounded-xl text-sm font-bold text-white" style={{ background: '#DC2626', fontFamily: 'Montserrat, sans-serif' }}>
                      Apagar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}
