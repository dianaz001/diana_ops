Follow the dtverify workflow for Diana Portal Web.

## Verification Process

1. **Navigate to live site**: `https://diana.treedigits.ca`
   - ALWAYS test on the live deployed site, never localhost
2. **Pass the password gate** if present
3. **Test all interactive elements systematically**
4. **Save screenshots** with format `YYMMDD-diana-description.png` to `docs/reports/screenshots/`
5. **Fix issues immediately** when found — stop, fix, verify, continue
6. **Write report** to `docs/reports/dtverify-{date}-{scope}.md`
7. **Commit and push** the report

## Testing Checklist

### Password Gate
- [ ] Correct password grants access
- [ ] Wrong password shows error

### Navigation
- [ ] All tab/route links work
- [ ] Back/forward browser navigation works

### Dashboard
- [ ] Dashboard renders correctly
- [ ] Charts/visualizations load

### Forms & Inputs
- [ ] All form inputs accept values
- [ ] Submit buttons trigger expected actions
- [ ] Validation messages appear correctly

### Dark Mode
- [ ] Toggle works
- [ ] All components render correctly in both modes

### Responsive
- [ ] Mobile layout works
- [ ] Tablet layout works
