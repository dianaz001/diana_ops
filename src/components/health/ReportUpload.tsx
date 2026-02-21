import { useState, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertTriangle,
  Check,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { parseMultiplePDFs } from '../../lib/pdf-parser';
import { useHealthStore } from '../../stores/healthStore';
import { StatusBadge } from './StatusBadge';
import type { LabReport, Person } from '../../types/health';

interface ReportUploadProps {
  onClose: () => void;
}

type Step = 'drop' | 'parsing' | 'preview';

export function ReportUpload({ onClose }: ReportUploadProps) {
  const [step, setStep] = useState<Step>('drop');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedReports, setParsedReports] = useState<LabReport[]>([]);
  const [parseErrors, setParseErrors] = useState<{ fileName: string; error: string }[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [rawTexts, setRawTexts] = useState<{ fileName: string; text: string }[]>([]);
  const [showRawText, setShowRawText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addReports } = useHealthStore();

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const pdfFiles = Array.from(files).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfFiles.length === 0) return;

    setStep('parsing');
    const { reports, errors, rawTexts: texts } = await parseMultiplePDFs(pdfFiles);
    setParsedReports(reports);
    setParseErrors(errors);
    setRawTexts(texts);
    setStep('preview');
    if (reports.length > 0) {
      setExpandedReport(reports[0].id);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeReport = (id: string) => {
    setParsedReports((prev) => prev.filter((r) => r.id !== id));
  };

  const updateReportPerson = (id: string, person: Person) => {
    setParsedReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, person } : r))
    );
  };

  const handleConfirm = () => {
    if (parsedReports.length > 0) {
      addReports(parsedReports);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upload Lab Reports</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 1: Drop zone */}
          {step === 'drop' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`}
              />
              <p className="text-lg font-medium text-gray-700 mb-1">
                Drop your LifeLabs PDFs here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                You can drop multiple files at once
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Browse files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {/* Step 2: Parsing */}
          {step === 'parsing' && (
            <div className="flex flex-col items-center py-16">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-700">Reading your reports...</p>
              <p className="text-sm text-gray-500 mt-1">Extracting lab results from PDFs</p>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Parse errors */}
              {parseErrors.length > 0 && (
                <div className="space-y-2">
                  {parseErrors.map((err) => (
                    <div
                      key={err.fileName}
                      className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">{err.fileName}</p>
                        <p className="text-xs text-amber-600">{err.error}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Parsed reports */}
              {parsedReports.length === 0 && parseErrors.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No results could be extracted.</p>
                  <button
                    onClick={() => { setStep('drop'); setParseErrors([]); }}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Try different files
                  </button>
                </div>
              )}

              {parsedReports.map((report) => {
                const isExpanded = expandedReport === report.id;
                const totalTests = report.categories.reduce(
                  (sum, cat) => sum + cat.results.length,
                  0
                );
                const normalTests = report.categories.reduce(
                  (sum, cat) =>
                    sum +
                    cat.results.filter(
                      (r) => r.status === 'optimal' || r.status === 'normal'
                    ).length,
                  0
                );

                return (
                  <div
                    key={report.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Report header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                      <button
                        onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <FileText className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {format(parseISO(report.date), 'MMM d, yyyy')} &middot;{' '}
                            {report.provider}
                          </p>
                          <p className="text-xs text-gray-500">
                            {totalTests} tests found &middot; {normalTests} in range
                            {report.rawFileName && (
                              <span className="ml-1 text-gray-400">
                                &middot; {report.rawFileName}
                              </span>
                            )}
                          </p>
                        </div>
                      </button>

                      {/* Person selector */}
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <select
                          value={report.person}
                          onChange={(e) =>
                            updateReportPerson(report.id, e.target.value as Person)
                          }
                          className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700"
                        >
                          <option value="liz">Liz</option>
                          <option value="julian">Julian</option>
                        </select>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeReport(report.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove this report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 py-3 space-y-3">
                        {report.categories.map((cat) => (
                          <div key={cat.id}>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                              {cat.icon} {cat.name}
                            </p>
                            <div className="space-y-1">
                              {cat.results.map((result) => (
                                <div
                                  key={result.testName}
                                  className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-gray-50"
                                >
                                  <span className="text-gray-700">{result.testName}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs text-gray-600">
                                      {result.valueSI}
                                    </span>
                                    <StatusBadge
                                      status={result.status}
                                      label={result.statusLabel}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Raw text debug viewer */}
          {step === 'preview' && rawTexts.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                {showRawText ? 'Hide' : 'Show'} raw extracted text
              </button>
              {showRawText && (
                <div className="mt-2 space-y-3">
                  {rawTexts.map((rt) => (
                    <div key={rt.fileName} className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64">
                      <p className="text-xs text-gray-400 mb-2 font-medium">{rt.fileName}</p>
                      <pre className="text-xs text-green-400 whitespace-pre-wrap break-all font-mono leading-relaxed">
                        {rt.text}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          {step === 'preview' && parsedReports.length > 0 ? (
            <>
              <button
                onClick={() => { setStep('drop'); setParsedReports([]); setParseErrors([]); }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Upload more
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                Save {parsedReports.length} report{parsedReports.length !== 1 ? 's' : ''}
              </button>
            </>
          ) : step === 'drop' ? (
            <div className="w-full text-center text-xs text-gray-400">
              Accepts LifeLabs PDF reports. Data stays in your browser.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
