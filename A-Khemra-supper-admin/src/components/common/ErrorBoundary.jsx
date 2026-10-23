import { Component } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null
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
      return <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4 font-km">
          <div className="max-w-lg w-full bg-white dark:bg-stone-100 rounded-3xl p-8 shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-h2 font-bold text-stone-900 dark:text-stone-900 tracking-tight">
                មានបញ្ហាបច្ចេកទេស / Something went wrong
              </h2>
              <p className="text-body text-stone-500 dark:text-stone-400 mt-2 leading-relaxed max-w-prose mx-auto">
                An unexpected interface error occurred. Please try reloading the page.
              </p>
            </div>

            {this.state.error && <div className="text-left bg-stone-100 dark:bg-stone-800/80 p-4 rounded-xl text-small font-mono text-rose-600 dark:text-rose-400 max-h-40 overflow-y-auto break-all">
                {this.state.error.toString()}
              </div>}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-body shadow-md transition-all flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="px-6 py-3 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-300 text-stone-800 dark:text-stone-700 font-bold text-body transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>;
    }
    return this.props.children;
  }
}
export {
  ErrorBoundary
};
