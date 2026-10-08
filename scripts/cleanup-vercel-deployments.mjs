// Dry run: node scripts/cleanup-vercel-deployments.mjs
// Delete:  node scripts/cleanup-vercel-deployments.mjs --apply
// Uses VERCEL_TOKEN or the local Vercel CLI login; never prints credentials.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--apply')) throw new Error('Only --apply is supported.');
const apply = args.includes('--apply');
const projectId = 'prj_vFgBpefAFOzF5uVRiV6iJtXuseca';
const teamId = 'team_JsyI08lOzgWNOknAMXPRNteB';
const projectName = 'v0-hortonville-soccer-history';
const keep = 10;
const authPaths = process.platform === 'win32'
  ? [path.join(process.env.APPDATA || '', 'com.vercel.cli', 'Data', 'auth.json')]
  : [path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local/share'), 'com.vercel.cli', 'auth.json')];
let token = process.env.VERCEL_TOKEN;
for (const file of authPaths) {
  if (!token && fs.existsSync(file)) token = JSON.parse(fs.readFileSync(file, 'utf8')).token;
}
if (!token) throw new Error('Set VERCEL_TOKEN or sign in using the Vercel CLI.');

async function api(endpoint, method = 'GET') {
  const url = new URL(endpoint, 'https://api.vercel.com');
  url.searchParams.set('teamId', teamId);
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`${method} ${url.pathname}: HTTP ${response.status} (${body.error?.code || 'unknown error'})`);
  }
  return response.status === 204 ? {} : response.json();
}
async function project() {
  const p = await api(`/v9/projects/${projectId}`);
  if (p.id !== projectId || p.accountId !== teamId || p.name !== projectName) {
    throw new Error('Project identity mismatch; stopping.');
  }
  if (!p.targets?.production?.id) throw new Error('Cannot identify live production deployment; stopping.');
  return p;
}

const p = await project();
const deployments = new Map();
let until;
do {
  const query = new URLSearchParams({ projectId, limit: '100' });
  if (until !== undefined) query.set('until', String(until));
  const page = await api(`/v6/deployments?${query}`);
  for (const d of page.deployments) deployments.set(d.uid || d.id, d);
  const next = page.pagination?.next;
  if (next != null && until !== undefined && next >= until) throw new Error('Pagination did not advance.');
  until = next;
} while (until != null);

const sorted = [...deployments.entries()].sort((a, b) => b[1].created - a[1].created || a[0].localeCompare(b[0]));
const protectedIds = new Set(sorted.slice(0, keep).map(([id]) => id));
protectedIds.add(p.targets.production.id);
const activeStates = new Set(['BUILDING', 'INITIALIZING', 'QUEUED']);
const candidates = sorted.filter(([id, d]) => !protectedIds.has(id) && !activeStates.has(d.state || d.readyState));
console.log(`${projectName}: ${sorted.length} deployments; keep ${sorted.length - candidates.length}; delete ${candidates.length}.`);
console.log(`Live production protected: ${p.targets.production.id}`);
for (const [id, d] of candidates) console.log(`${apply ? 'DELETE' : 'WOULD DELETE'} ${id} ${new Date(d.created).toISOString()} ${d.url || ''}`);
if (!apply) {
  console.log('Dry run complete. Add --apply to delete these deployments.');
} else {
  let deleted = 0;
  for (const [id] of candidates) {
    // Refresh before each deletion in case production was promoted during cleanup.
    const current = await project();
    if (id === current.targets.production.id) {
      console.log(`SKIP ${id}: now serving production.`);
      continue;
    }
    const deployment = await api(`/v13/deployments/${id}`);
    if (deployment.projectId !== projectId) throw new Error('Deployment project mismatch; stopping.');
    if (activeStates.has(deployment.readyState || deployment.state)) {
      console.log(`SKIP ${id}: active build.`);
      continue;
    }
    await api(`/v13/deployments/${id}`, 'DELETE');
    deleted++;
    console.log(`Deleted ${id} (${deleted}/${candidates.length}).`);
  }
  console.log(`Cleanup complete: deleted ${deleted} deployments.`);
}
