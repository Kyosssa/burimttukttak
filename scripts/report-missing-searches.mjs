import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isSearchLikeInput } from '../src/search.mjs';

export const READ_ONLY_SQL = 'SELECT normalized_query, display_query, search_count, first_seen, last_seen FROM missing_searches WHERE search_count >= 2 ORDER BY search_count DESC, last_seen DESC LIMIT 20';
export const WRANGLER_ARGS = [
  'd1', 'execute', 'burimttukttak-missing-search-prod',
  '--config', 'wrangler.jsonc', '--env', 'production', '--remote',
  '--command', READ_ONLY_SQL, '--json', '--yes',
];

export function safeRows(output) {
  const statements = Array.isArray(output) ? output : [output];
  const rows = statements.flatMap(statement => statement?.results ?? []);
  const timestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2})?$/.test(value);
  return rows.filter(row =>
    isSearchLikeInput(row.normalized_query) && isSearchLikeInput(row.display_query)
    && Number.isInteger(row.search_count) && row.search_count >= 2
    && timestamp(row.first_seen) && timestamp(row.last_seen)
  ).slice(0, 20).map(row => ({
    normalized_query: row.normalized_query,
    display_query: row.display_query,
    search_count: row.search_count,
    first_seen: row.first_seen,
    last_seen: row.last_seen,
  }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const wrangler = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
  const result = spawnSync(process.execPath, [wrangler, ...WRANGLER_ARGS], {
    cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8', maxBuffer: 1024 * 1024,
  });
  try {
    if (result.error || result.status !== 0) throw new Error('query_failed');
    process.stdout.write(`${JSON.stringify(safeRows(JSON.parse(result.stdout)), null, 2)}\n`);
  } catch {
    process.stderr.write('Production D1 읽기 전용 조회에 실패했습니다. 설정과 로그인 상태를 확인하세요.\n');
    process.exitCode = 1;
  }
}
