---
description: Scaffold the Vite preview app into the current directory
allowed-tools: Bash
---

Run the following steps in order:

1. Copy all scaffold files into the current working directory:
   `cp -r "${CLAUDE_PLUGIN_ROOT}/scaffold/." .`

2. Install dependencies:
   `npm install`

3. Start the preview server:
   `node "${CLAUDE_PLUGIN_ROOT}/bin/design.mjs" start`

Tell the user that the dashboard is available at http://localhost:5173 and they can create their first project by running `/design <name> <prompt>`.
