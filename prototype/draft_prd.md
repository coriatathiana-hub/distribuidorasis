# PRD – Distribuidora SIS · Sitio Web Corporativo

> **Versión:** 1.0  
> **Fecha:** 10 de marzo de 2026  
> **Estado:** Prototipo funcional (frontend)  
> **Stack:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui

---

## 1. Visión del Producto

Sitio web corporativo y catálogo digital para **Distribuidora SIS**, comercializadora especializada en suministro de materiales, equipos e insumos para la industria de la construcción (obras civiles, industriales y desarrollos inmobiliarios), con sede en Polanco, CDMX.

### Objetivo principal

Ofrecer una presencia digital profesional que permita a residentes de obra, jefes de proyecto y áreas de compras:

1. **Explorar** el catálogo de productos (EPP, señalización, accesorios, herramientas).
2. **Solicitar cotizaciones** directamente desde el sitio.
3. **Conocer** la empresa, sus valores y líneas de servicio.

---

## 2. Usuarios Objetivo

| Perfil | Necesidad principal | Contexto de uso |
|---|---|---|
| **Residente de obra** | Consultar catálogo y solicitar EPP rápido | Desde celular en campo |
| **Jefe de obra / Compras** | Solicitar cotización formal por volumen | Escritorio u oficina |
| **Administrador SIS** | Gestionar catálogo de productos | Panel de admin interno |

---

## 3. Arquitectura de Páginas

### 3.1 Home (`/`)

- **Hero section** con imagen industrial de fondo, título "Tu aliado en seguridad industrial" y CTAs a Catálogo y Contacto.
- **Servicios Personalizados** — 4 cards en grid 2×2:
  - Equipos de Protección Personal
  - Suministros Industriales
  - Logística Empresarial
  - Garantía Profesional
- **CTA de Cotización** — sección con gradiente y enlaces a Contacto/Catálogo.

### 3.2 Catálogo (`/catalogo`)

- **Sidebar de filtros**: búsqueda por texto + filtro por categoría (EPP, Señalización, Accesorios, Herramientas).
- **Grid de productos** responsive (1–3 columnas según viewport).
- **Contador** de resultados dinámico.
- **Estado vacío** con ícono y mensaje cuando no hay coincidencias.
- Skeleton loaders para estados de carga.

### 3.3 Detalle de Producto (`/producto/:id`)

- **Breadcrumb** de navegación (Inicio → Catálogo → Producto).
- **Galería de imágenes** con carousel.
- **Badges** de categoría y subcategoría.
- **CTA de cotización** con botones de Contacto y Llamar.
- **Tabla de especificaciones** parseadas automáticamente de la descripción.

### 3.4 Nosotros (`/nosotros`)

- **Quiénes Somos** — descripción corporativa + quote card.
- **Misión y Visión** — 2 cards lado a lado.
- **Valores** — 5 cards: Cumplimiento, Seguridad, Calidad, Responsabilidad, Enfoque en Resultados.
- **Líneas de Producto** — 4 cards con lista de productos: EPP, Materiales para Obra, Herramientas, Señalización.

### 3.5 Contacto (`/contacto`)

- **Formulario de cotización** con 6 campos validados con Zod:
  - Nombre completo, Empresa, Teléfono, Correo, Tipo de requerimiento (select), Mensaje.
- **Información de contacto**: dirección (Polanco), teléfonos, email, horario.
- **Botón WhatsApp** para atención inmediata (+52 55 5162 7054).
- Enlace a Aviso de Privacidad.

### 3.6 Aviso de Privacidad (`/privacidad`)

Página legal conforme a la LFPDPPP.

### 3.7 Panel de Administración (`/admin`)

- **Tabs**: Productos / Categorías.
- **CRUD completo** de productos y categorías.
- **Gestión de imágenes** por producto.
- **Dashboard** con estadísticas (totales de productos, categorías, imágenes).
- **Persistencia** con localStorage (sin backend).
- Confirmaciones de eliminación, toasts de feedback.

