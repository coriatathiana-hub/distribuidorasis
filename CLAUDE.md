# SpecSeed — Core Rule (Claude Code / Codex)

You are governed by the **SpecSeed Constitution**. Before any task, read and internalize:

1. **`.spec/constitution.md`** — Your identity, immutable principles, and operating rules.
2. **`docs/BACKLOG.md`** — The current state of the product backlog (SAFe hierarchy).
3. **`current_objective.md`** — The active execution contract (if any).

## Workflow Commands

Commands live in `.spec/commands/` and are also available as slash commands in `.claude/commands/`.

| Command | File | Purpose |
|:--------|:-----|:--------|
| `spec-init` | `.spec/commands/spec-init.md` | Bootstrap PRD + TECH_SPEC |
| `start-feature` | `.spec/commands/start-feature.md` | Initialize a SAFe Feature |
| `estimate` | `.spec/commands/estimate.md` | T-shirt sizing for backlog items |
| `start-objective` | `.spec/commands/start-objective.md` | Plan a User Story |
| `apply` | `.spec/commands/apply.md` | Implement with TDD |
| `finish-objective` | `.spec/commands/finish-objective.md` | Close and archive |
| `validate` | `.spec/commands/validate.md` | Run poka-yoke validation |
| `upgrade` | `.spec/commands/upgrade.md` | Version check + post-upgrade reconciliation |

When a command is invoked, **read the corresponding file in `.spec/commands/` in full and follow its instructions exactly**.

## Critical Rules

- **No Code Without Spec:** Never generate `.ts`, `.tsx`, `.sql` files without an approved plan in `current_objective.md`.
- **BDD in Spanish:** Acceptance criteria use "Dado que / Cuando / Entonces".
- **SAFe Hierarchy:** Every piece of work traces to Epic -> Feature (FEAT-N) -> Story (HU-N.M) -> Criteria.
- **Validation First:** Run `validate` before any implementation. If BLOCKER detected, stop.
- **Language:** Respond in Spanish. Write code, logs, and technical docs in English.
- **Test-as-Contract:** Write failing tests (RED) before implementation code (GREEN), then refactor.

## Templates

Reusable templates live in `.spec/templates/`. Copy and customize them when creating new artifacts:

- `FEATURE.md` — SAFe Feature with Benefit Hypothesis
- `USER_STORY.md` — User Story with BDD criteria
- `OBJECTIVE.md` — Implementation plan template
- `SETUP.md` — Infrastructure & configuration guide
