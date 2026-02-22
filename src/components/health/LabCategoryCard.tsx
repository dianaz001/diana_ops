import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { LabCategory } from '../../types/health';
import { StatusBadge } from './StatusBadge';
import { TrendCell } from './TrendCell';

interface LabCategoryCardProps {
  category: LabCategory;
  defaultOpen?: boolean;
  trendData?: Map<string, { date: string; value: number }[]>;
}

export function LabCategoryCard({ category, defaultOpen = true, trendData }: LabCategoryCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const optimalCount = category.results.filter(
    (r) => r.status === 'optimal' || r.status === 'normal'
  ).length;
  const total = category.results.length;

  return (
    <div className="bg-white/50 backdrop-blur rounded-2xl one-pixel-border overflow-hidden hover:shadow-md hover:shadow-[#195de6]/5 transition-all">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#195de6]/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{category.icon}</span>
          <span className="text-sm font-medium text-slate-800 tracking-wide">{category.name}</span>
          <span className="text-[10px] text-[#195de6]/60 tracking-widest uppercase">
            {optimalCount}/{total} in range
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-300" />
        )}
      </button>

      {/* Results Table */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#195de6]/5">
                <th className="text-left px-6 py-3 text-[9px] tracking-[0.3em] uppercase font-light text-slate-400">
                  Test
                </th>
                <th className="text-left px-6 py-3 text-[9px] tracking-[0.3em] uppercase font-light text-slate-400">
                  Result (SI)
                </th>
                <th className="text-left px-6 py-3 text-[9px] tracking-[0.3em] uppercase font-light text-slate-400 hidden sm:table-cell">
                  Standard
                </th>
                <th className="text-left px-6 py-3 text-[9px] tracking-[0.3em] uppercase font-light text-slate-400">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-[9px] tracking-[0.3em] uppercase font-light text-slate-400 hidden md:table-cell">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {category.results.map((result) => (
                <tr
                  key={result.testName}
                  className="border-b border-[#195de6]/[0.04] hover:bg-[#195de6]/[0.03] transition-colors"
                >
                  <td className="px-6 py-3 text-sm font-medium text-slate-800">
                    {result.testName}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-600">
                    {result.valueSI}
                  </td>
                  <td className="px-6 py-3 text-xs text-[#195de6]/50 font-mono hidden sm:table-cell">
                    {result.valueStandard}
                  </td>
                  <td className="px-6 py-3">
                    {result.referenceRange && !result.statusLabel.includes('Normal') && !result.statusLabel.includes('Optimal') ? (
                      <span className="text-xs text-slate-400">{result.referenceRange}</span>
                    ) : (
                      <StatusBadge status={result.status} label={result.statusLabel} />
                    )}
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell">
                    {trendData?.get(result.testName) && (
                      <TrendCell history={trendData.get(result.testName)!} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {category.note && (
            <div className="bg-[#195de6]/[0.03] border-t border-[#195de6]/5 px-6 py-3 text-[10px] text-slate-400 italic">
              {category.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
