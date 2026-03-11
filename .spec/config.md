# SpecSeed Configuration

> Project-level settings that commands read at runtime.
> Edit this file to customize SpecSeed behavior for your project.

---

## Git Strategy

| Setting | Value | Options |
|:--------|:------|:--------|
| **mode** | `trunk` | `trunk` / `feature` |

- **`trunk`** (default): All commits go directly to `main`. Push happens at `@finish-objective`.
  Best for pre-deployment or projects without CI/CD auto-deploy.
- **`feature`**: Each `@start-objective` creates a branch `hu/N.M` from `main`.
  Commits stay on the branch during `@apply`. At `@finish-objective`, the branch is merged
  to `main` with `--no-ff`, pushed, and deleted. Best for projects with CD pipelines
  connected to `main` (Railway, Vercel, Netlify, etc.) where every push triggers a deploy.

---

## Testing Strategy

| Setting | Value | Options |
|:--------|:------|:--------|
| **tdd_mode** | `flexible` | `strict` / `flexible` / `off` |

- **`strict`** (default): RED phase is mandatory before GREEN. Tests must be written
  *before* implementation code. Cycle markers: `RED → GREEN → REFACTOR`.
- **`flexible`**: Tests are required but may be written *after* the implementation code.
  Useful for UI-heavy work or when the API surface is uncertain.
  Cycle markers: `IMPLEMENT → TEST → REFACTOR`.
  Post-condition remains: all BDD criteria must have passing tests.
- **`off`**: No automated test requirement. Only for spikes, prototypes, or projects
  without testing infrastructure. Generated code is marked with `// WARNING: No test contract`.
  Post-condition changes to: BDD criteria documented but not automated.

---

## Model Routing (Cursor)

> Cursor Pro has two separate usage pools: **Auto** (competitive token rates) and
> **Frontier** ($20/month API credit for manually selected models like Claude Sonnet,
> GPT-4o, Gemini Pro). Use both pools to maximize your subscription value.

| Phase | Recommended Tier | Rationale |
|:------|:-----------------|:----------|
| `validate`, `finish-objective` | **Auto** | Read-only analysis of `.md` files; no code generation |
| `estimate`, `start-feature` | **Auto** | Reasoning over docs, no code output |
| `spec-init`, `start-objective` | **Auto / Frontier** | Complex synthesis; user choice based on quality needs |
| `apply` | **Frontier** | Code generation + TDD demands maximum precision |

- **Auto:** Leave the model selector on "Auto" in Cursor. Best for lightweight,
  document-centric commands.
- **Frontier:** Manually select a specific model (e.g., Claude Sonnet 4, GPT-4o)
  in Cursor's model selector. Best for code-heavy commands where output quality
  is critical. This consumes from your separate $20 API credit pool.

---

## IDE Compatibility

| IDE | Entry Point | Commands |
|:----|:------------|:---------|
| **Cursor** | `.cursor/rules/specseed.mdc` | `@.spec/commands/X.md` |
| **Claude Code** | `CLAUDE.md` | `.claude/commands/` (symlinks to `.spec/commands/`) |
