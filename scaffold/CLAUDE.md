# Claude Design — Project Memory

## Plugin
`claude-design` is installed. Use `/design*` commands, the `designer` subagent, and
`mcp__claude-design__*` MCP tools for all prototype work.

## Project Layout
```
projects/<name>/
  App.jsx           ← default export, entry point — never rename
  components/       ← additional components for this project
```

## Imports

### Shared UI primitives
```js
import { Button }    from '@shared/ui/button'
import { Card }      from '@shared/ui/card'
import { Input }     from '@shared/ui/input'
import { Label }     from '@shared/ui/label'
import { Badge }     from '@shared/ui/badge'
import { Tabs }      from '@shared/ui/tabs'
import { Separator } from '@shared/ui/separator'
import { Dialog }    from '@shared/ui/dialog'
import { cn }        from '@shared/lib/utils'
```

### Icons
```js
import { IconName } from 'lucide-react'
```

## Styling
- Tailwind v4 utility classes only.
- No inline styles unless the value is dynamic.
- No external CSS files per project.

## Constraints
- Browser-only code. No Node built-ins. No external API calls.

## Workflow
1. Write / edit files under `projects/<name>/`.
2. After every write, call `design_health` to check for compile errors.
3. Only report done once `design_health` returns clean.
4. End every response with: `Preview: <URL from design_url>`

## URLs
| Purpose       | URL                               |
|---------------|-----------------------------------|
| Dev server    | http://localhost:5173             |
| Dashboard     | http://localhost:5173             |
| Project route | http://localhost:5173/p/<name>    |

Start dev server: `design start` or `npm run dev`
