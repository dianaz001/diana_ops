import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { useGroceryStore } from '../../stores/groceryStore';
import { getAllCategories, categorizeItem } from '../../lib/grocery-categorizer';
import type { GroceryCategory } from '../../types/grocery';

interface Props {
  onClose: () => void;
}

export function ManualItemModal({ onClose }: Props) {
  const { addManualItem } = useGroceryStore();
  const categories = getAllCategories();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState<GroceryCategory>('other');
  const [taxAmount, setTaxAmount] = useState('0');
  const [itemDate, setItemDate] = useState(new Date().toISOString().slice(0, 10));
  const [owner, setOwner] = useState<'julian' | 'liz' | 'shared'>('shared');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-categorize as user types
    if (val.length >= 3) {
      const auto = categorizeItem(val);
      if (auto !== 'other') setCategory(auto);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price) return;
    setSaving(true);

    await addManualItem({
      receipt_id: null,
      name: name.trim(),
      price: parseFloat(price) || 0,
      quantity: parseFloat(quantity) || 1,
      unit_price: null,
      category,
      tax_amount: parseFloat(taxAmount) || 0,
      owner,
      item_date: itemDate,
      is_manual: true,
      notes: notes.trim() || null,
    });

    setSaving(false);
    setSaved(true);

    // Reset for another entry
    setTimeout(() => {
      setName('');
      setPrice('');
      setQuantity('1');
      setCategory('other');
      setTaxAmount('0');
      setNotes('');
      setSaved(false);
    }, 600);
  };

  const handleSaveAndClose = async () => {
    if (name.trim() && price) {
      await handleSave();
    }
    setTimeout(onClose, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: '#FDFBF7' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: '#E8DED1' }}>
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" style={{ color: '#4A3728' }} />
            <h2 className="text-[13px] font-semibold" style={{ color: '#282627' }}>Add Grocery Item</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5">
            <X className="w-4 h-4" style={{ color: '#6B5B4F' }} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Name */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>
              Item Name
            </label>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Organic Bananas"
              autoFocus
              className="w-full px-3 py-2 rounded-lg border text-[12px] focus:outline-none focus:ring-1"
              style={{ borderColor: '#E8DED1', color: '#282627' }} />
          </div>

          {/* Price + Quantity row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>
                Price ($)
              </label>
              <input type="number" step="0.01" value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border text-[12px] focus:outline-none focus:ring-1"
                style={{ borderColor: '#E8DED1', color: '#282627', fontFamily: "'SF Mono', monospace" }} />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>
                Qty
              </label>
              <input type="number" step="1" min="1" value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-[12px] focus:outline-none focus:ring-1"
                style={{ borderColor: '#E8DED1', color: '#282627', fontFamily: "'SF Mono', monospace" }} />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>
                Tax ($)
              </label>
              <input type="number" step="0.01" value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border text-[12px] focus:outline-none focus:ring-1"
                style={{ borderColor: '#E8DED1', color: '#282627', fontFamily: "'SF Mono', monospace" }} />
            </div>
          </div>

          {/* Category + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>
                Category
              </label>
              <select value={category}
                onChange={(e) => setCategory(e.target.value as GroceryCategory)}
                className="w-full px-3 py-2 rounded-lg border text-[11px] focus:outline-none"
                style={{ borderColor: '#E8DED1', color: '#282627' }}>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>
                Date
              </label>
              <input type="date" value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-[11px] focus:outline-none"
                style={{ borderColor: '#E8DED1', color: '#282627' }} />
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>
              Owner
            </label>
            <div className="inline-flex rounded-lg overflow-hidden border" style={{ borderColor: '#E8DED1' }}>
              {(['shared', 'julian', 'liz'] as const).map((o) => (
                <button key={o}
                  onClick={() => setOwner(o)}
                  className="px-3 py-1.5 text-[10px] font-medium capitalize transition-colors"
                  style={{
                    background: owner === o ? '#4A3728' : '#fff',
                    color: owner === o ? '#fff' : '#6B5B4F',
                  }}>
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-[0.1em] block mb-1" style={{ color: '#6B5B4F' }}>
              Notes <span className="normal-case">(optional)</span>
            </label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Store, brand, etc."
              className="w-full px-3 py-2 rounded-lg border text-[11px] focus:outline-none"
              style={{ borderColor: '#E8DED1', color: '#282627' }} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {saved && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: '#4A3728' }}>
                <Check className="w-3.5 h-3.5" /> Saved! Add another?
              </span>
            )}
            {!saved && <div />}

            <div className="flex gap-2">
              <button onClick={handleSave}
                disabled={!name.trim() || !price || saving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.1em] border transition-all disabled:opacity-40"
                style={{ borderColor: '#E8DED1', color: '#4A3728' }}>
                <Plus className="w-3.5 h-3.5" />
                Save & Add More
              </button>
              <button onClick={handleSaveAndClose}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.1em] transition-all"
                style={{ background: '#4A3728', color: '#fff' }}>
                <Check className="w-3.5 h-3.5" />
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
