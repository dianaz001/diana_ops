#!/usr/bin/env python3
"""Hook: Remind to grep for all instances of a pattern before committing.
Trigger: PostToolUse on Edit
"""
import sys

def main():
    print("Reminder: Before committing, grep the codebase for all instances of the pattern you just edited. Fix ALL occurrences, not just this one.")
    sys.exit(0)

if __name__ == "__main__":
    main()
