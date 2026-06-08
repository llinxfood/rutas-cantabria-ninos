import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { routes, comarcas, mapsDirectionsUrl, wikilocUrl, slugify, routeBySlug, categoryOf, isAccessible } from './data.js'
import Wheel from './components/Wheel.jsx'
import RouteMap from './components/RouteMap.jsx'
import waLogo from './icons/whatsapp.svg'
import mapsLogo from './icons/googlemaps.svg'
import wikilocLogo from './icons/wikiloc.svg'

const SITE_URL = 'https://llinxfood.github.io/ruleta-rutas-cantabria-peques/'
const shareUrl = r => `${SITE_URL}#ruta=${slugify(r.name)}`

function StatChips({ r }) {
  const cat = categoryOf(r)
  const chip = "rounded-full bg-moss/10 border border-moss/25 px-3 py-1 text-sm font-semibold text-forest"
  return (
    <div className="flex flex-wrap gap-2">
      <span className={chip + " capitalize"}>{cat.icon} {cat.key}</span>
      <span className={chip}>📏 {r.km} km</span>
      <span className={chip}>⛰️ {r.desnivel} m</span>
      <span className={chip}>{r.tipo === 'Circular' ? '🔄' : '↔️'} {r.tipo}</span>
      {isAccessible(r) && <span className="rounded-full bg-mostaza/25 border border-mostaza/50 px-3 py-1 text-sm font-semibold text-forest">👶 Apto carrito</span>}
    </div>
  )
}

function Actions({ r, center, compact }) {
  const [copied, setCopied] = useState(false)
  const waText = `🥾 Plan en Cantabria: ${r.name}. ¡Mira esta ruta para peques!`
  const waHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText + ' ' + shareUrl(r))}`
  function copy() {
    navigator.clipboard?.writeText(shareUrl(r)).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }
  const base = "inline-flex items-center justify-center rounded-full border border-forest/15 bg-paper text-sm font-bold text-forest shadow-sm transition hover:border-forest/30 hover:-translate-y-0.5"
  const btn = base + " gap-2 px-4 py-2.5"
  const iconBtn = base + " h-10 w-10"
  const ico = "h-[18px] w-[18px]"
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <a href={mapsDirectionsUrl(r)} target="_blank" rel="noopener" className={iconBtn} title="Cómo llegar en coche" aria-label="Cómo llegar en coche">
          <img src={mapsLogo} alt="" className={ico} />
        </a>
        <a href={wikilocUrl(r)} target="_blank" rel="noopener" className={iconBtn} title="Ver track en Wikiloc" aria-label="Ver track en Wikiloc">
          <img src={wikilocLogo} alt="" className={ico} />
        </a>
        <a href={waHref} target="_blank" rel="noopener" className={iconBtn} title="Compartir por WhatsApp" aria-label="Compartir por WhatsApp">
          <img src={waLogo} alt="" className={ico} />
        </a>
        <button onClick={copy} className={iconBtn} title={copied ? '¡Copiado!' : 'Copiar enlace'} aria-label="Copiar enlace">
          {copied ? '✓' : '🔗'}
        </button>
      </div>
    )
  }
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${center ? 'justify-center' : ''}`}>
      <a href={mapsDirectionsUrl(r)} target="_blank" rel="noopener" className={btn}>
        <img src={mapsLogo} alt="" className={ico} /> Cómo llegar
      </a>
      <a href={wikilocUrl(r)} target="_blank" rel="noopener" className={btn}>
        <img src={wikilocLogo} alt="" className={ico} /> Wikiloc
      </a>
      <a href={waHref} target="_blank" rel="noopener" className={btn}>
        <img src={waLogo} alt="" className={ico} /> WhatsApp
      </a>
      <button onClick={copy} className={btn}>
        {copied ? '✓ ¡Copiado!' : '🔗 Copiar enlace'}
      </button>
    </div>
  )
}

function ResultCard({ r, onAgain }) {
  return (
    <div className="animate-fade-up mx-auto mt-7 w-full max-w-2xl rounded-3xl border border-forest/10 bg-paper p-7 text-center shadow-xl shadow-forest/5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracota">Vuestra ruta de hoy</p>
      <h2 className="mt-1.5 font-display text-3xl font-semibold leading-tight text-forest-deep sm:text-4xl">{r.name}</h2>
      <p className="mt-3 text-sm font-semibold text-salvia">📍 {r.zona} · {r.comarca}</p>
      <div className="mt-3.5 flex justify-center"><StatChips r={r} /></div>
      <p className="mt-3 text-forest/80 leading-relaxed">{r.resumen}</p>
      <div className="mt-5"><Actions r={r} center /></div>
      <button onClick={onAgain} className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-4 py-2 text-sm font-semibold text-forest/70 transition hover:bg-forest/5">
        🎡 Girar otra vez
      </button>
    </div>
  )
}

