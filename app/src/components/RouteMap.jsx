import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { coordsOf, categoryOf, mapsDirectionsUrl, wikilocUrl } from '../data.js'

export default function RouteMap({ routes, onPick }) {
  const elRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current || !elRef.current) return
    const map = L.map(elRef.current, { scrollWheelZoom: false }).setView([43.25, -4.0], 9)
    mapRef.current = map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18,
    }).addTo(map)

    // Pequeño desplazamiento para municipios con varias rutas (evita solapado total)
    const seen = {}
    routes.forEach(r => {
      const base = coordsOf(r)
      const k = base.join()
      const i = seen[k] = (seen[k] || 0)
      seen[k]++
      const jitter = i === 0 ? [0, 0] : [(Math.cos(i) * 0.012), (Math.sin(i) * 0.012)]
      const lat = base[0] + jitter[0]
      const lng = base[1] + jitter[1]
      const cat = categoryOf(r)
      const marker = L.circleMarker([lat, lng], {
        radius: 7, color: '#0c3024', weight: 2, fillColor: '#e7b85f', fillOpacity: 1,
      }).addTo(map)
      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;min-width:170px">
           <strong style="font-size:14px">${cat.icon} ${r.name}</strong><br>
           <span style="color:#555">${r.zona} · ${r.km} km · ${r.desnivel} m</span><br>
           <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
             <a href="${mapsDirectionsUrl(r)}" target="_blank" rel="noopener" style="color:#0c7a4a;font-weight:600">🚗 Llegar</a>
             <a href="${wikilocUrl(r)}" target="_blank" rel="noopener" style="color:#ff6a00;font-weight:600">📍 Wikiloc</a>
           </div>
         </div>`
      )
      if (onPick) marker.on('click', () => onPick(r))
    })

    setTimeout(() => map.invalidateSize(), 150)

    return () => { map.remove(); mapRef.current = null }
  }, [routes, onPick])

  return (
    <div
      ref={elRef}
      className="h-[420px] w-full overflow-hidden rounded-2xl border border-white/10"
      style={{ background: '#0c3024' }}
    />
  )
}
