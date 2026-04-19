---
name: design-project
description: Build or update a UI prototype, React component, landing page, dashboard, mockup, design, or visual app. Triggers when the user asks for any visual/UI work without explicitly using /design.
---

Derive a kebab-case project name from the user's request. Examples: "todo app" → "todo-app", "landing page for my SaaS" → "saas-landing", "admin dashboard" → "admin-dashboard". If the user says "update X" or "add Y to X" where X matches an existing project name, use that name directly.

Call `mcp__claude-design__design_start` to ensure the preview server is running before proceeding.

Delegate to the `designer` subagent, passing it the derived project name and the full user request as the prompt. The subagent will create or update `projects/<name>/App.jsx` with a React component that fulfills the request.

Once the subagent completes, retrieve the preview URL and print:

Preview: <url>
