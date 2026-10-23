import { Component } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

export class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in component tree:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper p-4 font-km dark:bg-stone-950">
          <div className="w-full max-w-lg space-y-6 rounded-[32px] border border-sage-deep bg-white p-8 text-center shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage text-forest dark:bg-brand-950/60 dark:text-brand-300">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-forest dark:text-white">
                មានបញ្ហាបច្ចេកទេស / Something went wrong
              </h2>
              <p className="mx-auto mt-2 max-w-prose text-sm leading-relaxed text-muted dark:text-stone-400">
                An unexpected interface error occurred. Please try reloading the page.
              </p>
            </div>

            {this.state.error && (
              <div className="max-h-40 overflow-y-auto break-all rounded-2xl bg-sage/60 p-4 text-left font-mono text-xs text-rose-600 dark:bg-stone-800/80 dark:text-rose-400">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-forest shadow-md transition-all hover:bg-brand-400"
              >
                <RotateCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 rounded-full bg-sage px-6 py-3 text-sm font-bold text-forest transition-all hover:bg-brand-100 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
