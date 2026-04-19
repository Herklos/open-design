---
description: Create or update a design project with a prompt
argument-hint: <project-name> <prompt…>
allowed-tools: Bash, mcp__claude-design__design_start, mcp__claude-design__design_url
---

Extract the project name as the first word of $ARGUMENTS and the prompt as the remaining words.

Call `mcp__claude-design__design_start` to ensure the preview server is running.

Delegate to the `designer` subagent, passing it the project name and the full prompt. The subagent will create or update `projects/<name>/App.jsx` with a React component matching the prompt.

Once the subagent finishes, call `mcp__claude-design__design_url` with the project name to retrieve the preview URL.

Print the result as:

Preview: <url>
