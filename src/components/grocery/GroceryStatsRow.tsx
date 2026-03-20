import { DollarSign, ShoppingBag, Receipt, TrendingUp } from 'lucide-react';
import { useGroceryStore } from '../../stores/groceryStore';
import { useGroceryTheme } from '../../lib/grocery-theme';

export function GroceryStatsRow() {
  const { getTotalSpend, getItemCount, getAvgPerTrip, receipts, filters } = useGroceryStore();
  const gc = useGroceryTheme();

  const totalSpend = getTotalSpend();
  const itemCount = getItemCount();
  const avgPerTrip = getAvgPerTrip();
  const tripCount = receipts.filter((r) => new Date(r.receipt_date).getFullYear() === filters.year).length;

  const stats = [
    {
      label: 'Total Spend',
      value: `$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      sub: `${filters.year}`,
    },
    {
      label: 'Items Tracked',
      value: itemCount.toLocaleString(),
      icon: ShoppingBag,
      sub: 'all categories',
    },
    {
      label: 'Avg per Trip',
      value: `$${avgPerTrip.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      sub: `${tripCount} trips`,
    },
    {
      label: 'Receipts',
      value: tripCount.toLocaleString(),
      icon: Receipt,
      sub: 'scanned + manual',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {stats.map((s) => (
        <div key={s.label}
          className="rounded-xl p-4 border"
          style={{ background: gc.bgCard, borderColor: gc.borderCard }}>
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em]" style={{ color: gc.textMuted }}>
              {s.label}
            </span>
            <s.icon className="w-3.5 h-3.5" style={{ color: gc.accentGold }} />
          </div>
          <p className="text-[18px] font-bold tracking-tight" style={{ color: gc.text, fontFamily: "'SF Mono', 'Fira Code', ui-monospace, monospace" }}>
            {s.value}
          </p>
          <p className="text-[9px] mt-1 uppercase tracking-[0.1em]" style={{ color: gc.textSubtle }}>
            {s.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
