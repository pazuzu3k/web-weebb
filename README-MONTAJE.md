# Cómo llenar el sitio (paso a paso, para quien nunca tocó código)

No hay que programar. Solo abrís archivos, pegás texto y arrastrás fotos.

Hay **un archivo de control** y **una carpeta para las fotos/PDFs**.

---

## 1. Dónde está todo

En GitHub: [pazuzu3k/web-weebb](https://github.com/pazuzu3k/web-weebb)

Entrás al repo → carpeta `public` → carpeta `montaje`.

Ahí hay dos cosas:

1. **`contenidos.json`** — acá escribís el texto y decís qué fotos van
2. **`archivos/`** — acá subís las fotos y los PDF

Nada más.

---

## 2. Cómo se sube un archivo (foto o PDF)

1. Entrá a `public/montaje/archivos/`
2. Arriba a la derecha: **Add file** → **Upload files**
3. Arrastrá la foto o el PDF
4. Abajo: **Commit changes** (el botón verde)
5. Anotá el nombre exacto del archivo, con todo y extensión.  
   Ejemplo: `foto-gato.jpg` o `nota.pdf`

Ese nombre se usa después en el json.

La ruta que vas a copiar es siempre:

```
/montaje/archivos/NOMBRE-DEL-ARCHIVO
```

Ejemplo: si subiste `foto-gato.jpg`, la ruta es `/montaje/archivos/foto-gato.jpg`

---

## 3. Cómo se edita el texto (el json)

1. Entrá a `public/montaje/contenidos.json`
2. Arriba a la derecha: el lápiz (**Edit**)
3. Cambiá solo lo que está entre comillas
4. **Commit changes**

### Cómo se ve un hueco vacío

```json
"a": {
  "texto": "",
  "imagenes": [],
  "pdfs": []
}
```

### Cómo se ve lleno

```json
"a": {
  "texto": "<p>acá va tu texto</p>",
  "imagenes": ["/montaje/archivos/foto-gato.jpg"],
  "pdfs": ["/montaje/archivos/nota.pdf"]
}
```

Reglas tontas pero importantes:

- el texto va **entre comillas**
- si querés un párrafo: `"<p>hola</p>"`
- si querés dos párrafos: `"<p>uno</p><p>dos</p>"`
- cada foto va entre comillas, y si hay más de una, se separan con coma:
  `["/montaje/archivos/1.jpg", "/montaje/archivos/2.jpg"]`
- si no hay fotos, dejá `[]`
- no borres las comas que ya están entre un bloque y otro
- no borres las llaves `{ }`

Si el sitio se rompe después de editar, casi siempre falta una coma o una comilla. Deshacé el último commit o copiá de nuevo un hueco vacío y rellenalo despacio.

---

## 4. Qué llave editar (el mapa de huecos)

### Home — las 5 tipografías

| qué ves en home | letra | qué pasa al hacer clic | dónde se llena |
|---|---|---|---|
| Newsreader | **a** | abre una **página** nueva | `letras.a` |
| Special Elite | **b** | abre una **ventana flotante** (pop-up) | `ventanas.b` |
| Space Mono | **c** | abre una **página** nueva | `letras.c` |
| EB Garamond | **d** | abre una **página** nueva | `letras.d` |
| Techno | **e** | abre una **ventana flotante** (pop-up) | `ventanas.e` |

Buscá en el json estas palabras, sin tocar las demás:

- `"letras"` → adentro `"a"`, `"c"`, `"d"`
- `"ventanas"` → adentro `"b"`, `"e"`

**Pop-ups (b y e):** mientras `texto`, `imagenes` y `pdfs` estén vacíos, la ventana sigue mostrando lo que ya tenía. En cuanto pongas algo en `texto` o una foto, **eso reemplaza** el contenido de la ventana.

Ejemplo pop-up de Special Elite (b):

```json
"ventanas": {
  "b": {
    "texto": "<p>lo que quieras que se lea en la ventana</p>",
    "imagenes": ["/montaje/archivos/ventana-b.jpg"],
    "pdfs": []
  },
  "e": {
    "texto": "",
    "imagenes": [],
    "pdfs": []
  }
}
```

### Cotas (el mapa del dinosaurio)

Al hacer clic en un número del mapa se abre `/cota/N/`.

En el json, sección `"cotas"`. La clave es el número entre comillas.

Cota 7:

```json
"7": {
  "texto": "<p>nota de la cota 7</p>",
  "imagenes": ["/montaje/archivos/7.jpg"],
  "pdfs": []
}
```

Hay huecos del **1 al 53**.  
La **54 no se llena acá**: esa abre la escalera.

### Peldaños (la escalera)

Al hacer clic en un peldaño se abre `/peldano/N/`.

En el json, sección `"peldanos"`.

Peldaño 3:

```json
"3": {
  "texto": "<p>nota del peldaño 3</p>",
  "imagenes": [],
  "pdfs": ["/montaje/archivos/p3.pdf"]
}
```

Hay huecos del **1 al 100**, menos el 54 y el 101.

- peldaño **54**: no se llena. Al clic aparece `@s1ento54_`. Otro clic a eso abre Instagram.
- peldaño **101**: no se llena. Al clic aparece una *i*. Clic a la *i* vuelve al mapa.

---

## 5. Receta completa de una foto, del principio al fin

Querés una foto en la cota 12.

1. Subí `playa.jpg` a `public/montaje/archivos/`
2. Abrí `contenidos.json`
3. Buscá (Ctrl+F / Cmd+F) esto: `"12":`
4. Dejá así:

```json
"12": {
  "texto": "<p>playa</p>",
  "imagenes": ["/montaje/archivos/playa.jpg"],
  "pdfs": []
}
```

5. Commit changes
6. Recargá `/cota/12/` en el sitio

Listo.

---

## 6. Lo que NO hay que tocar

- no cambies los nombres de las claves (`a`, `b`, `7`, `ventanas`, etc.)
- no edites `territorio.js` ni `territorio.css` para llenar contenido
- no pongas la foto adentro del json (el json solo **nombra** el archivo)
- no uses espacios raros en el nombre del archivo: mejor `foto-12.jpg` que `Foto 12 FINAL.JPG`

---

## 7. Si algo no aparece

1. ¿El nombre en el json es **idéntico** al del archivo, mayúsculas incluidas?
2. ¿La ruta empieza con `/montaje/archivos/`?
3. ¿Hiciste commit?
4. ¿Estás mirando la página correcta? (`/letra/a/`, `/cota/7/`, `/peldano/3/`, o el pop-up b/e en home)
