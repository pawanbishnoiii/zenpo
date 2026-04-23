import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full rounded-2xl glass-card shadow-elevated p-6 space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-foreground">{this.props.fallbackTitle || 'Something went wrong'}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Don't worry — your data is safe. Please reload the page to continue.
              </p>
              {this.state.error?.message && (
                <p className="text-xs text-muted-foreground mt-3 font-mono bg-muted/50 rounded-lg px-3 py-2 break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={this.handleHome}
                className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-colors">
                <Home className="w-4 h-4" /> Home
              </button>
              <button onClick={this.handleReload}
                className="flex-[2] py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 glow-primary">
                <RefreshCw className="w-4 h-4" /> Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
