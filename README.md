# Herklaude Design

A Claude Code plugin that lets you build and iterate on React prototypes from your terminal. Claude writes JSX; a local Vite dev server renders it live in your browser. The workflow mirrors Anthropic's Herklaude Design tool (launched April 2026), but runs entirely on your machine — no cloud preview service, no usage limits beyond your Claude subscription, and every project is just a file in `projects/`.

---

## What it is

herklaude-design turns Claude Code into a local React prototyping environment. You describe a UI in plain English; Claude writes `projects/<name>/App.jsx`; Vite's HMR pushes it to your browser in under a second. You keep chatting to iterate — add features, change the layout, fix a bug — and the preview updates without a reload. All your projects live as ordinary React files in your repository: edit them by hand, commit them to git, or deploy them anywhere.

---

## How it works

```
You (terminal)
     │
     │  /design <name> <prompt>
     ▼
┌─────────────────┐
│  /design command │  — ensures server is running, parses name + prompt
└────────┬────────┘
         │  delegates
         ▼
┌─────────────────┐
│ designer subagent│  — reads existing files, writes/edits projects/<name>/App.jsx
│  (claude-sonnet) │    calls design_health after every write, self-corrects errors
└────────┬────────┘
         │  file write triggers
         ▼
┌─────────────────┐
│   Vite HMR      │  — detects file change, pushes update to open browser tab
└────────┬────────┘
         │
         ▼
   Browser preview
   http://localhost:5173/p/<name>
```

The designer subagent is the core workhorse. It knows all the shared UI primitives, Tailwind constraints, and React best practices, so you don't have to repeat them in every prompt.

---

## Example projects

**Todo app**

```
/design todo-app "A minimal todo list with add, toggle done, and delete. Show a count of remaining items and a clear-completed button."
```

Produces `projects/todo-app/App.jsx`: a stateful list with a controlled input, checkbox toggles, item deletion, and a footer counter — all using `Input`, `Button`, and `Badge` from `@shared/ui`.

---

**Pricing page**

```
/design pricing "Three-tier SaaS pricing page: Free, Pro ($29/mo), Enterprise (contact us). Highlight the Pro tier. Include a feature comparison table below the cards."
```

Produces `projects/pricing/App.jsx`: a responsive pricing grid with a highlighted `Card` for the Pro tier, feature rows with `Check` and `X` icons from lucide-react, and a sticky CTA.

---

**Analytics dashboard**

```
/design dashboard "Admin dashboard with a sidebar nav (Overview, Users, Revenue, Settings), KPI cards at the top (total users, MRR, churn rate), and a placeholder chart area."
```

Produces `projects/dashboard/App.jsx` with sub-components in `projects/dashboard/components/` — a `Sidebar.jsx`, `KpiCard.jsx`, and a chart placeholder that renders a bar-chart skeleton using only Tailwind divs.

---

## Requirements

- **Node.js 18+**
- **Claude Code** (any recent version)
- **Claude Pro, Max, Team, or Enterprise** — subagent support is required for the designer and reviewer agents

---

## Installation

### Step 1 — Install the plugin

**From the marketplace** (once published):

```bash
claude plugin install herklaude-design
```

**Local install** (for development or if you cloned this repo):

```bash
claude plugin install --local /path/to/herklaude-design-plugin
```

### Step 2 — Install MCP server dependencies

Run this inside the plugin directory:

```bash
npm install
```

This installs `@modelcontextprotocol/sdk` and any other runtime dependencies the MCP server needs. The MCP tools (`design_health`, `design_url`, etc.) will not be available until this step is done.

### Step 3 — Initialize a repo

Navigate to the directory where you want your design projects to live and run:

```
/design-init
```

