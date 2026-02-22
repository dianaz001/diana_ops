import { useState } from 'react';
import { Calendar, User, FileText, ArrowLeft, Upload } from 'lucide-react';
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

interface HealthDashboardProps {
  onBack: () => void;
}

export function HealthDashboard({ onBack }: HealthDashboardProps) {
  const { uploadedReports } = useHealthStore();
  const [selectedPerson, setSelectedPerson] = useState<Person>('liz');
  const [showUpload, setShowUpload] = useState(false);

  const dates = getTestDates(uploadedReports, selectedPerson);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || '');

  const report = getReport(uploadedReports, selectedPerson, selectedDate);
  const reports = getReportsForPerson(uploadedReports, selectedPerson);
  const trendData = buildTrendData(reports);

  const handlePersonSwitch = (person: Person) => {
    setSelectedPerson(person);
    const personDates = getTestDates(uploadedReports, person);
    setSelectedDate(personDates[0] || '');
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
          {/* Upload button */}
          <button
            onClick={() => setShowUpload(true)}
            className="bg-white border border-[#195de6]/20 py-3 px-5 rounded-xl flex items-center gap-3 hover:border-[#195de6] transition-all group"
          >
            <Upload className="w-4 h-4 text-[#195de6]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-slate-700">
              Upload Reports
            </span>
          </button>

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
            <div className="ml-auto text-[#195de6] font-medium">
              {normalTests}/{totalTests} in range
            </div>
          </div>

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
        <div className="text-center py-20">
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
        </div>
      )}

      {/* Footer with report count */}
      {reports.length > 0 && (
        <div className="mt-10 pt-6 border-t border-[#195de6]/5 text-center text-[10px] tracking-widest uppercase text-slate-400">
          {reports.length} report{reports.length !== 1 ? 's' : ''} on file for{' '}
          {selectedPerson === 'liz' ? 'Liz' : 'Julian'}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && <ReportUpload onClose={() => setShowUpload(false)} />}
    </div>
  );
}
