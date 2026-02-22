import { Sparkline } from './Sparkline';

interface TrendCellProps {
  history: { date: string; value: number }[];
}

export function TrendCell({ history }: TrendCellProps) {
  if (history.length < 2) return null;

  const latest = history[history.length - 1].value;
  const previous = history[history.length - 2].value;
  const diff = latest - previous;
  const arrow = diff > 0 ? '\u2191' : diff < 0 ? '\u2193' : '\u2192';
  const arrowColor =
    diff > 0 ? 'text-amber-500' : diff < 0 ? 'text-[#195de6]/60' : 'text-slate-300';

  return (
    <div className="flex items-center gap-2">
      <Sparkline points={history} />
      <span
        className={`text-[10px] font-medium tracking-wider ${arrowColor}`}
        title={`Change: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}`}
      >
        {arrow}
      </span>
    </div>
  );
}
