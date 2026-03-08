import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'juliz-version-shown';
const POLL_INTERVAL = 60_000;

interface VersionData {
  version: string;
  buildTime?: string;
}

export function VersionUpdateBanner() {
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const currentVersion: string =
    typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

  const shouldShow = useCallback(
    (serverVersion: string) => {
      if (serverVersion === currentVersion) return false;
      if (serverVersion === 'dev') return false;
      if (sessionStorage.getItem(SESSION_KEY) === serverVersion) return false;
      return true;
    },
    [currentVersion]
  );

  const handleVersionDetected = useCallback(
    (data: VersionData) => {
      if (!data.version || !shouldShow(data.version)) return;
      sessionStorage.setItem(SESSION_KEY, data.version);
      setUpdateVersion(data.version);
    },
    [shouldShow]
  );

  // Listen for custom window event (from early script or SW)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<VersionData>).detail;
      handleVersionDetected(detail);
    };
    window.addEventListener('juliz-version-update', handler);
    return () => window.removeEventListener('juliz-version-update', handler);
  }, [handleVersionDetected]);

  // Listen for SW postMessage directly
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'VERSION_UPDATE') {
        handleVersionDetected(e.data);
      }
    };
    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }, [handleVersionDetected]);

  // One-time initial fetch + periodic polling
  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const resp = await fetch(`/version.json?_cb=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!resp.ok) return;
        const data: VersionData = await resp.json();
        if (!cancelled) handleVersionDetected(data);
      } catch {
        // ignore
      }
    }

    check();
    const id = setInterval(check, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [handleVersionDetected]);

  // Supabase realtime: listen for app_version inserts
  useEffect(() => {
    const channel = supabase
      .channel('app-version-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'app_version' },
        (payload) => {
          const row = payload.new as { version?: string; deployed_at?: string };
          if (row.version) {
            handleVersionDetected({
              version: row.version,
              buildTime: row.deployed_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleVersionDetected]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Tell SW to skipWaiting if there's a waiting worker
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('skipWaiting');
    }
    // Force reload with cache-busting param
    window.location.href =
      window.location.pathname + '?_reload=' + Date.now();
  };

  if (!updateVersion) return null;

  return (
    <div
      data-version-banner
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down"
    >
      <div className="flex items-center gap-3 bg-[#195de6] text-white pl-4 pr-2 py-2 rounded-xl shadow-lg shadow-[#195de6]/25 text-sm font-medium">
        <span>Update available</span>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-60 px-3 py-1 rounded-lg text-xs uppercase tracking-wider font-medium transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}
