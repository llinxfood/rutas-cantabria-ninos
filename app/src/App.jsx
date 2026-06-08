import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { routes, comarcas, mapsDirectionsUrl, wikilocUrl, slugify, routeBySlug, categoryOf, isAccessible } from './data.js'
import Wheel from './components/Wheel.jsx'
import RouteMap from './components/RouteMap.jsx'

const SITE_URL = 'https://llinxfood.github.io/ruleta-rutas-cantabria-peques/'
const shareUrl = r => `${SITE_URL}#ruta=${slugify(r.name)}`

function StatChips({ r }) {
  const cat = categoryOf(r)
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-salvia/15 border border-salvia/25 px-3 py-1 text-sm font-semibold capitalize">{cat.icon} {cat.key}</span>
      <span className="rounded-full bg-salvia/15 border border-salvia/25 px-3 py-1 text-sm font-semibold">📏 {r.km} km</span>
      <span className="rounded-full bg-salvia/15 border border-salvia/25 px-3 py-1 text-sm font-semibold">⛰️ {r.desnivel} m</span>
      <span className="rounded-full bg-salvia/15 border border-salvia/25 px-3 py-1 text-sm font-semibold">{r.tipo === 'Circular' ? '🔄' : '↔️'} {r.tipo}</span>
      {isAccessible(r) && <span className="rounded-full bg-sand/20 border border-sand/40 px-3 py-1 text-sm font-semibold text-sand">👶 Apto carrito</span>}
    </div>
  )
}

function Actions({ r, center }) {
  const [copied, setCopied] = useState(false)
  const waText = `🥾 Plan en Cantabria: ${r.name}. ¡Mira esta ruta para peques!`
  function copy() {
    navigator.clipboard?.writeText(shareUrl(r)).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <div className={`flex flex-wrap gap-2.5 ${center ? 'justify-center' : ''}`}>
      <a href={mapsDirectionsUrl(r)} target="_blank" rel="noopener"
         className="inline-flex items-center gap-1.5 rounded-full bg-sand px-4 py-2.5 text-sm font-bold text-forest-deep shadow-lg transition hover:brightness-105 hover:-translate-y-0.5">
        🚗 Cómo llegar
      </a>
      <a href={wikilocUrl(r)} target="_blank" rel="noopener"
         className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-105 hover:-translate-y-0.5"
         style={{ background: '#ff6a00' }}>
        📍 Wikiloc
      </a>
      <a href={`https://wa.me/?text=${encodeURIComponent(waText + ' ' + shareUrl(r))}`} target="_blank" rel="noopener"
         className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-105 hover:-translate-y-0.5"
         style={{ background: '#25D366' }}>
        🟢 WhatsApp
      </a>
      <button onClick={copy}
         className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-white/20">
        {copied ? '✓ ¡Copiado!' : '🔗 Copiar enlace'}
      </button>
    </div>
  )
}

function ResultCard({ r, onAgain }) {
  return (
    <div className="animate-fade-up mx-auto mt-7 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.06] p-7 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-salvia/80">Vuestra ruta de hoy</p>
      <h2 className="mt-1.5 font-display text-3xl font-semibold leading-tight text-sand sm:text-4xl">{r.name}</h2>
      <p className="mt-3 text-sm font-semibold text-salvia">📍 {r.zona} · {r.comarca}</p>
      <div className="mt-3.5 flex justify-center"><StatChips r={r} /></div>
      <p className="mt-3 text-cream/90 leading-relaxed">{r.resumen}</p>
      <div className="mt-5"><Actions r={r} center /></div>
      <button onClick={onAgain}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-cream/80 transition hover:bg-white/10">
        🎡 Girar otra vez
      </button>
    </div>
  )
}

