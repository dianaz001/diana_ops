# PR Merge Skill
1. List open PRs: `gh pr list`
2. For each PR to merge, BEFORE any action:
   - Show the PR's base branch (merge target) and head branch
   - Confirm with user if target looks correct
3. Checkout the PR branch: `gh pr checkout <number>`
4. Run `npm run build` to verify TypeScript build passes
5. Merge: `gh pr merge <number> --squash`
6. After merge, verify commit is on the correct target branch
7. Sync all related branches
