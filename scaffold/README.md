# Claude Design Workspace

A local prototyping workspace powered by the [claude-design](https://github.com/herklos/claude-design) plugin. Build and iterate on React UI projects through natural conversation with Claude.

## Prerequisites

- Node.js 18+
- Claude Code with the `claude-design` plugin installed

## Getting Started

```bash
npm install
npm run dev        # → http://localhost:5173
```

The dashboard at http://localhost:5173 lists all your projects.

## Creating & Iterating

| Task | Command |
|------|---------|
| Create a new project | `/design <name> <prompt>` |
| Iterate on a project | `/design <name> <updated prompt>` — or just talk to Claude |
| List all projects | `/design-list` |
| Preview a project | `/design-preview <name>` |
| Delete a project | `/design-delete <name>` |
| Rename a project | `/design-rename <old> <new>` |

## Project Structure

Each project lives at `projects/<name>/App.jsx` (default export). Additional components go in `projects/<name>/components/`. Nothing else needs to be touched.

## Shared UI

`shared/ui/` contains shadcn-style primitives (Button, Card, Input, Label, Badge, Tabs, Separator, Dialog). Import them from `@shared/ui/*`. Utility: `import { cn } from '@shared/lib/utils'`.
