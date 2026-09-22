import { readFileSync } from 'node:fs';

export const pack = new URL('../../docs/prebuild/', import.meta.url);
export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
export function loadInputs(seedPath = new URL('burimttukttak-seed-v1.1.json', pack)) {
  return {
    seed: readJson(seedPath),
    schema: readJson(new URL('02-item.schema.json', pack)),
    registry: readJson(new URL('12-source-registry-v1.json', pack)),
    categories: readJson(new URL('10-categories-v1.json', pack)),
  };
}
