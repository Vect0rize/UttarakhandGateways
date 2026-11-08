import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
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
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = '/';
    }
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
              An unexpected issue occurred while rendering this page. You can return to the marketplace anytime.
            </p>
            {this.state.error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-left text-xs font-mono text-rose-700 dark:text-rose-300 overflow-x-auto select-all max-h-40">
                <strong>Error:</strong> {this.state.error.message}
                {this.state.error.stack && (
                  <pre className="mt-1 text-[10px] opacity-80 whitespace-pre-wrap">{this.state.error.stack}</pre>
                )}
              </div>
            )}
            <div className="pt-2 flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
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
