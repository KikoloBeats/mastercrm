import { useEffect, useState } from 'react'

const ICONS = {
  success: (
    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
    </svg>
  ),
}

const GRADIENTS = {
  success: 'linear-gradient(135deg, #17A865 0%, #0D7A4A 100%)',
  error:   'linear-gradient(135deg, #E8365D 0%, #AA1A3A 100%)',
  info:    'linear-gradient(135deg, #2D5BE3 0%, #1A3DAD 100%)',
}

export default function Toast({ message, type = 'success', onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // mount → animate in
    const show = setTimeout(() => setVisible(true), 10)
    // auto dismiss after 7s
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 350)
    }, 7000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [onDone])

  return (
    <div
      className="fixed z-[200] top-4 left-1/2 transition-all duration-300"
      style={{
        transform: visible ? 'translateX(-50%) translateY(0) scale(1)' : 'translateX(-50%) translateY(-12px) scale(0.97)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-2xl"
        style={{
          background: GRADIENTS[type],
          minWidth: 260,
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.18)' }}
        >
          {ICONS[type]}
        </div>
        <p className="flex-1 text-sm font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {message}
        </p>
        <button
          onClick={() => { setVisible(false); setTimeout(onDone, 350) }}
          className="flex-shrink-0"
          style={{ opacity: 0.55 }}
        >
          <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
