---
description: Create a low-fidelity wireframe for a design project
argument-hint: <project-name> <prompt…>
allowed-tools: Bash, mcp__open-design__design_start, mcp__open-design__design_url
---

If $ARGUMENTS is empty or missing, reply: "Usage: /design-wireframe <name> <prompt>" and stop.

Extract the project name as the first word of $ARGUMENTS and the prompt as the remaining words. If the prompt is empty after extracting the name, reply: "Usage: /design-wireframe <name> <prompt>" and stop.

Call `mcp__open-design__design_start` to ensure the preview server is running.

Delegate to the `wireframe-designer` subagent, passing it the project name and the full prompt.

The wireframe-designer will produce a low-fidelity skeleton of the UI — layout only, no real styling or colors — so you can review and validate the structure before committing to a full implementation.

Once the subagent finishes, print the result it returned (including the Wireframe URL and the /design-build instruction).
