import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const tasksRoot = path.join(root, '.agent', 'tasks');
fs.mkdirSync(tasksRoot, { recursive: true });
const action = process.argv[2];
const input = process.argv.slice(3).join(' ').trim();
const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'feature';
const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
};
const latest = () =>
  fs
    .readdirSync(tasksRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .at(-1);
const write = (dir, name, body) => fs.writeFileSync(path.join(dir, name), body, 'utf8');
function start() {
  if (!input) {
    console.error('Usage: pnpm run agent:new -- "feature name"');
    process.exit(1);
  }
  const id = `${stamp()}-${slugify(input)}`;
  const dir = path.join(tasksRoot, id);
  fs.mkdirSync(dir, { recursive: true });
  write(
    dir,
    'task.json',
    JSON.stringify(
      {
        id,
        title: input,
        status: 'intake',
        createdAt: new Date().toISOString(),
        gates: {
          intake: false,
          product: false,
          engineering: false,
          implementation: false,
          qa: false,
          release: false,
        },
      },
      null,
      2,
    ) + '\n',
  );
  write(
    dir,
    'brief.md',
    `# Feature brief — ${input}\n\n## User problem\n\n## Evidence and existing behavior\n\n## Scope / out of scope\n\n## Assumptions\n\n## Success metrics\n\n## Risks\n- Money / identity / privacy / security / regulatory: \n\n## Acceptance criteria\n- [ ] Loading, empty, error, success and responsive states defined\n- [ ] Analytics decision recorded\n- [ ] Rollback path defined\n`,
  );
  write(
    dir,
    'reviews.md',
    `# Multi-role review\n\nEach role must independently return **APPROVE**, **APPROVE-WITH-CHANGES**, or **REJECT**. Resolve every REJECT before implementation.\n\n## Product round\n### Product manager\nDecision:\nReasons:\nChanges:\n\n### UX designer\nDecision:\nReasons:\nChanges:\n\n### Growth / business\nDecision:\nReasons:\nChanges:\n\n## Engineering round\n### Frontend architect\nDecision:\nReasons:\nChanges:\n\n### Backend / API reviewer\nDecision:\nReasons:\nChanges:\n\n### Security / privacy reviewer\nDecision:\nReasons:\nChanges:\n\n### SRE / operations reviewer\nDecision:\nReasons:\nChanges:\n`,
  );
  write(
    dir,
    'plan.md',
    `# Implementation plan\n\n## Component reuse map\n\n## Data flow and contracts\n\n## State boundaries\n\n## Files to change\n\n## Test matrix\n\n## Rollout and rollback\n\n## Ordered implementation steps\n- [ ] \n`,
  );
  write(
    dir,
    'qa.md',
    `# Adversarial validation\n\n## QA engineer\nDecision:\nEvidence:\n\n## Accessibility reviewer\nDecision:\nEvidence:\n\n## Performance reviewer\nDecision:\nEvidence:\n\n## Skeptical user\nDecision:\nEvidence:\n\n## Commands and results\n- pnpm run quality:\n- pnpm run build:storybook:\n- pnpm run test:e2e:\n`,
  );
  write(
    dir,
    'release.md',
    `# Release report\n\nDecision: PENDING\n\n## User-visible changes\n\n## Changed files\n\n## Configuration and migrations\n\n## Telemetry / alerts\n\n## Known limitations\n\n## Rollback\n\n## Final approvals\n`,
  );
  console.log(`Created ${path.relative(root, dir)}\nOpen brief.md and complete gates in order.`);
}
function target() {
  const id = input || latest();
  if (!id) {
    console.error('No task folders found.');
    process.exit(1);
  }
  const direct = path.join(tasksRoot, id);
  return fs.existsSync(direct) ? direct : path.resolve(root, id);
}
function check() {
  const dir = target();
  const required = ['task.json', 'brief.md', 'reviews.md', 'plan.md', 'qa.md', 'release.md'];
  const missing = required.filter((name) => !fs.existsSync(path.join(dir, name)));
  if (missing.length) {
    console.error(`Workflow incomplete: missing ${missing.join(', ')}`);
    process.exit(1);
  }
  const reviews = fs.readFileSync(path.join(dir, 'reviews.md'), 'utf8');
  const release = fs.readFileSync(path.join(dir, 'release.md'), 'utf8');
  const unresolved = (reviews.match(/Decision:\s*(?:REJECT|PENDING)?\s*$/gim) ?? []).length;
  if (unresolved) console.warn(`Warning: ${unresolved} review decisions are empty/rejected.`);
  if (/Decision:\s*PENDING/i.test(release))
    console.warn('Warning: release decision is still PENDING.');
  console.log(`Workflow structure valid: ${path.relative(root, dir)}`);
}
function close() {
  const dir = target();
  check();
  const file = path.join(dir, 'release.md');
  const release = fs.readFileSync(file, 'utf8');
  if (!/Decision:\s*APPROVED/i.test(release)) {
    console.error('Set release.md Decision: APPROVED after all gates pass.');
    process.exit(1);
  }
  const taskFile = path.join(dir, 'task.json');
  const task = JSON.parse(fs.readFileSync(taskFile, 'utf8'));
  task.status = 'closed';
  task.closedAt = new Date().toISOString();
  task.gates = Object.fromEntries(Object.keys(task.gates).map((key) => [key, true]));
  fs.writeFileSync(taskFile, JSON.stringify(task, null, 2) + '\n');
  console.log(`Closed ${path.relative(root, dir)}`);
}
if (action === 'start') start();
else if (action === 'check') check();
else if (action === 'close') close();
else {
  console.error('Usage: node scripts/agent-workflow.mjs <start|check|close> [name-or-task]');
  process.exit(1);
}