function RouteCard({ r }) {
  const cat = categoryOf(r)
  return (
    <li className="flex flex-col rounded-2xl border border-forest/10 bg-paper p-5 shadow-sm transition hover:border-terracota/40 hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-moss/10 px-2.5 py-0.5 text-xs font-semibold text-moss">{r.comarca}</span>
        <span className="rounded-full bg-forest/5 px-2.5 py-0.5 text-xs font-semibold text-forest capitalize">{cat.icon} {cat.key}</span>
        {isAccessible(r) && <span className="rounded-full bg-mostaza/25 px-2.5 py-0.5 text-xs font-semibold text-forest">👶 carrito</span>}
      </div>
      <h3 className="font-display text-lg font-semibold text-forest-deep">{r.name}</h3>
      <p className="mt-0.5 text-sm text-salvia">{r.zona}</p>
      <p className="mt-2.5 flex-1 text-sm text-forest/75 leading-relaxed">{r.resumen}</p>
      <div className="mt-3.5"><StatChips r={r} /></div>
      <div className="mt-4"><Actions r={r} compact /></div>
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

  useEffect(() => {
    const m = window.location.hash.match(/ruta=([\w-]+)/)
    if (m) {
      const r = routeBySlug(m[1])
      if (r) setResult(r)
    }
  }, [])

  useEffect(() => {
    if (!result) return
    history.replaceState(null, '', `#ruta=${slugify(result.name)}`)
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.35 }, colors: ['#c46a3f', '#d9a441', '#2e6b4f', '#1f3d2e'] })
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

  const selectCls = "rounded-xl border border-forest/15 bg-paper px-3 py-2.5 text-sm text-forest outline-none focus:border-terracota [&>option]:bg-paper [&>option]:text-forest"

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pb-16">
      {/* HERO */}
      <header className="relative -mx-4 w-screen overflow-hidden px-4 pb-28 pt-12 text-center">
        <div className="mountains pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative z-10">
          <p className="mb-2.5 text-sm font-semibold uppercase tracking-[0.28em] text-terracota">Cantabria con peques</p>
          <h1 className="mx-auto max-w-[16ch] font-display text-4xl font-semibold leading-[1.05] text-forest-deep sm:text-5xl md:text-6xl">
            Ruleta de <span className="italic text-terracota">rutas</span> de senderismo
          </h1>
          <p className="mx-auto mt-3.5 max-w-[46ch] text-base text-forest/75 leading-relaxed sm:text-lg">
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
            : <p className="mx-auto mt-7 max-w-md text-center text-forest/60">Pulsa <b className="text-terracota">GIRAR</b> y deja que la suerte elija vuestra excursión. 🎡</p>}
        </div>
      </section>

      {/* EXPLORAR */}
      <section className="mt-16 w-full max-w-6xl">
        <h2 className="font-display text-2xl font-semibold text-forest-deep">Explorar todas las rutas</h2>
        <p className="mt-1.5 max-w-3xl text-sm text-forest/55">
          📏 Distancia, ⛰️ desnivel y tipo son orientativos. El dato exacto, el track GPS, fotos y reseñas están en el enlace de Wikiloc de cada ruta.
        </p>

        {/* Chips de comarca */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => setComarca('')}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${comarca === '' ? 'bg-terracota text-cream' : 'bg-forest/5 text-forest hover:bg-forest/10'}`}>
            Todas
          </button>
          {comarcas.map(c => (
            <button key={c} onClick={() => setComarca(c === comarca ? '' : c)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${comarca === c ? 'bg-terracota text-cream' : 'bg-forest/5 text-forest hover:bg-forest/10'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="🔎 Buscar ruta o lugar…"
            className="min-w-[180px] flex-1 rounded-xl border border-forest/15 bg-paper px-3.5 py-2.5 text-sm text-forest outline-none placeholder:text-forest/40 focus:border-terracota" />
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
            className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${soloCarrito ? 'bg-terracota text-cream' : 'border border-forest/15 bg-paper text-forest hover:bg-forest/5'}`}>
            👶 Apto carrito
          </button>
          <button onClick={() => { setQ(''); setComarca(''); setTipo(''); setDist(''); setDesn(''); setSoloCarrito(false) }}
            className="rounded-xl border border-forest/15 bg-paper px-3.5 py-2.5 text-sm font-semibold text-forest transition hover:bg-forest/5">
            Limpiar
          </button>
        </div>

        <p className="mt-3 text-sm text-forest/60">{filtered.length} de {routes.length} rutas</p>

        {filtered.length === 0
          ? <p className="mt-6 italic text-forest/60">No hay rutas con esos filtros. Prueba a aflojarlos.</p>
          : <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(r => <RouteCard key={r.name} r={r} />)}
            </ul>}
      </section>

      {/* MAPA */}
      <section className="mt-16 w-full max-w-6xl">
        <h2 className="font-display text-2xl font-semibold text-forest-deep">Mapa de rutas</h2>
        <p className="mt-1.5 mb-4 max-w-3xl text-sm text-forest/55">
          Ubicación aproximada por municipio. Pulsa un punto para ver la ruta y abrir Maps o Wikiloc.
        </p>
        <RouteMap routes={filtered} onPick={setResult} />
      </section>

      {/* FOOTER */}
      <footer className="mt-16 max-w-xl text-center text-sm leading-relaxed text-salvia">
        Hecho con 🌲 para disfrutar Cantabria con peques.<br />
        Distancias y desniveles orientativos · tracks reales en Wikiloc.
        <br />
        <a href={SITE_URL} className="font-semibold text-terracota">{SITE_URL.replace('https://', '')}</a>
      </footer>
    </div>
  )
}
