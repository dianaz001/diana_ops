Review the entire conversation history and list every user-submitted prompt.

## Rules

- Extract ONLY messages typed by the user — skip system reminders, hook outputs, assistant responses, and automated messages
- Display in chronological order, numbered starting at 1
- Truncate prompts longer than 80 characters with `...`
- Include short prompts ("yes", "ok", etc.) — every user message counts
- Include the current `/prompts` invocation as the final entry
- Do NOT add commentary, analysis, or suggestions — just the list

## Output Format

Use this EXACT format — numbered prompts with italic text and divider lines between each:

```
**User Prompt 1:** *"the prompt text here"*

---

**User Prompt 2:** *"/prompts"*

— 2 prompts
```
