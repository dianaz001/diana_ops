import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { healthReports } from '../data/health-data';
import type { LabReport, Person } from '../types/health';

interface HealthState {
  uploadedReports: LabReport[];
  hiddenReportIds: string[];
  archivedReportIds: string[];
  isLoading: boolean;
  hasFetched: boolean;

  // Actions
  fetchReports: () => Promise<void>;
  addReports: (reports: LabReport[]) => void;
  removeReport: (id: string) => void;
  archiveReport: (id: string) => void;
  restoreReport: (id: string) => void;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  uploadedReports: [],
  hiddenReportIds: [],
  archivedReportIds: [],
  isLoading: false,
  hasFetched: false,

  fetchReports: async () => {
    if (get().hasFetched) return;
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('diana_health_reports')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const uploaded: LabReport[] = [];
      const hidden: string[] = [];
      const archived: string[] = [];

      for (const row of data || []) {
        const report = row.report_data as LabReport;
        report.id = row.id;
        report.source = 'uploaded';
        uploaded.push(report);
        if (row.is_hidden) hidden.push(row.id);
        if (row.is_archived) archived.push(row.id);
      }

      // Migrate any localStorage data that isn't in DB yet
      const localData = localStorage.getItem('diana-portal-health');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          const localReports: LabReport[] = parsed?.state?.uploadedReports || [];
          const localHidden: string[] = parsed?.state?.hiddenReportIds || [];
          const localArchived: string[] = parsed?.state?.archivedReportIds || [];

          const dbIds = new Set(uploaded.map((r) => r.id));
          const toMigrate = localReports.filter((r) => !dbIds.has(r.id));

          if (toMigrate.length > 0) {
            const rows = toMigrate.map((r) => ({
              id: r.id,
              person: r.person,
              date: r.date,
              report_data: r,
              is_hidden: localHidden.includes(r.id),
              is_archived: localArchived.includes(r.id),
            }));

            await supabase.from('diana_health_reports').upsert(rows);

            for (const r of toMigrate) {
              r.source = 'uploaded';
              uploaded.push(r);
            }
            for (const id of localHidden) {
              if (!hidden.includes(id)) hidden.push(id);
            }
            for (const id of localArchived) {
              if (!archived.includes(id)) archived.push(id);
            }
          }

          // Also migrate hidden/archived flags for seed reports
          const seedHidden = localHidden.filter((id) => !dbIds.has(id) && !toMigrate.some((r) => r.id === id));
          const seedArchived = localArchived.filter((id) => !dbIds.has(id) && !toMigrate.some((r) => r.id === id));

          for (const id of seedHidden) {
            if (!hidden.includes(id)) hidden.push(id);
            await supabase.from('diana_health_reports').upsert({
              id,
              person: 'diana',
              date: '1970-01-01',
              report_data: {},
              is_hidden: true,
              is_archived: seedArchived.includes(id),
            });
          }
          for (const id of seedArchived) {
            if (!archived.includes(id)) archived.push(id);
            if (!seedHidden.includes(id)) {
              await supabase.from('diana_health_reports').upsert({
                id,
                person: 'diana',
                date: '1970-01-01',
                report_data: {},
                is_hidden: false,
                is_archived: true,
              });
            }
          }

          // Clear localStorage after successful migration
          localStorage.removeItem('diana-portal-health');
        } catch {
          // localStorage parse failed, ignore
        }
      }

      set({ uploadedReports: uploaded, hiddenReportIds: hidden, archivedReportIds: archived, isLoading: false, hasFetched: true });
    } catch (err) {
      console.error('Failed to fetch health reports:', err);
      set({ isLoading: false, hasFetched: true });
    }
  },

  addReports: async (reports) => {
    const state = get();
    const newReports = reports.filter(
      (r) => !state.uploadedReports.some((existing) => existing.id === r.id)
    );

    if (newReports.length === 0) return;

    // Optimistic update
    set({
      uploadedReports: [...state.uploadedReports, ...newReports],
    });

    // Save to Supabase
    const rows = newReports.map((r) => ({
      id: r.id,
      person: r.person,
      date: r.date,
      report_data: r,
      is_hidden: false,
      is_archived: false,
    }));

    const { error } = await supabase.from('diana_health_reports').upsert(rows);
    if (error) console.error('Failed to save health reports:', error);
  },

  removeReport: async (id) => {
    set((state) => ({
      uploadedReports: state.uploadedReports.filter((r) => r.id !== id),
      hiddenReportIds: state.hiddenReportIds.includes(id)
        ? state.hiddenReportIds
        : [...state.hiddenReportIds, id],
    }));

    // Check if row exists in DB
    const { data } = await supabase
      .from('diana_health_reports')
      .select('id')
      .eq('id', id)
      .single();

    if (data) {
      await supabase.from('diana_health_reports').update({ is_hidden: true }).eq('id', id);
    } else {
      // Seed report — create a flag row
      await supabase.from('diana_health_reports').upsert({
        id,
        person: 'diana',
        date: '1970-01-01',
        report_data: {},
        is_hidden: true,
        is_archived: false,
      });
    }
  },

  archiveReport: async (id) => {
    set((state) => ({
      archivedReportIds: state.archivedReportIds.includes(id)
        ? state.archivedReportIds
        : [...state.archivedReportIds, id],
    }));

    const { data } = await supabase
      .from('diana_health_reports')
      .select('id')
      .eq('id', id)
      .single();

    if (data) {
      await supabase.from('diana_health_reports').update({ is_archived: true }).eq('id', id);
    } else {
      await supabase.from('diana_health_reports').upsert({
        id,
        person: 'diana',
        date: '1970-01-01',
        report_data: {},
        is_hidden: false,
        is_archived: true,
      });
    }
  },

  restoreReport: async (id) => {
    set((state) => ({
      archivedReportIds: state.archivedReportIds.filter((rid) => rid !== id),
    }));

    await supabase.from('diana_health_reports').update({ is_archived: false }).eq('id', id);
  },
}));

