# Objective: HU-N.M — [Story Title]

## Context

- **Feature:** FEAT-N — [Feature Name]
- **Story:** Como [rol], quiero [acción], para poder [resultado]
- **Spec Level:** [Minimal | Lite | Standard | Full]
- **TDD Mode:** [strict | flexible | off — from .spec/config.md]
- **Estimated Duration:** [total time estimate]

## Acceptance Criteria (BDD)

### Scenario 1: [Name]

- **Dado que:** [context]
- **Cuando:** [action]
- **Entonces:** [result]

### Scenario 2: [Name]

- **Dado que:** [context]
- **Cuando:** [action]
- **Entonces:** [result]

### Scenario 3: [Error case]

- **Dado que:** [context]
- **Cuando:** [action]
- **Entonces:** [result]

## Implementation Plan

### Task 1: [Description] (~XX min)

- **Type:** [SC] | [CC] | [SA] | [DB] | [TEST]
- **Cycle:** [strict: RED → GREEN → REFACTOR | flexible: IMPLEMENT → TEST → REFACTOR | off: IMPLEMENT → REFACTOR]
- **Files:** [list of files to create/modify]
- **Verification:** [specific command to validate]

### Task 2: [Description] (~XX min)

- **Type:** [SC] | [CC] | [SA] | [DB] | [TEST]
- **Cycle:** [per tdd_mode in .spec/config.md]
- **Files:** [list of files to create/modify]
- **Verification:** [specific command to validate]

## Database Changes

> Remove this section if no DB changes are needed.

```sql
-- Migration: [description]
-- Tables affected: [list]

-- [SQL statements here]
```

## Infrastructure Changes

> Remove this section if no infrastructure changes are needed.

- **New environment variables:** [list or "None"]
- **New external services:** [list or "None"]
- **New storage/buckets:** [list or "None"]
- **New auth configuration:** [list or "None"]
- **SETUP.md update required:** Yes / No

## Manual Testing Checklist

- [ ] [Step 1: What to do and what to verify]
- [ ] [Step 2: What to do and what to verify]
- [ ] [Step 3: What to do and what to verify]

## Definition of Done

- [ ] All BDD criteria covered (passing tests if `tdd_mode` is `strict` or `flexible`; documented if `off`)
- [ ] No TypeScript errors
- [ ] RLS policies tested (if applicable)
- [ ] Manual testing checklist verified
- [ ] CHANGELOG entry drafted

---

> The following sections are filled automatically by `@finish-objective`.

## Completion

- **Date:** [filled at close]
- **Estimated Duration:** [copied from Context]
- **Actual Duration:** [computed from git: first `feat(HU-N.M)` commit to closing commit]
- **Variance:** [over/under estimate and ratio, e.g. "3x faster than estimated"]
- **Files modified:** [filled at close]
- **Tests added:** [filled at close]

## Deviations & Decisions

- **Added:** [unplanned tasks/files, or "None"]
- **Changed:** [tasks that changed scope, or "None"]
- **Skipped:** [omitted tasks and reason, or "None"]
- **Key Decisions:** [decisions made during implementation]
- **Escalated ADRs:** [ADR-00N reference if applicable, or "None"]
- **Lesson:** [one-line takeaway for future objectives, if applicable]
