import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

function isChunkLoadError(err?: Error): boolean {
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('unable to preload css') ||
    msg.includes('loading chunk') ||
    msg.includes('loading css chunk')
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    if (isChunkLoadError(error)) {
      try {
        const reloadKey = `ukg_chunk_reload_${window.location.pathname}`;
        const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
        if (Date.now() - lastReload > 15000) {
          sessionStorage.setItem(reloadKey, String(Date.now()));
          window.location.reload();
        }
      } catch {}
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = '/';
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#071a14] flex items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-white dark:bg-[#0b271d] p-8 rounded-3xl border border-slate-200 dark:border-emerald-800 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif-luxury">
              {this.props.fallbackTitle || 'Unable to display page'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              A new update may have been deployed or a temporary connection issue occurred. Reloading refreshes the latest version.
            </p>
            <div className="pt-2 flex flex-wrap gap-2.5 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 dark:border-emerald-700 text-slate-700 dark:text-emerald-200 font-bold text-xs transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
