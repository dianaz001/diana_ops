import { useState, useMemo } from 'react';
import { Search, X, Trash2, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { useGroceryStore } from '../../stores/groceryStore';
import { useGroceryTheme } from '../../lib/grocery-theme';
import { getCategoryLabel, getCategoryColor } from '../../lib/grocery-categorizer';
import type { GroceryItem, GroceryCategory } from '../../types/grocery';

type SortKey = 'item_date' | 'name' | 'category' | 'price' | 'tax_amount';
type SortDir = 'asc' | 'desc';

export function GroceryItemsTable() {
  const { getFilteredItems, deleteItem } = useGroceryStore();
  const gc = useGroceryTheme();
  const items = getFilteredItems();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('item_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) =>
      i.name.toLowerCase().includes(q) ||
      getCategoryLabel(i.category).toLowerCase().includes(q)
    );
  }, [items, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'item_date': cmp = a.item_date.localeCompare(b.item_date); break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'category': cmp = getCategoryLabel(a.category).localeCompare(getCategoryLabel(b.category)); break;
        case 'price': cmp = a.price - b.price; break;
        case 'tax_amount': cmp = a.tax_amount - b.tax_amount; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Name', 'Category', 'Price', 'Tax', 'Total', 'Owner'];
    const rows = sorted.map((i) => [
      i.item_date,
      `"${i.name}"`,
      getCategoryLabel(i.category),
      i.price.toFixed(2),
      i.tax_amount.toFixed(2),
      (i.price + i.tax_amount).toFixed(2),
      i.owner,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-items-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3" style={{ color: gc.accent }} />
      : <ChevronDown className="w-3 h-3" style={{ color: gc.accent }} />;
  };

  return (
    <div className="rounded-xl border" style={{ background: gc.bgCard, borderColor: gc.borderCard }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 border-b" style={{ borderColor: gc.border }}>
        <h2 className="text-[12px] font-semibold flex-1" style={{ color: gc.text }}>
          Items <span className="font-normal" style={{ color: gc.textSubtle }}>({filtered.length})</span>
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: gc.textSubtle }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="pl-8 pr-7 py-1.5 rounded-lg text-[11px] border w-full sm:w-48 focus:outline-none focus:ring-1"
            style={{ borderColor: gc.border, color: gc.text, background: gc.bgInput }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3" style={{ color: gc.textSubtle }} />
            </button>
          )}
        </div>

        {/* Export */}
        <button onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-[0.1em] border transition-colors hover:shadow-sm"
          style={{ borderColor: gc.border, color: gc.textMuted, background: gc.bgCard }}>
          <Download className="w-3 h-3" />
          CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: `1px solid ${gc.border}` }}>
              {([
                { key: 'item_date' as SortKey, label: 'Date', cls: 'w-24' },
                { key: 'name' as SortKey, label: 'Item', cls: '' },
                { key: 'category' as SortKey, label: 'Category', cls: 'hidden sm:table-cell' },
                { key: 'price' as SortKey, label: 'Price', cls: 'text-right' },
                { key: 'tax_amount' as SortKey, label: 'Tax', cls: 'text-right hidden sm:table-cell' },
              ]).map((col) => (
                <th key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.15em] cursor-pointer select-none ${col.cls}`}
                  style={{ color: gc.textMuted }}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </div>
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[12px]" style={{ color: gc.textSubtle }}>
                  No items found
                </td>
              </tr>
            ) : (
              sorted.map((item) => (
                <TableRow
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onSelect={() => setSelectedId(selectedId === item.id ? null : item.id)}
                  onDelete={() => deleteItem(item.id)}
                  gc={gc}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableRow({ item, isSelected, onSelect, onDelete, gc }: {
  item: GroceryItem;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  gc: ReturnType<typeof import('../../lib/grocery-theme').useGroceryTheme>;
}) {
  const catColor = getCategoryColor(item.category as GroceryCategory);

  return (
    <>
      <tr
        onClick={onSelect}
        className="cursor-pointer transition-colors"
        style={{
          borderBottom: `1px solid ${gc.borderLight}`,
          background: isSelected ? gc.bgSelected : 'transparent',
        }}
      >
        {/* Date */}
        <td className="px-4 py-2.5">
          <span className="text-[11px]" style={{ color: gc.textMuted, fontFamily: "'SF Mono', monospace" }}>
            {item.item_date}
          </span>
        </td>

        {/* Name */}
        <td className="px-4 py-2.5">
          <span className="text-[11px] font-medium" style={{ color: gc.text }}>
            {item.name}
          </span>
          {/* Mobile: show category inline */}
          <span className="sm:hidden ml-2 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: catColor }} />
            <span className="text-[9px]" style={{ color: gc.textSubtle }}>
              {getCategoryLabel(item.category)}
            </span>
          </span>
        </td>

        {/* Category */}
        <td className="px-4 py-2.5 hidden sm:table-cell">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: catColor }} />
            <span className="text-[10px]" style={{ color: gc.textMuted }}>
              {getCategoryLabel(item.category)}
            </span>
          </div>
        </td>

        {/* Price */}
        <td className="px-4 py-2.5 text-right">
          <span className="text-[11px] font-medium" style={{ color: gc.text, fontFamily: "'SF Mono', monospace" }}>
            ${item.price.toFixed(2)}
          </span>
        </td>

        {/* Tax */}
        <td className="px-4 py-2.5 text-right hidden sm:table-cell">
          <span className="text-[10px]" style={{ color: gc.textSubtle, fontFamily: "'SF Mono', monospace" }}>
            ${item.tax_amount.toFixed(2)}
          </span>
        </td>

        {/* Delete */}
        <td className="px-2 py-2.5">
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded hover:bg-red-50 transition-colors opacity-40 hover:opacity-100">
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </td>
      </tr>

      {/* Expanded row on mobile */}
      {isSelected && (
        <tr className="sm:hidden" style={{ background: gc.bgHover }}>
          <td colSpan={6} className="px-4 py-2">
            <div className="flex flex-wrap gap-3 text-[10px]" style={{ color: gc.textMuted }}>
              <span>Category: {getCategoryLabel(item.category)}</span>
              <span>Tax: ${item.tax_amount.toFixed(2)}</span>
              <span>Total: ${(item.price + item.tax_amount).toFixed(2)}</span>
              <span>Owner: {item.owner}</span>
              {item.is_manual && <span className="italic">Manual entry</span>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
