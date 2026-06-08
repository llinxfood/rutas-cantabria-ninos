import { useEffect, useRef, useState } from 'react'

const COLORS = ["#1b6b4a", "#238a5e", "#2f9e6e", "#0f5d3f", "#3aaf7c", "#157a52"]

export default function Wheel({ routes, onResult }) {
  const canvasRef = useRef(null)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)

  const n = routes.length

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const R = size / 2
    const arc = (2 * Math.PI) / n

    ctx.clearRect(0, 0, size, size)
    for (let i = 0; i < n; i++) {
      const start = i * arc - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(R, R)
      ctx.arc(R, R, R - 6, start, start + arc)
      ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()
      ctx.strokeStyle = "rgba(255,255,255,.15)"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.translate(R, R)
      ctx.rotate(start + arc / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = "#fff"
      ctx.font = `bold ${Math.max(9, Math.min(15, 360 / n))}px "Inter", sans-serif`
      let label = routes[i].name
      const maxChars = n > 40 ? 22 : 34
      if (label.length > maxChars) label = label.slice(0, maxChars - 1) + "…"
      ctx.fillText(label, R - 18, 4)
      ctx.restore()
    }
  }, [routes, n])

  function spin() {
    if (spinning) return
    setSpinning(true)
    const idx = Math.floor(Math.random() * n)
    const extraTurns = 5 + Math.floor(Math.random() * 4)
    const target = 360 * extraTurns + (360 - (idx * (360 / n) + (360 / n) / 2))
    setRotation(prev => prev + target)
    setTimeout(() => {
      setSpinning(false)
      onResult(routes[idx])
    }, 6100)
  }

  return (
    <div className="relative mx-auto" style={{ width: 'min(86vw, 520px)', height: 'min(86vw, 520px)' }}>
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-1 z-10"
        style={{ width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '38px solid var(--color-sand)', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.55))' }}
      />
      <canvas
        ref={canvasRef}
        width={700}
        height={700}
        className="w-full h-full rounded-full wheel-spin"
        style={{
          transform: `rotate(${rotation}deg)`,
          boxShadow: '0 0 0 8px rgba(243,238,222,.14), 0 0 0 16px rgba(12,48,36,.5), 0 24px 60px rgba(0,0,0,.5)',
        }}
      />
      <button
        onClick={spin}
        disabled={spinning}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 grid place-items-center rounded-full font-display font-bold text-forest-deep transition active:scale-95 disabled:grayscale disabled:brightness-90"
        style={{
          width: 96, height: 96,
          border: '5px solid var(--color-cream)',
          background: 'radial-gradient(circle at 35% 30%, var(--color-sand-soft), var(--color-sand))',
          fontSize: '1.05rem', letterSpacing: '.03em',
          boxShadow: '0 8px 22px rgba(0,0,0,.45)',
          cursor: spinning ? 'not-allowed' : 'pointer',
        }}
      >
        {spinning ? '…' : 'GIRAR'}
      </button>
    </div>
  )
}
