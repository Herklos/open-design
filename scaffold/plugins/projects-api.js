import fs from 'node:fs';
import path from 'node:path';

// Per-project compile error store, updated by the transform hook.
const errors = new Map();

export function projectsApiPlugin() {
  return {
    name: 'projects-api',

    // Track transform errors per project
    transform(code, id, options) {
      const match = id.match(/\/projects\/([^/]+)\/.*\.jsx$/);
      if (match) {
        // If we get here without error, clear any previous error
        errors.set(match[1], null);
      }
    },

    // Clear errors on successful hot updates
    handleHotUpdate({ file, server }) {
      const match = file.match(/\/projects\/([^/]+)\/.*\.jsx$/);
      if (match) errors.set(match[1], null);
    },

    configureServer(server) {
      const root = server.config.root;
      const projectsDir = path.join(root, 'projects');

      // Intercept outgoing WebSocket messages to capture compile errors sent to the browser.
      // server.ws.send() is how Vite pushes error payloads; server.ws.on() only receives
      // messages FROM the browser, so listening there would never fire for build errors.
      const origSend = server.ws.send.bind(server.ws);
      server.ws.send = function (payload) {
        if (payload?.type === 'error' && payload?.err?.id) {
          const match = payload.err.id.match(/\/projects\/([^/]+)\//);
          if (match) {
            errors.set(match[1], {
              message: payload.err.message,
              loc: payload.err.loc,
            });
          }
        }
        return origSend(payload);
      };

      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        // GET /api/health
        if (url.pathname === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        // GET /api/projects
        if (url.pathname === '/api/projects' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          if (!fs.existsSync(projectsDir)) { res.end('[]'); return; }

          const projects = fs.readdirSync(projectsDir, { withFileTypes: true })
            .filter(e => e.isDirectory())
            .filter(e => fs.existsSync(path.join(projectsDir, e.name, 'App.jsx')))
            .map(e => {
              const appPath = path.join(projectsDir, e.name, 'App.jsx');
              const stat = fs.statSync(appPath);
              const firstLine = fs.readFileSync(appPath, 'utf8').split('\n')[0] ?? '';
              const wireframe = firstLine.startsWith('// @wireframe');
              return {
                name: e.name,
                updatedAt: stat.mtime.toISOString(),
                previewUrl: `http://localhost:${server.config.server.port ?? 5173}/p/${e.name}`,
                entry: 'App.jsx',
                wireframe,
              };
            })
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

          res.end(JSON.stringify(projects));
          return;
        }

        // GET /api/projects/:name/health
        const healthMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/health$/);
        if (healthMatch && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const name = healthMatch[1];
          const err = errors.get(name);
          if (err) {
            res.end(JSON.stringify({ status: 'error', error: err }));
          } else {
            const appPath = path.join(projectsDir, name, 'App.jsx');
            const exists = fs.existsSync(appPath);
            let wireframe = false;
            if (exists) {
              const firstLine = fs.readFileSync(appPath, 'utf8').split('\n')[0] ?? '';
              wireframe = firstLine.startsWith('// @wireframe');
            }
            res.end(JSON.stringify({ status: exists ? 'ok' : 'not_found', error: null, wireframe }));
          }
          return;
        }

        next();
      });
    },
  };
}
