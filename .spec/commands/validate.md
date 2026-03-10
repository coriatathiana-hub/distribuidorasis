# @validate

> Run the SpecSeed Poka-Yoke validation schema against project artifacts.
>
> **Model Hint: Auto** — Lightweight read-only analysis of `.md` files.

---

## Trigger

Invoked automatically as Step 0 of `@start-objective`, or manually by the user at any time.

**Usage:**
- `@validate` — validate all artifacts
- `@validate HU-N.M` — validate a specific Story and its context
- `@validate FEAT-N` — validate a specific Feature

### When to Validate (Recommended)

| Moment | Why |
|:-------|:----|
| Before `@start-objective` | **Automatic** — runs as Step 0 of the command |
| After `@start-feature` | Verify the Feature has a complete Benefit Hypothesis and its HUs have BDD criteria |
| After editing `PRD.md` or `TECH_SPEC.md` | Detect inconsistencies (e.g., referenced tables that don't exist) |
| After editing `current_objective.md` post-approval | Ensure the plan is still valid after manual changes |
| When adopting SpecSeed on an existing project | Health check of documentation completeness |
| When resuming work after a break | Quick sanity check before continuing |

---

## Pre-conditions

1. Read `.spec/constitution.md` to load operating principles.
2. Read the target artifact(s) and their parent documents.

---

## Execution Strategy (Cursor Optimization)

To conserve credits, delegate the bulk of validation work to a **fast subagent** using
the Task tool. The main agent only synthesizes the final report.

1. **Delegate:** Use the Task tool with `model: "fast"` and `subagent_type: "explore"` to
   read all target artifacts and run the checklist checks below. The subagent prompt should
   include the full checklist criteria and return a structured list of PASS/WARNING/BLOCKER
   findings per artifact.
2. **Synthesize:** The main agent receives the subagent findings and formats the final
   Validation Report (see Report Format below).
3. **Decide:** The main agent applies the Poka-Yoke rule (BLOCKER = no code files).

This pattern keeps the expensive main-agent context focused on decision-making while
the lightweight pattern-matching runs on a cheaper model.

---

## Validation Checklists

### PRD.md (Global Pre-requisite)

- [ ] `# Vision`: Product purpose is clear and unambiguous.
- [ ] `# Users`: At least 2 personas or key roles identified.
- [ ] `# MVP Scope`: Explicit list of what is IN and OUT.
- [ ] `# KPIs`: At least 1 measurable success indicator.

### TECH_SPEC.md (Global Pre-requisite)

- [ ] `# Stack`: Defines Framework, DB, UI, and Language.
- [ ] `# Data Model`: List of main tables with key columns.
- [ ] `# Authentication`: Access method defined.
- [ ] `# Security (RLS)`: Definition of who can read/write which entities.

### Feature (FEAT-N)

- [ ] `ID`: Uses `FEAT-N` naming convention.
- [ ] `Benefit Hypothesis`: Complete "Para/Que/Esta Feature/Esperamos/Sabremos" structure.
- [ ] `Associated Stories`: List of `HU-N.M` IDs.

### User Story (HU-N.M)

- [ ] `C/Q/P Format`: Complete "Como [rol], quiero [acción], para [beneficio]" structure.
- [ ] `BDD Criteria`: At least 2 scenarios in "Dado que/Cuando/Entonces" format.
- [ ] `Error Scenario`: At least 1 exception or error handling scenario.

### Plan (current_objective.md)

- [ ] `Atomicity`: Tasks broken into steps under 60 minutes.
- [ ] `Cycle Markers`: Markers per technical task matching `tdd_mode` from `.spec/config.md`:
  - `strict`: `RED → GREEN → REFACTOR`
  - `flexible`: `IMPLEMENT → TEST → REFACTOR`
  - `off`: `IMPLEMENT → REFACTOR`
- [ ] `Verification`: Specific command to validate each task.
- [ ] `Manual Test`: Final interactive manual integration task.

---

## Automatic Validation Rules

| Item | Pattern to Find | Severity | Failure Message | Suggested Fix |
|:-----|:----------------|:---------|:----------------|:--------------|
| **Clarity** | `[NEEDS CLARIFICATION]` | **BLOCKER** | Unresolved questions in the document. | Answer the `[NEEDS CLARIFICATION]` tags. |
| **Identity** | `FEAT-` or `HU-` | **BLOCKER** | Missing SAFe hierarchical ID. | Assign an ID following BACKLOG.md. |
| **Value** | `Si entregamos..., entonces...` | **BLOCKER** | Feature without benefit hypothesis. | Define the measurable business benefit. |
| **BDD** | `Entonces:` | **WARNING** | Acceptance criteria not testable. | Use Dado/Cuando/Entonces format. |
| **Security** | `RLS` or `Policy` | **BLOCKER** | No security logic detected. | Define RLS policy in TECH_SPEC.md. |
| **Hallucination** | References to non-existent files | **BLOCKER** | Plan references files not in the tree. | Create the files or fix the path. |
| **Infrastructure** | Plan has infra tasks but `docs/SETUP.md` missing | **WARNING** | Infrastructure changes planned without SETUP.md. | Create `docs/SETUP.md` from `.spec/templates/SETUP.md`. |
| **TDD Off** | `tdd_mode: off` in `config.md` | **WARNING** | No automated test contract for this objective. | Consider switching to `flexible` or `strict` mode. |

---

## Validation Levels

| Change Type | Level | What Gets Validated |
|:------------|:------|:--------------------|
| **Hotfix** | **Minimum** | Presence of `HU-ID` and at least 1 acceptance criterion. |
| **Bug fix** | **Basic** | `HU-ID` + Criteria + Root cause analysis (5 Whys). |
| **Simple Story** | **Standard** | Feature (Context) + Story (Functional) + BDD + Plan (TDD). |
| **Complex Story** | **Complete** | All above + Sequence diagram or ADR in `.spec/work/`. |
| **New Feature** | **Exhaustive** | PRD + Tech Spec + Benefit Hypothesis + All Feature HUs. |

---

## Report Format

Generate this block in the Cursor chat:

```
=== VALIDATION REPORT ===
Target: [HU-ID or FEAT-ID] — [Name]
Level: [Detected level]

✅ [Artifact]: [Criterion passed]
⚠️ [Artifact]: [Quality warning]
❌ [Artifact]: [Critical error — blocks implementation]

RESULT: [PASSED | WARNINGS | BLOCKED]
ACTION: [Immediate instruction for the user or AI]
```

---

## Integration Rules

1. **Automatic Execution:** Validation is **Step 0** of `@start-objective`. Before generating
   `current_objective.md`, the AI must self-evaluate against this schema.
2. **Skip Mechanism:** The `--skip-validation` flag is permitted only for Spikes/prototyping.
   When used, all generated code must include `// WARNING: Unverified Spec`.
3. **Result Logging:** The validation report must be saved at session end in
   `.spec/history/YYYY-MM-DD_ID_validation.md` as evidence of technical compliance.

---

## Poka-Yoke Rule

**If any BLOCKER is detected, the agent is FORBIDDEN from writing any code file (`.ts`, `.sql`,
`.tsx`). It may only edit `.md` files until validation passes.**
