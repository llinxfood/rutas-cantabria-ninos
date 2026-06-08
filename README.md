# 🥾 Ruleta de Rutas de Cantabria (en familia)

Una **ruleta interactiva** para elegir al azar tu próxima excursión por Cantabria: **74 senderos fáciles y aptos para ir con peques**. Giras la rueda, te toca una ruta y te da los datos clave, **cómo llegar en coche** y el **track GPS en Wikiloc**.

🌐 **En vivo:** https://llinxfood.github.io/ruleta-rutas-cantabria-peques/

## ✨ Características

- 🎡 Ruleta animada que elige una de las 74 rutas
- 📏 Datos orientativos de cada ruta: distancia, desnivel y tipo (circular / lineal)
- 🚗 Botón **Cómo llegar en coche** (Google Maps con indicaciones)
- 📍 Botón **Track en Wikiloc** (enlace directo al recorrido GPS, fotos y reseñas)
- 🔎 Explorador de rutas con **filtros**: buscador, comarca, distancia y desnivel
- 📱 Diseño responsive, pensado también para el móvil

## 🛠️ Tecnología

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- Publicado en **GitHub Pages** (los archivos compilados se sirven desde la raíz)

## 🚀 Desarrollo

El código fuente está en `app/`:

```bash
cd app
npm install
npm run dev        # servidor de desarrollo
npm run build      # genera app/dist/
```

Para publicar, se copia el contenido de `app/dist/` (`index.html` + `assets/`) a la raíz del repositorio y se hace push a `master`.

## 📒 Datos

Las rutas viven en [`app/src/data.js`](app/src/data.js). Distancia, desnivel y tipo son **orientativos**; el dato exacto y el track están en el enlace de Wikiloc de cada ruta.

---

Hecho con 🌲 para disfrutar Cantabria en familia.
