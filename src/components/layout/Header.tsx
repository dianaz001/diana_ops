import { useState } from 'react';
import { Search, Plus, RefreshCw, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
  onSearch: (query: string) => void;
  onQuickCapture: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export function Header({ onSearch, onQuickCapture, onSync, isSyncing }: HeaderProps) {
  const { logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Debounced search on type
    onSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f9f8f6]/80 backdrop-blur-md border-b border-[#195de6]/5">
      <div className="px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile brand (hidden on desktop where sidebar has it) */}
          <div className="lg:hidden flex items-center">
            <span className="text-xs uppercase tracking-[0.3em] font-light text-[#195de6]">
              JULIZ
            </span>
          </div>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search everything..."
                  className="w-full bg-[#195de6]/5 border-none rounded-full py-2.5 pl-10 pr-4 text-xs font-light text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 transition-all"
                />
              </div>
            </form>
          </div>

          {/* Actions - desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="p-2 text-slate-400 hover:text-[#195de6] transition-colors disabled:opacity-40"
              title="Sync with GitHub"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onQuickCapture}
              className="flex items-center gap-2 bg-[#195de6] text-white px-4 py-2 rounded-xl text-[11px] uppercase tracking-[0.2em] font-medium shadow-lg shadow-[#195de6]/20 hover:bg-[#195de6]/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture</span>
            </button>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-[#195de6] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-[#195de6] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-6 pb-3">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search everything..."
              className="w-full bg-[#195de6]/5 border-none rounded-full py-2.5 pl-10 pr-4 text-xs font-light text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 transition-all"
            />
          </div>
        </form>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#195de6]/5 px-6 py-3">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onSync();
                setMobileMenuOpen(false);
              }}
              disabled={isSyncing}
              className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-[#195de6] rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-[11px] uppercase tracking-[0.2em]">Sync with GitHub</span>
            </button>
            <button
              onClick={() => {
                onQuickCapture();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-[#195de6] rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[11px] uppercase tracking-[0.2em]">Quick Capture</span>
            </button>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-[#195de6] rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[11px] uppercase tracking-[0.2em]">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
