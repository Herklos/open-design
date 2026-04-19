import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Clock, ExternalLink, Palette } from 'lucide-react';

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

function ProjectCard({ project, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex h-32 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground text-4xl">
        <Palette className="h-10 w-10 opacity-30 group-hover:opacity-60 transition-opacity" />
      </div>
      <div>
        <p className="font-semibold text-sm truncate">{project.name}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <Clock className="h-3 w-3" />
          {formatDate(project.updatedAt)}
        </p>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
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
    window.addEventListener('visibilitychange', onFocus);
    return () => { clearInterval(interval); window.removeEventListener('visibilitychange', onFocus); };
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Layers className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Claude Design</span>
          <span className="ml-auto text-xs text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Palette className="h-12 w-12 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">No projects yet</p>
            <p className="text-sm text-muted-foreground/70 max-w-xs">
              Run <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">/design &lt;name&gt; &lt;prompt&gt;</code> in your Claude Code terminal to create your first prototype.
            </p>
          </div>
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
