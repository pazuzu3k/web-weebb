# montaje

doble mundo: preview (cáscara TanStack) y publicación vanilla (GitHub Pages).

al publicar:
- copiar `public/sitio/index.html` a la raíz como `index.html`
- no bundlear `territorio.js` con vite; vive en `public/`
- mantener `src/territorio/territorio.js` y `public/territorio.js` iguales
- igual `presence.js`

cotas:
- `public/cotas.json` es la fuente. hoy las reservadas tienen `abreEstado: encendido`.
- un cuarto vacío se ocupa sin renumerar.
- para Pages, `public/cota/N/index.html` se genera desde la plantilla `public/cota/index.html`.

huecos marcados `<!-- MONTAJE: ... -->`. no completarlos desde el código.

config: `public/smioochy.config.js` — supabase vacío.
