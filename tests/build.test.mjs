import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadInputs } from '../scripts/lib/inputs.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
for (const scenario of ['invalid-json', 'invalid-data', 'missing-file']) {
  test(`build stops before tests/artifacts on ${scenario}`, () => {
    const directory = mkdtempSync(join(tmpdir(), 'burim-phase0-'));
    const file = join(directory, 'seed.json');
    try {
      if (scenario === 'invalid-json') writeFileSync(file, '{');
      if (scenario === 'invalid-data') {
        const { seed } = loadInputs();
        seed.items[0].sources = [];
        writeFileSync(file, JSON.stringify(seed));
      }
      const result = spawnSync(process.execPath, ['scripts/build.mjs', file], { cwd: root, encoding: 'utf8' });
      assert.equal(result.status, 1, result.stderr);
      assert.ok(!result.stdout.includes('Phase 0 build passed'));
      assert.ok(!result.stdout.includes('fixture 1:'));
      assert.match(result.stderr, /validation failed|\[schema\]/);
    } finally {
      // Remove only this test's freshly-created temporary directory.
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
