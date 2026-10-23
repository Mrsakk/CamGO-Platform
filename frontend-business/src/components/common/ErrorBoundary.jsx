import { Component } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

export class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-4 dark:bg-[#0B1409]">
        <div className="w-full max-w-md space-y-6 rounded-[32px] border border-sage-deep bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-forest dark:bg-brand-950/40 dark:text-brand-300">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-forest dark:text-white">
                មានបញ្ហាបច្ចេកទេស / Something went wrong
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted dark:text-slate-400">
                An unexpected interface error occurred. Please try reloading the page.
              </p>
            </div>

            {this.state.error && (
              <div className="max-h-36 overflow-y-auto break-all rounded-2xl bg-sage/60 p-3 text-left font-mono text-xs text-rose-600 dark:bg-slate-800 dark:text-rose-400">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button type="button" onClick={this.handleReload} className="btn-primary">
                <RotateCw className="h-4 w-4" />
                <span>Reload</span>
              </button>
              <button type="button" onClick={this.handleHome} className="btn-secondary">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
