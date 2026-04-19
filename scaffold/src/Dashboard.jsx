import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Clock, ExternalLink, Palette, Copy, Check, Terminal } from 'lucide-react';

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString();
}

function CopyUrlButton({ name }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/p/${name}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Copy preview URL"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied!' : 'Copy URL'}
    </button>
  );
}

function ProjectCard({ project, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex h-32 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground text-4xl">
        <Palette className="h-10 w-10 opacity-30 group-hover:opacity-60 transition-opacity" />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{project.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3 shrink-0" />
            {formatDate(project.updatedAt)}
          </p>
        </div>
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyUrlButton name={project.name} />
        </div>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div className="rounded-full bg-muted p-4">
        <Palette className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-foreground">No projects yet</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Start a new prototype by running the <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">/design</code> command in your Claude Code terminal.
        </p>
      </div>
      <div className="w-full max-w-sm rounded-lg border bg-muted/50 text-left">
        <div className="flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          Claude Code terminal
        </div>
        <pre className="px-4 py-3 text-xs font-mono text-foreground leading-relaxed">{`/design my-app Build a todo list with\n         drag-and-drop reordering`}</pre>
      </div>
      <p className="text-xs text-muted-foreground/60">
        Projects appear here automatically once created.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) setProjects(await res.json());
    } catch {
      // server might not be ready yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 5_000);
    const onFocus = () => fetchProjects();
    document.addEventListener('visibilitychange', onFocus);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onFocus); };
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Layers className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Open Design</span>
          <span className="ml-auto text-xs text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">Loading…</div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {projects.map(p => (
              <ProjectCard key={p.name} project={p} onClick={() => navigate(`/p/${p.name}`)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