This command copies the Vite preview app scaffold into your repo, runs `npm install`, and starts the dev server. The dashboard opens automatically at [http://localhost:5173](http://localhost:5173).

You only need to run `/design-init` once per repo.

---

## Quick start

```
/design todo-app "A minimal todo app with add, toggle, and delete. Use shadcn Button and Input."
```

Claude creates `projects/todo-app/App.jsx` and the preview appears at [http://localhost:5173/p/todo-app](http://localhost:5173/p/todo-app).

Keep chatting to iterate:

```
/design todo-app "add a count of remaining items and a clear completed button"
```

Claude reads the existing file, makes targeted edits, and Vite hot-reloads the change. No restart, no rewrite.

---

## All commands

| Command | Description |
|---|---|
| `/design-init` | Scaffold the preview app into the current repo |
| `/design <name> <prompt>` | Create a new project or iterate on an existing one |
| `/design-list` | List all projects with their preview URLs |
| `/design-preview <name>` | Open a project in the browser |
| `/design-start` | Start the Vite dev server |
| `/design-stop` | Stop the Vite dev server |
| `/design-status` | Show server status and the full project list |
| `/design-delete <name>` | Delete a project (prompts for confirmation) |
| `/design-rename <old> <new>` | Rename a project and update its preview URL |

---

## How projects are structured

After `/design-init`, your repo looks like this:

```
your-repo/
├── projects/
│   └── <name>/
│       ├── App.jsx          ← entry point (always this file — never rename it)
│       └── components/      ← sub-components (optional)
├── shared/
│   ├── ui/                  ← shadcn-style primitives
│   └── lib/
│       └── utils.js         ← cn() helper
├── src/                     ← preview app shell (don't edit)
│   ├── main.jsx
│   └── router.jsx
├── vite.config.js
├── tailwind.config.js
└── package.json
```

Each project is a self-contained directory. `App.jsx` is the single entry point the preview router mounts at `/p/<name>`. You can add as many files as you want under `projects/<name>/components/` — just import them with relative paths.

Projects are plain files. You own them. Put them in git, copy them to another project, or open them in your editor — they have no magic dependencies beyond React, Tailwind, and the shared UI primitives.

---

## Shared UI primitives

All projects can use these components without any setup. They are shadcn/ui-compatible components bundled with the plugin:

```jsx
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@shared/ui/card';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Badge } from '@shared/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shared/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@shared/ui/dialog';
import { Separator } from '@shared/ui/separator';
import { cn } from '@shared/lib/utils';
```

Icons from `lucide-react` are also available:

```jsx
import { Check, Trash2, Plus, Search, ChevronDown, X } from 'lucide-react';
```

Claude knows to use these automatically. You can use them in files you write by hand too.

---

## Managing the preview server

The dev server starts automatically the first time you run `/design` or `/design-init`. You can also control it manually:

```
/design-start   — start the Vite dev server
/design-stop    — stop it
/design-status  — check whether it's running and list projects
```

Server logs are written to `.design/server.log` in your repo root. If you need to debug a startup failure, check there first.

The server runs on port **5173** by default. The dashboard (project list) is at [http://localhost:5173](http://localhost:5173). Each project is at [http://localhost:5173/p/<name>](http://localhost:5173/p/<name>).

---

## How iterating works

Running `/design <name>` with the same project name always **iterates on the existing project** — it never starts from scratch unless you explicitly ask it to. This means:

- Your existing state logic, component structure, and sub-components are preserved.
- The designer reads the current files first, then makes targeted edits with the `Edit` tool.
- You can layer changes across many turns: build the skeleton, then add a feature, then restyle it.

To start completely fresh on an existing project, tell Claude explicitly:

```
/design todo-app "start from scratch — I want a completely different layout"
```

Detailed iteration flow:

1. You run `/design <name> "<change>"`.
2. The designer subagent reads the current `App.jsx` and any referenced component files.
3. It makes targeted edits with the `Edit` tool — existing state logic and structure are preserved unless you asked to start over.
4. Vite's HMR detects the file change and pushes the update to your browser tab. No page reload needed.
5. A PostToolUse hook calls `design_health` automatically. If there is a compile error, the designer self-corrects before returning control to you.
6. The response ends with a `Preview: <url>` line.

---

## Reviewing a project

Ask Claude to review any project:

```
/design todo-app looks good?
```

or

```
review my todo-app design project
```

The reviewer subagent runs a structured checklist:
- Compile health (via `design_health`)
- `App.jsx` exists with a default export
- All `.map()` calls have `key` props
- `@shared/ui/*` imports resolve correctly
- No forbidden Node.js built-ins (`fs`, `path`, etc.)
- Accessibility basics (image `alt`, icon button `aria-label`, form labels)
- All requested features from the original prompt are present

Output is a short markdown checklist with `✓` / `✗` / `⚠` per item.

---

## Troubleshooting

**Port 5173 already in use**

Another process is holding the port. Run `/design-stop` to kill any stale process managed by the plugin, then `/design-start`. If the port is held by something unrelated, find it with `lsof -i :5173` and kill it manually.

**Preview shows "Project not found"**

The preview router looks for `projects/<name>/App.jsx`. If that file doesn't exist, you'll see this page. Run `/design-list` to see what projects are registered. If the file exists but the route still 404s, restart the server with `/design-stop` then `/design-start`.

**Compile error badge in the preview**

The PostToolUse hook catches most errors automatically and Claude self-corrects. If an error persists, run:

```
/design <name> "fix the current compile error"
```

You can also check `.design/server.log` for the raw Vite error output.

**Subagent not available** (error mentioning "subagent" or "agent support")

The designer and reviewer agents run as subagents. Subagent support requires **Claude Pro, Max, Team, or Enterprise** — it is not available on the free tier. Upgrade your Claude subscription, or switch to one of those plans in Claude Code settings.

---

**MCP tools not available** (`mcp__herklaude-design__*` tools are missing)

The MCP server failed to start, usually because `npm install` was not run in the plugin directory. Run:

```bash
cd /path/to/herklaude-design-plugin
npm install
```

Then reload Claude Code. The `.mcp.json` in the plugin directory points Claude Code to `mcp/server.mjs`; if Node can't resolve `@modelcontextprotocol/sdk`, the server exits on startup.

**Changes not reflecting in the browser**

Vite's HMR requires the browser tab to stay open and connected. If you closed and reopened the tab, hard-reload it (`Cmd+Shift+R` / `Ctrl+Shift+R`) to re-establish the HMR websocket. If HMR is broken, run `/design-stop` then `/design-start`.

---

## Contributing

The plugin is structured as follows:

```
herklaude-design/
├── agents/
│   ├── designer.md          ← subagent: writes and edits React prototypes
│   └── design-reviewer.md   ← subagent: reviews projects for quality
├── bin/
│   └── design.mjs           ← CLI helper
├── commands/                ← slash command definitions
├── hooks/                   ← PostToolUse hooks (auto compile-check)
├── mcp/
│   └── server.mjs           ← MCP server exposing design_* tools
├── scaffold/                ← Vite app copied by /design-init
├── shared/
│   └── ui/                  ← shadcn-style primitives
├── skills/                  ← skill definitions
├── .mcp.json                ← MCP server registration for Claude Code
└── package.json
```

PRs welcome. Please test against Claude Code with a real Claude subscription before submitting — the designer and reviewer agents require subagent support that is not available on the free tier.
