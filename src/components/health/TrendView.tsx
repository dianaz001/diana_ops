import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { LabReport } from '../../types/health';
import { Sparkline } from './Sparkline';
import { StatusBadge } from './StatusBadge';

interface TrendViewProps {
  reports: LabReport[];
  trendData: Map<string, { date: string; value: number }[]>;
}

interface TrendItem {
  testName: string;
  categoryName: string;
  categoryIcon: string;
  currentValue: string;
  currentStatus: { status: 'optimal' | 'normal' | 'note' | 'warning' | 'danger'; label: string };
  unit: string;
  history: { date: string; value: number }[];
  change: number;
}

function buildTrendItems(reports: LabReport[], trendData: Map<string, { date: string; value: number }[]>): TrendItem[] {
  const latestReport = reports[0];
  if (!latestReport) return [];

  const items: TrendItem[] = [];

  for (const category of latestReport.categories) {
    for (const result of category.results) {
      const history = trendData.get(result.testName);
      if (!history || history.length < 1) continue;

      const latest = history[history.length - 1]?.value ?? 0;
      const previous = history.length >= 2 ? history[history.length - 2].value : latest;

      items.push({
        testName: result.testName,
        categoryName: category.name,
        categoryIcon: category.icon,
        currentValue: result.valueSI,
        currentStatus: { status: result.status, label: result.statusLabel },
        unit: result.unit || '',
        history,
        change: latest - previous,
      });
    }
  }

  return items;
}

function groupByCategory(items: TrendItem[]): Map<string, { icon: string; items: TrendItem[] }> {
  const groups = new Map<string, { icon: string; items: TrendItem[] }>();
  for (const item of items) {
    if (!groups.has(item.categoryName)) {
      groups.set(item.categoryName, { icon: item.categoryIcon, items: [] });
    }
    groups.get(item.categoryName)!.items.push(item);
  }
  return groups;
}

function TrendCategory({ name, icon, items }: { name: string; icon: string; items: TrendItem[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasMultiplePoints = items.some((i) => i.history.length >= 2);

  return (
    <div className="bg-white/50 backdrop-blur rounded-2xl one-pixel-border overflow-hidden hover:shadow-md hover:shadow-[#195de6]/5 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#195de6]/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-medium text-slate-800 tracking-wide">{name}</span>
          {!hasMultiplePoints && (
            <span className="text-[10px] text-slate-400 tracking-widest uppercase">
              Single report — trends show after 2+ reports
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-300" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-5 grid gap-3">
          {items.map((item) => (
            <TrendCard key={item.testName} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendCard({ item }: { item: TrendItem }) {
  const hasHistory = item.history.length >= 2;
  const arrow = item.change > 0 ? '\u2191' : item.change < 0 ? '\u2193' : '\u2192';
  const arrowColor =
    item.change > 0 ? 'text-amber-500' : item.change < 0 ? 'text-[#195de6]/60' : 'text-slate-300';

  return (
    <div className="flex items-center gap-4 bg-white/60 rounded-xl one-pixel-border px-5 py-3.5 hover:bg-[#195de6]/[0.02] transition-colors">
      {/* Test name + status */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800 truncate">{item.testName}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-xs text-slate-600">{item.currentValue}</span>
          <StatusBadge status={item.currentStatus.status} label={item.currentStatus.label} />
        </div>
      </div>

      {/* Sparkline + change */}
      {hasHistory ? (
        <div className="flex items-center gap-3 flex-shrink-0">
          <Sparkline points={item.history} width={120} height={36} />
          <div className="text-right min-w-[3rem]">
            <span className={`text-sm font-medium ${arrowColor}`}>{arrow}</span>
            <div className="text-[9px] tracking-wider text-slate-400 mt-0.5">
              {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-shrink-0 text-slate-300">
          <div className="w-[120px] h-[36px] rounded bg-slate-50 flex items-center justify-center">
            <span className="text-[9px] tracking-widest uppercase">No trend yet</span>
          </div>
        </div>
      )}

      {/* Date range */}
      {hasHistory && (
        <div className="hidden lg:block flex-shrink-0 text-right">
          <div className="text-[9px] tracking-widest uppercase text-slate-400">
            {format(parseISO(item.history[0].date), 'MMM yyyy')}
          </div>
          <div className="text-[9px] tracking-widest uppercase text-slate-400">
            to {format(parseISO(item.history[item.history.length - 1].date), 'MMM yyyy')}
          </div>
        </div>
      )}
    </div>
  );
}

export function TrendView({ reports, trendData }: TrendViewProps) {
  const items = buildTrendItems(reports, trendData);
  const grouped = groupByCategory(items);

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl opacity-30 mb-3">📈</div>
        <p className="text-lg font-light text-slate-600">No trend data yet</p>
        <p className="text-sm font-light text-slate-400 mt-1">
          Upload more reports to see how your values change over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {Array.from(grouped.entries()).map(([name, group]) => (
        <TrendCategory key={name} name={name} icon={group.icon} items={group.items} />
      ))}
    </div>
  );
}
