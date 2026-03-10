# @upgrade

> Check the SpecSeed framework version and guide post-upgrade reconciliation.

---

## Trigger

The user invokes this command to verify the framework version or reconcile settings after
running `scripts/upgrade.sh`.

**Usage:** `@upgrade` (no arguments)

---

## Pre-conditions

1. Read `.spec/VERSION` to determine the current framework version.
2. Read `.spec/config.md` to understand current project settings.
3. Check if `.spec/config.md.pre-upgrade` exists (indicates a recent upgrade with config changes).

---

## Steps

### Step 1: Version Report

Report the current SpecSeed version from `.spec/VERSION`.

```
SpecSeed version: X.Y.Z
```

If `.spec/VERSION` does not exist, report it as missing and recommend running
`scripts/adopt.sh` or `scripts/upgrade.sh`.

### Step 2: Config Reconciliation (if needed)

If `.spec/config.md.pre-upgrade` exists:

1. Read both `.spec/config.md` (new defaults) and `.spec/config.md.pre-upgrade` (user's previous settings).
2. Compare them and identify user-customized settings that differ from defaults.
3. Present a clear summary:

```
=== CONFIG RECONCILIATION ===
Settings that need to be restored from your previous config:
  - Git mode: [user's value] (new default: [default])
  - TDD mode: [user's value] (new default: [default])
  - [any other differences]
```

4. Ask the user which settings to restore.
5. Apply the chosen settings to `.spec/config.md`.
6. Delete `.spec/config.md.pre-upgrade` after reconciliation is complete.

### Step 3: Integrity Check

Verify that the upgrade left the project in a consistent state:

1. **Commands exist:** All commands referenced in `constitution.md` Section 5 have corresponding files in `.spec/commands/`.
2. **Templates exist:** `.spec/templates/` contains at least `FEATURE.md`, `USER_STORY.md`, `OBJECTIVE.md`.
3. **Symlinks valid:** Every file in `.claude/commands/` is a symlink pointing to an existing `.spec/commands/` file.
4. **Project docs untouched:** `docs/PRD.md`, `docs/BACKLOG.md`, `docs/TECH_SPEC.md`, `docs/CHANGELOG.md` exist (framework does not validate their content — they are project-owned).
5. **Active work preserved:** If `.spec/work/` has content, confirm it was not modified.

### Step 4: Summary

```
=== UPGRADE VERIFIED ===
Version: X.Y.Z
Config: [Reconciled / No changes needed / Pending reconciliation]
Integrity: [All checks passed / Issues found]

[If issues found, list them with recommended actions]
```

---

## Output

| Result | Action |
|:-------|:-------|
| Version current, no backup config | Report version, run integrity check |
| Backup config exists | Guide reconciliation, then integrity check |
| Issues found | List issues with fix recommendations |

---

## Post-conditions

- `.spec/config.md` reflects the user's intended settings.
- `.spec/config.md.pre-upgrade` is deleted (if it existed and was reconciled).
- All framework files are consistent with the reported version.
