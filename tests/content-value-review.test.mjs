import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { guideData } from '../scripts/lib/guides.mjs';
import { improvements, validateImprovements } from '../scripts/lib/content-improvements.mjs';
import { answerSimilarity, answerText, contentAudit } from '../scripts/lib/content-audit.mjs';
import { escapeHtml } from '../scripts/lib/html.mjs';
const {seed,registry}=loadInputs();
const html=path=>readFileSync(`dist/${path}`,'utf8');

test('six traffic-priority pages and two source-specific appliances attach evidenced explanations without new FAQs',()=>{
  assert.deepEqual(improvements.items.map(i=>i.slug),['wifi-router','bag','foil-plate','food-absorbent-pad','lint-roller','razor','treadmill','tablet']);
  assert.doesNotThrow(()=>validateImprovements(seed,registry,guideData));
  for(const entry of improvements.items){
    const page=html(`item/${entry.slug}/index.html`),item=seed.items.find(i=>i.slug===entry.slug);
    for(const note of entry.step_notes){
      assert.equal(page.split(escapeHtml(note.text)).length-1,1);
      assert.ok(page.indexOf(escapeHtml(item.steps[note.step]))<page.indexOf(escapeHtml(note.text)));
      for(const id of note.source_ids)assert.ok(page.includes(escapeHtml(registry.sources.find(s=>s.id===id).url)));
    }
    for(const link of entry.links)assert.ok(page.includes(`href="${link.path}"`)&&page.includes(escapeHtml(link.label)));
    assert.equal((page.match(/data-content-improvement/g)||[]).length,entry.step_notes.length);
    assert.doesNotMatch(page,/FAQPage/);
    assert.ok(page.includes(`"dateModified":"${improvements.checked_at}"`));
    assert.match(html('sitemap.xml'),new RegExp(`<loc>https://beorimttukttak.com/item/${entry.slug}/</loc>\\s*<lastmod>${improvements.checked_at}</lastmod>`));
    assert.ok(page.indexOf('data-content-improvement')<page.indexOf('data-coupang-carousel'));
  }
  assert.doesNotMatch(html('item/sofa/index.html'),/data-content-improvement/);
});

test('improvement validator rejects held targets, invented evidence, repeated explanations and wrong links',()=>{
  for(const [change,pattern]of[
    [d=>d.items[0].slug='sofa',/indexable/],
    [d=>d.items[0].step_notes[0].source_ids=['imagined-source'],/evidence/],
    [d=>d.items[1].step_notes[0].text=d.items[0].step_notes[0].text,/repeated/],
    [d=>d.items[0].step_notes[0].step=99,/annotation/],
    [d=>d.items[0].links[0].path='/item/wifi-router/',/navigation/],
    [d=>d.items[0].links[0].path='/item/sofa/',/navigation/]
  ]){const copy=structuredClone(improvements);change(copy);assert.throws(()=>validateImprovements(seed,registry,guideData,copy),pattern);}
});

test('review excludes warning/menu/ad noise and detects common actions despite reordered wording',()=>{
  const first={name:'첫품목',aliases:[],slug:'one',verification_status:'verified',category:'test',sources:[],summary:'첫품목의 회수 경로',steps:['분리 가능한 전지를 확인합니다.','전용수거함에 배출합니다.','관할 지자체 안내를 확인합니다.'],warnings:['공통 경고']};
  const second={...first,name:'둘품목',slug:'two',summary:'둘품목의 공식 접수 순서',steps:['지역 기준을 살펴보세요.','전용 수거함으로 넣으세요.','분리 가능한 전지를 살펴보세요.'],warnings:['다른 안내']};
  assert.equal(answerText(first),answerText({...first,warnings:['완전히 다른 경고'],menu:'ads',sources:['other']}));
  assert.equal(answerSimilarity(first,first),1);
  const result=contentAudit({items:[first,second]},{guides:[]},{sources:[]});
  assert.equal(result.reviewPairs.length,1);
  assert.equal(result.reviewPairs[0].sameActions,true);
  assert.equal(result.reviewPairs[0].caughtByExistingNameGate,false);
  assert.equal(result.mode,'offline_manual_review_only');
  assert.equal(first.verification_status,'verified');
});

test('full audit covers all indexable answers and guides without treating warning candidates as deindex decisions',()=>{
  const report=contentAudit(seed,guideData,registry,improvements.items);
  assert.equal(report.indexableItems,124);assert.equal(report.guides,11);
  assert.equal(report.categories.reduce((n,c)=>n+c.count,0),124);
  assert.equal(report.items.length,124);
  assert.ok(report.notCaughtByExistingNameGate>0);
  assert.ok(report.reviewPairs.some(p=>p.slugs.includes('wifi-router')));
  assert.ok(report.guideOverlapPairs.length>0);
  assert.ok(!report.items.some(i=>i.slug==='sofa'));
});

test('scope boundaries remain explicit and unchanged destinations answer the next concrete question',()=>{
  assert.match(html('item/foil-plate/index.html'),/선별의 어려움/);
  assert.match(html('item/bag/index.html'),/전국 공통 크기 수치나 수수료를 제시하지/);
  assert.match(html('item/food-absorbent-pad/index.html'),/하수구로 버리는 방법은 확인하지/);
  assert.match(html('item/lint-roller/index.html'),/금속 몸체·전동 청소기/);
  assert.match(html('item/razor/index.html'),/칼날을 떼어내라는 지침으로 해석하지/);
  assert.match(html('item/wifi-router/index.html'),/공유기 한 대만으로 방문수거가 된다고 판단하지/);
  assert.match(html('index.html'),/먼저 살펴볼 품목/);
});
