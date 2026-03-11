# Product Requirements Document (PRD)

> **Project:** distribuidorasis
> **Last updated:** 2026-03-10

---

## Vision

Distribuidora SIS necesita evolucionar su sitio corporativo a una aplicacion mobile-first con operaciones reales para convertir trafico web en oportunidades de venta calificadas. El producto debe permitir explorar catalogo industrial de forma rapida desde campo, administrar productos con persistencia segura, y capturar solicitudes por canales de alto uso (email y WhatsApp), reduciendo friccion comercial y tiempos de respuesta del equipo de ventas.

---

## Users

### Persona 1: Residente de Obra / Supervisor de Campo

- **Who:** Profesional operativo que trabaja en sitio y consulta productos desde celular.
- **Goal:** Encontrar rapidamente equipo o insumos y pedir cotizacion sin abandonar su flujo de trabajo.
- **Pain point:** Catalogos desactualizados o procesos de contacto lentos que atrasan compras urgentes.

### Persona 2: Comprador / Jefe de Compras

- **Who:** Responsable de compras corporativas y solicitudes por volumen.
- **Goal:** Validar opciones de producto y enviar requerimientos formales con informacion completa.
- **Pain point:** Falta de informacion visual y especificaciones claras para comparar alternativas.

### Persona 3: Administrador Comercial SIS

- **Who:** Usuario interno que mantiene el catalogo digital y responde prospectos.
- **Goal:** Gestionar productos, categorias e imagenes en un panel seguro con persistencia en BD.
- **Pain point:** Dependencia de localStorage y ausencia de autenticacion real para operacion productiva.

---

## MVP Scope

### IN Scope

- Catalogo mobile-first con busqueda, filtros, detalle de producto y carrusel de multiples imagenes por producto.
- Modulo de administracion real con Supabase (PostgreSQL + Auth OTP por email) para CRUD de categorias, productos e imagenes.
- Formulario de contacto funcional que envia solicitud al correo `ventas@distribuidorasis.com.mx`.
- CTA de contacto por WhatsApp con mensaje prellenado y trazabilidad minima de intentos.
- Base de seguridad inicial con RLS para separar permisos anonimos y usuarios autenticados administradores.

### OUT of Scope (V1)

- Pasarela de pagos y checkout ecommerce (el objetivo es captacion de leads, no venta transaccional).
- Motor avanzado de recomendaciones o personalizacion por IA (no esencial para validar conversion inicial).
- Integraciones ERP/CRM bidireccionales en tiempo real (se evalua en fases posteriores).
- Multilenguaje y multimoneda (mercado objetivo inicial: Mexico, espanol).

---

## KPIs (Success Metrics)

| KPI | Target | Measurement Method |
|:----|:-------|:-------------------|
| Contact requests delivered (email or WhatsApp) | >= 40 solicitudes calificadas/mes en los primeros 90 dias | Eventos de formulario + logs de envio + clicks a WhatsApp |
| Admin update success rate | >= 95% operaciones CRUD exitosas sin error | Logs de API y metricas de errores por endpoint |
| Product catalog engagement on mobile | >= 60% de sesiones mobile con al menos 3 vistas de producto | Analytics de navegacion por ruta y eventos de galeria |
| Contact response SLA | <= 2 horas habiles promedio | Timestamp de solicitud vs primer contacto comercial |

---

## Feature Overview

| ID | Feature | Priority | Status |
|:---|:--------|:---------|:-------|
| FEAT-1 | Plataforma base mobile-first y experiencia de catalogo | High | Pending |
| FEAT-2 | Administracion real con persistencia, autenticacion OTP y RLS | High | Pending |
| FEAT-3 | Gestion avanzada de imagenes por producto y carrusel en listados | High | Pending |
| FEAT-4 | Captura omnicanal de solicitudes (email + WhatsApp) | High | Pending |

---

## Constraints

- **Business constraint:** El canal principal de conversion en V1 es solicitud de cotizacion (no venta directa).
- **Technical constraint:** Reutilizar al maximo el prototipo actual en React + Vite para acelerar salida a produccion.
- **Security constraint:** Solo usuarios admin autenticados por OTP pueden modificar catalogo.
- **Operational constraint:** El contenido visual del catalogo requiere multiples imagenes por producto sin degradar rendimiento mobile.
