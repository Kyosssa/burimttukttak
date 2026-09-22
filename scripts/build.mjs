import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildSite } from './build-site.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
// Phase 0 has no public artifacts. This gate stays mandatory in later builders.
const seedArg = process.argv[2];
const validation = spawnSync(process.execPath, ['scripts/validate-data.mjs', ...(seedArg ? [seedArg] : [])], { cwd: root, stdio: 'inherit' });
if (validation.error || validation.status !== 0) process.exit(validation.status || 1);

// Only the canonical Pack Seed can produce public pages. Alternate paths are
// supported solely for validation/failure-gate tests.
if (!seedArg) {
  const stats = buildSite();
  console.log(`Static site generated: ${stats.items} item pages / ${stats.categories} category pages / ${stats.other} other pages`);
}

const testFiles = readdirSync(new URL('../tests/', import.meta.url)).filter(name => name.endsWith('.test.mjs')).map(name => `tests/${name}`);
const tests = spawnSync(process.execPath, ['--test', ...testFiles], { cwd: root, stdio: 'inherit' });
if (tests.error || tests.status !== 0) process.exit(tests.status || 1);
console.log('Build passed.');