function RouteCard({ r }) {
  const cat = categoryOf(r)
  return (
    <li className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition hover:border-sand/40 hover:bg-white/[0.08]">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-forest px-2.5 py-0.5 text-xs font-semibold text-salvia">{r.comarca}</span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold capitalize">{cat.icon} {cat.key}</span>
        {isAccessible(r) && <span className="rounded-full bg-sand/20 px-2.5 py-0.5 text-xs font-semibold text-sand">👶 carrito</span>}
      </div>
      <h3 className="font-display text-lg font-semibold text-cream">{r.name}</h3>
      <p className="mt-0.5 text-sm text-salvia">{r.zona}</p>
      <p className="mt-2.5 flex-1 text-sm text-cream/85 leading-relaxed">{r.resumen}</p>
      <div className="mt-3.5"><StatChips r={r} /></div>
      <div className="mt-4"><Actions r={r} /></div>
    </li>
  )
}

function inRange(value, sel, low, high) {
  if (sel === 's') return value <= low
  if (sel === 'm') return value > low && value <= high
  if (sel === 'l') return value > high
  return true
}

export default function App() {
  const [result, setResult] = useState(null)
  const [q, setQ] = useState('')
  const [comarca, setComarca] = useState('')
  const [tipo, setTipo] = useState('')
  const [dist, setDist] = useState('')
  const [desn, setDesn] = useState('')
  const [soloCarrito, setSoloCarrito] = useState(false)

  const wheelRef = useRef(null)
  const resultRef = useRef(null)

  // Enlace profundo: al abrir con #ruta=slug, muestra esa ruta
  useEffect(() => {
    const m = window.location.hash.match(/ruta=([\w-]+)/)
    if (m) {
      const r = routeBySlug(m[1])
      if (r) setResult(r)
    }
  }, [])

  // Al obtener resultado: confetti, scroll y actualizar el hash para compartir
  useEffect(() => {
    if (!result) return
    history.replaceState(null, '', `#ruta=${slugify(result.name)}`)
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.35 }, colors: ['#e7b85f', '#9bc1a8', '#2e7d5b', '#f3eede'] })
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [result])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return routes.filter(r => {
      if (query && !`${r.name} ${r.zona} ${r.comarca} ${r.resumen}`.toLowerCase().includes(query)) return false
      if (comarca && r.comarca !== comarca) return false
      if (tipo && r.tipo !== tipo) return false
      if (soloCarrito && !isAccessible(r)) return false
      if (!inRange(r.km, dist, 3, 5)) return false
      if (!inRange(r.desnivel, desn, 50, 150)) return false
      return true
    })
  }, [q, comarca, tipo, dist, desn, soloCarrito])

  const selectCls = "rounded-xl border border-white/18 bg-white/8 px-3 py-2.5 text-sm text-cream outline-none focus:border-sand/50 [&>option]:bg-forest [&>option]:text-cream"

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pb-16">
      {/* HERO */}
      <header className="relative -mx-4 w-screen overflow-hidden px-4 pb-28 pt-12 text-center">
        <div className="mountains pointer-events-none absolute inset-0 opacity-90" aria-hidden="true" />
        <div className="relative z-10">
          <p className="mb-2.5 text-sm font-semibold uppercase tracking-[0.28em] text-salvia">Cantabria con peques</p>
          <h1 className="mx-auto max-w-[16ch] font-display text-4xl font-semibold leading-[1.05] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl">
            Ruleta de <span className="italic text-sand">rutas</span> de senderismo
          </h1>
          <p className="mx-auto mt-3.5 max-w-[46ch] text-base text-cream/90 leading-relaxed sm:text-lg">
            {routes.length} senderos fáciles y aptos para ir con peques. Gira la ruleta y descubre vuestra próxima excursión 🥾
          </p>
        </div>
      </header>

      {/* RULETA */}
      <section className="-mt-16 w-full">
        <Wheel ref={wheelRef} routes={routes} onResult={setResult} />
        <div ref={resultRef}>
          {result
            ? <ResultCard r={result} onAgain={() => wheelRef.current?.spin()} />
            : <p className="mx-auto mt-7 max-w-md text-center text-cream/70">Pulsa <b className="text-sand">GIRAR</b> y deja que la suerte elija vuestra excursión. 🎡</p>}
        </div>
      </section>

      {/* EXPLORAR */}
      <section className="mt-16 w-full max-w-6xl">
        <h2 className="font-display text-2xl font-semibold text-cream">Explorar todas las rutas</h2>
        <p className="mt-1.5 max-w-3xl text-sm text-cream/60">
          📏 Distancia, ⛰️ desnivel y tipo son orientativos. El dato exacto, el track GPS, fotos y reseñas están en el enlace de Wikiloc de cada ruta.
        </p>

        {/* Chips de comarca */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => setComarca('')}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${comarca === '' ? 'bg-sand text-forest-deep' : 'bg-white/8 text-cream hover:bg-white/15'}`}>
            Todas
          </button>
          {comarcas.map(c => (
            <button key={c} onClick={() => setComarca(c === comarca ? '' : c)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${comarca === c ? 'bg-sand text-forest-deep' : 'bg-white/8 text-cream hover:bg-white/15'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="🔎 Buscar ruta o lugar…"
            className="min-w-[180px] flex-1 rounded-xl border border-white/18 bg-white/8 px-3.5 py-2.5 text-sm text-cream outline-none placeholder:text-cream/55 focus:border-sand/50" />
          <select value={tipo} onChange={e => setTipo(e.target.value)} className={selectCls}>
            <option value="">Tipo: todas</option>
            <option value="Circular">🔄 Circular</option>
            <option value="Lineal">↔️ Lineal</option>
          </select>
          <select value={dist} onChange={e => setDist(e.target.value)} className={selectCls}>
            <option value="">Distancia: cualquiera</option>
            <option value="s">Hasta 3 km</option>
            <option value="m">3 – 5 km</option>
            <option value="l">Más de 5 km</option>
          </select>
          <select value={desn} onChange={e => setDesn(e.target.value)} className={selectCls}>
            <option value="">Desnivel: cualquiera</option>
            <option value="s">Llano (≤ 50 m)</option>
            <option value="m">Suave (50 – 150 m)</option>
            <option value="l">Más exigente (&gt; 150 m)</option>
          </select>
          <button onClick={() => setSoloCarrito(v => !v)}
            className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${soloCarrito ? 'bg-sand text-forest-deep' : 'border border-white/18 bg-white/8 text-cream hover:bg-white/18'}`}>
            👶 Apto carrito
          </button>
          <button onClick={() => { setQ(''); setComarca(''); setTipo(''); setDist(''); setDesn(''); setSoloCarrito(false) }}
            className="rounded-xl border border-white/18 bg-white/8 px-3.5 py-2.5 text-sm font-semibold text-cream transition hover:bg-white/18">
            Limpiar
          </button>
        </div>

        <p className="mt-3 text-sm text-cream/70">{filtered.length} de {routes.length} rutas</p>

        {filtered.length === 0
          ? <p className="mt-6 italic text-cream/70">No hay rutas con esos filtros. Prueba a aflojarlos.</p>
          : <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(r => <RouteCard key={r.name} r={r} />)}
            </ul>}
      </section>

      {/* MAPA */}
      <section className="mt-16 w-full max-w-6xl">
        <h2 className="font-display text-2xl font-semibold text-cream">Mapa de rutas</h2>
        <p className="mt-1.5 mb-4 max-w-3xl text-sm text-cream/60">
          Ubicación aproximada por municipio. Pulsa un punto para ver la ruta y abrir Maps o Wikiloc.
        </p>
        <RouteMap routes={filtered} onPick={setResult} />
      </section>

      {/* FOOTER */}
      <footer className="mt-16 max-w-xl text-center text-sm leading-relaxed text-salvia">
        Hecho con 🌲 para disfrutar Cantabria con peques.<br />
        Distancias y desniveles orientativos · tracks reales en Wikiloc.
        <br />
        <a href={SITE_URL} className="text-sand">{SITE_URL.replace('https://', '')}</a>
      </footer>
    </div>
  )
}
