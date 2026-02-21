import { Sparkline } from './Sparkline';

interface TrendCellProps {
  history: { date: string; value: number }[];
}

export function TrendCell({ history }: TrendCellProps) {
  if (history.length < 2) return null;

  const latest = history[history.length - 1].value;
  const previous = history[history.length - 2].value;
  const diff = latest - previous;
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
  const arrowColor =
    diff > 0 ? 'text-amber-500' : diff < 0 ? 'text-blue-500' : 'text-gray-400';

  return (
    <div className="flex items-center gap-2">
      <Sparkline points={history} />
      <span className={`text-xs font-medium ${arrowColor}`} title={`Change: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}`}>
        {arrow}
      </span>
    </div>
  );
}
