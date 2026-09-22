import { loadInputs } from './lib/inputs.mjs';
import { createValidator } from './lib/validate.mjs';

try {
  const inputs = loadInputs(process.argv[2]);
  const errors = createValidator(inputs)(inputs.seed);
  for (const error of errors) console.error(`[${error.code}] ${error.path}: ${error.message}`);
  if (errors.length) process.exitCode = 1;
  else console.log(`Data validation passed: ${inputs.seed.item_count} items / ${inputs.seed.verified_item_count} verified / ${inputs.seed.needs_research_count} needs_research`);
} catch (error) {
  console.error(`Data validation failed: ${error.message}`);
  process.exitCode = 1;
}
