import { useGroceryStore } from '../../stores/groceryStore';
import { useGroceryTheme } from '../../lib/grocery-theme';

const YEARS = [2026, 2025, 2024, 2023, 2022];
const MONTHS = [
  { value: null, label: 'All Months' },
  { value: 0, label: 'Jan' }, { value: 1, label: 'Feb' }, { value: 2, label: 'Mar' },
  { value: 3, label: 'Apr' }, { value: 4, label: 'May' }, { value: 5, label: 'Jun' },
  { value: 6, label: 'Jul' }, { value: 7, label: 'Aug' }, { value: 8, label: 'Sep' },
  { value: 9, label: 'Oct' }, { value: 10, label: 'Nov' }, { value: 11, label: 'Dec' },
];

export function GroceryFiltersBar() {
  const { filters, setFilters } = useGroceryStore();
  const gc = useGroceryTheme();

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {/* View mode toggle */}
      <div className="inline-flex rounded-lg overflow-hidden border" style={{ borderColor: gc.border }}>
        {(['category', 'store'] as const).map((mode) => (
          <button key={mode}
            onClick={() => setFilters({ viewMode: mode })}
            className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors"
            style={{
              background: filters.viewMode === mode ? gc.btnActiveBg : gc.btnInactiveBg,
              color: filters.viewMode === mode ? gc.btnActiveText : gc.btnInactiveText,
            }}>
            {mode === 'category' ? 'Category' : 'Store'}
          </button>
        ))}
      </div>

      {/* Granularity toggle */}
      <div className="inline-flex rounded-lg overflow-hidden border" style={{ borderColor: gc.border }}>
        {(['monthly', 'quarterly', 'annual'] as const).map((g) => (
          <button key={g}
            onClick={() => setFilters({ granularity: g })}
            className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors"
            style={{
              background: filters.granularity === g ? gc.btnActiveBg : gc.btnInactiveBg,
              color: filters.granularity === g ? gc.btnActiveText : gc.btnInactiveText,
            }}>
            {g === 'monthly' ? 'Monthly' : g === 'quarterly' ? 'Quarterly' : 'Annual'}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Year chips */}
      <div className="flex gap-1.5">
        {YEARS.map((y) => (
          <button key={y}
            onClick={() => setFilters({ year: filters.year === y ? new Date().getFullYear() : y })}
            className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors"
            style={{
              background: filters.year === y ? gc.btnActiveBg : gc.btnInactiveBg,
              color: filters.year === y ? gc.btnActiveText : gc.btnInactiveText,
              border: `1px solid ${filters.year === y ? gc.btnActiveBg : gc.border}`,
            }}>
            {y}
          </button>
        ))}
      </div>

      {/* Month filter (second row on mobile) */}
      <div className="w-full flex flex-wrap gap-1 sm:hidden">
        {MONTHS.map((m) => (
          <button key={m.label}
            onClick={() => setFilters({ month: m.value })}
            className="px-2 py-1 rounded text-[9px] font-medium transition-colors"
            style={{
              background: filters.month === m.value ? gc.btnActiveBg : 'transparent',
              color: filters.month === m.value ? gc.btnActiveText : gc.textMuted,
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Month select (desktop) */}
      <select
        value={filters.month === null ? '' : String(filters.month)}
        onChange={(e) => setFilters({ month: e.target.value === '' ? null : parseInt(e.target.value) })}
        className="hidden sm:block px-2.5 py-1.5 rounded-lg text-[11px] border focus:outline-none"
        style={{ borderColor: gc.border, color: gc.text, background: gc.bgCard }}>
        {MONTHS.map((m) => (
          <option key={m.label} value={m.value === null ? '' : String(m.value)}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}
