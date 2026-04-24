import { STATUSES } from '../../constants/statuses'

export default function StatusPill({ status, size = 'md' }) {
  const cfg = STATUSES[status] || STATUSES.novo
  const isSmall = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
        isSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1'
      }`}
      style={{ backgroundColor: cfg.bg, color: cfg.textColor }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.color }}
      />
      {cfg.label}
    </span>
  )
}
