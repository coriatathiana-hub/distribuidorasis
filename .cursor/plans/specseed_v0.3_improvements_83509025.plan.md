---
name: SpecSeed v0.3 Improvements
overview: "Evolucionar SpecSeed con 4 mejoras: git strategy configurable (trunk/feature), desviaciones automaticas con escalamiento a ADR en finish-objective, soporte dual Cursor+Claude Code con symlinks estilo LIDR, y mecanismo de upgrade (diferido)."
todos:
  - id: deviations
    content: Integrar Deviation Analysis en finish-objective.md con escalamiento a ADR en TECH_SPEC.md, y actualizar template OBJECTIVE.md
    status: completed
  - id: git-config
    content: Crear .spec/config.md y adaptar start-objective, apply, finish-objective para modo trunk|feature
    status: completed
  - id: dual-ide
    content: Crear CLAUDE.md + .claude/commands/ con symlinks a .spec/commands/ (patron LIDR), y documentar en README
    status: completed
  - id: constitution-update
    content: Actualizar constitution.md con nuevas secciones (git modes, config reference, dual IDE)
    status: completed
  - id: upgrade-mechanism
    content: "Crear scripts/upgrade.sh + .spec/commands/upgrade.md para actualizar archivos del framework en proyectos existentes"
    status: completed
isProject: false
---

# SpecSeed v0.3 — Mejoras de Robustez

## (1) Git Strategy Configurable: trunk | feature

**Problema:** Con CD conectado a `main` (Railway, Vercel), trunk-based despliega código incompleto en cada push intermedio.

**Solucion:** Modo configurable por proyecto.

- Crear `[.spec/config.md](.spec/config.md)` como configuracion del framework por proyecto:

```markdown
  # SpecSeed Config
  ## Git Strategy
  - mode: trunk | feature  (default: trunk)
  

```

- Modificar `[.spec/commands/start-objective.md](.spec/commands/start-objective.md)`:
  - Si `mode: feature` -> nuevo Step: crear branch `hu/N.M` desde `main`
  - Si `mode: trunk` -> comportamiento actual (sin cambios)
- Modificar `[.spec/commands/apply.md](.spec/commands/apply.md)`:
  - Los commits van al branch activo (en feature mode, al branch `hu/N.M`; en trunk, a `main`)
  - No se hace push automatico entre tareas (en ningun modo)
- Modificar `[.spec/commands/finish-objective.md](.spec/commands/finish-objective.md)`:
  - Si `mode: feature`:
    1. Merge `hu/N.M` -> `main` (con `--no-ff` para preservar historia)
    2. Push a `main` + tags
    3. Eliminar branch local `hu/N.M`
  - Si `mode: trunk`: push directo a `main` + tags (comportamiento actual)
- Actualizar `[.spec/constitution.md](.spec/constitution.md)` seccion 8 para documentar ambos modos

**Archivos a modificar:** `constitution.md`, `start-objective.md`, `apply.md`, `finish-objective.md` + crear `config.md`

---

## (2) Desviaciones Automaticas en finish-objective (con escalamiento a ADR)

**Problema:** Las desviaciones se pierden si no se documentan manualmente. Las sesiones y retrospectivas separadas son overhead innecesario. Ademas, algunas desviaciones son decisiones arquitectonicas cross-cutting que deberian persistir como ADRs.

**Solucion:** Integrar analisis de desviaciones en `@finish-objective` con clasificacion y escalamiento.

- Modificar `[finish-objective.md](.spec/commands/finish-objective.md)` agregando un **Step 1.5: Deviation Analysis** (entre verificacion y archivado):
  1. Leer `current_objective.md` (plan original, con tareas y archivos planificados)
  2. Inspeccionar `git log` desde el primer commit del objetivo
  3. Comparar plan vs realidad e identificar desviaciones
  4. **Clasificar cada desviacion:**
    - **Tactica** (afecta solo esta HU) -> queda en el archivo de history
    - **Arquitectonica** (introduce patron/convencion/tecnologia cross-cutting) -> proponer al usuario escalarla a ADR en `docs/TECH_SPEC.md`
  5. Si el usuario aprueba el escalamiento, agregar ADR-00N en TECH_SPEC.md con referencia a la HU de origen
  6. Generar seccion `## Deviations & Decisions` en el archivo archivado
- Modificar `[OBJECTIVE.md](.spec/templates/OBJECTIVE.md)` template para incluir placeholder de "Deviations" en la seccion de cierre
- Formato enriquecido del archivo en `.spec/history/`:

