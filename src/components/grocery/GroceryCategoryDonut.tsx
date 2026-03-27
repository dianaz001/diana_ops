import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useGroceryStore } from '../../stores/groceryStore';
import { useGroceryTheme } from '../../lib/grocery-theme';
import { getCategoryColor } from '../../lib/grocery-categorizer';
import type { GroceryCategory } from '../../types/grocery';

export function GroceryCategoryDonut() {
  const { getCategoryBreakdown, filters } = useGroceryStore();
  const gc = useGroceryTheme();
  const breakdown = getCategoryBreakdown();

  const total = breakdown.reduce((s, b) => s + b.value, 0);
  const hasData = total > 0;

  return (
    <div className="rounded-xl border p-4 h-full flex flex-col"
      style={{ background: gc.bgCard, borderColor: gc.borderCard }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] font-semibold" style={{ color: gc.text }}>
          Allocation
        </h2>
        <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: gc.textMuted }}>
          {filters.year}
        </span>
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[12px]" style={{ color: gc.textSubtle }}>No data</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Chart */}
          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="75%"
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ percent, cx, cy, midAngle, innerRadius, outerRadius }: {
                    percent?: number; cx?: number; cy?: number; midAngle?: number;
                    innerRadius?: number; outerRadius?: number;
                  }) => {
                    const p = (percent ?? 0) * 100;
                    if (p < 5) return null;
                    const RADIAN = Math.PI / 180;
                    const radius = (innerRadius ?? 0) + ((outerRadius ?? 0) - (innerRadius ?? 0)) * 0.5;
                    const x = (cx ?? 0) + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
                    const y = (cy ?? 0) + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
                    return (
                      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
                        style={{ fontSize: '0.6rem', fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>
                        {`${p.toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.category} fill={getCategoryColor(entry.category as GroceryCategory)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Spend']}
                  contentStyle={{
                    borderRadius: '0.5rem',
                    border: `1px solid ${gc.border}`,
                    fontSize: '0.7rem',
                    background: gc.tooltipBg,
                    color: gc.text,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
            {breakdown.slice(0, 8).map((entry) => {
              const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
              return (
                <div key={entry.category} className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: getCategoryColor(entry.category as GroceryCategory) }} />
                  <span className="text-[9px] truncate" style={{ color: gc.textMuted }}>
                    {entry.name}
                  </span>
                  <span className="text-[9px] ml-auto flex-shrink-0"
                    style={{ color: gc.textSubtle, fontFamily: "'SF Mono', monospace" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
