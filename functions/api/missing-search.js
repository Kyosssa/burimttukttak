import seed from '../../docs/prebuild/burimttukttak-seed-v1.1.json' assert { type: 'json' };
import fixtures from '../../docs/prebuild/14-search-quality-fixtures.json' assert { type: 'json' };
import { createMissingSearchApi } from './missing-search-core.mjs';

const { handleMissingSearch } = createMissingSearchApi(seed, fixtures);

export function onRequest(context) {
  return handleMissingSearch(context.request, context.env);
}
