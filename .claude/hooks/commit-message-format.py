#!/usr/bin/env python3
"""Hook: Block commits containing AI attribution in the message.
Trigger: PreToolUse on Bash (when command contains git commit)
"""
import json
import os
import re
import sys

BLOCKED_PATTERNS = [
    r"Co-Authored-By:\s*Claude",
    r"Co-Authored-By:\s*Happy",
    r"Generated with \[?Claude Code\]?",
    r"via \[?Happy\]?",
    r"noreply@anthropic\.com",
    r"yesreply@happy\.engineering",
]

def main():
    tool_input = json.loads(os.environ.get("TOOL_INPUT", "{}"))
    command = tool_input.get("command", "")

    if "git commit" not in command:
        sys.exit(0)

    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            print(f"BLOCKED: Commit message contains AI attribution matching '{pattern}'.", file=sys.stderr)
            print("Per CLAUDE.md: commit messages must be clean and professional, no AI signatures.", file=sys.stderr)
            sys.exit(2)

    sys.exit(0)

if __name__ == "__main__":
    main()
