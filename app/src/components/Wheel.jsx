import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

// Paleta cálida cohesionada con el tema (verdes + terracota + tierra)
const COLORS = ["#2e6b4f", "#c46a3f", "#1f4536", "#a8552f", "#3f7a5e", "#8a3d22"]

const Wheel = forwardRef(function Wheel({ routes, onResult }, ref) {
  const canvasRef = useRef(null)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(-1)

  const n = routes.length

  function draw(highlight = -1) {
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
      ctx.fillStyle = i === highlight ? '#f3cd7e' : COLORS[i % COLORS.length]
      ctx.fill()
      ctx.strokeStyle = i === highlight ? '#fff' : 'rgba(255,255,255,.15)'
      ctx.lineWidth = i === highlight ? 4 : 2
      ctx.stroke()

      ctx.save()
      ctx.translate(R, R)
      ctx.rotate(start + arc / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = i === highlight ? '#0c3024' : '#fff'
      ctx.font = `bold ${Math.max(9, Math.min(15, 360 / n))}px "Inter", sans-serif`
      let label = routes[i].name
      const maxChars = n > 40 ? 22 : 34
      if (label.length > maxChars) label = label.slice(0, maxChars - 1) + '…'
      ctx.fillText(label, R - 18, 4)
      ctx.restore()
    }
  }

  useEffect(() => { draw(winner) }, [routes, n, winner])

  function spin() {
    if (spinning) return
    setSpinning(true)
    setWinner(-1)
    const idx = Math.floor(Math.random() * n)
    const extraTurns = 5 + Math.floor(Math.random() * 4)
    const target = 360 * extraTurns + (360 - (idx * (360 / n) + (360 / n) / 2))
    setRotation(prev => prev + target)
    setTimeout(() => {
      setSpinning(false)
      setWinner(idx)
      onResult(routes[idx])
    }, 6100)
  }

  useImperativeHandle(ref, () => ({ spin, spinning }), [spinning])

  return (
    <div className="relative mx-auto" style={{ width: 'min(86vw, 520px)', height: 'min(86vw, 520px)' }}>
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-1 z-10"
        style={{ width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '38px solid var(--color-terracota)', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.35))' }}
      />
      <canvas
        ref={canvasRef}
        width={700}
        height={700}
        className="w-full h-full rounded-full wheel-spin"
        style={{
          transform: `rotate(${rotation}deg)`,
          boxShadow: '0 0 0 8px rgba(31,61,46,.06), 0 0 0 16px rgba(31,61,46,.12), 0 24px 50px rgba(20,44,32,.22)',
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
})

export default Wheel
