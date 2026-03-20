#!/bin/bash
# Pre-commit hook: verify TypeScript build passes before allowing git commit
# Triggered by PreToolUse on Bash when command contains "git commit"

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)

if echo "$COMMAND" | grep -q "git commit"; then
  echo "Running build check before commit..."

  if [ -f "package.json" ]; then
    BUILD_OUTPUT=$(npm run build 2>&1)
    BUILD_EXIT=$?

    if [ $BUILD_EXIT -ne 0 ]; then
      echo "BLOCKED: Build failed. Fix build errors before committing."
      echo "$BUILD_OUTPUT"
      exit 2
    fi
    echo "Build passed. Proceeding with commit."
  fi
fi

exit 0
