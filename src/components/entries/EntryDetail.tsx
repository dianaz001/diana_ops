import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { X, Edit2, Trash2, Save, AlertTriangle } from 'lucide-react';
import { getCategoryInfo, CATEGORIES, type Entry, type Category, type Owner } from '../../types';
import { useEntriesStore } from '../../stores/entriesStore';

interface EntryDetailProps {
  entry: Entry;
  onClose: () => void;
  onDelete: () => void;
}

// Patterns for sensitive data detection
const SENSITIVE_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/, name: 'SSN' },
  { pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, name: 'Credit card' },
  { pattern: /\b\d{9,12}\b/, name: 'Account number' },
];

export function EntryDetail({ entry, onClose, onDelete }: EntryDetailProps) {
  const { updateEntry } = useEntriesStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState<Partial<Entry>>(entry);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sensitiveWarning, setSensitiveWarning] = useState<string | null>(null);

  const categoryInfo = getCategoryInfo(entry.category);

  const checkSensitiveData = (content: string): string | null => {
    for (const { pattern, name } of SENSITIVE_PATTERNS) {
      if (pattern.test(content)) {
        return `Content appears to contain ${name}. Consider removing sensitive information.`;
      }
    }
    return null;
  };

  const handleContentChange = (content: string) => {
    setEditedEntry({ ...editedEntry, content });
    setSensitiveWarning(checkSensitiveData(content));
  };

  const handleSave = async () => {
    await updateEntry(entry.id, editedEntry);
    setIsEditing(false);
    setSensitiveWarning(null);
  };

  const handleDelete = async () => {
    onDelete();
    onClose();
  };

  // Render wiki-style links
  const renderContent = (content: string) => {
    // Replace [[link]] with clickable spans
    const processed = content.replace(
      /\[\[([^\]]+)\]\]/g,
      '<span class="wiki-link">$1</span>'
    );
    return processed;
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/10 one-pixel-border max-w-3xl w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#195de6]/8">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ${categoryInfo.color}`}>
                {categoryInfo.icon} {categoryInfo.label}
              </span>
              {entry.subcategory && (
                <span className="text-[10px] uppercase tracking-wider text-slate-400">/ {entry.subcategory}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-[#195de6] hover:bg-[#195de6]/5 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#195de6] text-white rounded-xl text-[11px] uppercase tracking-[0.2em] px-4 py-2 hover:bg-[#195de6]/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-[#195de6] hover:bg-[#195de6]/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {isEditing ? (
              <div className="space-y-5">
                <input
                  type="text"
                  value={editedEntry.title || ''}
                  onChange={(e) => setEditedEntry({ ...editedEntry, title: e.target.value })}
                  className="w-full text-2xl font-light border-none focus:outline-none focus:ring-0 bg-transparent p-0 text-slate-900 placeholder-slate-300"
                  placeholder="Title"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-medium text-slate-500 mb-1.5">
                      Category
                    </label>
                    <select
                      value={editedEntry.category || entry.category}
                      onChange={(e) => setEditedEntry({ ...editedEntry, category: e.target.value as Category })}
                      className="w-full px-3 py-2 bg-[#195de6]/5 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 text-sm"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-medium text-slate-500 mb-1.5">
                      Owner
                    </label>
                    <select
                      value={editedEntry.owner || entry.owner}
                      onChange={(e) => setEditedEntry({ ...editedEntry, owner: e.target.value as Owner })}
                      className="w-full px-3 py-2 bg-[#195de6]/5 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 text-sm"
                    >
                      <option value="julian">Julian</option>
                      <option value="liz">Liz</option>
                      <option value="shared">Shared</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-medium text-slate-500 mb-1.5">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(editedEntry.tags || entry.tags || []).join(', ')}
                    onChange={(e) => setEditedEntry({
                      ...editedEntry,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 bg-[#195de6]/5 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 text-sm"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {sensitiveWarning && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50/80 border-none rounded-xl text-amber-800 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{sensitiveWarning}</span>
                  </div>
                )}

                <textarea
                  value={editedEntry.content || ''}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-64 px-4 py-3 bg-[#195de6]/5 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 font-mono text-sm"
                  placeholder="Write your content in Markdown..."
                />

                {/* Category-specific fields */}
                {renderCategoryFields(editedEntry, entry, setEditedEntry)}
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-light tracking-tight text-slate-900 mb-4">{entry.title}</h1>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#195de6]/5 text-[#195de6]/80 text-[10px] uppercase tracking-wider rounded-full px-2.5 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Category-specific display */}
                {renderCategoryDisplay(entry)}

                {/* Content */}
                <div className="markdown-content prose max-w-none prose-slate prose-p:font-light prose-headings:font-medium prose-headings:tracking-tight">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {renderContent(entry.content)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#195de6]/5">
            <div className="flex items-center justify-between text-[10px] tracking-widest uppercase text-slate-400">
              <span>Owner: {entry.owner}</span>
              <span>Updated: {format(new Date(entry.updated_at), 'MMM d, yyyy h:mm a')}</span>
            </div>
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <h3 className="text-lg font-light text-slate-900 mb-2">Delete this entry?</h3>
                <p className="text-sm font-light text-slate-500 mb-6">This action cannot be undone.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 one-pixel-border rounded-xl text-sm font-light text-slate-600 hover:bg-[#195de6]/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-light hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderCategoryFields(
  editedEntry: Partial<Entry>,
  entry: Entry,
  setEditedEntry: (entry: Partial<Entry>) => void
) {
  const category = editedEntry.category || entry.category;

  switch (category) {
    case 'goals':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-medium text-slate-500 mb-1.5">Status</label>
            <select
              value={editedEntry.goal_status || entry.goal_status || 'not_started'}
              onChange={(e) => setEditedEntry({ ...editedEntry, goal_status: e.target.value })}
              className="w-full px-3 py-2 bg-[#195de6]/5 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 text-sm"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-medium text-slate-500 mb-1.5">Progress %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={editedEntry.progress_percent ?? entry.progress_percent ?? 0}
              onChange={(e) => setEditedEntry({ ...editedEntry, progress_percent: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-[#195de6]/5 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 text-sm"
            />
          </div>
        </div>
      );

    case 'finance':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-medium text-slate-500 mb-1.5">Amount</label>
            <input
              type="number"
              value={editedEntry.amount ?? entry.amount ?? ''}
              onChange={(e) => setEditedEntry({ ...editedEntry, amount: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 bg-[#195de6]/5 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 text-sm"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="recurring"
              checked={editedEntry.is_recurring ?? entry.is_recurring ?? false}
              onChange={(e) => setEditedEntry({ ...editedEntry, is_recurring: e.target.checked })}
              className="w-4 h-4 rounded border-[#195de6]/20 text-[#195de6] focus:ring-[#195de6]/30"
            />
            <label htmlFor="recurring" className="text-sm font-light text-slate-600">Recurring</label>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function renderCategoryDisplay(entry: Entry) {
  switch (entry.category) {
    case 'goals':
      if (entry.progress_percent !== undefined) {
        return (
          <div className="mb-5 p-4 bg-[#195de6]/[0.03] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-slate-500">Progress</span>
              <span className="text-sm font-light text-slate-700">{entry.progress_percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#195de6]/10 rounded-full">
              <div
                className="h-full bg-[#195de6] rounded-full transition-all"
                style={{ width: `${entry.progress_percent}%` }}
              />
            </div>
            {entry.goal_status && (
              <div className="mt-2 text-[10px] tracking-wider uppercase text-slate-400">
                Status: {entry.goal_status.replace('_', ' ')}
              </div>
            )}
          </div>
        );
      }
      return null;

    case 'finance':
      if (entry.amount !== undefined) {
        return (
          <div className="mb-5 p-4 bg-[#195de6]/[0.03] rounded-xl">
            <div className="text-2xl font-light tracking-tighter text-slate-800">
              ${entry.amount.toLocaleString()}
            </div>
            {entry.is_recurring && (
              <div className="text-[10px] tracking-wider uppercase text-slate-400 mt-1">
                Recurring {entry.frequency || 'expense'}
              </div>
            )}
          </div>
        );
      }
      return null;

    default:
      return null;
  }
}
