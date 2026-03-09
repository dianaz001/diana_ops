import { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGroceryStore } from '../../stores/groceryStore';
import { GROCERY_CATEGORIES } from '../../lib/grocery-categorizer';
import type { GroceryCategory } from '../../types/grocery';

// Top categories to show as stacked bars (the rest go into "Other")
const TOP_CATEGORIES: { key: GroceryCategory; label: string; color: string }[] =
  GROCERY_CATEGORIES
    .filter((c) => c.id !== 'other')
    .map((c) => ({ key: c.id, label: c.label, color: c.color }));

export function GroceryTrendChart() {
  const { getMonthlyData, filters } = useGroceryStore();
  const monthlyData = getMonthlyData();
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  // Calculate running avg for trend line
  const dataWithTrend = monthlyData.map((row, i) => {
    const slice = monthlyData.slice(Math.max(0, i - 2), i + 1);
    const avg = slice.reduce((s, r) => s + r.total, 0) / slice.length;
    return { ...row, trend: Math.round(avg * 100) / 100 };
  });

  const hasData = monthlyData.some((r) => r.total > 0);

  return (
    <div className="rounded-xl border p-4" style={{ background: '#fff', borderColor: 'rgba(232,222,209,0.6)' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] font-semibold" style={{ color: '#282627' }}>
          Spend by Month ({filters.year})
        </h2>
        <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: '#6B5B4F' }}>
          Stacked by category
        </span>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-[280px]">
          <p className="text-[12px]" style={{ color: '#9DAFD0' }}>No grocery data for {filters.year}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={dataWithTrend} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8DED1" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#6B5B4F' }}
              axisLine={{ stroke: '#E8DED1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#6B5B4F', fontFamily: "'SF Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '0.5rem',
                border: '1px solid #E8DED1',
                fontSize: '0.7rem',
                background: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
              formatter={(value, name) => [`$${Number(value ?? 0).toFixed(2)}`, String(name)]}
            />
            <Legend
              wrapperStyle={{ fontSize: '0.6rem', paddingTop: 4 }}
              onClick={(e) => {
                if (typeof e.dataKey === 'string') toggleSeries(e.dataKey);
              }}
              formatter={(value: string, entry) => {
                const isHidden = hiddenSeries.has(entry.dataKey as string);
                return (
                  <span style={{
                    color: isHidden ? '#ccc' : '#6B5B4F',
                    textDecoration: isHidden ? 'line-through' : 'none',
                    cursor: 'pointer',
                  }}>
                    {value}
                  </span>
                );
              }}
            />

            {TOP_CATEGORIES.map((cat, i) => (
              <Bar
                key={cat.key}
                dataKey={cat.key}
                stackId="spend"
                fill={cat.color}
                name={cat.label}
                hide={hiddenSeries.has(cat.key)}
                radius={i === TOP_CATEGORIES.length - 1 ? [3, 3, 0, 0] : undefined}
              />
            ))}

            <Line
              type="monotone"
              dataKey="trend"
              stroke="#4A6FA5"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              name="3-mo Avg"
              hide={hiddenSeries.has('trend')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
