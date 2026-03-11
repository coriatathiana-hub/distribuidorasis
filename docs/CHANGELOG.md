# Changelog

> Benefit-oriented history of delivered value.
> Each entry traces back to a User Story and its parent Feature.

---

## Format

```
## [YYYY-MM-DD] — HU-N.M: [Story Title]

**Feature:** FEAT-N — [Feature Name]
**Benefit:** [What value was delivered to the user]
**Changes:**
- [Summary of what was built/changed]
**Tests:** [Number of tests added]
```

---

## [2026-03-10] — HU-1.1: Navegacion mobile-first y estructura base de experiencia

**Feature:** FEAT-1 — Foundation mobile-first de catalogo y navegacion  
**Benefit:** Mejor navegacion mobile-first con estado activo consistente y recuperacion clara ante rutas invalidas, reduciendo friccion en exploracion de catalogo.  
**Changes:**
- Se reforzo el `Header` para estado activo correcto de rutas (incluyendo `end` en inicio) y menu mobile accesible.
- Se mejoro `NotFound` con CTAs de retorno a Inicio y Catalogo.
- Se fijo el tema corporativo `theme-1` y se removio el selector de temas por decision de producto.
- Se renombro la carpeta base de trabajo de `prototype` a `app` y se ajustaron referencias documentales.
**Tests:** 3 passing tests (`app/src/test/navigation.test.tsx`) / 1 archivo de pruebas agregado
