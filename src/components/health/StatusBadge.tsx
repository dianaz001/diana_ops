import type { LabStatus } from '../../types/health';

const statusStyles: Record<LabStatus, string> = {
  optimal: 'bg-[#195de6]/10 text-[#195de6]',
  normal: 'bg-emerald-50 text-emerald-600',
  note: 'bg-slate-100 text-slate-500',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
};

interface StatusBadgeProps {
  status: LabStatus;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block text-[10px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusStyles[status]}`}
    >
      {label}
    </span>
  );
}