/** Get all reports (seed + uploaded) merged and sorted, excluding hidden and optionally archived */
export function getAllReports(
  uploadedReports: LabReport[],
  hiddenReportIds: string[] = [],
  archivedReportIds: string[] = [],
  includeArchived = false
): LabReport[] {
  const seed = healthReports.map((r) => ({ ...r, source: 'seed' as const }));
  return [...seed, ...uploadedReports]
    .filter((r) => !hiddenReportIds.includes(r.id))
    .filter((r) => includeArchived ? archivedReportIds.includes(r.id) : !archivedReportIds.includes(r.id))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Get reports for a specific person */
export function getReportsForPerson(
  uploadedReports: LabReport[],
  person: Person,
  hiddenReportIds: string[] = [],
  archivedReportIds: string[] = [],
  includeArchived = false
): LabReport[] {
  return getAllReports(uploadedReports, hiddenReportIds, archivedReportIds, includeArchived)
    .filter((r) => r.person === person);
}

/** Get all unique test dates for a person */
export function getTestDates(
  uploadedReports: LabReport[],
  person: Person,
  hiddenReportIds: string[] = [],
  archivedReportIds: string[] = [],
  includeArchived = false
): string[] {
  return getReportsForPerson(uploadedReports, person, hiddenReportIds, archivedReportIds, includeArchived)
    .map((r) => r.date);
}

/** Get a specific report by person and date */
export function getReport(
  uploadedReports: LabReport[],
  person: Person,
  date: string,
  hiddenReportIds: string[] = [],
  archivedReportIds: string[] = [],
  includeArchived = false
): LabReport | undefined {
  return getAllReports(uploadedReports, hiddenReportIds, archivedReportIds, includeArchived).find(
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
