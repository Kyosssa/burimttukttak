import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
// Phase 0 has no public artifacts. This gate stays mandatory in later builders.
const steps = [
  ['scripts/validate-data.mjs', ...process.argv.slice(2)],
  ['--test', 'tests/search.test.mjs', 'tests/validation.test.mjs', 'tests/build.test.mjs'],
];
for (const args of steps) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
console.log('Phase 0 build passed. No pages or deployment artifacts generated.');
