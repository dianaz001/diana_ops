import type { LabReport } from '../../types/health';

interface SummaryCardsProps {
  report: LabReport;
}

interface MetricCard {
  label: string;
  value: string;
  detail: string;
  icon: string;
  color: string;
}

function extractSummaryMetrics(report: LabReport): MetricCard[] {
  const metrics: MetricCard[] = [];
  const findResult = (categoryId: string, testName: string) => {
    const cat = report.categories.find((c) => c.id === categoryId);
    return cat?.results.find((r) => r.testName === testName);
  };

  // Cholesterol ratio
  const cholRatio = findResult('lipids', 'Chol/HDL Ratio');
  if (cholRatio) {
    metrics.push({
      label: 'Cholesterol Ratio',
      value: cholRatio.valueSI,
      detail: 'Low cardiovascular risk',
      icon: '❤️',
      color: 'from-rose-50 to-pink-50 border-rose-200',
    });
  }

  // A1C
  const a1c = findResult('metabolic', 'Hemoglobin A1C');
  if (a1c) {
    metrics.push({
      label: 'A1C (Blood Sugar)',
      value: a1c.valueSI,
      detail: 'Normal range',
      icon: '🩸',
      color: 'from-blue-50 to-indigo-50 border-blue-200',
    });
  }

  // Kidney
  const egfr = findResult('metabolic', 'eGFR (Kidney Function)');
  if (egfr) {
    metrics.push({
      label: 'Kidney (eGFR)',
      value: egfr.valueSI,
      detail: 'Optimal function',
      icon: '🧪',
      color: 'from-emerald-50 to-teal-50 border-emerald-200',
    });
  }

  // TSH
  const tsh = findResult('vitamins', 'TSH');
  if (tsh) {
    metrics.push({
      label: 'Thyroid (TSH)',
      value: tsh.valueSI,
      detail: 'In range',
      icon: '🧬',
      color: 'from-violet-50 to-purple-50 border-violet-200',
    });
  }

  // Hemoglobin
  const hb = findResult('cbc', 'Hemoglobin');
  if (hb) {
    metrics.push({
      label: 'Hemoglobin',
      value: hb.valueSI,
      detail: 'Healthy level',
      icon: '🔬',
      color: 'from-amber-50 to-yellow-50 border-amber-200',
    });
  }

  return metrics;
}

export function SummaryCards({ report }: SummaryCardsProps) {
  const metrics = extractSummaryMetrics(report);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`bg-gradient-to-br ${metric.color} border rounded-xl p-4 transition-transform hover:scale-[1.02]`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{metric.icon}</span>
            <span className="text-xs font-semibold text-gray-600 leading-tight">
              {metric.label}
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">{metric.value}</div>
          <div className="text-xs text-gray-500 mt-1">{metric.detail}</div>
        </div>
      ))}
    </div>
  );
}
