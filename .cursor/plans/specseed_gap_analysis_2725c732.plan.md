---
name: SpecSeed Gap Analysis
overview: Analisis de brechas entre SpecSeed v3.0 (produccion), el workspace de diseno v2.0, y capacidades de frameworks como BMAD. Identifica que falta, que vale la pena portar, y que puede quedarse fuera.
todos:
  - id: fullstack-identity
    content: Agregar identidad Fullstack Developer en constitution.md (seccion 1) y Role Activation en apply.md
    status: completed
  - id: estimate-command
    content: Crear .spec/commands/estimate.md portado de design v2.0, adaptado al estilo v3.0 (sin agente .ai/ separado)
    status: completed
  - id: retro-finish
    content: Agregar seccion Quick Retrospective al Step 2 de finish-objective.md
    status: pending
  - id: plan-session
    content: Crear .spec/commands/plan-session.md simplificado con session_log.md
    status: pending
  - id: visualize-command
    content: Crear .spec/commands/visualize.md portado de design v2.0 (Tier 2, despues de los P1)
    status: pending
  - id: update-references
    content: Actualizar constitution.md (tabla comandos), specseed.mdc (tabla comandos), README.md (workflow y tabla)
    status: completed
isProject: false
---

# Audit de SpecSeed v3.0 -- Brechas y Recomendaciones

## Estado actual: Lo que v3.0 ya tiene bien

El flujo core esta completo y es solido:

```
@spec-init -> @start-feature -> @start-objective -> @apply -> @finish-objective
                                        ^
                                   @validate (poka-yoke)
```

- Jerarquia SAFe (Epic -> Feature -> Story -> BDD) bien implementada
- Poka-yoke (@validate) con niveles BLOCKER/WARNING
- TDD con RED -> GREEN -> REFACTOR
- Git trunk-based con Conventional Commits
- Niveles de detalle (Minimal a Full) para no sobre-burocratizar
- Templates reutilizables

---

## TIER 1: Brechas criticas (alto impacto, bajo esfuerzo)

### 1. Identidad "Fullstack Developer" ausente en @apply

**Problema:** La [constitucion](.spec/constitution.md) define la identidad como "Enterprise Architect (SAFe) + SDD Engineer". Pero cuando llega @apply, **no hay cambio de rol a desarrollador**. El AI podria quedarse en modo "arquitecto" y ser demasiado abstracto en lugar de escribir codigo real.

**Solucion:** Agregar al inicio de [apply.md](.spec/commands/apply.md) una instruccion explicita:

```markdown
### Role Activation
When executing @apply, shift your identity to **Senior Fullstack Developer**.
You are now writing production code — not architecting. Be hands-on:
- Write complete, working implementations (not pseudocode).
- Follow the project's TECH_SPEC.md conventions exactly.
- Handle edge cases, loading states, and error boundaries.
- If using Supabase, write real SQL, real RLS, real TypeScript types.
```

**Esfuerzo:** ~10 min. **Impacto:** Alto -- cambia fundamentalmente la calidad del codigo generado.

---

### 2. Sin estimaciones (@estimate) -- ya disenado en v2.0

**Problema:** No hay forma de dimensionar el trabajo antes de planificar. Sin estimaciones, no se puede priorizar con criterio ni saber si una historia deberia partirse.

**Lo que ya existe en design:** [design/.spec/commands/estimate.md](design/.spec/commands/estimate.md) + [design/.spec/.ai/estimation_agent.md](design/.spec/.ai/estimation_agent.md) con escala T-shirt (XS-XL) bien definida.

**Solucion:** Portar `@estimate` a v3.0 adaptandolo:

- Crear `.spec/commands/estimate.md` (adaptar del v2.0)
- NO necesita agente separado (.ai/) -- la instruccion puede ir inline en el comando
- Actualizar BACKLOG.md con formato `> Talla: M | Rationale: ...`
- Agregar a la tabla de comandos en constitution.md y specseed.mdc

**Esfuerzo:** ~30 min. **Impacto:** Alto -- habilita priorizacion informada.

---

### 3. Sin retrospectiva en @finish-objective

**Problema:** El flujo cierra, archiva y sigue. Pero nunca reflexiona. No hay mecanismo para capturar:

- Que salio bien (para replicar)
- Que salio mal (para mejorar)
- Que la IA aprendio del codebase (context para futuras sesiones)

**Solucion:** Agregar una seccion "Retro" al Step 2 de [finish-objective.md](.spec/commands/finish-objective.md):

```markdown
### Step 2b: Quick Retrospective

Before archiving, add a "Retrospective" section to the archived file:

- **What went well:** [1-2 bullets]
- **What was harder than expected:** [1-2 bullets]
- **Spec quality:** [Was the spec sufficient? What was missing?]
- **Improvement for next time:** [1 actionable item]
```

**Esfuerzo:** ~10 min. **Impacto:** Medio-Alto -- genera aprendizaje acumulativo.

---

## TIER 2: Brechas importantes (medio impacto, esfuerzo moderado)

### 4. Sin continuidad de sesion (@plan-session)

**Problema:** Cada nuevo chat en Cursor empieza sin contexto. La constitucion dice "lee BACKLOG y current_objective" pero no hay un log de **que se hizo en la ultima sesion** ni **donde se quedo**.

**Lo que ya existe en design:** [design/.spec/commands/plan_session.md](design/.spec/commands/plan_session.md) + [design/.spec/.ai/session_agent.md](design/.spec/.ai/session_agent.md) con `session_log.md`.

