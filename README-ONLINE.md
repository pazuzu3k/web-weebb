# Guía para dejar smioochy.click en línea

Partís de acá:

- el dominio es tuyo en Porkbun
- ya verificaste el dominio en GitHub
- la repo [pazuzu3k/web-weebb](https://github.com/pazuzu3k/web-weebb) es pública
- GitHub Pages está activado

Eso **no** pone la web en smioochy.click todavía. Faltan tres cosas: **Vercel** (el servidor), **Neon** (el diario) y **Porkbun** (el DNS).

Hay tres pestañas. Cada una hace una sola cosa:

| Dónde | Para qué | No sirve para |
|---|---|---|
| GitHub | guardar el código | mostrar la web al mundo con el diario |
| Vercel | servir la web y el diario | comprar el dominio |
| Porkbun | apuntar smioochy.click al servidor | hospedar la web |

GitHub Pages **no** es el servidor final. Si ponés el dominio ahí, el diario del 55 no lo ve el mundo. No toques Custom domain en Pages.

---

## A. GitHub — no hagas más nada acá

No agregues `smioochy.click` en:

`web-weebb` → Settings → Pages → Custom domain

Dejá Pages como está. No lo apagues, no lo configures. El código ya está en `main`. Listo.

---

## B. Vercel — crear la web en el mundo

### B1. Cuenta e importar el repo

1. Abrí una pestaña nueva: [vercel.com/new](https://vercel.com/new)
2. Tocá **Continue with GitHub**
3. Entrá con **pazuzu3k** (la misma cuenta de la repo)
4. Si GitHub pregunta si Vercel puede ver tus repos, tocá **Authorize** / **Grant**
5. En la lista, buscá **web-weebb**
6. Tocá **Import** al lado de web-weebb

Si no aparece: **Adjust GitHub App Permissions** (o **Configure**) → dale acceso a **web-weebb** o a All repositories → volvé a [vercel.com/new](https://vercel.com/new)

### B2. Deploy (no toques nada)

En la pantalla de import:

- Project Name: dejalo
- Framework Preset: dejalo
- Root Directory: dejalo vacío / `.`
- Build Command: dejalo
- **no** agregues variables todavía

Tocá el botón **Deploy**.

Esperá. Van a pasar unos minutos. Cuando diga **Ready** / **Congratulations**, copiá la URL que termina en `.vercel.app`.

Abrila. Tenés que ver smioochy, igual que acá.  
Ejemplo: `https://web-weebb.vercel.app`

Si esa URL se ve bien, Vercel ya está sirviendo la web. El dominio propio viene después.

---

## C. Neon — para que el diario lo vea el mundo

Sin esto, el peldaño 55 se ve, pero las entradas no se guardan para los demás.

### C1. Camino fácil (adentro de Vercel)

1. En Vercel, arriba: el proyecto **web-weebb**
2. Pestaña **Storage**
3. **Create Database**
4. Elegí **Neon Postgres** (el plan Hobby / Free)
5. Create / Continue
6. Cuando pregunte a qué proyecto conectarla, elegí **web-weebb**
7. Confirmá. Eso crea sola la variable `DATABASE_URL`

### C2. Si no aparece Storage

1. Abrí [console.neon.tech](https://console.neon.tech)
2. Entrá con GitHub (pazuzu3k)
3. **Create project**
4. Nombre: `smioochy` (o el que quieras)
5. Region: dejá la que venga
6. Create
7. En el dashboard, copiá **Connection string** (URI). Empieza con `postgresql://` o `postgres://`
8. Volvé a Vercel → proyecto **web-weebb** → **Settings** → **Environment Variables**
9. Key: `DATABASE_URL`
10. Value: pegá la connection string
11. Environments: tildá Production, Preview y Development
12. **Save**

### C3. Redeploy (obligatorio)

La base no entra en el deploy viejo. Hay que tirar uno nuevo.

1. Vercel → **Deployments**
2. El de arriba (el último)
3. Los tres puntitos a la derecha
4. **Redeploy**
5. Confirmá
6. Esperá a que diga Ready

Probá: `https://TU-URL.vercel.app/peldano/55/`  
Escribí una entrada, recargá. Si sigue ahí, el diario ya está en el servidor.

---

## D. Vercel — cargar el dominio

1. Vercel → **web-weebb** → **Settings** → **Domains**
2. En el recuadro escribí exactamente: `smioochy.click`
3. **Add**
4. Si ofrece también `www.smioochy.click`, **Add**
5. Vercel te muestra una tarjeta con los DNS. **Dejá esa pestaña abierta.** Ahí están los valores verdaderos.

Casi siempre es:

- Tipo **A**, nombre **@**, valor **10.0.1.2**
- Tipo **CNAME**, nombre **www**, valor algo como `cname.vercel-dns.com` o un código largo `.vercel-dns-017.com`

Si la tarjeta muestra otro IP, usá **ese**, no el de esta guía.

---

## E. Porkbun — apuntar el dominio a Vercel

1. Entrá a [porkbun.com](https://porkbun.com) y logueate
2. **Domain Management**
3. Al lado de **smioochy.click** tocá **DNS** (o el ícono de la lista de registros)
4. Si ves un recuadro de búsqueda arriba, **borralo**. Eso filtra, no crea.

### E1. Borrar lo que estorba

Por cada registro de esta lista, tocá el tacho / Delete:

| Tipo | Host | Valor que vas a ver | ¿Borrar? |
|---|---|---|---|
| A | `@` o en blanco o `smioochy.click` | `207.207.210.229` o `207.207.210.107` | SÍ (parking de Porkbun) |
| A | `@` | `185.199.108.153` y los otros `185.199…` | SÍ (GitHub Pages; no los uses) |
| CNAME | `www` | `pixie.porkbun.com` | SÍ |
| TXT | `_github-pages-challenge-pazuzu3k` | un código | **NO. Dejalo.** |

Si hay un ALIAS o CNAME en `@` al parking, también borralo.

### E2. Crear los de Vercel

Tocá **+ Add record**. No uses la caja de buscar.

**Registro 1 — la web en smioochy.click**

| Campo | Qué poner |
|---|---|
| Type | `A` |
| Name / Host | `@` (si no acepta @, dejalo **vacío**) |
| Answer / Value / Content | el IP de la tarjeta de Vercel, casi siempre `10.0.1.2` |
| TTL | 600 o el default |

Save / Add.

**Registro 2 — www**

**+ Add record** otra vez:

| Campo | Qué poner |
|---|---|
| Type | `CNAME` |
| Name / Host | `www` |
| Answer / Value / Content | el CNAME de la tarjeta de Vercel (termina en `vercel-dns.com` o parecido) |
| TTL | 600 o el default |

Save / Add.

**Name corto.** No escribas `www.smioochy.click` ni `@.smioochy.click`. Porkbun agrega el dominio solo. Si lo pegas entero, queda `www.smioochy.click.smioochy.click` y no anda.

### E3. Cómo tiene que quedar

| Tipo | Host | Valor |
|---|---|---|
| A | `@` | `10.0.1.2` (o el de Vercel) |
| CNAME | `www` | el de Vercel |
| TXT | `_github-pages-challenge-pazuzu3k` | el de GitHub (ya está) |

Nada de `pixie.porkbun.com`. Nada de `185.199…`. Nada de `207.207…`.

---

## F. Comprobar que está en el aire

Esperá 2 a 10 minutos (a veces más).

1. En Vercel → Settings → Domains, `smioochy.click` tiene que pasar a **Valid**
2. Abrí [https://smioochy.click](https://smioochy.click) — la home
3. [https://smioochy.click/cotas/](https://smioochy.click/cotas/) — el mapa
4. [https://smioochy.click/peldano/55/](https://smioochy.click/peldano/55/) — el diario: escribí, recargá, tiene que seguir

El candado HTTPS lo pone Vercel solo. No hay que comprar certificado.

Si el navegador dice “no seguro” o “no se puede acceder”, esperá y recargá con Ctrl+Shift+R. El DNS tarda.

---

## G. De ahora en más

Cada vez que se sube algo a `main` en GitHub, Vercel actualiza smioochy.click sola. No hay que volver a Porkbun.

GitHub Pages puede seguir existiendo. No lo uses. No le pongas el dominio.

---

## Si algo falla

**No aparece web-weebb en Vercel**  
Authorize GitHub App → acceso al repo → recargá vercel.com/new

**Deploy en rojo**  
Mandame el log (Deployments → el rojo → Building). No toques el build.

**El .vercel.app anda, smioochy.click no**  
DNS: faltó borrar el parking, o el A no es el de Vercel, o el Name tiene `.smioochy.click` de más.

**El 55 no guarda**  
Falta Neon o falta Redeploy después de `DATABASE_URL`.

**GitHub dice domain already taken**  
Ignoralo. El dominio se carga en Vercel, no en Pages.
