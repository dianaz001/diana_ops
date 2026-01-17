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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className={`text-sm px-2 py-1 rounded-full ${categoryInfo.color}`}>
                {categoryInfo.icon} {categoryInfo.label}
              </span>
              {entry.subcategory && (
                <span className="text-sm text-gray-500">/ {entry.subcategory}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedEntry.title || ''}
                  onChange={(e) => setEditedEntry({ ...editedEntry, title: e.target.value })}
                  className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 p-0"
                  placeholder="Title"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editedEntry.category || entry.category}
                      onChange={(e) => setEditedEntry({ ...editedEntry, category: e.target.value as Category })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner
                    </label>
                    <select
                      value={editedEntry.owner || entry.owner}
                      onChange={(e) => setEditedEntry({ ...editedEntry, owner: e.target.value as Owner })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="julian">Julian</option>
                      <option value="liz">Liz</option>
                      <option value="shared">Shared</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(editedEntry.tags || entry.tags || []).join(', ')}
                    onChange={(e) => setEditedEntry({
                      ...editedEntry,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {sensitiveWarning && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{sensitiveWarning}</span>
                  </div>
                )}

                <textarea
                  value={editedEntry.content || ''}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Write your content in Markdown..."
                />

                {/* Category-specific fields */}
                {renderCategoryFields(editedEntry, entry, setEditedEntry)}
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{entry.title}</h1>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Category-specific display */}
                {renderCategoryDisplay(entry)}

                {/* Content */}
                <div className="markdown-content prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {renderContent(entry.content)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex items-center justify-between">
              <span>Owner: {entry.owner}</span>
              <span>Updated: {format(new Date(entry.updated_at), 'MMM d, yyyy h:mm a')}</span>
            </div>
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Delete this entry?</h3>
                <p className="text-gray-500 mb-4">This action cannot be undone.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={editedEntry.goal_status || entry.goal_status || 'not_started'}
              onChange={(e) => setEditedEntry({ ...editedEntry, goal_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={editedEntry.progress_percent ?? entry.progress_percent ?? 0}
              onChange={(e) => setEditedEntry({ ...editedEntry, progress_percent: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );

    case 'finance':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={editedEntry.amount ?? entry.amount ?? ''}
              onChange={(e) => setEditedEntry({ ...editedEntry, amount: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="recurring"
              checked={editedEntry.is_recurring ?? entry.is_recurring ?? false}
              onChange={(e) => setEditedEntry({ ...editedEntry, is_recurring: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="recurring" className="text-sm text-gray-700">Recurring</label>
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
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-semibold">{entry.progress_percent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${entry.progress_percent}%` }}
              />
            </div>
            {entry.goal_status && (
              <div className="mt-2 text-sm text-gray-500">
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
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${entry.amount.toLocaleString()}
            </div>
            {entry.is_recurring && (
              <div className="text-sm text-green-600 mt-1">
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
