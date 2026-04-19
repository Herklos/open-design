import { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FolderOpen, AlertCircle, RefreshCw } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary.jsx';

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

function CompileError({ error }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
      <div className="w-full max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
        <div className="flex items-center gap-2 text-destructive font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Compile error — fix the issue in your editor and save to reload
        </div>
        <pre className="overflow-auto rounded-lg bg-background/60 border border-destructive/20 px-4 py-3 text-xs font-mono text-destructive/80 leading-relaxed whitespace-pre-wrap">
          {error?.message ?? JSON.stringify(error, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function Preview() {
  const { name } = useParams();
  const key = `/projects/${name}/App.jsx`;
  const [healthError, setHealthError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const checkHealth = useCallback(() => {
    fetch(`/api/projects/${name}/health`)
      .then(r => r.json())
      .then(d => { if (d.status === 'error') setHealthError(d.error); else setHealthError(null); })
      .catch(() => { /* server not ready yet */ });
  }, [name]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleReload = () => {
    setHealthError(null);
    setReloadKey(k => k + 1);
    checkHealth();
  };

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
          <span className="flex items-center gap-1 text-xs text-destructive font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            compile error
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleReload}
            aria-label="Reload preview"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reload
          </button>
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => window.open(`/p/${name}`, '_blank')}
            aria-label="Open in new tab"
          >
            <FolderOpen className="h-3.5 w-3.5" /> open standalone
          </button>
        </div>
      </header>

      <main className="flex-1">
        {!ProjectApp ? (
          <NotFound name={name} />
        ) : healthError ? (
          <CompileError error={healthError} />
        ) : (
          <ErrorBoundary key={`${name}-${reloadKey}`} onRetry={handleReload}>
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
