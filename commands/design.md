---
description: Create or update a design project with a prompt
argument-hint: <project-name> <prompt…>
allowed-tools: Bash, mcp__claude-design__design_start, mcp__claude-design__design_url
---

Extract the project name as the first word of $ARGUMENTS and the prompt as the remaining words.

Call `mcp__claude-design__design_start` to ensure the preview server is running.

Delegate to the `designer` subagent, passing it the project name and the full prompt.

**Creation vs. iteration:**

- If `projects/<name>/App.jsx` does **not** exist, this is a **new project**. The designer will create the file from scratch.
- If `projects/<name>/App.jsx` **already exists**, this is an **iteration**. The designer will read the existing file first and make targeted edits — it will NOT start from scratch unless the prompt explicitly requests it (e.g. "start over" or "rewrite from scratch"). Existing state logic, sub-components, and structure are preserved.

Once the subagent finishes, call `mcp__claude-design__design_url` with the project name to retrieve the preview URL.

Print the result as:

Preview: <url>
