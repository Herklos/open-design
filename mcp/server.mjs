#!/usr/bin/env node
/**
 * MCP server for the claude-design plugin.
 * Exposes design_* tools so Claude can query/control the preview server
 * without parsing Bash output.
 *
 * Transport: stdio (default for Claude Code MCP servers).
 * No npm deps — pure node:* + the MCP SDK is brought in via @modelcontextprotocol/sdk
 * which is declared as a peer dep in the plugin's package.json.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

// The plugin bin is on PATH, so we can call `design` directly.
// But for robustness, resolve it relative to this file.
const PLUGIN_ROOT = path.resolve(import.meta.dirname, '..');
const DESIGN_BIN = path.join(PLUGIN_ROOT, 'bin', 'design.mjs');

function run(subcmd) {
  try {
    return execSync(`node "${DESIGN_BIN}" ${subcmd} --json`, {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 20_000,
    }).toString().trim();
  } catch (err) {
    return JSON.stringify({ error: err.message });
  }
}

function runPlain(subcmd) {
  try {
    return execSync(`node "${DESIGN_BIN}" ${subcmd}`, {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 20_000,
    }).toString().trim();
  } catch (err) {
    return err.message;
  }
}

// ── server ────────────────────────────────────────────────────────────────────

const server = new McpServer({ name: 'claude-design', version: '0.1.0' });

server.tool(
  'design_status',
  'Get the current status of the Vite preview server (running, pid, url, uptime).',
  {},
  async () => ({
    content: [{ type: 'text', text: run('status') }],
  })
);

server.tool(
  'design_start',
  'Start the Vite preview server if not already running. Returns the server URL.',
  {},
  async () => ({
    content: [{ type: 'text', text: runPlain('start') }],
  })
);

server.tool(
  'design_stop',
  'Stop the Vite preview server.',
  {},
  async () => ({
    content: [{ type: 'text', text: runPlain('stop') }],
  })
);

server.tool(
  'design_list',
  'List all design projects in the current repo with their preview URLs and last-modified timestamps.',
  {},
  async () => ({
    content: [{ type: 'text', text: run('list') }],
  })
);

server.tool(
  'design_url',
  'Get the preview URL for a specific design project.',
  { name: z.string().describe('Project folder name (kebab-case)') },
  async ({ name }) => ({
    content: [{ type: 'text', text: runPlain(`url ${name}`) }],
  })
);

server.tool(
  'design_open',
  'Open the preview for a project in the default browser.',
  { name: z.string().describe('Project folder name') },
  async ({ name }) => ({
    content: [{ type: 'text', text: runPlain(`open ${name}`) }],
  })
);

server.tool(
  'design_health',
  'Check the last Vite compile status for a project. Returns { status: "ok"|"error", error? }.',
  { name: z.string().describe('Project folder name') },
  async ({ name }) => ({
    content: [{ type: 'text', text: run(`health ${name}`) }],
  })
);

server.tool(
  'design_delete',
  'Delete a design project folder. Irreversible.',
  { name: z.string().describe('Project folder name to delete') },
  async ({ name }) => ({
    content: [{ type: 'text', text: runPlain(`delete ${name}`) }],
  })
);

server.tool(
  'design_rename',
  'Rename a design project folder. Returns the new preview URL.',
  {
    oldName: z.string().describe('Current project folder name'),
    newName: z.string().describe('New project folder name (kebab-case)'),
  },
  async ({ oldName, newName }) => ({
    content: [{ type: 'text', text: runPlain(`rename ${oldName} ${newName}`) }],
  })
);

// ── boot ──────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
