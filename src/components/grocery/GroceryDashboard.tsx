import { useEffect, useState } from 'react';
import { ArrowLeft, Upload, Plus, ShoppingCart } from 'lucide-react';
import { useGroceryStore } from '../../stores/groceryStore';
import { useGroceryTheme } from '../../lib/grocery-theme';
import { GroceryStatsRow } from './GroceryStatsRow';
import { GroceryTrendChart } from './GroceryTrendChart';
import { GroceryCategoryDonut } from './GroceryCategoryDonut';
import { GroceryItemsTable } from './GroceryItemsTable';
import { GroceryFiltersBar } from './GroceryFiltersBar';
import { ReceiptUploadModal } from './ReceiptUploadModal';
import { ManualItemModal } from './ManualItemModal';

interface GroceryDashboardProps {
  onBack: () => void;
}

export function GroceryDashboard({ onBack }: GroceryDashboardProps) {
  const { fetchItems, fetchReceipts, isLoading } = useGroceryStore();
  const [showUpload, setShowUpload] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const gc = useGroceryTheme();

  useEffect(() => {
    fetchItems();
    fetchReceipts();
  }, [fetchItems, fetchReceipts]);

  return (
    <div className="min-h-screen" style={{ background: gc.bg }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-28 lg:pb-10">

        {/* ── Header ──────────────────────────────────── */}
        <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-2"
          style={{ background: gc.bgHeader, backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={onBack}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] font-medium transition-colors hover:opacity-70"
                style={{ color: gc.textMuted }}>
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <div className="h-4 w-px" style={{ background: gc.border }} />
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" style={{ color: gc.text }} />
                <h1 className="text-[13px] font-semibold tracking-tight" style={{ color: gc.text }}>
                  Grocery Expenses
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setShowUpload(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium uppercase tracking-[0.1em] transition-all hover:shadow-sm"
                style={{ background: gc.btnActiveBg, color: gc.btnActiveText }}>
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Scan Receipt</span>
              </button>
              <button onClick={() => setShowManual(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium uppercase tracking-[0.1em] border transition-all hover:shadow-sm"
                style={{ borderColor: gc.border, color: gc.text, background: gc.bgCard }}>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────── */}
        <GroceryFiltersBar />

        {/* ── Stats KPIs ──────────────────────────────── */}
        <GroceryStatsRow />

        {/* ── Charts Row ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          {/* Trend chart: 2/3 width */}
          <div className="lg:col-span-2">
            <GroceryTrendChart />
          </div>

          {/* Category donut: 1/3 width */}
          <div>
            <GroceryCategoryDonut />
          </div>
        </div>

        {/* ── Items Table ─────────────────────────────── */}
        <GroceryItemsTable />

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
            <div className="rounded-xl px-6 py-4 shadow-lg flex items-center gap-3"
              style={{ background: gc.bgCard }}>
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: gc.accent, borderTopColor: 'transparent' }} />
              <span className="text-sm" style={{ color: gc.text }}>Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────── */}
      {showUpload && <ReceiptUploadModal onClose={() => setShowUpload(false)} />}
      {showManual && <ManualItemModal onClose={() => setShowManual(false)} />}
    </div>
  );
}
