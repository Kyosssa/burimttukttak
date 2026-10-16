import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{loadInputs}from'../scripts/lib/inputs.mjs';
import{sourceRechecks,recheckedDate,beforeDocumentedCorrections}from'../scripts/lib/source-rechecks.mjs';
import{createSourceHealthReport}from'../scripts/source-health.mjs';
const{seed,registry}=loadInputs();const html=slug=>readFileSync(`dist/item/${slug}/index.html`,'utf8');

test('three actually accessed sources document all 53 specific Seed references and comparison evidence',()=>{
 assert.deepEqual(sourceRechecks.sources.map(s=>[s.id,s.references.length]),[['official-disposal-portal',7],['ewaste-pickup',44],['official-disposal-location-map',2]]);
 assert.equal(new Set(sourceRechecks.sources.flatMap(s=>s.references.map(r=>r.slug))).size,53);
 for(const s of sourceRechecks.sources){assert.equal(s.http_status,200);assert.equal(s.availability,'accessible');assert.equal(s.authority,registry.sources.find(r=>r.id===s.id).authority);assert.match(s.html_sha256,/^[a-f0-9]{64}$/);assert.ok(s.scope);
  for(const ref of s.references){const item=seed.items.find(i=>i.slug===ref.slug),source=item.sources.find(r=>r.url===s.url);assert.equal(recheckedDate(item,source,'2026-10-17'),'2026-10-17');assert.ok(ref.finding);assert.ok(ref.evidence_urls.every(u=>/^https:\/\/(?:www\.)?(?:xn--oy2b29bd3a601b\.kr|15990903\.or\.kr)\//.test(u)));}
 }
});

test('changed claims, failed access, incomplete review and future reviews never clear overdue dates',()=>{
 const row=sourceRechecks.sources[0],ref=row.references[0],item=seed.items.find(i=>i.slug===ref.slug),source=item.sources.find(s=>s.url===row.url);
 assert.equal(recheckedDate({...item,summary:item.summary+' changed'},source,'2026-10-17'),null);
 assert.equal(recheckedDate(item,source,'2026-10-16'),null);
 for(const change of [d=>d.sources[0].http_status=403,d=>d.sources[0].availability='unavailable',d=>d.sources[0].references[0].status='pending',d=>d.sources[0].references[0].evidence_urls=[]]){const copy=structuredClone(sourceRechecks);change(copy);assert.equal(recheckedDate(item,source,'2026-10-17',copy),null);}
 const original=JSON.stringify(seed);assert.equal(createSourceHealthReport({asOf:new Date('2026-10-17')}).summary.reviewDueItems,0);
 assert.ok(createSourceHealthReport({asOf:new Date('2026-10-07')}).summary.reviewDueItems>0);
 assert.ok(createSourceHealthReport({asOf:new Date('2026-10-31')}).summary.reviewDueItems>=53);
 assert.equal(JSON.stringify(seed),original);
});

test('only twelve explicitly documented core corrections are authorized and test baselines stay strict',()=>{
 assert.deepEqual(sourceRechecks.corrections.map(c=>c.slug),['kimchi-refrigerator','electric-oven','dishwasher','water-purifier','water-dispenser','treadmill','copier','electric-fan','humidifier','rice-cooker','desktop-computer','power-bank']);
 const restored=beforeDocumentedCorrections(seed.items);assert.equal(restored.length,149);
 const drift=structuredClone(seed.items);drift.find(i=>i.slug==='electric-fan').warnings=['unreviewed'];assert.throws(()=>beforeDocumentedCorrections(drift),/drift/);
 for(const slug of ['kimchi-refrigerator','electric-oven','dishwasher','water-purifier','water-dispenser','treadmill','copier']){const item=seed.items.find(i=>i.slug===slug);assert.ok(item.steps[0].includes('포장재'));assert.ok(!item.steps[0].includes('부속품'));}
 for(const slug of ['electric-fan','humidifier','rice-cooker']){const item=seed.items.find(i=>i.slug===slug);assert.match(item.warnings[0],/모든 제품이 다량 품목인 것은 아닙니다/);}
 assert.doesNotMatch(seed.items.find(i=>i.slug==='desktop-computer').summary,/공식 무상방문수거 기준에 명시/);
 assert.match(seed.items.find(i=>i.slug==='power-bank').warnings[0],/분리된 전지의 단자가 노출된 경우/);
});

test('all 22 baseline repeated appliances have bounded manual findings; no status or route expansion',()=>{
 assert.equal(sourceRechecks.appliance_review.length,22);assert.equal(new Set(sourceRechecks.appliance_review.map(r=>r.slug)).size,22);
 assert.deepEqual(sourceRechecks.appliance_review.filter(r=>r.new_explanation).map(r=>r.slug).sort(),['tablet','treadmill']);
 for(const r of sourceRechecks.appliance_review)assert.ok(r.decision&&seed.items.some(i=>i.slug===r.slug&&i.verification_status==='verified'));
 assert.equal(seed.items.filter(i=>i.verification_status==='verified').length,135);assert.equal(seed.items.filter(i=>i.verification_status==='needs_research').length,14);
});

test('HTML shows specific short condition differences and reviewed source dates without full guide copies',()=>{
 assert.match(html('treadmill'),/건전지 계기판만 달린 운동기구/);
 assert.match(html('tablet'),/태블릿PC를 다량 품목 표에 열거/);
 for(const source of sourceRechecks.sources)for(const ref of source.references){const page=html(ref.slug);assert.match(page,/확인일: 2026\.10\.17/);assert.match(page,/다음 검토 예정일: 2026\.10\.31/);}
 for(const c of sourceRechecks.corrections)assert.ok(html(c.slug).includes('"dateModified":"2026-10-17"'));
 assert.match(html('sofa'),/content="noindex,follow"/);
 const sitemap=readFileSync('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,147);assert.ok(!sitemap.includes('/item/sofa/'));
});