**Solucion:** Portar una version simplificada:

- Crear `.spec/commands/plan-session.md`
- Usar `.spec/sessions/session_log.md` como log acumulativo
- Al iniciar sesion: lee log + current_objective + BACKLOG, resume contexto
- Al cerrar sesion (o en @finish-objective): append al log con estado actual

**Esfuerzo:** ~45 min. **Impacto:** Alto para uso real -- resuelve el problema #1 de trabajar con AI: la perdida de contexto entre sesiones.

---

### 5. @visualize como comando standalone

**Problema:** Lovable/v0 son herramientas reales en tu stack (mencionado en [LINEAMIENTOS.md](design/LINEAMIENTOS.md)). Generar prompts de UI/UX desde specs es valioso y no esta en el flujo core.

**Lo que ya existe:** [design/.spec/commands/visualize.md](design/.spec/commands/visualize.md) + [design/.spec/.ai/visualization_agent.md](design/.spec/.ai/visualization_agent.md).

**Solucion:** Portar como comando **fuera del flujo principal** (no bloquea nada, es un "utility"):

- Crear `.spec/commands/visualize.md`
- Genera prompts para Lovable/v0 basado en PRD + TECH_SPEC + referencia
- Guarda en `PROTOTYPES.md` (nuevo artefacto)

**Esfuerzo:** ~30 min. **Impacto:** Medio -- acelera prototyping pero no es critico.

---

## TIER 3: Cosas que podriamos agregar pero NO recomiendo ahora

### 6. Agentes separados (.spec/.ai/)

**v2.0 los tenia:** init_agent, session_agent, estimation_agent, visualization_agent.
**v3.0 los elimino:** la logica va embebida en los comandos + constitucion.

**Mi recomendacion: NO agregarlos.** La constitucion + comandos son suficientes para un solo developer. Agregar .ai/ files anade complejidad sin beneficio claro -- Cursor ya lee el comando y la constitucion, no necesita un tercer archivo.

### 7. Metricas (Spec-to-Code Ratio, Intent Density, AI Leverage)

Definidas en [design/notebook-lab/grupo-c-safe/metricas.md](design/notebook-lab/grupo-c-safe/metricas.md). Son interesantes como concepto pero:

- Dificiles de medir automaticamente
- No cambian el flujo de trabajo
- Mejor recopilar datos manualmente despues de 2-3 proyectos reales

**Recomendacion:** Diferir. Usar los proyectos reales para calibrar si valen la pena.

### 8. Comando dedicado @hotfix

El nivel "Minimal" ya lo cubre (directo a @finish-objective con nota en CHANGELOG). Un comando separado seria sugar syntax pero no agrega funcionalidad real.

### 9. Comando @spike / @research

Solo mencionado como excepcion (--skip-validation). Podria formalizarse, pero los spikes son por naturaleza no-estructurados. Forzar estructura a un spike es contraproducente.

### 10. Multi-agente estilo BMAD

BMAD tiene Analyst, PM, Architect, SM, Developer, QA, UX, Tech Writer. Es un framework para equipos grandes. SpecSeed es para **un solo developer con AI**. La constitucion ya fusiona esos roles en uno. Adoptar multi-agente seria over-engineering.

---

## Tabla resumen de decision


| Capacidad                     | En v2.0?  | En v3.0? | Recomendacion           | Prioridad |
| ----------------------------- | --------- | -------- | ----------------------- | --------- |
| Identidad fullstack en @apply | Parcial   | No       | **Agregar**             | P1        |
| @estimate (T-shirt sizing)    | Si        | No       | **Portar**              | P1        |
| Retro en @finish-objective    | No        | No       | **Agregar**             | P1        |
| @plan-session (continuidad)   | Si        | No       | **Portar simplificado** | P2        |
| @visualize (prompts UI/UX)    | Si        | No       | **Portar como utility** | P2        |
| Agentes .ai/ separados        | Si        | No       | Diferir                 | P3        |
| Metricas                      | Diseñadas | No       | Diferir                 | P3        |
| @hotfix dedicado              | No        | No       | No necesario            | --        |
| @spike dedicado               | No        | No       | No necesario            | --        |
| Multi-agente BMAD             | N/A       | No       | No aplica               | --        |


---

## Archivos a modificar/crear

**Modificar:**

- `[.spec/constitution.md](.spec/constitution.md)` -- Agregar identidad fullstack en seccion 1, agregar @estimate y @plan-session a tabla de comandos (seccion 5)
- `[.spec/commands/apply.md](.spec/commands/apply.md)` -- Agregar "Role Activation" al inicio
- `[.spec/commands/finish-objective.md](.spec/commands/finish-objective.md)` -- Agregar Step 2b retrospectiva
- `[.cursor/rules/specseed.mdc](.cursor/rules/specseed.mdc)` -- Agregar nuevos comandos a la tabla
- `[README.md](README.md)` -- Actualizar tabla de comandos y workflow

**Crear:**

- `.spec/commands/estimate.md` -- Portado y adaptado de design v2.0
- `.spec/commands/plan-session.md` -- Portado y simplificado de design v2.0
- `.spec/commands/visualize.md` -- Portado de design v2.0 (Tier 2)

**No crear (ni traer de design):**

- `.spec/.ai/` -- No necesario, la logica va en los comandos
- `PROTOTYPES.md` -- Solo si se implementa @visualize
- `metricas.md` -- Diferido

