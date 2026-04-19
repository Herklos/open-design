---
description: Delete a design project (asks for confirmation)
argument-hint: <project-name>
allowed-tools: mcp__open-design__design_delete
---

Use $ARGUMENTS as the project name.

Before proceeding, ask the user to explicitly confirm the deletion with a clear warning that this action is irreversible and will permanently remove the project and all its files.

Only call `design_delete` with the project name after the user has replied with an explicit confirmation (e.g. "yes", "confirm", "delete it"). If the user does not confirm, abort and do nothing.
