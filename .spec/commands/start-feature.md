# @start-feature

> Initialize a new SAFe Feature with its Benefit Hypothesis and User Story breakdown.
>
> **Model Hint: Auto** — Reasoning over product docs, no code output.

---

## Trigger

The user invokes this command to start working on a Feature, providing the Feature ID.

**Usage:** `@start-feature FEAT-N` (e.g., `@start-feature FEAT-1`)

---

## Pre-conditions

1. Read `.spec/constitution.md` to load operating principles.
2. Read `docs/PRD.md` to understand the product vision and scope.
3. Read `docs/BACKLOG.md` to confirm the Feature exists and understand the hierarchy.
4. Read `docs/TECH_SPEC.md` to understand technical constraints.
5. Verify the Feature ID exists in `docs/BACKLOG.md`.

---

## Steps

### Step 1: Create Feature Workspace

Create the folder `.spec/work/FEAT-N/` for the Feature.

### Step 2: Generate Benefit Hypothesis

Using the SAFe template, define the Feature's value:

```markdown
## Benefit Hypothesis — FEAT-N: [Feature Name]

- **Para**: [target customer or user]
- **Que**: [what they seek]
- **Esta Feature**: [what it provides]
- **Esperamos**: [expected business benefit]
- **Sabremos que hemos tenido éxito cuando**: [measurable success indicator]
```

Save this in `.spec/work/FEAT-N/README.md`.

### Step 3: Break Down into User Stories

For each User Story identified:

1. Assign ID following `HU-N.M` convention (e.g., HU-1.1, HU-1.2).
2. Write the story using the format:
   - **Como:** [role or persona]
   - **Quiero:** [action]
   - **Para poder:** [outcome]
3. Define at least 2 BDD acceptance criteria per story:
   - **Dado que:** [context]
   - **Cuando:** [action]
   - **Entonces:** [expected result]
4. Include at least 1 error/exception scenario per story.

### Step 4: Update `docs/BACKLOG.md`

Add the new User Stories under the Feature in the backlog, maintaining the hierarchy:

```markdown
### FEAT-N: [Feature Name]
- **Hypothesis:** [one-line summary]
- **Status:** In Progress
  - [ ] HU-N.1: [Story title]
  - [ ] HU-N.2: [Story title]
  - [ ] HU-N.3: [Story title]
```

### Step 5: Summary

```
=== FEATURE STARTED ===
Feature: FEAT-N — [Name]
Hypothesis: [One-line]
Stories identified: N
Workspace: .spec/work/FEAT-N/

Next step: Run @start-objective HU-N.1 to plan the first User Story.
```

---

## Output

| File | Content |
|:-----|:--------|
| `.spec/work/FEAT-N/README.md` | Benefit Hypothesis + Story list |
| `docs/BACKLOG.md` | Updated with new Feature stories |

---

## Post-conditions

- Every Story has at least 2 BDD criteria and 1 error scenario.
- The Feature has a complete Benefit Hypothesis (no empty fields).
- `docs/BACKLOG.md` reflects the new hierarchy.
