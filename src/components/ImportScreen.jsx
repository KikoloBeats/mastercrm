import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { calculateScores } from '../lib/scoring'
import { supabase } from '../lib/supabase'

const CSV_MAP = { created_at: 2, first_name: 3, last_name: 4, email: 5, whatsapp: 6, career_phase: 7, main_challenge: 8, course_wish: 9 }

function parseCSVDate(str) {
  if (!str || !str.trim()) return new Date().toISOString()
  const s = str.trim()
  // Handle "DD/MM/YYYY HH:MM:SS" (Tally format)
  const ddmm = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (ddmm) {
    const [, dd, mm, yyyy] = ddmm
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`).toISOString()
  }
  // Fallback: ISO-ish with space separator
  const d = new Date(s.replace(' ', 'T'))
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

function normalisePhone(raw) {
  if (!raw) return ''
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return trimmed
  return trimmed.startsWith('+') ? trimmed : `+${digits}`
}

function buildTallyResponse(row) {
  const parts = []
  const phase     = row[CSV_MAP.career_phase]?.trim()
  const challenge = row[CSV_MAP.main_challenge]?.trim()
  const wish      = row[CSV_MAP.course_wish]?.trim()
  if (phase)     parts.push(`Fase da carreira: ${phase}`)
  if (challenge) parts.push(`Maior desafio: ${challenge}`)
  if (wish)      parts.push(`O que procura no curso: ${wish}`)
  return parts.join('\n')
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.08em' }}>
      {children}
    </p>
  )
}

export default function ImportScreen({ onImportDone }) {
  const [dragging, setDragging]         = useState(false)
  const [parsed, setParsed]             = useState(null)
  const [parseError, setParseError]     = useState(null)
  const [importing, setImporting]       = useState(false)
  const [result, setResult]             = useState(null)
  const [manualMode, setManualMode]     = useState(false)
  const [manualForm, setManualForm]     = useState({ name: '', whatsapp: '', email: '', tally_response: '' })
  const [manualError, setManualError]   = useState('')
  const [manualSuccess, setManualSuccess] = useState(false)
  const fileRef = useRef()

  const parseFile = (file) => {
    setResult(null); setParseError(null); setParsed(null)
    Papa.parse(file, {
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (res) => {
        try {
          if (!res.data || res.data.length < 2) { setParseError('Ficheiro vazio ou sem dados apos o cabecalho.'); return }
          const rows = res.data.slice(1)
          const leads = rows
            .map(row => {
              const firstName = row[CSV_MAP.first_name]?.trim() || ''
              const lastName  = row[CSV_MAP.last_name]?.trim()  || ''
              const name      = [firstName, lastName].filter(Boolean).join(' ')
              const whatsapp  = normalisePhone(row[CSV_MAP.whatsapp])
              return {
                name, whatsapp,
                email:          row[CSV_MAP.email]?.trim() || null,
                tally_response: buildTallyResponse(row) || null,
                created_at:     parseCSVDate(row[CSV_MAP.created_at]),
                source: 'csv', status: 'novo', score: 0,
                contact_history: [], is_archived: false,
              }
            })
            .filter(l => l.name.trim() && l.whatsapp.replace(/\D/g, '').length >= 7)

          if (leads.length === 0) { setParseError('Nenhum lead valido encontrado. Verifica as colunas (C a J).'); return }
          setParsed(calculateScores(leads))
        } catch (e) { setParseError('Erro ao processar: ' + e.message) }
      },
      error: (err) => setParseError('Erro ao ler o ficheiro: ' + err.message),
    })
  }

  const handleFile = (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) { setParseError('Por favor carrega um ficheiro .csv'); return }
    parseFile(file)
  }

  const doImport = async () => {
    if (!parsed?.length) return
    setImporting(true)
    try {
      const { data: existing, error: fetchErr } = await supabase.from('leads').select('whatsapp,email')
      if (fetchErr) throw new Error('Nao foi possivel verificar duplicados: ' + fetchErr.message)

      const existingWa     = new Set((existing || []).map(l => l.whatsapp?.replace(/\D/g, '')))
      const existingEmails = new Set((existing || []).map(l => l.email).filter(Boolean))
      const toInsert = []; let skipped = 0

      for (const lead of parsed) {
        const waClean = lead.whatsapp.replace(/\D/g, '')
        if (existingWa.has(waClean)) { skipped++; continue }
        if (lead.email && existingEmails.has(lead.email)) { skipped++; continue }
        toInsert.push(lead); existingWa.add(waClean)
        if (lead.email) existingEmails.add(lead.email)
      }

      let inserted = 0
      for (let i = 0; i < toInsert.length; i += 50) {
        const { error } = await supabase.from('leads').insert(toInsert.slice(i, i + 50))
        if (error) throw new Error(error.message)
        inserted += Math.min(50, toInsert.length - i)
      }

      setResult({ inserted, skipped, total: parsed.length }); setParsed(null); onImportDone?.(inserted)
    } catch (e) { setParseError('Erro ao importar: ' + e.message) }
    finally { setImporting(false) }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault(); setManualError('')
    const phone = normalisePhone(manualForm.whatsapp)
    if (!manualForm.name.trim() || !phone) { setManualError('Nome e WhatsApp sao obrigatorios.'); return }
    const phoneDigits = phone.replace(/\D/g, '')
    try {
      const { data: existing } = await supabase.from('leads').select('id,whatsapp,email')
      const dup = (existing || []).find(l => {
        const wa = l.whatsapp?.replace(/\D/g, '')
        return wa === phoneDigits || (manualForm.email && l.email === manualForm.email.trim())
      })
      if (dup) { setManualError('Ja existe um lead com este WhatsApp ou email.'); return }

      const { error } = await supabase.from('leads').insert({
        name: manualForm.name.trim(), whatsapp: phone,
        email: manualForm.email.trim() || null,
        tally_response: manualForm.tally_response.trim() || null,
        source: 'manual', status: 'novo',
        score: 40 + Math.min(Math.floor((manualForm.tally_response?.length || 0) / 5), 40),
        contact_history: [], is_archived: false,
      })
      if (error) throw error
      setManualSuccess(true); setManualForm({ name: '', whatsapp: '', email: '', tally_response: '' })
      setTimeout(() => setManualSuccess(false), 3000); onImportDone?.(1)
    } catch (e) { setManualError('Erro: ' + e.message) }
  }

  return (
    <div className="space-y-4 max-w-lg">

      {/* ── Mode tabs ── */}
      <div className="surface p-1 flex gap-1 rounded-xl">
        {[{ id: false, label: 'Importar CSV' }, { id: true, label: 'Adicionar manual' }].map(({ id, label }) => (
          <button
            key={String(id)}
            onClick={() => setManualMode(id)}
            className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all"
            style={manualMode === id
              ? { background: 'var(--blue)', color: 'white', fontFamily: 'Montserrat, sans-serif', boxShadow: '0 2px 8px rgba(45,91,227,0.25)' }
              : { color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {!manualMode ? (
        <>
          {!parsed && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                onClick={() => fileRef.current?.click()}
                className="surface p-10 text-center cursor-pointer transition-all rounded-xl"
                style={dragging
                  ? { border: '2px dashed var(--blue)', background: 'rgba(45,91,227,0.04)' }
                  : { border: '2px dashed var(--border)' }
                }
              >
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, var(--blue) 0%, var(--navy-mid) 100%)', boxShadow: '0 4px 16px rgba(45,91,227,0.25)' }}
                >
                  <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                </div>
                <p className="font-bold text-sm" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>Arrasta o CSV ou clica para carregar</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>Exportacao do Tally.so</p>
                <p className="text-xs mt-2 px-4" style={{ color: 'var(--border)', fontFamily: 'Inter, sans-serif' }}>Colunas C a J: Data, Nome, Apelido, Email, WhatsApp, Fase, Desafio, Curso</p>
              </div>

              {parseError && (
                <div className="surface p-4" style={{ borderLeft: '3px solid #DC2626' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#DC2626', fontFamily: 'Montserrat, sans-serif' }}>Erro</p>
                  <p className="text-sm" style={{ color: 'var(--text-mid)', fontFamily: 'Inter, sans-serif' }}>{parseError}</p>
                  <button onClick={() => setParseError(null)} className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Fechar</button>
                </div>
              )}
            </>
          )}

          {parsed && (
            <div className="space-y-3">
              {/* Preview header */}
              <div
                className="rounded-xl p-4 flex items-center gap-4"
                style={{ background: 'linear-gradient(135deg, var(--blue) 0%, var(--navy-mid) 100%)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{parsed.length}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>leads validos encontrados</p>
                </div>
              </div>

              {/* Preview table */}
              <div className="surface overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>WhatsApp</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 8).map((l, i) => (
                      <tr key={i}>
                        <td className="font-semibold" style={{ color: 'var(--text)', fontFamily: 'Montserrat, sans-serif' }}>{l.name}</td>
                        <td style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>{l.whatsapp}</td>
                        <td className="font-bold" style={{ color: 'var(--coral)', fontFamily: 'Montserrat, sans-serif' }}>{l.score}</td>
                      </tr>
                    ))}
                    {parsed.length > 8 && (
                      <tr>
                        <td colSpan={3} className="text-center py-3 text-xs" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                          e mais {parsed.length - 8} leads...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {parseError && (
                <div className="surface p-4" style={{ borderLeft: '3px solid #DC2626' }}>
                  <p className="text-sm" style={{ color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>{parseError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setParsed(null); setParseError(null) }} className="btn-ghost flex-1 justify-center">Cancelar</button>
                <button
                  onClick={doImport}
                  disabled={importing}
                  className="btn-primary flex-1 justify-center"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {importing ? 'A importar...' : `Importar ${parsed.length} leads`}
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {/* Success header */}
              <div className="p-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #17A865 0%, #0D7A4A 100%)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Importacao concluida</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>{result.inserted} leads adicionados</p>
                </div>
              </div>
              <div className="p-4 space-y-1" style={{ background: 'white' }}>
                {[
                  { label: 'Adicionados', value: result.inserted, color: 'var(--green)' },
                  { label: 'Duplicados ignorados', value: result.skipped, color: 'var(--muted)' },
                  { label: 'Total no ficheiro', value: result.total, color: 'var(--text)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between py-1.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <span className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                    <span className="text-xs font-bold" style={{ color, fontFamily: 'Montserrat, sans-serif' }}>{value}</span>
                  </div>
                ))}
                <button onClick={() => setResult(null)} className="text-xs mt-2 pt-1" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                  Importar outro ficheiro
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleManualSubmit} className="surface p-5 space-y-4">
          <SectionLabel>Adicionar lead manual</SectionLabel>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }}>Nome completo *</label>
            <input className="field" type="text" placeholder="Ana Ferreira" value={manualForm.name} onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }}>WhatsApp *</label>
            <div className="flex gap-0 rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--border)' }}>
              <div className="flex items-center px-3 flex-shrink-0" style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--blue)', fontFamily: 'Montserrat, sans-serif' }}>+</span>
              </div>
              <input
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                type="text"
                placeholder="244 923 456 789"
                value={manualForm.whatsapp.startsWith('+') ? manualForm.whatsapp.slice(1) : manualForm.whatsapp}
                onChange={e => setManualForm(f => ({ ...f, whatsapp: '+' + e.target.value.replace(/^\+/, '') }))}
                style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text)' }}
                required
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>Inclui codigo do pais (ex: 244 para Angola)</p>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }}>Email</label>
            <input className="field" type="email" placeholder="ana@email.com" value={manualForm.email} onChange={e => setManualForm(f => ({ ...f, email: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--muted)', fontFamily: 'Montserrat, sans-serif' }}>Resposta / Desafio de carreira</label>
            <textarea
              className="field resize-none h-24"
              placeholder="Maior dificuldade ou desafio profissional..."
              value={manualForm.tally_response}
              onChange={e => setManualForm(f => ({ ...f, tally_response: e.target.value }))}
            />
          </div>

          {manualError && (
            <p className="text-sm p-3 rounded-xl" style={{ background: '#FEF2F2', color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>{manualError}</p>
          )}
          {manualSuccess && (
            <p className="text-sm p-3 rounded-xl font-semibold" style={{ color: '#0D7A4A', background: '#E3F9EE', fontFamily: 'Montserrat, sans-serif' }}>
              Lead adicionado com sucesso!
            </p>
          )}

          <button type="submit" className="btn-primary w-full justify-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Adicionar lead
          </button>
        </form>
      )}
    </div>
  )
}
