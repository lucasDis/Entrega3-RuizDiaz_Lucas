# Background and Motivation

El sitio debe adoptar la estética del tema Business Growth X manteniendo los textos actuales, eliminar "LLAMAR HOY" del navbar y asegurar que todos los recursos/enlaces funcionen correctamente. Referencia visual: [Business Growth X](https://wp-themes.com/business-growth-x).

Nueva solicitud UX/UI: mejorar hero, About y CTA.
• Reemplazar el indicador de scroll por flecha SVG en el borde inferior del hero, visible sobre el overlay.
• Mantener overlay e imagen pegados al scrollear (sin parallax en overlays), y asegurar contenido por encima.
• About con fondo gradiente (azul oscuro → dorado) sin overlay.
• CTA con overlay azul oscuro por encima de la imagen y por debajo del contenido.

# Key Challenges and Analysis

- Desalineación de rutas de recursos:
  - CSS apunta a `assets/css/styles.css` pero el CSS real está en `css/base.css`.
  - JS apunta a `assets/js/main.js` pero el JS real está en `src/main.js`.
  - Imágenes referenciadas como `assets/images/...` no existen; disponibles en `assets/img/*.webp`.
  - Fondos en SCSS usan `../images/hero-bg.jpg` que no existe; deben apuntar a `../assets/img/*.webp` desde `css/`.
- Navegación:
  - El navbar tiene un botón "LLAMAR HOY" que debe eliminarse.
  - El enlace "Planes" apunta a `#planes` (sección inexistente). Debe enlazar a `pages/principal/planes.html`.
  - "Iniciar Sesión" debería ser un enlace a `pages/principal/login.html`.
- Mantener textos/títulos intactos al cambiar solo estilos/enlaces.

# High-level Task Breakdown

1) Navbar y navegación
- Eliminar el botón `LLAMAR HOY` del navbar.
- Convertir "Iniciar Sesión" a `<a>` enlazando a `pages/principal/login.html`.
- Ajustar el enlace "Planes" a `pages/principal/planes.html`.
- Verificar anclas a `#inicio`, `#funcionalidades`, `#contacto`.
- Success: Navbar sin CTA telefónico; todos los links navegan y no dan 404.

2) Recursos CSS/JS
- Cambiar `<link rel="stylesheet" href="assets/css/styles.css">` a `css/base.css`.
- Cambiar `<script src="assets/js/main.js">` a `src/main.js`.
- Success: La consola no muestra 404 de CSS/JS y los estilos/JS cargan.

3) Imágenes y fondos
- Reemplazar `src` de imágenes inexistentes por ficheros en `assets/img/`:
  - `dashboard-preview.jpg` → `assets/img/glenn-carstens-peters-npxXWgQ33ZQ-unsplash.webp`
  - `team-meeting.jpg` → `assets/img/108683.webp`
  - `hero-bg.jpg` (inline img) → no necesario; ajustar fondos CSS.
  - `testimonial-avatar.jpg` → `assets/img/108683.webp` (temporal).
- En `scss/base.scss`, actualizar fondos de `.hero-section` y `.cta-section` a `url('../assets/img/pexels-googledeepmind-17483867.webp')` (ruta relativa desde `css/`). Recompilar no es automático; alternativamente, apuntar directamente en `css/base.css` si no hay pipeline.
- Success: Todas las imágenes renderizan sin 404; fondos visibles.

4) Accesibilidad/estética
- Mantener tipografías y esquema de colores ya alineados con el tema.
- Verificar contraste de botones y estados hover conforme al tema de referencia.
- Success: Apariencia consistente con Business Growth X sin cambios de copy.

- El parallax en `src/main.js` movía los overlays (`hero-overlay`, `cta-overlay`) separándolos del fondo; se desactiva para mantener cohesión visual.
- El indicador de scroll anterior quedaba detrás del contenido y no era reconocible; se reemplaza por flecha SVG y z-index elevado.
- About carece de overlay, por lo que se aplica gradiente directamente y se ajustan colores de texto.

5) QA de enlaces
- Verificar enlaces de footer (privacidad/términos/cookies). Si no existen, dejarlos como `#` para evitar 404 o mantenerlos si el proyecto prevé rutas.
- Success: No hay enlaces rotos visibles en navegación principal.

# Project Status Board

- [x] 1) Navbar sin "LLAMAR HOY", enlaces actualizados
- [x] 2) Corrección de rutas CSS/JS
- [x] 3) Sustitución de imágenes/ajuste de fondos
- [ ] 4) Revisión visual rápida (colores/tipografías)
- [ ] 5) QA de enlaces principales y footer
- [x] 6) Hero/CTA/About refinamientos solicitados

# Current Status / Progress Tracking

- Paso 1 completado: removido CTA "LLAMAR HOY", "Iniciar Sesión" ahora enlaza a `pages/principal/login.html`, y "Planes" a `pages/principal/planes.html`.
- Paso 2 completado: actualizado CSS a `css/base.css` y JS a `src/main.js` en `index.html`.
- Paso 3 completado: reemplazadas rutas de imágenes a `assets/img/*.webp`; fondos de `.hero-section` y `.cta-section` actualizados en `css/base.css` y `scss/base.scss`.
- Paso 6 completado:
  - Indicador de scroll reemplazado por flecha SVG y posicionado en la base del hero con z-index elevado. Edits en `index.html`, `css/base.css`, `scss/base.scss`.
  - Overlays fijados (z-index correctos) y sin parallax para no separarse del fondo. Edit en `src/main.js`.
  - `about-section` con fondo gradiente azul/dorado y textos sobre fondo oscuro. Edits en `css/base.css` y `scss/base.scss`.
  - `cta-section` overlay con `z-index: 1` y contenido con `z-index: 2` para mantener jerarquía visual.

# Executor's Feedback or Assistance Requests

- ¿Deseás que cambie los enlaces legales del footer a `#` para evitar 404?
- Si preferís otras imágenes de portada/hero diferentes a las asignadas, indícame cuáles.
- ¿Te gustaría mantener la animación del indicador (rebote) o ajusto velocidad/estilo?

# Lessons

- Verificar rutas relativas desde `css/` al referenciar imágenes de fondo: desde `css/base.css` a `assets/img/` es `../assets/img/...`.
- Antes de editar, leer archivos para detectar desalineaciones de rutas.
- Mantener textos intactos al modificar únicamente estructura/enlaces/estilos.
