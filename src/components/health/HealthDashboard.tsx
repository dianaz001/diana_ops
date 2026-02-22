import { useState } from 'react';
import { Calendar, User, FileText, ArrowLeft, Upload, Trash2, Archive, RotateCcw, ClipboardList, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  useHealthStore,
  getReportsForPerson,
  getTestDates,
  getReport,
  buildTrendData,
} from '../../stores/healthStore';
import type { Person } from '../../types/health';
import { SummaryCards } from './SummaryCards';
import { LabCategoryCard } from './LabCategoryCard';
import { ReportUpload } from './ReportUpload';
import { TrendView } from './TrendView';

type ViewMode = 'results' | 'trends';

interface HealthDashboardProps {
  onBack: () => void;
}

export function HealthDashboard({ onBack }: HealthDashboardProps) {
  const { uploadedReports, hiddenReportIds, archivedReportIds, removeReport, archiveReport, restoreReport } = useHealthStore();
  const [selectedPerson, setSelectedPerson] = useState<Person>('liz');
  const [showUpload, setShowUpload] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewingArchive, setViewingArchive] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('results');

  const dates = getTestDates(uploadedReports, selectedPerson, hiddenReportIds, archivedReportIds, viewingArchive);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || '');

  const report = getReport(uploadedReports, selectedPerson, selectedDate, hiddenReportIds, archivedReportIds, viewingArchive);
  const reports = getReportsForPerson(uploadedReports, selectedPerson, hiddenReportIds, archivedReportIds, viewingArchive);
  const archivedCount = getReportsForPerson(uploadedReports, selectedPerson, hiddenReportIds, archivedReportIds, true).length;
  const trendData = buildTrendData(reports);

  const handlePersonSwitch = (person: Person) => {
    setSelectedPerson(person);
    const personDates = getTestDates(uploadedReports, person, hiddenReportIds, archivedReportIds, viewingArchive);
    setSelectedDate(personDates[0] || '');
  };

  const handleToggleArchiveView = () => {
    const next = !viewingArchive;
    setViewingArchive(next);
    const nextDates = getTestDates(uploadedReports, selectedPerson, hiddenReportIds, archivedReportIds, next);
    setSelectedDate(nextDates[0] || '');
  };

  const handleArchiveReport = () => {
    if (!report) return;
    archiveReport(report.id);
    const remainingDates = dates.filter((d) => d !== selectedDate);
    setSelectedDate(remainingDates[0] || '');
  };

  const handleRestoreReport = () => {
    if (!report) return;
    restoreReport(report.id);
    const remainingDates = dates.filter((d) => d !== selectedDate);
    setSelectedDate(remainingDates[0] || '');
  };

  const handleDeleteReport = () => {
    if (!report) return;
    removeReport(report.id);
    setShowDeleteConfirm(false);
    const remainingDates = dates.filter((d) => d !== selectedDate);
    setSelectedDate(remainingDates[0] || '');
  };

  // Count all results across all categories
  const totalTests = report
    ? report.categories.reduce((sum, cat) => sum + cat.results.length, 0)
    : 0;
  const normalTests = report
    ? report.categories.reduce(
        (sum, cat) =>
          sum +
          cat.results.filter((r) => r.status === 'optimal' || r.status === 'normal').length,
        0
      )
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
      {/* Back link */}
      <button
        onClick={onBack}
        className="text-[10px] tracking-[0.3em] uppercase text-slate-400 hover:text-[#195de6] flex items-center gap-2 transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All entries
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-l-2 border-[#195de6]/20 pl-6 mb-8">
        <div>
          <h2 className="text-xs tracking-[0.4em] uppercase font-light text-slate-400 mb-1">
            Health
          </h2>
          <p className="text-2xl font-light text-slate-600">
            Lab Results & Health Trends
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Archive toggle */}
          {archivedCount > 0 && (
            <button
              onClick={handleToggleArchiveView}
              className={`border py-3 px-5 rounded-xl flex items-center gap-3 transition-all ${
                viewingArchive
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-[#195de6]/20 hover:border-[#195de6]'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium">
                Archive ({archivedCount})
              </span>
            </button>
          )}

          {/* Upload button */}
          {!viewingArchive && (
            <button
              onClick={() => setShowUpload(true)}
              className="bg-white border border-[#195de6]/20 py-3 px-5 rounded-xl flex items-center gap-3 hover:border-[#195de6] transition-all group"
            >
              <Upload className="w-4 h-4 text-[#195de6]" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-slate-700">
                Upload Reports
              </span>
            </button>
          )}

          {/* Person toggle */}
          <div className="flex bg-[#195de6]/5 rounded-lg p-1">
            <button
              onClick={() => handlePersonSwitch('liz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] tracking-widest uppercase transition-all ${
                selectedPerson === 'liz'
                  ? 'bg-white shadow-sm text-[#195de6] font-medium'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Liz
            </button>
            <button
              onClick={() => handlePersonSwitch('julian')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] tracking-widest uppercase transition-all ${
                selectedPerson === 'julian'
                  ? 'bg-white shadow-sm text-[#195de6] font-medium'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Julian
            </button>
          </div>
        </div>
      </div>

      {/* Archive banner */}
      {viewingArchive && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
          <Archive className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-light text-amber-700">
            Viewing archived reports
          </span>
          <button
            onClick={handleToggleArchiveView}
            className="ml-auto text-[10px] tracking-widest uppercase text-amber-600 hover:text-amber-800 transition-colors"
          >
            Back to active
          </button>
        </div>
      )}

      {/* Date timeline */}
      {dates.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[9px] tracking-widest uppercase text-slate-400">
              Test Dates
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-[10px] tracking-widest uppercase transition-all ${
                  selectedDate === date
                    ? 'bg-white shadow-sm text-[#195de6] one-pixel-border'
                    : 'bg-[#195de6]/5 text-slate-400 hover:text-[#195de6]'
                }`}
              >
                {format(parseISO(date), 'MMM d, yyyy')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report content */}
      {report ? (
        <>
          {/* Report info bar */}
          <div className="bg-white/50 backdrop-blur rounded-2xl one-pixel-border px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-2 mb-8">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-300" />
              <div>
                <span className="text-[10px] tracking-widest uppercase text-slate-400 block">Report</span>
                <span className="text-sm font-light">{report.reportId}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase text-slate-400 block">Provider</span>
              <span className="text-sm font-light">{report.provider}</span>
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase text-slate-400 block">Ordered by</span>
              <span className="text-sm font-light">{report.orderedBy}</span>
            </div>
            {report.source === 'uploaded' && (
              <span className="bg-[#195de6]/10 text-[#195de6] text-[9px] uppercase tracking-wider rounded-full px-2 py-0.5">
                Uploaded
              </span>
            )}
            <div className="ml-auto flex items-center gap-4">
              <span className="text-[#195de6] font-medium">
                {normalTests}/{totalTests} in range
              </span>
              {viewingArchive ? (
                <>
                  <button
                    onClick={handleRestoreReport}
                    className="p-2 rounded-xl text-slate-400 hover:text-[#195de6] hover:bg-[#195de6]/5 transition-all"
                    title="Restore this report"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleArchiveReport}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                    title="Archive this report"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Delete this report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Results / Trends toggle */}
          <div className="flex bg-[#195de6]/5 rounded-lg p-1 mb-8">
            <button
              onClick={() => setViewMode('results')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[10px] tracking-widest uppercase transition-all ${
                viewMode === 'results'
                  ? 'bg-white shadow-sm text-[#195de6] font-medium'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Results
            </button>
            <button
              onClick={() => setViewMode('trends')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[10px] tracking-widest uppercase transition-all ${
                viewMode === 'trends'
                  ? 'bg-white shadow-sm text-[#195de6] font-medium'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Trends
            </button>
          </div>

          {viewMode === 'results' ? (
            <>
              {/* Summary cards */}
              <div className="mb-10">
                <SummaryCards report={report} />
              </div>

              {/* Category cards */}
              <div className="space-y-5">
                {report.categories.map((category) => (
                  <LabCategoryCard
                    key={category.id}
                    category={category}
                    trendData={trendData}
                  />
                ))}
              </div>
            </>
          ) : (
            <TrendView reports={reports} trendData={trendData} />
          )}
        </>
      ) : (
        <div className="text-center py-20">
          {viewingArchive ? (
            <>
              <div className="text-5xl opacity-30 mb-4">
                <Archive className="w-12 h-12 mx-auto text-slate-300" />
              </div>
              <p className="text-lg font-light text-slate-600">No archived reports</p>
              <p className="text-sm font-light text-slate-400 mt-1">
                Reports you archive will appear here.
              </p>
              <button
                onClick={handleToggleArchiveView}
                className="mt-6 bg-white border border-[#195de6]/20 py-3 px-5 rounded-xl inline-flex items-center gap-3 hover:border-[#195de6] transition-all group"
              >
                <ArrowLeft className="w-4 h-4 text-[#195de6]" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-slate-700">
                  Back to active reports
                </span>
              </button>
            </>
          ) : (
            <>
              <div className="text-5xl opacity-30 mb-4">🏥</div>
              <p className="text-lg font-light text-slate-600">No lab results yet</p>
              <p className="text-sm font-light text-slate-400 mt-1">
                {selectedPerson === 'julian'
                  ? "Julian's results will appear here once added."
                  : "No results found for this date."}
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-6 bg-white border border-[#195de6]/20 py-3 px-5 rounded-xl inline-flex items-center gap-3 hover:border-[#195de6] transition-all group"
              >
                <Upload className="w-4 h-4 text-[#195de6]" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-slate-700">
                  Upload your first report
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Footer with report count */}
      {reports.length > 0 && (
        <div className="mt-10 pt-6 border-t border-[#195de6]/5 text-center text-[10px] tracking-widest uppercase text-slate-400">
          {reports.length} report{reports.length !== 1 ? 's' : ''} on file for{' '}
          {selectedPerson === 'liz' ? 'Liz' : 'Julian'}
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-4 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-light text-slate-700 mb-1">Delete this report?</h3>
            <p className="text-sm font-light text-slate-400 mb-6">
              {report.provider} — {format(parseISO(report.date), 'MMM d, yyyy')}
              <br />
              This can't be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-light text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && <ReportUpload onClose={() => setShowUpload(false)} />}
    </div>
  );
}
