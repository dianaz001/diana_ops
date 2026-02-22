import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { healthReports } from '../data/health-data';
import type { LabReport, Person } from '../types/health';

interface HealthState {
  uploadedReports: LabReport[];
  hiddenReportIds: string[];
  addReports: (reports: LabReport[]) => void;
  removeReport: (id: string) => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      uploadedReports: [],
      hiddenReportIds: [],

      addReports: (reports) =>
        set((state) => ({
          uploadedReports: [
            ...state.uploadedReports,
            ...reports.filter(
              (r) => !state.uploadedReports.some((existing) => existing.id === r.id)
            ),
          ],
        })),

      removeReport: (id) =>
        set((state) => ({
          uploadedReports: state.uploadedReports.filter((r) => r.id !== id),
          hiddenReportIds: state.hiddenReportIds.includes(id)
            ? state.hiddenReportIds
            : [...state.hiddenReportIds, id],
        })),
    }),
    {
      name: 'juliz-portal-health',
      partialize: (state) => ({
        uploadedReports: state.uploadedReports,
        hiddenReportIds: state.hiddenReportIds,
      }),
    }
  )
);

/** Get all reports (seed + uploaded) merged and sorted, excluding hidden */
export function getAllReports(uploadedReports: LabReport[], hiddenReportIds: string[] = []): LabReport[] {
  const seed = healthReports.map((r) => ({ ...r, source: 'seed' as const }));
  return [...seed, ...uploadedReports]
    .filter((r) => !hiddenReportIds.includes(r.id))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Get reports for a specific person */
export function getReportsForPerson(
  uploadedReports: LabReport[],
  person: Person,
  hiddenReportIds: string[] = []
): LabReport[] {
  return getAllReports(uploadedReports, hiddenReportIds).filter((r) => r.person === person);
}

/** Get all unique test dates for a person */
export function getTestDates(uploadedReports: LabReport[], person: Person, hiddenReportIds: string[] = []): string[] {
  return getReportsForPerson(uploadedReports, person, hiddenReportIds).map((r) => r.date);
}

/** Get a specific report by person and date */
export function getReport(
  uploadedReports: LabReport[],
  person: Person,
  date: string,
  hiddenReportIds: string[] = []
): LabReport | undefined {
  return getAllReports(uploadedReports, hiddenReportIds).find(
    (r) => r.person === person && r.date === date
  );
}

/** Build trend data: map from test name to historical {date, value} pairs */
export function buildTrendData(
  reports: LabReport[]
): Map<string, { date: string; value: number }[]> {
  const trends = new Map<string, { date: string; value: number }[]>();
  const sorted = [...reports].sort((a, b) => a.date.localeCompare(b.date));

  for (const report of sorted) {
    for (const category of report.categories) {
      for (const result of category.results) {
        if (result.numericValue !== undefined) {
          const key = result.testName;
          if (!trends.has(key)) trends.set(key, []);
          trends.get(key)!.push({ date: report.date, value: result.numericValue });
        }
      }
    }
  }

  return trends;
}
