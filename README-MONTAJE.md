# montaje

doble mundo: preview (cáscara TanStack) y publicación vanilla (GitHub Pages).

al publicar:
- copiar `public/index.html` a la raíz
- no bundlear `territorio.js` con vite; vive en `public/`
- mantener `src/territorio/territorio.js` y `public/territorio.js` iguales

## dónde se llenan las páginas «en proceso»

**un solo archivo de contenido:** [`public/montaje/contenidos.json`](public/montaje/contenidos.json)

cada hueco tiene esta forma:

```json
{
  "texto": "tu texto o html corto",
  "imagenes": ["/montaje/archivos/foto.jpg"],
  "pdfs": ["/montaje/archivos/nota.pdf"]
}
```

los archivos (jpg, png, pdf) se copian a `public/montaje/archivos/` y se listan por ruta en el json.

### tipografías a, c, d

| letrero | ruta de la página | clave en el json |
|---|---|---|
| a Newsreader | `/letra/a/` | `letras.a` |
| c Space Mono | `/letra/c/` | `letras.c` |
| d EB Garamond | `/letra/d/` | `letras.d` |

b (Special Elite) y e (Techno) siguen siendo ventanas flotantes en home. no pasan por este json.

### cotas 1–53

página: `/cota/N/`  
json: `cotas.N`  (ej. cota 7 → `cotas["7"]`)  
html estático: `public/cota/N/index.html`

la cota **54** no se llena aquí: abre la escalera.

### peldaños 1–100 (menos 54 y 101)

página: `/peldano/N/`  
json: `peldanos.N`  
html estático: `public/peldano/N/index.html`

- peldaño **54**: revela `@s1ento54_` → Instagram  
- peldaño **101**: revela *i* → vuelve a `/cotas/`

### ejemplo

editar `public/montaje/contenidos.json`:

```json
"cotas": {
  "7": {
    "texto": "<p>una nota</p>",
    "imagenes": ["/montaje/archivos/7.jpg"],
    "pdfs": []
  }
}
```

y dejar el archivo en `public/montaje/archivos/7.jpg`.
