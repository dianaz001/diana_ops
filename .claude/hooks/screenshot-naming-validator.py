#!/usr/bin/env python3
"""Hook: Validate screenshot filenames match YYMMDD-juliz-description.png format.
Trigger: PostToolUse on mcp__playwright__browser_take_screenshot
"""
import json
import re
import sys
import os

def main():
    tool_input = json.loads(os.environ.get("TOOL_INPUT", "{}"))

    filename = None
    for key in ("path", "file", "filename", "name", "outputPath"):
        if key in tool_input:
            filename = os.path.basename(str(tool_input[key]))
            break

    if not filename:
        return

    pattern = r'^\d{6}-[a-z]+-[a-z0-9-]+\.png$'

    if not re.match(pattern, filename):
        print(f"BLOCKED: Screenshot filename '{filename}' doesn't match required format.", file=sys.stderr)
        print(f"Required format: YYMMDD-juliz-description.png", file=sys.stderr)
        print(f"Example: 260320-juliz-dashboard-home.png", file=sys.stderr)
        sys.exit(2)

if __name__ == "__main__":
    main()
