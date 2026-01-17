import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { CATEGORIES, type Category, type Owner } from '../../types';
import { useEntriesStore } from '../../stores/entriesStore';

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

// Patterns for sensitive data detection
const SENSITIVE_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/, name: 'SSN' },
  { pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, name: 'Credit card' },
  { pattern: /\b\d{9,12}\b/, name: 'Account number' },
];

export function QuickCapture({ isOpen, onClose, onCreated }: QuickCaptureProps) {
  const { createEntry } = useEntriesStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('ideas');
  const [owner, setOwner] = useState<Owner>('shared');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sensitiveWarning, setSensitiveWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Check for sensitive data in title and content
    const textToCheck = `${title} ${content}`;
    for (const { pattern, name } of SENSITIVE_PATTERNS) {
      if (pattern.test(textToCheck)) {
        setSensitiveWarning(`Content appears to contain ${name}. Consider removing sensitive information.`);
        return;
      }
    }
    setSensitiveWarning(null);
  }, [title, content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const entry = await createEntry({
      title: title.trim(),
      content: content.trim(),
      category,
      owner,
      tags: [],
    });

    if (entry) {
      onCreated(entry.id);
      resetForm();
      onClose();
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('ideas');
    setOwner('shared');
    setShowAdvanced(false);
    setSensitiveWarning(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen px-4 pt-4 pb-20 sm:pt-20">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Quick Capture</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              <div>
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full text-lg px-0 py-2 border-none focus:outline-none focus:ring-0 placeholder-gray-400"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add more details (optional)..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              {sensitiveWarning && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{sensitiveWarning}</span>
                </div>
              )}

              {/* Quick category selection */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      category === cat.name
                        ? cat.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    disabled={isSubmitting}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              {/* Advanced options toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {showAdvanced ? 'Hide options' : 'More options'}
              </button>

              {showAdvanced && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner
                    </label>
                    <div className="flex gap-2">
                      {(['julian', 'liz', 'shared'] as Owner[]).map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setOwner(o)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            owner === o
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          disabled={isSubmitting}
                        >
                          {o === 'julian' ? 'Julian' : o === 'liz' ? 'Liz' : 'Shared'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
