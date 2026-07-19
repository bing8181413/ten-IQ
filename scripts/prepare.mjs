import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
if (!fs.existsSync('.git')) {
  console.log('Skipping Husky setup because this directory is not a Git worktree.');
  process.exit(0);
}
const result = spawnSync('husky', [], { stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
