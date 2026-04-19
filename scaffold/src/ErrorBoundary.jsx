import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

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
          <p className="font-semibold text-destructive">Runtime error in project</p>
          <pre className="max-w-xl overflow-auto rounded-lg bg-muted px-4 py-3 text-left text-xs text-muted-foreground">
            {this.state.error.message}
            {this.state.error.stack && '\n\n' + this.state.error.stack}
          </pre>
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
