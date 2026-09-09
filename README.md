# GEDIM — Landing Page

Sitio web principal de **GEDIM Colombia** (`gedimcolombia.co`), empresa de sistemas de seguridad integrada.

---

## Stack

- HTML + CSS + JavaScript vanilla (sin frameworks)
- Fuente: DM Sans (Google Fonts)
- Animaciones: GSAP 3.12.5 + ScrollTrigger (CDN cdnjs)
- Robot 3D en header: Spline viewer (`@splinetool/viewer@1.9.82`)
- Sitio 100% estático — sin backend, sin build step

## Estructura de archivos

```
gedim-landpage/
├── index.html              ← página principal
├── styles.css              ← todos los estilos (variables CSS, responsive)
├── main.js                 ← toda la lógica JS
├── .htaccess               ← cache headers para Apache
├── tratamiento-datos.html  ← política de datos (Ley 1581 Colombia)
├── garantia.html           ← términos de garantía (pendiente rellenar)
├── assets/
│   └── img/
│       ├── gedim-logo.jpg
│       ├── cam01.jpg
│       ├── cam02.jpg
│       ├── cam03.jpg
│       └── cam04.jpg
└── .github/
    └── workflows/
        └── deploy.yml      ← CI/CD: push a master → deploy automático
```

## Secciones de la página

| ID / ancla | Sección |
|---|---|
| `#hero` | Hero — cámara PTZ, canvas partículas, feeds CCTV |
| `#servicio-incendio` | Detección y extinción de incendio |
| `#servicio-acceso` | Control de acceso biométrico |
| `#servicio-cctv` | Videovigilancia |
| `#servicio-integracion` | Integración total de sistemas |
| `#mantenimiento` | Mantenimiento preventivo |
| `#contacto` | Formulario de contacto + datos |

## Efectos interactivos (main.js)

- **Cámara PTZ SVG** — sigue el cursor con lerp (atan2 + `requestAnimationFrame`)
- **Robot Spline** — gimbal wrapper que rota hacia el cursor
- **Canvas sprinklers** — partículas de agua al activar válvulas del header
- **Red de integración** — 6 pulsos animados (np0–np5) a velocidades distintas
- **Banner de alarma** — se activa por ciclo de fuego, countdown de 10s
- **Timestamps CCTV** — hora real en feeds de cámaras
- **Contadores animados** — métricas en la sección de trayectoria
- **Reveals** — IntersectionObserver para animar elementos al hacer scroll

---

## Deploy automático (GitHub Actions → FTP)

Cada `git push` a `master` despliega automáticamente a `gedimcolombia.co`.

**Pipeline:** `git push` → GitHub Actions → FTP → `/public_html/` en colombiahosting

### Credenciales (guardadas como GitHub Secrets)

| Secret | Valor |
|---|---|
| `FTP_SERVER` | `ftp.gedimcolombia.co` |
| `FTP_USERNAME` | `github-deploy@gedimcolombia.co` |
| `FTP_PASSWORD` | (encriptado en GitHub) |

Los secrets están en: `github.com/pinillaernesto/gedim-landpage → Settings → Secrets and variables → Actions`

### Cómo actualizar la página

```bash
# 1. Editar los archivos localmente
# 2. Guardar con cache-buster actualizado en index.html:
#    styles.css?v=YYYYMMDD  y  main.js?v=YYYYMMDD

# 3. Commit y push
git add .
git commit -m "descripción del cambio"
git push origin master

# El deploy tarda ~10 segundos.
# Verificar en: github.com/pinillaernesto/gedim-landpage → Actions
```

### Verificar el deploy

- Ve a la pestaña **Actions** en GitHub
- El workflow "Deploy to gedimcolombia.co" debe mostrar ✅ verde
- Si sale ❌ roja, revisar logs del job para ver el error FTP

---

## Hosting

- **Proveedor:** colombiahosting
- **cPanel:** usuario `gedimc`
- **Directorio raíz:** `/home/gedimc/public_html/`
- **Dominio registrado en:** GoDaddy (apunta a colombiahosting)

---

## Pendientes

- [ ] **Formulario de contacto con backend** — actualmente no envía emails. Conectar a [Web3Forms](https://web3forms.com) (gratis) o similar: agregar `action` al `<form>` y una clave de acceso.
- [ ] **Texto de garantía** — completar `garantia.html` (hay un placeholder visible).
- [ ] **Favicon** — no tiene favicon definido aún.

---

## Notas para sesiones de IA

- El archivo de estilos usa **variables CSS** definidas en `:root` — siempre editar colores/tamaños por ahí.
- El cache-buster en `index.html` (`?v=YYYYMMDD`) debe actualizarse con cada cambio a CSS o JS para que el hosting no sirva versiones viejas.
- La carpeta `sitepro/` en `public_html` es el sitio anterior — no tocar.
- El formulario de contacto (`#contactForm` en `index.html`) está completo visualmente pero sin acción de envío.
- Para agregar una nueva sección: añadir el HTML en `index.html`, estilos en `styles.css`, y si necesita un link desde el header agregar un `<li>` en `.header-services`.
