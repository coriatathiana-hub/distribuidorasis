# @estimate

> Analyze unestimated backlog items and assign T-shirt size estimates with rationale.
>
> **Model Hint: Auto** — Reasoning over documents, no code output.

---

## Trigger

The user invokes this command to estimate Features or User Stories that lack sizing.

**Usage:**
- `@estimate` — Estimate all unestimated items in `BACKLOG.md`
- `@estimate FEAT-N` — Estimate only items within a specific Feature

---

## Pre-conditions

1. Read `.spec/constitution.md` to load operating principles.
2. Read `docs/BACKLOG.md` to identify items without estimates.
3. Read `docs/PRD.md` for product context and scope.
4. Read `docs/TECH_SPEC.md` for technical complexity factors (data model, integrations, RLS).

---

## Role Activation

Switch to **Tech Lead** mode. You are assessing complexity, not implementing.

- Analyze beyond the surface: consider database changes, API work, UI/UX complexity,
  integrations, RLS policies, and edge cases.
- Be conservative: if unsure, estimate higher — it is safer to overestimate than to
  discover hidden complexity mid-implementation.
- Use relative sizing: compare items against each other for consistency.

---

## Estimation Scale

| Size | Description | Rough Duration | Guidance |
|:-----|:------------|:---------------|:---------|
| **XS** | Trivial change (text update, config, simple bug fix) | < 2 hours | Single file, no new logic |
| **S** | Simple feature (new field, basic UI component, simple query) | 2–8 hours | Few files, well-understood pattern |
| **M** | Standard feature (new page, CRUD operation, new API endpoint) | 1–3 days | Multiple files, some decisions needed |
| **L** | Complex feature (major refactor, new integration, complex state) | 3–7 days | Cross-cutting, multiple concerns |
| **XL** | Very complex (architectural change, complex algorithm, new subsystem) | > 1 week | **Should be broken down** before implementation |

---

## Steps

### Step 1: Identify Unestimated Items

Scan `docs/BACKLOG.md` for Features and User Stories that:
- Have no `> Estimate:` line
- Are marked as `TBD` or have no sizing information
- If a `FEAT-N` argument was provided, filter to only that Feature's items

### Step 2: Analyze Each Item

For each unestimated item:

1. Read its title, description, and acceptance criteria (if available in `.spec/work/FEAT-N/`).
2. Identify complexity drivers:
   - Database changes (new tables, migrations, RLS)
   - API/Server Actions needed
   - UI components and interactions
   - External integrations
   - Edge cases and error handling
3. Compare with already-estimated items for relative consistency.
4. Assign a T-shirt size with a brief rationale.

### Step 3: Flag XL Items

If any item is estimated as **XL**, recommend breaking it down:
- Suggest how to split it into smaller stories (each ideally M or smaller).
- Note this as a recommendation — do not modify the BACKLOG structure without user approval.

### Step 4: Update BACKLOG

Insert estimates into `docs/BACKLOG.md` under each item:

```markdown
- [ ] HU-N.M: [Story title]
  > Estimate: M | Requires new DB table, API endpoint, and form component.
```

For Features, add a rollup estimate:

```markdown
### FEAT-N: [Feature Name]
> Estimate: L (rollup) | 3 stories totaling ~4-5 days.
```

### Step 5: Summary

```
=== ESTIMATION COMPLETE ===
Items estimated: N
Breakdown: XS(n) S(n) M(n) L(n) XL(n)
XL items flagged for breakdown: [list or "none"]
Total estimated effort: [rough range]

Next step: Review estimates and run @start-objective HU-N.M for the highest-priority item.
```

---

## Output

| Artifact | Content |
|:---------|:--------|
| `docs/BACKLOG.md` | Updated with estimates and rationale per item |

---

## Post-conditions

- Every Feature and Story in scope has an `> Estimate:` line with size and rationale.
- XL items are flagged with a recommendation to break down.
- No existing BACKLOG content was removed — only estimates were added.
- Estimates are internally consistent (similar items have similar sizes).

---

## Rules

- **Never remove existing items** from the BACKLOG — only add estimation metadata.
- **Never auto-split XL items** without user approval — only recommend.
- **Always explain the rationale** — a bare size without reasoning is not useful.
- **Use the full scale** — if everything is "M", the estimates are not differentiating.
