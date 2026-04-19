---
name: design-project
description: Build or update a UI prototype, React component, landing page, dashboard, mockup, design, or visual app. Triggers when the user asks for any visual/UI work without explicitly using /design.
---

## When this skill triggers

This skill fires whenever the user requests any visual or UI work **without using the `/design` slash command directly**. Examples:

- "Build me a pricing page"
- "Create a todo app"
- "Make a dashboard with KPI cards"
- "Add a dark mode toggle to my landing page"
- "Update the pricing page to highlight the Pro tier"

It does NOT trigger for non-UI requests (data processing, file operations, explanations, etc.).

## What this skill does

1. **Derives a project name** from the user's request in kebab-case.
   - "todo app" → `todo-app`
   - "landing page for my SaaS" → `saas-landing`
   - "admin dashboard" → `admin-dashboard`
   - If the user says "update X" or "add Y to X" and X matches an existing project directory under `projects/`, use that exact name — this is an **iteration**, not a new project.

2. **Ensures the preview server is running** by calling `mcp__herklaude-design__design_start`. This is a no-op if the server is already up.

3. **Delegates to the `designer` subagent**, passing:
   - The derived project name
   - The full user request as the prompt

   The designer subagent handles all file creation or editing, compile-health checking, and self-correction. If a project with this name already exists, the subagent will read the existing files and iterate on them rather than starting from scratch.

4. **Retrieves the preview URL** using `mcp__herklaude-design__design_url` once the subagent completes.

## Expected output format

The skill's final output must end with exactly:

```
Preview: http://localhost:5173/p/<name>
```

No other trailing text after this line. The preview URL confirms the component compiled successfully and is live in the browser.