```markdown
## Completion
- Date / Duration / Files / Tests (ya existente)

## Deviations & Decisions
- **Added:** [tareas no planificadas que se ejecutaron]
- **Changed:** [tareas que cambiaron de scope]
- **Skipped:** [tareas omitidas y por que]
- **Key Decisions:** [decisiones tomadas durante la implementacion]
- **Escalated ADRs:** [ADR-00N si aplica, con referencia a TECH_SPEC.md]
- **Lesson:** [una linea con aprendizaje clave, si aplica]
```

- **No se crean comandos de sesion ni retrospectiva.** El history enriched ES la retrospectiva.
- El input para el analisis NO es la conversacion — es `current_objective.md` + `git log` (artefactos persistentes y comparables).

**Archivos a modificar:** `finish-objective.md`, `OBJECTIVE.md` template, potencialmente `TECH_SPEC.md` (si hay ADR nuevo)

---

## (3) Soporte Dual: Cursor + Claude Code (patron LIDR con symlinks)

**Problema:** Limitarse a un solo IDE puede ser mas costoso (plan Pro de uno vs basico de ambos).

**Solucion:** Aplicar el patron de [LIDR](https://github.com/LIDR-academy/ai-specs): fuente unica + symlinks por IDE.

**Hallazgo clave de LIDR:** Los archivos en `.cursor/commands/` y `.claude/commands/` son **symlinks** (~34 bytes) que apuntan al contenido real en `ai-specs/.commands/`. SpecSeed ya tiene los comandos en ubicacion neutral (`.spec/commands/`), asi que la adaptacion es mas simple.

**Estructura propuesta:**

```
project/
├── CLAUDE.md                          # Entry point Claude Code (equivalente a specseed.mdc)
├── .cursor/
│   └── rules/specseed.mdc            # Entry point Cursor (ya existe)
├── .claude/
│   └── commands/                      # Symlinks a .spec/commands/
│       ├── start-objective.md -> ../../.spec/commands/start-objective.md
│       ├── apply.md -> ../../.spec/commands/apply.md
│       ├── finish-objective.md -> ../../.spec/commands/finish-objective.md
│       └── ... (un symlink por comando)
├── .spec/
│   └── commands/                      # Fuente unica (single source of truth)
│       ├── start-objective.md         # Contenido real
│       ├── apply.md
│       └── ...
```

**Implementacion:**

- Crear `CLAUDE.md` en raiz con el contenido equivalente a `specseed.mdc` (sin frontmatter `.mdc`)
- Crear `.claude/commands/` con symlinks (`ln -s`) a cada `.spec/commands/*.md`
- Documentar en `README.md` seccion de compatibilidad dual:
  - **Cursor:** `@.spec/commands/X.md` (referencia directa)
  - **Claude Code:** `/start-objective`, `/apply`, etc. (slash commands via symlinks)
- Agregar nota en `.spec/config.md` sobre IDE compatibility
- Actualizar `init.sh` para generar symlinks automaticamente

**Archivos a crear:** `CLAUDE.md`, `.claude/commands/` (symlinks). **Modificar:** `README.md`, `init.sh`, `.spec/config.md`

---

## (4) Mecanismo de Upgrade [COMPLETADO]

**Problema:** Al evolucionar SpecSeed (nuevos comandos, cambios en constitution), los repos existentes quedan desactualizados.

**Solucion implementada:**

- `scripts/upgrade.sh` — Script bash que actualiza solo archivos del framework (commands, templates, constitution, entry points, symlinks). Respalda `config.md` como `.pre-upgrade` si cambió. Nunca toca `docs/`, `current_objective.md`, `.spec/work/`, `.spec/history/` ni código fuente.
- `.spec/commands/upgrade.md` — Comando in-IDE que verifica la versión, guía la reconciliación de `config.md` post-upgrade, y ejecuta un integrity check.
- Registrado en `constitution.md`, `specseed.mdc`, `CLAUDE.md`, y `README.md`.

---

## Prioridad de Implementacion

1. **(2) Desviaciones + ADR escalation** - Menor esfuerzo, mayor valor inmediato
2. **(1) Git configurable** - Necesario en cuanto tengas proyecto con CD
3. **(3) Dual IDE** - Necesario si decides usar Cursor + Claude Code (plan basico x2)
4. **(4) Upgrade** - Implementado: `scripts/upgrade.sh` + `@upgrade`

