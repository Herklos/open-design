import { Suspense, lazy, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FolderOpen, AlertCircle } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary.jsx';

// Vite resolves this glob at build/dev time.
// Each project's App.jsx becomes a lazy-loaded module with HMR.
const modules = import.meta.glob('/projects/*/App.jsx');

function NotFound({ name }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-center p-8">
      <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
      <p className="font-semibold">Project not found: <code className="font-mono">{name}</code></p>
      <p className="text-sm text-muted-foreground">
        Make sure <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">projects/{name}/App.jsx</code> exists.
      </p>
      <Link to="/" className="mt-2 text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground">
        Back to dashboard
      </Link>
    </div>
  );
}

export default function Preview() {
  const { name } = useParams();
  const key = `/projects/${name}/App.jsx`;
  const [healthError, setHealthError] = useState(null);

  useEffect(() => {
    fetch(`/api/projects/${name}/health`)
      .then(r => r.json())
      .then(d => { if (d.status === 'error') setHealthError(d.error); else setHealthError(null); })
      .catch(() => { /* server not ready yet */ });
  }, [name]);

  const ProjectApp = modules[key] ? lazy(modules[key]) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b px-4 py-2.5 text-sm sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <span className="text-border">|</span>
        <span className="font-medium">{name}</span>
        {healthError && (
          <span className="ml-2 flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            compile error — check terminal
          </span>
        )}
        <button
          className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => window.open(`/p/${name}`, '_blank')}
          title="Open in new tab"
        >
          <FolderOpen className="h-3.5 w-3.5" /> open standalone
        </button>
      </header>

      <main className="flex-1">
        {!ProjectApp ? (
          <NotFound name={name} />
        ) : (
          <ErrorBoundary key={name}>
            <Suspense fallback={
              <div className="flex items-center justify-center py-24 text-sm text-muted-foreground animate-pulse">
                Loading {name}…
              </div>
            }>
              <ProjectApp />
            </Suspense>
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}
