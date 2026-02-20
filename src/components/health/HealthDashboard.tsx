import { useState } from 'react';
import { Calendar, User, FileText, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getReportsForPerson, getTestDates, getReport } from '../../data/health-data';
import type { Person } from '../../types/health';
import { SummaryCards } from './SummaryCards';
import { LabCategoryCard } from './LabCategoryCard';

interface HealthDashboardProps {
  onBack: () => void;
}

export function HealthDashboard({ onBack }: HealthDashboardProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person>('liz');
  const dates = getTestDates(selectedPerson);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || '');

  const report = getReport(selectedPerson, selectedDate);
  const reports = getReportsForPerson(selectedPerson);

  const handlePersonSwitch = (person: Person) => {
    setSelectedPerson(person);
    const personDates = getTestDates(person);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All entries
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>❤️</span> Health Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lab results & health metrics over time
          </p>
        </div>

        {/* Person toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
          <button
            onClick={() => handlePersonSwitch('liz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedPerson === 'liz'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Liz
          </button>
          <button
            onClick={() => handlePersonSwitch('julian')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedPerson === 'julian'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Julian
          </button>
        </div>
      </div>

      {/* Date timeline */}
      {dates.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Test Dates
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selectedDate === date
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-white border border-gray-200 rounded-xl px-5 py-3 mb-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Report: {report.reportId}</span>
            </div>
            <div>Provider: {report.provider}</div>
            <div>Ordered by: {report.orderedBy}</div>
            <div className="ml-auto font-semibold text-emerald-600">
              {normalTests}/{totalTests} in range
            </div>
          </div>

          {/* Summary cards */}
          <div className="mb-8">
            <SummaryCards report={report} />
          </div>

          {/* Category cards */}
          <div className="space-y-4">
            {report.categories.map((category) => (
              <LabCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🏥</div>
          <p className="text-lg font-medium text-gray-600">No lab results yet</p>
          <p className="text-sm mt-1">
            {selectedPerson === 'julian'
              ? "Julian's results will appear here once added."
              : "No results found for this date."}
          </p>
        </div>
      )}

      {/* Footer with report count */}
      {reports.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          {reports.length} report{reports.length !== 1 ? 's' : ''} on file for{' '}
          {selectedPerson === 'liz' ? 'Liz' : 'Julian'}
        </div>
      )}
    </div>
  );
}
