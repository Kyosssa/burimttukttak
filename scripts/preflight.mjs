import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const testFiles = readdirSync(new URL('../tests/', import.meta.url)).filter(name => name.endsWith('.test.mjs')).map(name => `tests/${name}`);
const checks = [
  ['Seed validation', process.execPath, ['scripts/validate-data.mjs']],
  ['Search fixtures', process.execPath, ['--test', 'tests/search.test.mjs']],
  ['Production build', process.execPath, ['scripts/build.mjs']],
  ['Full tests', process.execPath, ['--test', ...testFiles]],
  ['Generated artifact audit', process.execPath, ['scripts/audit-dist.mjs']],
  ['Source review schedule', process.execPath, ['scripts/source-health.mjs']],
];

for (const [label, command, args] of checks) {
  console.log(`\n[preflight] ${label}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error(`[preflight] FAILED: ${label}`);
    process.exit(result.status || 1);
  }
}

console.log('\nPreflight passed: validation, 34 search fixtures, full tests, build, sitemap, links, indexing, 404, external-request audit and source review report.');
