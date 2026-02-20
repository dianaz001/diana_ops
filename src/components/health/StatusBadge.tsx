import type { LabStatus } from '../../types/health';

const statusStyles: Record<LabStatus, string> = {
  optimal: 'bg-emerald-100 text-emerald-800',
  normal: 'bg-green-50 text-green-700',
  note: 'bg-gray-100 text-gray-700',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
};

interface StatusBadgeProps {
  status: LabStatus;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[status]}`}
    >
      {label}
    </span>
  );
}
