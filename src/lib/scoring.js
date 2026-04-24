const KEYWORDS_HIGH = [
  'frustrada', 'frustrado', 'perdida', 'perdido', 'desesperada', 'desesperado',
  'stuck', 'bloqueada', 'bloqueado', 'desempregada', 'desempregado',
  'não sei o que fazer', 'nao sei o que fazer', 'sem saida', 'sem saída',
  'urgente', 'preciso muito', 'preciso urgente',
]

const KEYWORDS_MED = [
  'emprego', 'promoção', 'promocao', 'oportunidade', 'salário', 'salario',
  'direção', 'direcao', 'plano', 'mudar', 'crescer', 'crescimento',
  'não sei', 'nao sei', 'dificuldade', 'desafio', 'motivação', 'motivacao',
  'melhorar', 'transformar', 'insatisfeita', 'insatisfeito', 'confusa', 'confuso',
  'perdida', 'perdido', 'ajuda', 'preciso', 'carreira', 'trabalho',
  'reconhecimento', 'progressao', 'progressão', 'identidade',
]

export function calculateQualityScore(tallyResponse) {
  if (!tallyResponse || tallyResponse.trim().length < 10) return 0

  const text = tallyResponse.toLowerCase()
  const wordCount = text.split(/\s+/).filter(Boolean).length

  let score = 8
  if (wordCount > 15) score += 8
  if (wordCount > 40) score += 8
  if (wordCount > 80) score += 4

  const highMatches = KEYWORDS_HIGH.filter(k => text.includes(k)).length
  const medMatches = KEYWORDS_MED.filter(k => text.includes(k)).length

  score += Math.min(highMatches * 8, 16)
  score += Math.min(medMatches * 4, 16)

  return Math.min(score, 60)
}

export function scoreBreakdown(tallyResponse, createdAt, minDate, maxDate) {
  const recency = calculateRecencyScore(createdAt, minDate, maxDate)
  const quality = calculateQualityScore(tallyResponse)
  return { recency, quality, total: recency + quality }
}

export function calculateRecencyScore(createdAt, minDate, maxDate) {
  const date = new Date(createdAt).getTime()
  if (minDate === maxDate) return 40
  return Math.round(((date - minDate) / (maxDate - minDate)) * 40)
}

export function calculateScores(leads) {
  if (!leads.length) return []
  const dates = leads.map(l => new Date(l.created_at).getTime())
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)

  return leads.map(lead => ({
    ...lead,
    score:
      calculateRecencyScore(lead.created_at, minDate, maxDate) +
      calculateQualityScore(lead.tally_response),
  }))
}

export function getScoreCategory(score) {
  if (score >= 70) return 'hot'
  if (score >= 40) return 'warm'
  return 'cold'
}
