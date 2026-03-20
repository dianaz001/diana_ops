# DT Hooks — Juliz Portal Web Guardrails

> **Note**: The actual hooks are configured in `.claude/settings.json` under `hooks.PreToolUse` and `hooks.PostToolUse`.
> This file serves as documentation.

## Hook Architecture

```
+-----------------------------------------------------------------------+
|                     JULIZ PORTAL HOOK SYSTEM                          |
+-----------------------------------------------------------------------+
|                                                                       |
|  PreToolUse (BLOCKING - prevents bad actions)                         |
|  +-- Bash (git commit) -> commit-message-format.py (AI attribution)  |
|  +-- Bash (git commit) -> pre-commit-build-check.sh (broken builds)  |
|                                                                       |
|  PostToolUse (GUIDANCE - provides feedback after actions)             |
|  +-- take_screenshot   -> screenshot-naming-validator.py (YYMMDD)    |
|  +-- Edit              -> grep-before-fix-reminder.py (grep all)     |
|                                                                       |
|  UserPromptSubmit                                                     |
|  +-- (any prompt)      -> set-tab-title.js (Terminal tab title)      |
|                                                                       |
+-----------------------------------------------------------------------+
```

## Files

| File | Type | Purpose |
|------|------|---------|
| `commit-message-format.py` | PreToolUse | Blocks AI attribution in commits |
| `pre-commit-build-check.sh` | PreToolUse | Blocks commits with broken builds |
| `screenshot-naming-validator.py` | PostToolUse | Screenshot filename validation |
| `grep-before-fix-reminder.py` | PostToolUse | Grep all instances reminder |
| `dthook.md` | Documentation | This file |
