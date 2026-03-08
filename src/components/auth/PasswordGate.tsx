import { useState, useEffect, type FormEvent } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Lock } from 'lucide-react';

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, error, login, checkSession } = useAuthStore();
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    await login(password, rememberMe);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f6] dark:bg-[#0f1219]">
        <div className="animate-pulse text-slate-400 text-[10px] uppercase tracking-widest font-light">
          Loading...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f8f6] dark:bg-[#0f1219] px-4">
      <div className="max-w-sm w-full">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl one-pixel-border rounded-2xl p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#195de6]/5 one-pixel-border mb-6">
              <Lock className="w-6 h-6 text-[#195de6]" />
            </div>
            <h1 className="text-xs tracking-[0.3em] uppercase font-light text-[#195de6] mb-2">
              JULIZ
            </h1>
            <p className="text-sm font-light text-slate-400">
              Enter password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#195de6]/5 border-none rounded-full py-3 pl-12 pr-4 text-sm font-light text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 transition-all"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3 h-3 text-[#195de6] border-[#195de6]/20 rounded focus:ring-[#195de6]/20"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-light"
                >
                  Remember me for 30 days
                </label>
              </div>

              {error && (
                <div className="bg-red-50/80 text-red-600 text-sm font-light px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className="w-full bg-[#195de6] text-white py-3 rounded-xl text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#195de6]/90 focus:outline-none focus:ring-1 focus:ring-[#195de6]/30 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
