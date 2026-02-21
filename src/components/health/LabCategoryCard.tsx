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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{category.icon}</span>
          <span className="font-semibold text-gray-900">{category.name}</span>
          <span className="text-xs text-gray-400 font-medium">
            {optimalCount}/{total} in range
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Results Table */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Test
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Result (SI)
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Standard
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {category.results.map((result) => (
                <tr
                  key={result.testName}
                  className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {result.testName}
                  </td>
                  <td className="px-5 py-3 text-gray-700 font-mono text-xs">
                    {result.valueSI}
                  </td>
                  <td className="px-5 py-3 text-blue-600 font-mono text-xs hidden sm:table-cell">
                    {result.valueStandard}
                  </td>
                  <td className="px-5 py-3">
                    {result.referenceRange && !result.statusLabel.includes('Normal') && !result.statusLabel.includes('Optimal') ? (
                      <span className="text-xs text-gray-500">{result.referenceRange}</span>
                    ) : (
                      <StatusBadge status={result.status} label={result.statusLabel} />
                    )}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    {trendData?.get(result.testName) && (
                      <TrendCell history={trendData.get(result.testName)!} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {category.note && (
            <div className="px-5 py-3 bg-gray-50 border-t border-dashed border-gray-200 text-xs text-gray-500 italic">
              {category.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