### 3.8 NotFound (`*`)

Página 404 para rutas inválidas.

---

## 4. Datos del Catálogo

- **46 productos** consolidados (sin duplicados por talla/color).
- **4 categorías**: EPP, Señalización y Delimitación, Accesorios de Seguridad, Herramientas y Equipos.
- **9 subcategorías EPP**: Protección de Cabeza, Ocular/Facial, Respiratoria, Auditiva, Manos, Calzado Industrial, Ropa de Trabajo, Alta Visibilidad, Seguridad en Alturas.
- Imágenes generadas por IA para cada producto con fondo degradado profesional.

---

## 5. Componentes Reutilizables

| Componente | Responsabilidad |
|---|---|
| `Header` | Navegación sticky con logo, links desktop, Sheet mobile, selector de tema |
| `Footer` | Logo, enlaces rápidos, contacto, legal, copyright dinámico |
| `Layout` | Wrapper con Header + Footer + WhatsApp flotante |
| `NavLink` | Link con detección de ruta activa |
| `ProductCard` | Card de producto para grid del catálogo |
| `ProductFilters` | Input de búsqueda + Select de categoría |
| `ProductGallery` | Carousel de imágenes con embla-carousel |
| `SpecificationsTable` | Parser inteligente de specs (tallas, materiales, normas) |
| `WhatsAppButton` | Botón flotante global con enlace a WhatsApp |
| `ThemeSelector` | Selector de tema claro/oscuro |
| `CategoryManager` | CRUD de categorías (admin) |
| `ProductManager` | CRUD de productos (admin) |
| `ImageGalleryManager` | Gestión de imágenes por producto (admin) |

---

## 6. Stack Técnico

| Capa | Tecnología |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS + shadcn/ui + tailwindcss-animate |
| Routing | React Router DOM v6 |
| Formularios | React Hook Form + Zod |
| State | React hooks + localStorage |
| Data fetching | TanStack React Query (preparado) |
| Tipografía | Orbitron (display) + sistema |
| Iconos | Lucide React |
| Notificaciones | Sonner + Radix Toast |

---

## 7. Diseño y UX

- **Mobile-first**: botones touch-friendly (≥44×44px), navegación Sheet en mobile.
- **Tema dual**: claro/oscuro con tokens semánticos HSL (`--primary`, `--accent`, `--background`, etc.).
- **Estética industrial**: paleta oscura/acerada, tipografía Orbitron para headings, degradados sutiles.
- **Accesibilidad**: `aria-labels`, roles semánticos, contrastes WCAG.
- **Animaciones**: hover cards con `translate-y`, transiciones suaves, backdrop-blur en header.

---

## 8. Información de Contacto (datos reales)

| Campo | Valor |
|---|---|
| Razón social | Distribuidora SIS |
| Dirección | Av. Jaime Balmes No. 11, Mezanine 33, Oficina 122, Polanco I Sección, Miguel Hidalgo, CDMX |
| Teléfono | 55 5162 7054 |
| Celular | 55 3901 5860 |
| WhatsApp | +52 55 5162 7054 |
| Email | ventas@distribuidorasis.com.mx |
| Horario | L-V 9:00–18:00, Sáb 9:00–14:00 |

---

## 9. Limitaciones Actuales (Prototipo)

| Área | Estado actual | Requerimiento producción |
|---|---|---|
| Persistencia | localStorage | Base de datos (Lovable Cloud / PostgreSQL) |
| Autenticación | Sin protección en `/admin` | Login con roles y sesiones |
| Envío de formularios | Simulado (timeout) | Servicio SMTP o API de email |
| Imágenes | Generadas por IA, estáticas | Fotos reales + storage (S3/CDN) |
| SEO | Básico (título, meta desc) | Meta tags dinámicos, sitemap.xml, JSON-LD |
| Analytics | No implementado | Google Analytics / similar |
| Precios | No mostrados | Sistema de precios (si aplica) |

---


*Documento generado a partir del prototipo funcional de Distribuidora SIS.*
