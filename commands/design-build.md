---
description: Convert a validated wireframe into full-fidelity React components
argument-hint: <project-name> [design preferences…]
allowed-tools: Bash, mcp__open-design__design_start, mcp__open-design__design_url
---

If $ARGUMENTS is empty or missing, reply: "Usage: /design-build <name> [design preferences]" and stop.

Extract the project name as the first word of $ARGUMENTS and any design preferences as the remaining words (may be empty).

Call `mcp__open-design__design_start` to ensure the preview server is running.

Delegate to the `components-builder` subagent, passing it the project name and any design preferences from the prompt.

The components-builder will:
1. Read the existing wireframe at projects/<name>/App.jsx
2. Convert all placeholder elements into real, styled React components
3. Extract complex sections into projects/<name>/components/ as needed
4. Remove the @wireframe marker, signalling the project is production-ready

Once the subagent finishes, call `mcp__open-design__design_url` with the project name and print:

Preview: <url>
