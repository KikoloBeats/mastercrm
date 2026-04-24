import { getScoreCategory } from '../../lib/scoring'

const COLORS = {
  hot: { bg: '#EDFBF3', text: '#1A7A42', dot: '#6BCF8A' },
  warm: { bg: '#FDF8E6', text: '#7A5A10', dot: '#E8C96A' },
  cold: { bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF' },
}

export default function ScoreBadge({ score, size = 'md' }) {
  const cat = getScoreCategory(score ?? 0)
  const { bg, text, dot } = COLORS[cat]
  const isSmall = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-lg ${
        isSmall ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
      style={{ backgroundColor: bg, color: text }}
    >
      <span
        className={`rounded-full flex-shrink-0 ${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
        style={{ backgroundColor: dot }}
      />
      {score ?? 0}
    </span>
  )
}
