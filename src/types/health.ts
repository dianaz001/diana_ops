export type LabStatus = 'optimal' | 'normal' | 'note' | 'warning' | 'danger';
export type Person = 'liz' | 'julian';

export interface LabResult {
  testName: string;
  valueSI: string;
  valueStandard: string;
  referenceRange?: string;
  status: LabStatus;
  statusLabel: string;
  /** Numeric value for tracking trends over time */
  numericValue?: number;
  unit?: string;
}

export interface LabCategory {
  id: string;
  name: string;
  icon: string;
  results: LabResult[];
  note?: string;
}

export interface LabReport {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  person: Person;
  reportId: string;
  provider: string;
  orderedBy: string;
  specimen: string;
  categories: LabCategory[];
  source?: 'seed' | 'uploaded';
  uploadedAt?: string; // ISO date when the report was imported
  rawFileName?: string; // original PDF filename for reference
}

/** Summary metric for the top-level dashboard cards */
export interface HealthMetricSummary {
  label: string;
  value: string;
  unit?: string;
  status: LabStatus;
  icon: string;
}
