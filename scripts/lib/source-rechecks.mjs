import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
export const sourceRechecks = JSON.parse(readFileSync(new URL('../../data/source-recheck-2026-10-17.json', import.meta.url), 'utf8'));
export function referenceDigest(item, source) {
  return createHash('sha256').update(JSON.stringify({ summary:item.summary, steps:item.steps, warnings:item.warnings, regional_note:item.regional_note, collection_service:item.collection_service, verification_level:item.verification_level, source })).digest('hex');
}
// A curated review applies only to the exact claims actually compared. Changed
// claims, failed access, incomplete reviews and historical as-of dates never get
// their overdue status silently cleared. This does not promote item status.
export function recheckedDate(item, source, asOf = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), data = sourceRechecks) {
  const review = data.sources.find(s=>s.url===source.url);
  if (!review || review.availability !== 'accessible' || review.http_status !== 200) return null;
  const ref=review.references.find(ref=>ref.slug===item.slug);
  if (!ref || ref.status !== 'verified_with_scope' || !ref.finding || !ref.evidence_urls?.length || !/^\d{4}-\d{2}-\d{2}$/.test(ref.reviewed_at) || ref.reviewed_at > asOf) return null;
  if (Number.isNaN(Date.parse(`${ref.reviewed_at}T00:00:00Z`)) || new Date(`${ref.reviewed_at}T00:00:00Z`).toISOString().slice(0,10)!==ref.reviewed_at) return null;
  return ref.claim_sha256 === referenceDigest(item,source) ? ref.reviewed_at : null;
}
export function contentModifiedDate(item) {
  return sourceRechecks.corrections.some(c=>c.slug===item.slug) ? sourceRechecks.reviewed_at : item.verified_at;
}
// Historical baseline tests restore ONLY documented, still-exact field patches;
// every other field remains under the original full-object SHA-256 assertions.
export function beforeDocumentedCorrections(items) {
  return items.map(item=>{
    const copy=structuredClone(item),correction=sourceRechecks.corrections.find(c=>c.slug===item.slug);
    if(correction)for(const[key,patch]of Object.entries(correction.fields)){
      if(!['summary','steps','warnings'].includes(key)||JSON.stringify(copy[key])!==JSON.stringify(patch.after))throw new Error(`Undocumented correction drift: ${item.slug}.${key}`);
      copy[key]=structuredClone(patch.before);
    }
    return copy;
  });
}
