import { loadInputs } from './lib/inputs.mjs';
import { guideData } from './lib/guides.mjs';
import { improvements } from './lib/content-improvements.mjs';
import { contentAudit } from './lib/content-audit.mjs';
const {seed,registry}=loadInputs();
const report=contentAudit(seed,guideData,registry,improvements.items);
console.log(process.argv.includes('--json')?JSON.stringify(report,null,2):`Content review (offline, warnings only): ${report.indexableItems} indexable items / ${report.guides} guides / ${report.reviewPairs.length} candidate pairs / ${report.notCaughtByExistingNameGate} not caught by name replacement gate. Manual review required; not an AdSense cause determination.`);
