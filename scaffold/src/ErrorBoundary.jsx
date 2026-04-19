import { Component, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

function ErrorDetails({ error }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-xl space-y-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        {open ? 'Hide' : 'Show'} details
      </button>
      {open && (
        <pre className="overflow-auto rounded-lg bg-muted px-4 py-3 text-left text-xs text-muted-foreground leading-relaxed">
          {error.stack || error.message}
        </pre>
      )}
    </div>
  );
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center bg-background">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <p className="font-semibold text-destructive">Runtime error in project</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {this.state.error.message}
            </p>
          </div>
          <ErrorDetails error={this.state.error} />
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            onClick={() => { this.props.onRetry?.(); this.setState({ error: null }); }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
