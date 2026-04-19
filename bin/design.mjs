#!/usr/bin/env node
/**
 * design — CLI helper for the herklaude-design plugin.
 * Operates on the current working directory (a scaffolded design repo).
 * Pure node:* — no npm dependencies.
 *
 * Usage:
 *   design start
 *   design stop
 *   design status [--json]
 *   design list [--json]
 *   design url <name>
 *   design open <name>
 *   design health <name> [--json]
 *   design delete <name>
 *   design rename <old> <new>
 */

import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;
const DESIGN_DIR = path.join(process.cwd(), '.design');
const PID_FILE = path.join(DESIGN_DIR, 'server.pid');
const LOG_FILE = path.join(DESIGN_DIR, 'server.log');
const PROJECTS_DIR = path.join(process.cwd(), 'projects');

// ── helpers ──────────────────────────────────────────────────────────────────

function ensureDesignDir() {
  if (!fs.existsSync(DESIGN_DIR)) fs.mkdirSync(DESIGN_DIR, { recursive: true });
}

function readPid() {
  try { return parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10); }
  catch { return null; }
}

function isRunning(pid) {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; }
  catch { return false; }
}

function isPortOpen() {
  try {
    const out = execSync(`lsof -ti tcp:${PORT}`, { stdio: 'pipe' }).toString().trim();
    return out.length > 0;
  } catch { return false; }
}

function serverRunning() {
  const pid = readPid();
  return isRunning(pid) && isPortOpen();
}

function httpGet(url, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve(body); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function pollReady(retries = 30, intervalMs = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      http.get(`${BASE_URL}/api/health`, { timeout: 1000 }, res => {
        if (res.statusCode === 200) return resolve();
        tryAgain();
      }).on('error', tryAgain);
    };
    function tryAgain() {
      if (++attempts >= retries) return reject(new Error('Server did not start in time'));
      setTimeout(check, intervalMs);
    }
    check();
  });
}

function projectExists(name) {
  return fs.existsSync(path.join(PROJECTS_DIR, name, 'App.jsx'));
}

function listProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && projectExists(e.name))
    .map(e => {
      const stat = fs.statSync(path.join(PROJECTS_DIR, e.name, 'App.jsx'));
      return { name: e.name, updatedAt: stat.mtime.toISOString(), previewUrl: `${BASE_URL}/p/${e.name}`, entry: 'App.jsx' };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// ── commands ──────────────────────────────────────────────────────────────────

async function cmdStart() {
  if (serverRunning()) {
    console.log(BASE_URL);
    return;
  }
  ensureDesignDir();
  if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    console.error('Error: no package.json found. Run /design-init first.');
    process.exit(1);
  }
  const log = fs.openSync(LOG_FILE, 'a');
  const child = spawn('npm', ['run', 'dev'], {
    detached: true,
    stdio: ['ignore', log, log],
    cwd: process.cwd(),
  });
  child.unref();
  fs.writeFileSync(PID_FILE, String(child.pid));
  process.stdout.write('Starting Vite dev server');
  try {
    await pollReady();
    console.log(`\n${BASE_URL}`);
  } catch (err) {
    console.error(`\nFailed to start: ${err.message}. Check .design/server.log`);
    process.exit(1);
  }
}

function cmdStop() {
  const pid = readPid();
  if (!pid || !isRunning(pid)) {
    // also kill any process holding the port
    if (isPortOpen()) {
      try { execSync(`lsof -ti tcp:${PORT} | xargs kill -9`, { stdio: 'pipe' }); }
      catch { /* ignore */ }
    }
    try { fs.unlinkSync(PID_FILE); } catch { /* ignore */ }
    console.log('stopped');
    return;
  }
  try {
    process.kill(pid, 'SIGTERM');
    setTimeout(() => { try { process.kill(pid, 'SIGKILL'); } catch { /* already gone */ } }, 2000);
  } catch { /* already gone */ }
  try { fs.unlinkSync(PID_FILE); } catch { /* ignore */ }
  console.log('stopped');
}

function cmdStatus(json) {
  const pid = readPid();
  const running = serverRunning();
  let uptimeSec = null;
  if (running && pid) {
    try {
      const stat = execSync(`ps -o etime= -p ${pid}`, { stdio: 'pipe' }).toString().trim();
      // etime format: [[DD-]HH:]MM:SS — convert to seconds
      const parts = stat.replace('-', ':').split(':').map(Number).reverse();
      uptimeSec = parts[0] + (parts[1] || 0) * 60 + (parts[2] || 0) * 3600 + (parts[3] || 0) * 86400;
    } catch { /* ignore */ }
  }
  const status = { running, pid: running ? pid : null, url: running ? BASE_URL : null, uptimeSec };
  if (json) { console.log(JSON.stringify(status)); return; }
  console.log(running ? `running  pid=${pid}  ${BASE_URL}` : 'stopped');
}

function cmdList(json) {
  const projects = listProjects();
  if (json) { console.log(JSON.stringify(projects)); return; }
  if (projects.length === 0) { console.log('No projects yet. Run: /design <name> <prompt>'); return; }
  console.log('Projects:\n');
  const rows = projects.map(p => [p.name, p.updatedAt.replace('T', ' ').slice(0, 16), p.previewUrl]);
  const w = [Math.max(...rows.map(r => r[0].length)), 16, Math.max(...rows.map(r => r[2].length))];
  rows.forEach(r => console.log(`  ${r[0].padEnd(w[0])}  ${r[1]}  ${r[2]}`));
}

function cmdUrl(name) {
  if (!name) { console.error('Usage: design url <name>'); process.exit(1); }
  if (!projectExists(name)) { console.error(`Project not found: ${name}`); process.exit(1); }
  console.log(`${BASE_URL}/p/${name}`);
}

function cmdOpen(name) {
  if (!name) { console.error('Usage: design open <name>'); process.exit(1); }
  if (!projectExists(name)) { console.error(`Project not found: ${name}`); process.exit(1); }
  if (!serverRunning()) {
    console.error('Server not running. Run: design start');
    process.exit(1);
  }
  const url = `${BASE_URL}/p/${name}`;
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  execSync(`${opener} "${url}"`);
  console.log(url);
}

async function cmdHealth(name, json) {
  if (!name) { console.error('Usage: design health <name>'); process.exit(1); }
  if (!serverRunning()) {
    const result = { status: 'stopped', error: null };
    if (json) { console.log(JSON.stringify(result)); return; }
    console.log('Server not running');
    return;
  }
  try {
    const data = await httpGet(`${BASE_URL}/api/projects/${name}/health`);
    if (json) { console.log(JSON.stringify(data)); return; }
    if (data.status === 'ok') console.log(`${name}: OK`);
    else console.log(`${name}: ERROR\n${data.error?.message || JSON.stringify(data.error)}`);
  } catch (err) {
    const result = { status: 'error', error: { message: err.message } };
    if (json) { console.log(JSON.stringify(result)); return; }
    console.error(`health check failed: ${err.message}`);
  }
}

function cmdDelete(name) {
  if (!name) { console.error('Usage: design delete <name>'); process.exit(1); }
  const dir = path.join(PROJECTS_DIR, name);
  if (!fs.existsSync(dir)) { console.error(`Project not found: ${name}`); process.exit(1); }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`deleted: ${name}`);
}

function cmdRename(oldName, newName) {
  if (!oldName || !newName) { console.error('Usage: design rename <old> <new>'); process.exit(1); }
  const src = path.join(PROJECTS_DIR, oldName);
  const dst = path.join(PROJECTS_DIR, newName);
  if (!fs.existsSync(src)) { console.error(`Project not found: ${oldName}`); process.exit(1); }
  if (fs.existsSync(dst)) { console.error(`Project already exists: ${newName}`); process.exit(1); }
  fs.renameSync(src, dst);
  console.log(`renamed: ${oldName} → ${newName}\n${BASE_URL}/p/${newName}`);
}

// ── dispatch ──────────────────────────────────────────────────────────────────

const [,, cmd, ...rest] = process.argv;
const jsonFlag = rest.includes('--json');
const args = rest.filter(a => a !== '--json');

switch (cmd) {
  case 'start':   await cmdStart(); break;
  case 'stop':    cmdStop(); break;
  case 'status':  cmdStatus(jsonFlag); break;
  case 'list':    cmdList(jsonFlag); break;
  case 'url':     cmdUrl(args[0]); break;
  case 'open':    cmdOpen(args[0]); break;
  case 'health':  await cmdHealth(args[0], jsonFlag); break;
  case 'delete':  cmdDelete(args[0]); break;
  case 'rename':  cmdRename(args[0], args[1]); break;
  default:
    console.log(`design <command> [options]

Commands:
  start              Start Vite dev server (background)
  stop               Stop the dev server
  status [--json]    Show server status
  list   [--json]    List all projects
  url    <name>      Print preview URL
  open   <name>      Open preview in browser
  health <name> [--json]  Check last compile error
  delete <name>      Delete a project
  rename <old> <new> Rename a project`);
    process.exit(1);
}
