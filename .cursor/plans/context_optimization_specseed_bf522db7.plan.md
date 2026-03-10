---
name: Context optimization SpecSeed
overview: Reducir el consumo de contexto del agente SpecSeed eliminando lecturas redundantes, condensando la constitución, y generando un archivo de estado compacto que funcione como warm-up en chats nuevos.
todos:
  - id: layer1-dedup
    content: "Capa 1: Eliminar lecturas redundantes en pre-condiciones de start-objective, apply, finish-objective, validate"
    status: pending
  - id: layer2-split
    content: "Capa 2: Dividir constitution.md en core (~80-100 lineas) y constitution-reference.md (~140 lineas)"
    status: pending
  - id: layer3-digest
    content: "Capa 3: Implementar context-digest.md auto-generado + actualizar reglas IDE y comandos que modifican estado"
    status: pending
  - id: version-bump
    content: Bump VERSION a 0.5.0 y actualizar ROADMAP con el item de Session Persistence como implementado
    status: pending
isProject: false
---

# Optimización de Consumo de Contexto en SpecSeed

## Problema

Cada comando (`start-objective`, `apply`, `finish-objective`) re-lee los mismos archivos que la regla always-applied ya cargó. En un ciclo completo, `constitution.md` se lee 4-5 veces, `config.md` 4 veces, etc. Esto quema ~30-40% del contexto solo en lecturas redundantes.

---

## Estrategia: 3 Capas de Optimización

### Capa 1: Eliminar lecturas redundantes en comandos (impacto alto, esfuerzo bajo)

**Archivos a modificar:**

- `[.spec/commands/start-objective.md](.spec/commands/start-objective.md)`
- `[.spec/commands/apply.md](.spec/commands/apply.md)`
- `[.spec/commands/finish-objective.md](.spec/commands/finish-objective.md)`
- `[.spec/commands/validate.md](.spec/commands/validate.md)`

**Cambio:** Reemplazar las pre-condiciones que dicen "Read `.spec/constitution.md`" y "Read `.spec/config.md`" por una referencia al contexto ya cargado:

```markdown
## Pre-conditions

1. **Context loaded by IDE rule** — `.spec/constitution.md` and `.spec/config.md` are
   already loaded by the always-applied IDE rule. Do NOT re-read them.
   Extract `git_strategy` and `tdd_mode` from the config already in context.
2. Read `current_objective.md` — [specific purpose for this command].
```

Esto elimina ~3 lecturas de `constitution.md` (239 lineas x 3 = 717 lineas) y ~3 lecturas de `config.md` (47 x 3 = 141 lineas) por ciclo.

### Capa 2: Condensar la constitución (impacto alto, esfuerzo medio)

**Archivos a modificar:**

- `[.spec/constitution.md](.spec/constitution.md)` -- reducir a ~80-100 lineas
- Nueva referencia: `.spec/constitution-reference.md` -- material de consulta

**Cambio:** Separar la constitución en dos partes:

- `**constitution.md` (core, ~80-100 lineas):** Identidad, 5 poka-yokes, protocolo de comandos (resumen), mecanismo test-as-contract (resumen), estilo de interacción. Esto es lo que la regla always-applied carga.
- `**constitution-reference.md` (~140 lineas):** Material detallado que solo se consulta cuando se necesita: convenciones de commit (sec 8), folder structure detallada (sec 3), guidelines Supabase (sec 7), detail levels completos (sec 4). Los comandos que lo necesiten lo leen explicitamente.

Secciones candidatas a mover a reference:

- Seccion 3 "Folder Structure": La estructura de carpetas solo la necesita `@spec-init` y `@validate`. El agente ya la conoce por el rule file.
- Seccion 4 "Detail Levels": Solo relevante para `@start-objective`.
- Seccion 7 "Supabase-Native Guidelines": Solo relevante si el proyecto usa Supabase.
- Seccion 8 "Git Strategy" (detalle): Los detalles de commit convention, tagging, feature flow. El resumen (trunk vs feature) queda en core. El detalle solo lo necesita `@apply` y `@finish-objective`.

### Capa 3: Context Digest para warm-up (impacto medio, esfuerzo medio)

**Archivos nuevos:**

- `.spec/context-digest.md` -- generado automaticamente

**Archivos a modificar:**

- `[.cursor/rules/specseed.mdc](.cursor/rules/specseed.mdc)` -- leer digest primero
- `[CLAUDE.md](CLAUDE.md)` -- mismo cambio
- `[.spec/commands/finish-objective.md](.spec/commands/finish-objective.md)` -- generar digest al cerrar
- `[.spec/commands/apply.md](.spec/commands/apply.md)` -- actualizar digest al completar tasks

**Concepto:** Al final de cada comando que modifica estado (`@apply`, `@finish-objective`, `@start-feature`, `@start-objective`), se genera/actualiza un archivo compacto (~30-40 lineas):

```markdown
# Context Digest
> Auto-generated. Last updated: 2026-02-21 by @finish-objective

## Config
- git_strategy: trunk
- tdd_mode: flexible

## Project State
- Active objective: None
- Last completed: HU-1.2 (2026-02-21)
- Features: FEAT-1 (3/5 stories done), FEAT-2 (pending)
- Next suggested: HU-1.3

## Key Decisions (from last session)
- ADR-001: Chose server-side validation over client-side
- RLS policy for properties table uses org_id
```

**La regla always-applied cambia a:**

```markdown
Before any task, read:
1. `.spec/context-digest.md` (if exists) — compact project state
2. `.spec/constitution.md` — operating principles (only if digest doesn't exist)
3. `current_objective.md` — active execution contract
```

Esto reduce el cold start de ~400+ lineas a ~70-80 lineas (digest + current_objective).

---

## Impacto Estimado


| Metrica                           | Antes                      | Despues                           |
| --------------------------------- | -------------------------- | --------------------------------- |
| Lecturas en cold start (rule)     | 4 archivos (~350+ lineas)  | 2 archivos (~70-80 lineas)        |
| Lecturas redundantes por comando  | 2-3 archivos (~300 lineas) | 0 (referencia a contexto cargado) |
| Constitution en contexto          | 239 lineas                 | ~80-100 lineas                    |
| Overhead total por ciclo completo | ~1500+ lineas de lecturas  | ~400-500 lineas                   |


Estimacion conservadora: **reduccion del 60-70% en tokens de contexto** dedicados a lecturas de framework.

---

## Orden de Implementacion

1. **Capa 1 primero** (quick win): Eliminar lecturas redundantes en los 4 comandos. Es un cambio de texto que no afecta funcionalidad.
2. **Capa 2 segundo**: Condensar constitution. Requiere decision sobre que va en core vs reference.
3. **Capa 3 ultimo**: Context digest. Requiere modificar multiples comandos y las reglas IDE.

---

## Riesgos

- **Capa 2 (split constitution):** Si se divide mal, un comando podria no tener acceso a informacion que necesita. Mitigacion: cada comando que necesite reference lo lee explicitamente.
- **Capa 3 (digest):** Si el digest se desincroniza (e.g., el usuario edita BACKLOG.md manualmente), el agente arranca con estado obsoleto. Mitigacion: el digest incluye un timestamp y un hash/version; `@validate` verifica consistencia.

