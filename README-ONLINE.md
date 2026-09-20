# Cómo poner smioochy.click en línea

El servidor es **Vercel**. Ahí corre la web y el diario del peldaño 55 para todo el mundo.

GitHub guarda el código. Vercel es la máquina que lo sirve. GitHub Pages no sirve para el diario: no puede guardar entradas ni fotos para los demás.

---

## 1. Cuenta en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new)
2. **Continue with GitHub** (la cuenta pazuzu3k)
3. Si pide permiso para repos privados, dale permiso
4. Importá **web-weebb**
5. No cambies nada del build. **Deploy**

Cuando termine, vas a tener una URL tipo `web-weebb.vercel.app`. Eso ya es la web en el mundo.

---

## 2. Base de datos (el diario)

Sin esto el 55 no guarda para los demás.

1. En el proyecto de Vercel: **Storage** → **Create Database** → **Neon Postgres**
2. Conectala a este proyecto (eso crea `DATABASE_URL`)
3. **Deployments** → los tres puntitos del último → **Redeploy**

Si no aparece Storage: [console.neon.tech](https://console.neon.tech) → Create project → copiá la connection string → en Vercel **Settings → Environment Variables** → `DATABASE_URL` → Redeploy.

---

## 3. El dominio smioochy.click

1. En Vercel: **Settings → Domains** → add `smioochy.click`
2. Agregá también `www.smioochy.click` si te lo ofrece
3. Vercel te va a mostrar los DNS exactos. En el lugar donde compraste el dominio, poné eso.

Casi siempre es:

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | `10.0.1.2` (o el IP que te muestre Vercel) |
| CNAME | `www` | el valor CNAME que te muestre Vercel |

Si ya habías puesto los DNS de GitHub Pages, **borralos** y dejá solo estos.

El HTTPS lo arma Vercel solo. Puede tardar unos minutos.

---

## Después

Cada vez que se sube algo a `main` en GitHub, Vercel actualiza la web sola.
