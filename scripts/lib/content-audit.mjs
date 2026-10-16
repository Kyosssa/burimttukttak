import { isIndexable, fuzzyDisposalFingerprint } from './index-quality.mjs';

// Review signals, not a semantic model or a reason to automatically deindex.
// Compare answer/steps only: menus, ads, warning boilerplate, names and sources
// must not inflate similarity. Supplemental notes cannot conceal repeated core advice.
export function answerText(item) {
  let text = [item.summary, ...item.steps].join(' ').normalize('NFKC').toLowerCase();
  for (const name of [item.name, ...(item.aliases ?? [])].filter(Boolean).sort((a,b)=>b.length-a.length)) text = text.replaceAll(name.toLowerCase(), '');
  return text.replace(/[\s\p{P}\p{S}]/gu, '');
}
const grams = text => new Set(Array.from({length:Math.max(0,text.length-2)},(_,n)=>text.slice(n,n+3)));
export function answerSimilarity(a,b) {
  const left=grams(answerText(a)),right=grams(answerText(b));
  if(!left.size||!right.size)return 0;
  const intersection=[...left].filter(x=>right.has(x)).length;
  return intersection/(left.size+right.size-intersection);
}
const actions=[
  ['empty',/비우|비웁|제거한 빈/],['rinse',/헹|씻/],['dry',/말리|건조/],
  ['dedicated-bin',/전용\s*수거함/],['battery-separation',/분리\s*가능한\s*전지/],
  ['service',/무상\s*방문\s*수거|방문수거/],['local-check',/지자체|관할|지역/],
  ['general-bag',/종량제\s*봉투/],['sharp-protection',/감싸|감싼|날.*보호/],
  ['scrap',/고철/],['reuse',/재사용|의류\s*수거함/],['bulky',/대형폐기물/]
];
export function actionSignature(item) {
  return [...new Set(item.steps.flatMap(step=>actions.filter(([,pattern])=>pattern.test(step)).map(([id])=>id)))].sort().join('|');
}
export function contentAudit(seed, guides, registry, supplemental = []) {
  const items=seed.items.filter(isIndexable), exactMisses=[], pairs=[];
  for(let a=0;a<items.length;a++)for(let b=a+1;b<items.length;b++) {
    const left=items[a],right=items[b],similarity=answerSimilarity(left,right);
    const signature=actionSignature(left), actionCount=signature.split('|').length;
    const sameActions=signature&&signature===actionSignature(right)&&(actionCount>=3||(actionCount>=2&&/dedicated-bin|battery-separation|sharp-protection|reuse/.test(signature)));
    // Signature comparison catches reordered/reworded advice; it does not prove
    // equivalence. Keep scores and reasons so a person can inspect false positives.
    if(similarity>=0.65||sameActions) {
      const caughtByExistingNameGate=fuzzyDisposalFingerprint(left)===fuzzyDisposalFingerprint(right);
      pairs.push({slugs:[left.slug,right.slug],similarity:Number(similarity.toFixed(3)),sameActions:Boolean(sameActions),caughtByExistingNameGate});
      if(!caughtByExistingNameGate)exactMisses.push([left.slug,right.slug]);
    }
  }
  const guidePairs=[], guideOverlapPairs=[];
  for(let a=0;a<guides.guides.length;a++)for(let b=a+1;b<guides.guides.length;b++) {
    const left=guides.guides[a],right=guides.guides[b];
    const score=answerSimilarity({name:left.title,summary:left.intro,steps:left.steps.map(s=>s.text)},{name:right.title,summary:right.intro,steps:right.steps.map(s=>s.text)});
    if(score>=0.3)guidePairs.push({slugs:[left.slug,right.slug],similarity:Number(score.toFixed(3))});
    const leftItems=new Set(left.steps.flatMap(s=>s.items)),rightItems=new Set(right.steps.flatMap(s=>s.items));
    const shared=[...leftItems].filter(s=>rightItems.has(s));
    if(shared.length>=2)guideOverlapPairs.push({slugs:[left.slug,right.slug],sharedItems:shared,note:'Shared targets require a manual check of distinct question and decision order.'});
  }
  return {mode:'offline_manual_review_only',indexableItems:items.length,guides:guides.guides.length,
    categories:[...new Set(items.map(i=>i.category))].map(category=>({category,count:items.filter(i=>i.category===category).length})),
    items:items.map(item=>({slug:item.slug,category:item.category,answerCharacters:answerText(item).length,sourceBasis:item.verification_level,officialSources:item.sources.map(s=>({url:s.url,registered:registry.sources.some(r=>r.url===s.url)})),reviewPairs:pairs.filter(p=>p.slugs.includes(item.slug)).length,hasPracticalNotes:supplemental.some(s=>s.slug===item.slug)})),
    disposalFamilies:[...new Set(items.map(i=>`${i.category}:${i.disposal_type}`))].map(key=>({key,slugs:items.filter(i=>`${i.category}:${i.disposal_type}`===key).map(i=>i.slug)})),
    reviewPairs:pairs.sort((a,b)=>b.similarity-a.similarity),notCaughtByExistingNameGate:exactMisses.length,guideReviewPairs:guidePairs,guideOverlapPairs,
    limitation:'Heuristic review candidates only; no embeddings, traffic data, AdSense diagnosis or automatic hold/status changes.'};
}
