import { loadInputs } from './lib/inputs.mjs';
import { createValidator, duplicateDisposalBodies } from './lib/validate.mjs';
import { duplicateGroups, fuzzyDisposalFingerprint, indexQualityErrors } from './lib/index-quality.mjs';

try {
  const inputs = loadInputs(process.argv[2]);
  const errors = createValidator(inputs)(inputs.seed);
  if (!errors.length) for (const message of indexQualityErrors(inputs.seed)) errors.push({ code: 'index_quality', path: '/items', message });
  for (const error of errors) console.error(`[${error.code}] ${error.path}: ${error.message}`);
  if (errors.length) process.exitCode = 1;
  else {
    console.log(`Data validation passed: ${inputs.seed.item_count} items / ${inputs.seed.verified_item_count} verified / ${inputs.seed.needs_research_count} needs_research`);
    for (const slugs of duplicateDisposalBodies(inputs.seed)) console.warn(`[duplicate_disposal_body] review identical answers: ${slugs.join(', ')}`);
    const fuzzy = duplicateGroups(inputs.seed.items, fuzzyDisposalFingerprint);
    if (fuzzy.length) console.warn(`[near_duplicate_disposal_body] editorial review: ${fuzzy.map(group => group.join(', ')).join(' | ')}`);
  }
} catch (error) {
  console.error(`Data validation failed: ${error.message}`);
  process.exitCode = 1;
}
