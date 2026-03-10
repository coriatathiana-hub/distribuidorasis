# @start-objective

> Plan the implementation of a User Story by generating the execution contract.
>
> **Model Hint: Auto / Frontier** — Complex synthesis; select a frontier model
> if you want higher quality planning output.

---

## Trigger

The user invokes this command to begin working on a specific User Story.

**Usage:** `@start-objective HU-N.M` (e.g., `@start-objective HU-1.1`)

---

## Pre-conditions

1. Read `.spec/constitution.md` to load operating principles.
2. Read `.spec/config.md` to determine `git_strategy` (trunk or feature) and `tdd_mode`
   (strict, flexible, or off).
3. Read `docs/BACKLOG.md` to confirm the HU exists and understand its Feature context.
4. Read `.spec/work/FEAT-N/README.md` to understand the Benefit Hypothesis.
5. Read `docs/TECH_SPEC.md` for technical constraints.
6. Verify no other objective is currently active (check if `current_objective.md` is empty or
   contains a completed objective).

---

## Step 0: VALIDATION (Mandatory)

Before generating the plan, execute the validation schema from `@validate` against:

- The parent Feature (FEAT-N)
- The target User Story (HU-N.M)
- The global pre-requisites (PRD.md, TECH_SPEC.md)

**If any BLOCKER is detected, STOP. Do not generate the plan. Report the blocker and wait
for the user to resolve it.**

---

## Steps

### Step 1: Analyze the Story

Read the User Story and its BDD criteria. Identify:

- **Data changes:** Does this HU require new tables, columns, or RLS policies?
- **Infrastructure prerequisites:** Does this HU require new infrastructure setup
  (e.g., storage buckets, environment variables, auth configuration, external service
  credentials, or cloud resources)? If yes, flag them explicitly in the Implementation
  Plan and reference `docs/SETUP.md` as the target for documentation.
- **Component classification:** For each new component, classify as:
  - `[SC]` Server Component
  - `[CC]` Client Component
  - `[SA]` Server Action
- **Dependencies:** Does this HU depend on other HUs being completed first?
- **Risk areas:** What could go wrong? What needs special attention?

### Step 2: Generate Implementation Plan

Create `current_objective.md` with this structure:

```markdown
# Objective: HU-N.M — [Story Title]

## Context
- **Feature:** FEAT-N — [Feature Name]
- **Story:** Como [rol], quiero [acción], para poder [resultado]
- **Spec Level:** [Minimal | Lite | Standard | Full]

## Acceptance Criteria (BDD)
[Copy from BACKLOG or Feature workspace]

## Implementation Plan

### Task 1: [Description] (~XX min)
- **Type:** [SC] | [CC] | [SA] | [DB] | [TEST]
- **Cycle:** [per tdd_mode — see table below]
- **Files:** [list of files to create/modify]
- **Verification:** [specific command to validate]

### Task 2: ...

## Database Changes (if applicable)
[SQL blocks for Supabase — tables, RLS policies, migrations]

## Manual Testing Checklist
- [ ] [Step-by-step verification the user can follow]

## Definition of Done
- [ ] All BDD criteria have passing tests
- [ ] No TypeScript errors
- [ ] RLS policies tested (if applicable)
- [ ] CHANGELOG entry drafted
- [ ] All changes committed with `feat(HU-N.M):` convention
- [ ] Tag `HU-N.M` created
```

#### Cycle Markers by `tdd_mode`

| `tdd_mode` | Cycle Value |
|:-----------|:------------|
| `strict` | `RED → GREEN → REFACTOR` |
| `flexible` | `IMPLEMENT → TEST → REFACTOR` |
| `off` | `IMPLEMENT → REFACTOR` |

### Step 3: Git Branch Setup (feature mode only)

If `.spec/config.md` has `git_strategy: feature`:

1. Ensure you are on `main` and it is up to date:
   ```bash
   git checkout main && git pull
   ```
2. Create and switch to a new branch:
   ```bash
   git checkout -b hu/N.M
   ```
3. Note the branch name in `current_objective.md` Context section:
   ```markdown
   - **Branch:** `hu/N.M`
   ```

If `git_strategy: trunk`, skip this step (work continues on `main`).

### Step 4: Confirm with User

Present the plan summary and ask for approval before proceeding to `@apply`.

---

## Output

| File | Content |
|:-----|:--------|
| `current_objective.md` | Complete implementation plan with TDD markers |

---

## Post-conditions

- `current_objective.md` is populated with a validated, actionable plan.
- Every task has a time estimate under 60 minutes.
- Every task has cycle markers matching `tdd_mode` from `.spec/config.md`.
- If `feature` mode: a `hu/N.M` branch exists and is checked out.
- The user has approved the plan.
