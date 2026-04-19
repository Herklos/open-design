# Claude Design — Project Memory

## Plugin
`claude-design` is installed. Use `/design*` commands, the `designer` subagent, and
`mcp__claude-design__*` MCP tools for all prototype work.

## Repository Structure

```
(repo root)/
├── projects/           ← one sub-directory per design project
│   └── <name>/
│       ├── App.jsx     ← default export, entry point — NEVER rename
│       └── components/ ← optional sub-components for this project
├── shared/             ← shared primitives (read-only — do not modify)
│   ├── ui/             ← shadcn-style component files
│   └── lib/
│       └── utils.js    ← cn() helper
├── src/                ← preview app shell (do not edit)
│   ├── main.jsx
│   └── router.jsx
├── vite.config.js
└── package.json
```

Only write inside `projects/<name>/`. Do not modify `shared/`, `src/`, or config files.

## Available Shared UI Components

All components below are pre-installed. Import them with `@shared/ui/*` — do not install or inline them.

```js
// Primitives
import { Button }                                                     from '@shared/ui/button'
import { Card, CardHeader, CardTitle, CardDescription,
         CardContent, CardFooter }                                    from '@shared/ui/card'
import { Input }                                                      from '@shared/ui/input'
import { Label }                                                      from '@shared/ui/label'
import { Badge }                                                      from '@shared/ui/badge'
import { Separator }                                                  from '@shared/ui/separator'

// Compound components
import { Tabs, TabsList, TabsTrigger, TabsContent }                   from '@shared/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle,
         DialogDescription, DialogFooter, DialogTrigger }            from '@shared/ui/dialog'

// Utility
import { cn } from '@shared/lib/utils'
```

### Icons
```js
import { Check, Trash2, Plus, Search, X, ChevronDown,
         ChevronRight, Star, Heart, Settings, Edit,
         Copy, Download, Upload, ArrowRight, Home,
         User, Bell, Mail } from 'lucide-react'
```

## Key Constraints

- **Tailwind v4 only** — utility classes only; no inline `style={{}}` (except truly dynamic values); no per-project CSS files.
- **Browser-only code** — no Node built-ins (`fs`, `path`, `os`, `crypto`). No `require()`. No `process.env` (use `import.meta.env` for Vite env vars).
- **No external fetches** — no `fetch()` to third-party URLs. Use static/mock data for prototypes.
- **No 3rd-party component libraries** — use `@shared/ui/*` primitives. Do not `npm install` anything.

## Workflow
1. Write / edit files under `projects/<name>/`.
2. **After every write or edit, call `mcp__claude-design__design_health`** with the project name to check for compile errors. Do not skip this step — it is the only way to confirm the preview is healthy.
3. If `design_health` returns an error, diagnose and fix it immediately before continuing.
4. Only report done once `design_health` returns clean.
5. End every response with: `Preview: <URL from design_url>`

## URLs
| Purpose       | URL                               |
|---------------|-----------------------------------|
| Dev server    | http://localhost:5173             |
| Dashboard     | http://localhost:5173             |
| Project route | http://localhost:5173/p/<name>    |

Start dev server: `design start` or `npm run dev`
