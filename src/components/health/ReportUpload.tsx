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
  ClipboardPaste,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { parseMultiplePDFs, parseFromPastedText } from '../../lib/pdf-parser';
import { useHealthStore } from '../../stores/healthStore';
import { StatusBadge } from './StatusBadge';
import type { LabReport, Person } from '../../types/health';

interface ReportUploadProps {
  onClose: () => void;
}

type Step = 'drop' | 'parsing' | 'preview' | 'paste';

export function ReportUpload({ onClose }: ReportUploadProps) {
  const [step, setStep] = useState<Step>('drop');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedReports, setParsedReports] = useState<LabReport[]>([]);
  const [parseErrors, setParseErrors] = useState<{ fileName: string; error: string }[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [rawTexts, setRawTexts] = useState<{ fileName: string; text: string }[]>([]);
  const [showRawText, setShowRawText] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [pasteError, setPasteError] = useState('');
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

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    setPasteError('');
    const report = parseFromPastedText(pastedText, 'Pasted report');
    if (report) {
      setParsedReports((prev) => [...prev, report]);
      setParseErrors([]);
      setStep('preview');
      setExpandedReport(report.id);
      setPastedText('');
    } else {
      setPasteError('Could not find lab results in the pasted text. Make sure you copied the full report content including test names and values.');
    }
  };

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

  const goToDropStep = () => {
    setStep('drop');
    setParsedReports([]);
    setParseErrors([]);
    setRawTexts([]);
    setPastedText('');
    setPasteError('');
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl one-pixel-border shadow-xl shadow-[#195de6]/5 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#195de6]/[0.06]">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-slate-400">Import</p>
            <h2 className="text-lg font-light text-slate-800">Lab Reports</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-slate-500 hover:bg-[#195de6]/[0.04] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 1: Drop zone */}
          {step === 'drop' && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border border-dashed rounded-2xl p-10 text-center transition-all ${
                  isDragging
                    ? 'border-[#195de6]/40 bg-[#195de6]/[0.04]'
                    : 'border-[#195de6]/10 bg-[#195de6]/[0.02] hover:border-[#195de6]/20'
                }`}
              >
                <Upload
                  className={`w-8 h-8 mx-auto mb-3 ${
                    isDragging ? 'text-[#195de6]' : 'text-slate-300'
                  }`}
                />
                <p className="text-sm font-light text-slate-600 mb-1">
                  Drop your lab report PDFs here
                </p>
                <p className="text-[10px] tracking-wider uppercase text-slate-400 mb-4">
                  Multiple files supported
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase font-medium bg-white one-pixel-border text-slate-600 hover:text-[#195de6] hover:shadow-md hover:shadow-[#195de6]/5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
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

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-[#195de6]/[0.06]" />
                <span className="text-[9px] tracking-[0.3em] uppercase text-slate-300 font-medium">or</span>
                <div className="flex-1 border-t border-[#195de6]/[0.06]" />
              </div>

              {/* Paste option */}
              <button
                onClick={() => setStep('paste')}
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl one-pixel-border bg-white/50 hover:bg-white hover:shadow-md hover:shadow-[#195de6]/5 transition-all text-left"
              >
                <ClipboardPaste className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <div>
                  <p className="text-[11px] tracking-wider uppercase font-medium text-slate-600">Paste text from your report</p>
                  <p className="text-[10px] font-light text-slate-400 mt-0.5">
                    Open the PDF, select all text, copy it, and paste here
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Step: Paste text */}
          {step === 'paste' && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-slate-400 mb-3">
                  Paste report text
                </p>
                <p className="text-xs font-light text-slate-500 mb-3">
                  Open your PDF in any viewer, press Ctrl+A to select all, Ctrl+C to copy, then Ctrl+V to paste here.
                </p>
                <textarea
                  value={pastedText}
                  onChange={(e) => { setPastedText(e.target.value); setPasteError(''); }}
                  placeholder="Paste your lab report text here..."
                  className="w-full h-48 px-4 py-3 text-xs font-mono rounded-2xl one-pixel-border bg-white/50 focus:bg-white focus:ring-1 focus:ring-[#195de6]/30 focus:outline-none resize-none text-slate-600 placeholder:text-slate-300 transition-all"
                />
              </div>
              {pasteError && (
                <div className="flex items-start gap-2 bg-amber-50/80 rounded-xl px-4 py-3 one-pixel-border">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-light text-amber-600 leading-relaxed">{pasteError}</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={goToDropStep}
                  className="text-[10px] tracking-wider uppercase text-slate-400 hover:text-[#195de6] font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePasteSubmit}
                  disabled={!pastedText.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase font-medium bg-[#195de6] text-white hover:bg-[#195de6]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#195de6]/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  Parse text
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Parsing */}
          {step === 'parsing' && (
            <div className="flex flex-col items-center py-16">
              <Loader2 className="w-8 h-8 text-[#195de6]/40 animate-spin mb-4" />
              <p className="text-sm font-light text-slate-600">Reading your reports...</p>
              <p className="text-[10px] tracking-wider uppercase text-slate-400 mt-2">Extracting lab results</p>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-3">
              {/* Parse errors with paste fallback */}
              {parseErrors.length > 0 && (
                <div className="space-y-2">
                  {parseErrors.map((err) => (
                    <div
                      key={err.fileName}
                      className="bg-amber-50/60 rounded-2xl px-5 py-4 one-pixel-border"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[11px] font-medium text-amber-700">{err.fileName}</p>
                          <p className="text-[10px] font-light text-amber-500 mt-0.5">{err.error}</p>
                          <p className="text-[10px] font-light text-amber-600 mt-2">
                            Some PDFs store data in a way that can't be read automatically.
                            Try opening the PDF, copying all the text, and using the paste option instead.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No reports extracted - offer paste fallback */}
              {parsedReports.length === 0 && parseErrors.length > 0 && (
                <div className="text-center py-4">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={goToDropStep}
                      className="text-[10px] tracking-wider uppercase text-slate-400 hover:text-[#195de6] font-medium transition-colors"
                    >
                      Try different files
                    </button>
                    <button
                      onClick={() => setStep('paste')}
                      className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-[#195de6] hover:text-[#195de6]/80 font-medium transition-colors"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      Paste text instead
                    </button>
                  </div>
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
                    className="bg-white/50 backdrop-blur rounded-2xl one-pixel-border overflow-hidden hover:shadow-lg hover:shadow-[#195de6]/5 transition-all"
                  >
                    {/* Report header */}
                    <div className="flex items-center gap-3 px-5 py-3">
                      <button
                        onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <FileText className="w-4 h-4 text-[#195de6]/50" />
                        <div>
                          <p className="text-sm font-light text-slate-700">
                            {format(parseISO(report.date), 'MMM d, yyyy')} &middot;{' '}
                            {report.provider}
                          </p>
                          <p className="text-[10px] tracking-wider text-slate-400">
                            {totalTests} tests &middot; {normalTests} in range
                            {report.rawFileName && (
                              <span className="ml-1 text-slate-300">
                                &middot; {report.rawFileName}
                              </span>
                            )}
                          </p>
                        </div>
                      </button>

                      {/* Person selector */}
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-300" />
                        <select
                          value={report.person}
                          onChange={(e) =>
                            updateReportPerson(report.id, e.target.value as Person)
                          }
                          className="text-[10px] tracking-wider uppercase one-pixel-border rounded-lg px-2 py-1 bg-white/80 text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#195de6]/20"
                        >
                          <option value="diana">Diana</option>
                        </select>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeReport(report.id)}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-red-400 hover:bg-red-50/50 transition-colors"
                        title="Remove this report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-5 py-3 space-y-3 border-t border-[#195de6]/[0.04]">
                        {report.categories.map((cat) => (
                          <div key={cat.id}>
                            <p className="text-[9px] tracking-[0.3em] uppercase font-medium text-slate-400 mb-2">
                              {cat.icon} {cat.name}
                            </p>
                            <div className="space-y-0.5">
                              {cat.results.map((result) => (
                                <div
                                  key={result.testName}
                                  className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl hover:bg-[#195de6]/[0.03] transition-colors"
                                >
                                  <span className="font-light text-slate-600">{result.testName}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] text-[#195de6]/60">
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
                className="text-[9px] tracking-[0.2em] uppercase text-slate-300 hover:text-[#195de6]/60 font-medium transition-colors"
              >
                {showRawText ? 'Hide' : 'Show'} raw extracted text
              </button>
              {showRawText && (
                <div className="mt-2 space-y-3">
                  {rawTexts.map((rt) => (
                    <div key={rt.fileName} className="bg-[#111621] rounded-2xl p-4 overflow-auto max-h-64">
                      <p className="text-[9px] tracking-[0.3em] uppercase text-slate-500 mb-2 font-medium">{rt.fileName}</p>
                      <pre className="text-[10px] text-[#195de6]/70 whitespace-pre-wrap break-all font-mono leading-relaxed">
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
        <div className="px-6 py-4 border-t border-[#195de6]/[0.06] flex items-center justify-between">
          {step === 'preview' && parsedReports.length > 0 ? (
            <>
              <div className="flex items-center gap-4">
                <button
                  onClick={goToDropStep}
                  className="text-[10px] tracking-wider uppercase text-slate-400 hover:text-[#195de6] font-medium transition-colors"
                >
                  Upload more
                </button>
                <button
                  onClick={() => setStep('paste')}
                  className="text-[10px] tracking-wider uppercase text-slate-400 hover:text-[#195de6] font-medium transition-colors"
                >
                  Paste another
                </button>
              </div>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase font-medium bg-[#195de6] text-white hover:bg-[#195de6]/90 transition-all shadow-lg shadow-[#195de6]/20"
              >
                <Check className="w-3.5 h-3.5" />
                Save {parsedReports.length} report{parsedReports.length !== 1 ? 's' : ''}
              </button>
            </>
          ) : step === 'drop' ? (
            <div className="w-full text-center text-[9px] tracking-[0.3em] uppercase text-slate-300">
              Data stays in your browser
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
