import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('score', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLeads()

    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLeads((prev) => {
            // dedup: if already in state (e.g. from refetch racing with realtime), skip
            if (prev.some(l => l.id === payload.new.id)) return prev
            return [payload.new, ...prev].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          })
        } else if (payload.eventType === 'UPDATE') {
          setLeads((prev) => prev.map(l => l.id === payload.new.id ? payload.new : l))
        } else if (payload.eventType === 'DELETE') {
          setLeads((prev) => prev.filter(l => l.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchLeads])

  const updateLead = useCallback(async (id, updates) => {
    const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  }, [])

  const addLead = useCallback(async (lead) => {
    const { data, error } = await supabase.from('leads').insert(lead).select().single()
    if (error) throw error
    return data
  }, [])

  const bulkInsert = useCallback(async (leads) => {
    const { data, error } = await supabase.from('leads').upsert(leads, { onConflict: 'whatsapp', ignoreDuplicates: true }).select()
    if (error) throw error
    return data
  }, [])

  const deleteLead = useCallback(async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error
  }, [])

  const archiveLead = useCallback(async (id, archive = true) => {
    const { data, error } = await supabase.from('leads').update({ is_archived: archive }).eq('id', id).select().single()
    if (error) throw error
    return data
  }, [])

  const exportCSV = useCallback(() => {
    if (!leads.length) return
    const headers = ['id', 'name', 'whatsapp', 'email', 'status', 'score', 'source', 'created_at', 'last_contacted_at', 'notes', 'tally_response']
    const rows = leads.map(l => headers.map(h => `"${(l[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a'); a.href = url
    a.download = `masterplan-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }, [leads])

  const exportJSON = useCallback(() => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url
    a.download = `masterplan-leads-${new Date().toISOString().slice(0, 10)}.json`
    a.click(); URL.revokeObjectURL(url)
  }, [leads])

  return { leads, loading, error, updateLead, addLead, bulkInsert, deleteLead, archiveLead, exportCSV, exportJSON, refetch: fetchLeads }
}
