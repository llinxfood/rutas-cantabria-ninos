import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base relativo: el build funciona en cualquier subruta de GitHub Pages
// (no depende del nombre del repo, así que un rename no rompe nada).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Nombres con hash (cache-busting): cada cambio genera URL nueva,
    // así el navegador (también el móvil) nunca sirve una versión cacheada.
  },
})
