# FEAT-1: Foundation mobile-first de catalogo y navegacion

## Benefit Hypothesis

- **Para**: Residentes de obra y compradores que consultan catalogo industrial desde dispositivos moviles.
- **Que**: Necesitan encontrar productos rapidamente, con navegacion clara y sin friccion.
- **Esta Feature**: Provee una base mobile-first de navegacion, listado y detalle de productos optimizada para conversion a contacto.
- **Esperamos**: Incrementar la exploracion efectiva del catalogo y reducir abandono en sesiones moviles.
- **Sabremos que hemos tenido éxito cuando**: Al menos 60% de sesiones mobile registren >=3 vistas de producto y el rebote del catalogo disminuya >=20% vs linea base.

## User Stories

| ID | Title | Priority | Status |
|:---|:------|:---------|:-------|
| HU-1.1 | Navegacion mobile-first y estructura base de experiencia | High | [x] Completed (2026-03-10) |
| HU-1.2 | Catalogo responsive con busqueda, filtros y estados UX | High | [x] Completed (2026-03-10) |
| HU-1.3 | Detalle de producto con informacion accionable y CTA a contacto | High | [ ] Pending |

## Story Definitions and BDD Criteria

### HU-1.1: Navegacion mobile-first y estructura base de experiencia

- **Como:** Residente de obra que navega desde celular.
- **Quiero:** Una navegacion clara y consistente entre Home, Catalogo, Nosotros y Contacto.
- **Para poder:** Moverme rapido entre secciones sin perder contexto.

**Criterios de aceptacion (BDD)**

1. Navegacion principal accesible en mobile.
   - **Dado que:** Estoy en un dispositivo movil.
   - **Cuando:** Abro el menu principal.
   - **Entonces:** Debo ver todas las rutas clave y poder navegar con maximo dos toques.

2. Persistencia de contexto de ruta activa.
   - **Dado que:** Estoy en cualquier pagina del sitio.
   - **Cuando:** Visualizo el encabezado o menu.
   - **Entonces:** Debe resaltarse claramente la seccion activa.

3. Escenario de error: ruta no valida.
   - **Dado que:** Ingreso una URL inexistente.
   - **Cuando:** El sistema intenta resolver la ruta.
   - **Entonces:** Debe mostrar una pantalla 404 con opcion para regresar a Home y Catalogo.

### HU-1.2: Catalogo responsive con busqueda, filtros y estados UX

- **Como:** Comprador que evalua alternativas de producto.
- **Quiero:** Buscar por nombre y filtrar por categoria desde mobile o desktop.
- **Para poder:** Reducir tiempo de descubrimiento de productos relevantes.

**Criterios de aceptacion (BDD)**

1. Busqueda por texto.
   - **Dado que:** Existen productos activos en el catalogo.
   - **Cuando:** Ingreso un termino de busqueda.
   - **Entonces:** Deben mostrarse solo productos que coincidan con nombre o descripcion corta.

2. Filtro por categoria.
   - **Dado que:** Hay categorias disponibles.
   - **Cuando:** Selecciono una categoria.
   - **Entonces:** El listado debe actualizarse solo con productos de esa categoria y mostrar contador de resultados.

3. Escenario de error: sin resultados.
   - **Dado que:** Aplico una busqueda o filtro sin coincidencias.
   - **Cuando:** El sistema procesa el criterio.
   - **Entonces:** Debe mostrar estado vacio con mensaje claro y accion para limpiar filtros.

### HU-1.3: Detalle de producto con informacion accionable y CTA a contacto

- **Como:** Usuario interesado en un producto especifico.
- **Quiero:** Ver informacion tecnica y acciones de contacto directas.
- **Para poder:** Solicitar cotizacion con contexto del producto seleccionado.

**Criterios de aceptacion (BDD)**

1. Presentacion de datos clave de producto.
   - **Dado que:** Entro a la vista de detalle de un producto valido.
   - **Cuando:** Se carga la pagina.
   - **Entonces:** Debo ver nombre, categoria, descripcion, especificaciones y CTA a contacto.

2. Navegacion contextual con breadcrumb.
   - **Dado que:** Estoy en detalle de producto.
   - **Cuando:** Quiero regresar al catalogo.
   - **Entonces:** Debo poder volver mediante breadcrumb conservando experiencia de navegacion.

3. Escenario de error: producto inexistente o inactivo.
   - **Dado que:** Intento abrir un ID de producto inexistente o no publicado.
   - **Cuando:** El sistema consulta el producto.
   - **Entonces:** Debe mostrar estado no encontrado con opcion de regresar al catalogo.

## Acceptance Criteria (Feature Level)

- [ ] La experiencia mobile-first permite navegar y descubrir productos sin bloqueos de usabilidad.
- [ ] El catalogo ofrece busqueda/filtros con estados de carga y estado vacio claros.
- [ ] El detalle de producto conecta de forma directa con los flujos de contacto del negocio.

## Technical Notes

- **Data model impact:** Consumo de `categories` y `products`; no introduce nuevas tablas en FEAT-1.
- **Security considerations:** Solo lectura publica de productos/categorias activos bajo RLS para usuarios anonimos.
- **Dependencies:** Depende del baseline de datos de catalogo y del layout global del sitio.

## Out of Scope

- Persistencia administrativa y autenticacion OTP (FEAT-2).
- Gestion multi-imagen avanzada y carrusel en listado (FEAT-3).
- Envio real de formulario por correo y flujo WhatsApp avanzado (FEAT-4).
