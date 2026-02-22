import type { LabReport } from '../../types/health';

interface SummaryCardsProps {
  report: LabReport;
}

interface MetricCard {
  label: string;
  value: string;
  detail: string;
  icon: string;
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
          className="bg-white/40 backdrop-blur rounded-2xl one-pixel-border p-5 hover:shadow-lg hover:shadow-[#195de6]/5 transition-all"
        >
          <span className="text-lg">{metric.icon}</span>
          <div className="text-[10px] tracking-[0.3em] uppercase font-medium text-slate-500 mt-2">
            {metric.label}
          </div>
          <div className="text-2xl font-light tracking-tighter text-slate-900 mt-1">
            {metric.value}
          </div>
          <div className="text-[10px] tracking-wider uppercase text-[#195de6] mt-1">
            {metric.detail}
          </div>
        </div>
      ))}
    </div>
  );
}
