# GEDIM — Landing Page

Sitio web principal de **GEDIM Colombia** (`gedimcolombia.co`), empresa de sistemas de seguridad integrada B2B con 21 años de trayectoria en Bogotá.

---

## Stack

- HTML + CSS + JavaScript vanilla (sin frameworks, sin build step)
- Fuente: **Poppins** (Google Fonts)
- Animaciones: GSAP 3.12.5 + ScrollTrigger (CDN cdnjs)
- Robot 3D en header: Spline viewer (`@splinetool/viewer@1.9.82`)
- Formulario de contacto: **Web3Forms** (API key en el `<input name="access_key">`)
- Sitio 100% estático

## Estructura de archivos

```
gedim-landpage/
├── index.html              ← página principal
├── styles.css              ← todos los estilos (variables CSS, responsive)
├── main.js                 ← toda la lógica JS
├── favicon.ico             ← favicon generado desde logo GEDIM (G metálica)
├── sitemap.xml             ← sitemap para Google Search Console
├── robots.txt              ← directivas para crawlers
├── .htaccess               ← cache headers para Apache
├── tratamiento-datos.html  ← política de datos (Ley 1581 Colombia)
├── garantia.html           ← términos de garantía
├── assets/
│   └── img/
│       ├── gedim-logo.jpg
│       ├── Honeywell-Logo.png
│       ├── kidde-logo-vector-2022.png
│       ├── 3m-logo.png
│       ├── cam01.jpg … cam04.jpg
│       └── og-image.jpg        ← ⚠ PENDIENTE: imagen 1200×630px para redes sociales
└── .github/
    └── workflows/
        └── deploy.yml      ← CI/CD: push a master → deploy automático vía FTP
```

## Secciones de la página

| ID / ancla | Sección |
|---|---|
| `#hero` | Hero — cámara PTZ, canvas partículas, feeds CCTV |
| `#servicio-incendio` | Detección y extinción de incendio (NFPA) |
| `#servicio-acceso` | Control de acceso biométrico |
| `#servicio-cctv` | Videovigilancia |
| `#servicio-integracion` | Integración total de sistemas |
| `#nosotros` | Trayectoria — 21 años, métricas, marcas certificadas |
| `#contacto` | Formulario de contacto + datos + WhatsApp |

## Efectos interactivos (main.js)

- **Cámara PTZ SVG** — sigue el cursor con lerp (atan2 + `requestAnimationFrame`)
- **Robot Spline** — gimbal wrapper que rota hacia el cursor
- **Canvas sprinklers** — partículas de agua al activar válvulas del header
- **Red de integración** — 6 pulsos animados (np0–np5) a velocidades distintas
- **Banner de alarma** — se activa por ciclo de fuego, countdown de 10s
- **Timestamps CCTV** — hora real en feeds de cámaras
- **Contadores animados** — métricas en la sección de trayectoria
- **Reveals** — IntersectionObserver para animar elementos al hacer scroll
- **Año en footer** — `new Date().getFullYear()` (se actualiza solo)

---

## Deploy automático (GitHub Actions → FTP)

Cada `git push` a `master` despliega automáticamente a `gedimcolombia.co` en ~20 segundos.

**Pipeline:** `git push` → GitHub Actions → FTP → raíz de `public_html/` en colombiahosting

### Credenciales (guardadas como GitHub Secrets)

| Secret | Valor |
|---|---|
| `FTP_SERVER` | `ftp.gedimcolombia.co` |
| `FTP_USERNAME` | `github-deploy@gedimcolombia.co` |
| `FTP_PASSWORD` | (encriptado en GitHub) |

Los secrets están en: `github.com/pinillaernesto/gedim-landpage → Settings → Secrets and variables → Actions`

### ⚠ Nota importante sobre server-dir

El FTP de `github-deploy@gedimcolombia.co` tiene su raíz ya en `public_html/`.
Por eso el `deploy.yml` usa `server-dir: ./` — **NO cambiar a `/public_html/`** (eso subiría a un subdirectorio equivocado).

### Cómo actualizar la página

```bash
# 1. Editar archivos localmente
# 2. Si cambias CSS o JS, actualizar el cache-buster en index.html:
#    styles.css?v=YYYYMMDD  y  main.js?v=YYYYMMDD

# 3. Commit y push
git add .
git commit -m "descripción del cambio"
git push origin master

# El deploy tarda ~20 segundos.
# Verificar en: github.com/pinillaernesto/gedim-landpage → Actions
```

### Verificar el deploy

- Ve a la pestaña **Actions** en GitHub
- El workflow "Deploy to gedimcolombia.co" debe mostrar ✅ verde
- Si sale ❌ roja, revisar logs del job para ver el error FTP

---

## SEO implementado

- **Meta tags**: title, description, keywords, canonical, robots, author (`lang="es-CO"`)
- **Open Graph**: og:title, og:description, og:url, og:image, og:locale (es_CO)
- **Twitter Card**: summary_large_image
- **Schema.org JSON-LD**: `LocalBusiness + ProfessionalService`
  - Dirección: Calle 95 # 48-22 Of 201, La Castellana, Bogotá
  - Teléfono: +57 300 227 8719
  - 4 servicios con descripciones keyword-rich
  - Marcas: Kidde, Honeywell, 3M, Notifier, Gamewell-FCI
- **sitemap.xml**: 3 URLs (index, garantia, tratamiento-datos)
- **robots.txt**: Allow all + Sitemap pointer

### Pasos pendientes de SEO (hacer manualmente)

1. **Crear og-image.jpg** — imagen 1200×630px con logo/visual de GEDIM → subir a `assets/img/og-image.jpg`
2. **Google Search Console** — registrar `gedimcolombia.co` y enviar sitemap: `https://gedimcolombia.co/sitemap.xml`
3. **Google Business Profile** — crear/reclamar perfil en `business.google.com` con la misma dirección (esto activa aparición en Google Maps)

---

## Hosting

- **Proveedor:** colombiahosting
- **cPanel:** usuario `gedimc`
- **Directorio raíz:** `/home/gedimc/public_html/`
- **Dominio registrado en:** GoDaddy (apunta a colombiahosting vía nameservers)

---

## Notas para sesiones de IA

- El archivo de estilos usa **variables CSS** en `:root` — editar colores/tamaños siempre por ahí.
- El **cache-buster** en `index.html` (`?v=YYYYMMDD`) debe actualizarse con cada cambio a CSS o JS.
- La carpeta `sitepro/` en `public_html` es el sitio anterior — no tocar.
- El formulario `#contactForm` está conectado a **Web3Forms** (access_key en el HTML). Respuestas llegan al email registrado en Web3Forms.
- El botón flotante de **WhatsApp** está en la clase `.wa-float` (HTML al final del body, estilos al final de styles.css). Número: +57 300 227 8719.
- Para agregar una sección: HTML en `index.html` + estilos en `styles.css` + si necesita link desde header, agregar `<li>` en `.header-services` Y en el nav mobile.
- El `server-dir` del deploy.yml **debe ser `./`** — el FTP de github-deploy ya tiene public_html como raíz.
