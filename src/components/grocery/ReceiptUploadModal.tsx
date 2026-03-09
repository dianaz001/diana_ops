import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { parseGroceryReceipt } from '../../lib/grocery-receipt-parser';
import { useGroceryStore } from '../../stores/groceryStore';
import { getAllCategories, categorizeItem } from '../../lib/grocery-categorizer';
import type { ParsedReceipt, ParsedReceiptItem, GroceryCategory } from '../../types/grocery';

interface Props {
  onClose: () => void;
}

type Step = 'upload' | 'review' | 'saving' | 'done';

export function ReceiptUploadModal({ onClose }: Props) {
  const { saveReceipt } = useGroceryStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [items, setItems] = useState<ParsedReceiptItem[]>([]);
  const [storeName, setStoreName] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [tax, setTax] = useState(0);
  const [owner, setOwner] = useState<'julian' | 'liz' | 'shared'>('shared');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const categories = getAllCategories();

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setError(null);
    setStep('review');

    try {
      const result = await parseGroceryReceipt(file);
      setParsed(result);
      setItems(result.items);
      setStoreName(result.store_name);
      setReceiptDate(result.receipt_date);
      setTax(result.tax);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse receipt');
      setStep('upload');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const updateItem = (index: number, updates: Partial<ParsedReceiptItem>) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addBlankItem = () => {
    setItems((prev) => [...prev, { name: '', price: 0, quantity: 1, category: 'other' }]);
  };

  const handleSave = async () => {
    if (!parsed) return;
    setStep('saving');

    const subtotal = items.reduce((s, i) => s + i.price, 0);
    const receiptToSave: ParsedReceipt = {
      ...parsed,
      store_name: storeName,
      receipt_date: receiptDate,
      items,
      subtotal,
      tax,
      total: subtotal + tax,
    };

    const id = await saveReceipt(receiptToSave, owner);
    if (id) {
      setStep('done');
      setTimeout(onClose, 800);
    } else {
      setStep('review');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: '#FDFBF7' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: '#E8DED1', background: 'rgba(253,251,247,0.95)', backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: '#4A3728' }} />
            <h2 className="text-[13px] font-semibold" style={{ color: '#282627' }}>
              {step === 'upload' ? 'Upload Receipt' : step === 'review' ? 'Review Items' : step === 'done' ? 'Saved!' : 'Saving...'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 transition-colors">
            <X className="w-4 h-4" style={{ color: '#6B5B4F' }} />
          </button>
        </div>

        <div className="p-5">
          {/* ── Upload Step ─────────────────────────── */}
          {step === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all"
              style={{
                borderColor: isDragging ? '#4A3728' : '#E8DED1',
                background: isDragging ? 'rgba(74,55,40,0.04)' : 'transparent',
              }}
            >
              <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: '#C4A882' }} />
              <p className="text-[13px] font-medium mb-1" style={{ color: '#282627' }}>
                Drop your receipt PDF here
              </p>
              <p className="text-[11px]" style={{ color: '#6B5B4F' }}>
                or click to browse files
              </p>
              <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 mt-3 p-3 rounded-lg" style={{ background: '#fef2f2' }}>
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-[11px] text-red-600">{error}</span>
            </div>
          )}

          {/* ── Review Step ─────────────────────────── */}
          {step === 'review' && parsed && (
            <div className="space-y-4">
              {/* Receipt meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>Store</label>
                  <input value={storeName} onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] focus:outline-none focus:ring-1"
                    style={{ borderColor: '#E8DED1', color: '#282627' }} />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>Date</label>
                  <input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] focus:outline-none focus:ring-1"
                    style={{ borderColor: '#E8DED1', color: '#282627' }} />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>Tax</label>
                  <input type="number" step="0.01" value={tax} onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] focus:outline-none focus:ring-1"
                    style={{ borderColor: '#E8DED1', color: '#282627', fontFamily: "'SF Mono', monospace" }} />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>Owner</label>
                  <select value={owner} onChange={(e) => setOwner(e.target.value as typeof owner)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] focus:outline-none"
                    style={{ borderColor: '#E8DED1', color: '#282627' }}>
                    <option value="shared">Shared</option>
                    <option value="julian">Julian</option>
                    <option value="liz">Liz</option>
                  </select>
                </div>
              </div>

              {/* Items list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium" style={{ color: '#282627' }}>
                    {items.length} items detected
                  </span>
                  <button onClick={addBlankItem}
                    className="text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg border transition-colors hover:shadow-sm"
                    style={{ borderColor: '#E8DED1', color: '#4A3728' }}>
                    + Add Row
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg border"
                      style={{ borderColor: '#f0ebe4', background: '#fff' }}>
                      {/* Name */}
                      <input value={item.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          updateItem(i, { name, category: categorizeItem(name) });
                        }}
                        placeholder="Item name"
                        className="flex-1 min-w-0 px-2 py-1 text-[11px] rounded border focus:outline-none"
                        style={{ borderColor: '#f0ebe4', color: '#282627' }} />

                      {/* Category */}
                      <select value={item.category}
                        onChange={(e) => updateItem(i, { category: e.target.value as GroceryCategory })}
                        className="w-28 sm:w-36 px-1.5 py-1 text-[10px] rounded border focus:outline-none"
                        style={{ borderColor: '#f0ebe4', color: '#6B5B4F' }}>
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>

                      {/* Price */}
                      <div className="relative w-20">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: '#9DAFD0' }}>$</span>
                        <input type="number" step="0.01" value={item.price}
                          onChange={(e) => updateItem(i, { price: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-5 pr-1.5 py-1 text-[11px] rounded border text-right focus:outline-none"
                          style={{ borderColor: '#f0ebe4', color: '#282627', fontFamily: "'SF Mono', monospace" }} />
                      </div>

                      {/* Remove */}
                      <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-red-50 transition-colors">
                        <X className="w-3 h-3 text-red-300 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#E8DED1' }}>
                <div className="text-[11px]" style={{ color: '#6B5B4F' }}>
                  Subtotal: <span style={{ fontFamily: "'SF Mono', monospace", color: '#282627' }}>
                    ${items.reduce((s, i) => s + i.price, 0).toFixed(2)}
                  </span>
                  {' + Tax: '}
                  <span style={{ fontFamily: "'SF Mono', monospace", color: '#282627' }}>${tax.toFixed(2)}</span>
                  {' = '}
                  <span className="font-semibold" style={{ fontFamily: "'SF Mono', monospace", color: '#282627' }}>
                    ${(items.reduce((s, i) => s + i.price, 0) + tax).toFixed(2)}
                  </span>
                </div>

                <button onClick={handleSave}
                  disabled={items.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.1em] transition-all disabled:opacity-40"
                  style={{ background: '#4A3728', color: '#fff' }}>
                  <Check className="w-3.5 h-3.5" />
                  Save Receipt
                </button>
              </div>
            </div>
          )}

          {/* ── Saving / Done ───────────────────────── */}
          {step === 'saving' && (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-[#4A3728] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[12px]" style={{ color: '#6B5B4F' }}>Saving receipt...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="py-12 text-center">
              <Check className="w-8 h-8 mx-auto mb-3" style={{ color: '#4A3728' }} />
              <p className="text-[13px] font-medium" style={{ color: '#282627' }}>Receipt saved!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
