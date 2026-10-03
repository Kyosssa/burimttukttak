import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { guideData, validateGuides } from '../scripts/lib/guides.mjs';
import { questionData, validateItemQuestions } from '../scripts/lib/item-questions.mjs';
import { heldSlugs, isIndexable } from '../scripts/lib/index-quality.mjs';
import { createSearchIndex, search } from '../src/search.mjs';
import { createMissingSearchApi } from '../functions/api/missing-search-core.mjs';
import { SITE_URL } from '../scripts/lib/html.mjs';

const {seed,registry}=loadInputs();
const manifest=JSON.parse(readFileSync('data/search-intent-expansion.json','utf8'));
const research=JSON.parse(readFileSync('data/keyword-research-2026-10-03.json','utf8'));
const fixtures=JSON.parse(readFileSync('docs/prebuild/14-search-quality-fixtures.json','utf8'));
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const html=p=>readFileSync(`dist/${p}`,'utf8');

test('sub-keyword expansion preserves every item fact, status, alias and prior guide/source',()=>{
  assert.equal(hash(seed.items.map(({search_keywords,...facts})=>facts)),manifest.baseline.items_sha256);
  assert.equal(hash(registry.sources.slice(0,manifest.baseline.registry_count)),manifest.baseline.registry_sha256);
  assert.equal(hash(guideData.guides.slice(0,manifest.baseline.guide_count)),manifest.baseline.guides_sha256);
  assert.equal(seed.items.filter(i=>i.verification_status==='verified').length,135);
  assert.equal(seed.items.filter(i=>i.verification_status==='needs_research').length,14);
  assert.equal(seed.items.filter(isIndexable).length,124);
  assert.equal(heldSlugs.size,11);
});

test('observed candidates are distinct from editorial ideas and trace to bounded public discovery',()=>{
  assert.ok(research.candidates.length>=80&&research.candidates.length<=120);
  assert.equal(new Set(research.candidates.map(c=>c.query)).size,research.candidates.length);
  const observed=new Set(research.observations.flatMap(o=>o.queries));
  for(const c of research.candidates){
    assert.equal(c.observation,'observed');assert.ok(['A','B','C','D'].includes(c.classification));
    assert.ok(c.user_question&&c.content_gap&&c.evidence_available&&c.decision);
    assert.match(c.discovery_url,/^https:\/\/(www\.google\.com\/search\?q=|www\.15990903\.or\.kr\/portal\/faq\/)/);
    if(c.discovery.startsWith('Google'))assert.ok(observed.has(c.query));
    for(const id of c.source_ids)assert.ok(registry.sources.some(s=>s.id===id));
  }
  for(const idea of research.editorial_ideas)assert.equal(idea.observation,'idea');
});

test('selected condition questions have evidence, valid guide connections and unique substantive answers',()=>{
  assert.equal(questionData.questions.length,18);
  assert.doesNotThrow(()=>validateItemQuestions(seed,registry,guideData));
  const invalid=structuredClone(questionData);invalid.questions[0].slug='sofa';
  assert.throws(()=>validateItemQuestions(seed,registry,guideData,invalid),/indexable/);
  const duplicate=structuredClone(questionData);duplicate.questions[1].answer=duplicate.questions[0].answer;
  assert.throws(()=>validateItemQuestions(seed,registry,guideData,duplicate),/duplicate/);
  const wrong=structuredClone(questionData);wrong.questions[0].source_ids=['not-official'];
  assert.throws(()=>validateItemQuestions(seed,registry,guideData,wrong),/evidence/);
  for(const q of questionData.questions){
    const page=html(`item/${q.slug}/index.html`);
    assert.equal((page.match(/data-section="condition-question"/g)||[]).length,1);
    assert.ok(page.includes(q.question)&&page.includes(q.answer));
    assert.ok(page.includes(`/guides/${q.guide_slug}/`));
    assert.ok(page.indexOf('condition-question')<page.indexOf('data-coupang-carousel'));
    for(const id of q.source_ids)assert.ok(page.includes(registry.sources.find(s=>s.id===id).url.replaceAll('&','&amp;')));
    assert.doesNotMatch(page,/FAQPage/);
  }
  for(const item of seed.items.filter(i=>!manifest.enhanced_items.includes(i.slug)&&i.verification_status==='verified'))assert.doesNotMatch(html(`item/${item.slug}/index.html`),/data-section="condition-question"/);
});

test('published condition search phrases resolve correctly and never touch D1',async()=>{
  const index=createSearchIndex(seed.items),{handleMissingSearch}=createMissingSearchApi(seed,fixtures);
  const DB={prepare(){assert.fail('Known condition query must not touch D1');}};
  for(const q of questionData.questions)for(const query of q.queries){
    for(const variant of [query,query.replaceAll(' ',''),` ${query} `]){
      const result=search(index,variant);assert.equal(result.slug,q.slug,variant);assert.equal(result.shouldTrackMissing,false);
      const response=await handleMissingSearch(new Request(`${SITE_URL}/api/missing-search`,{method:'POST',headers:{Origin:SITE_URL,'Content-Type':'application/json'},body:JSON.stringify({query:variant})}),{DB});assert.equal(response.status,204);
    }
  }
});

test('six new guides have distinct check sequences, canonical links, no extra advertising and reachable entry points',()=>{
  assert.equal(manifest.new_guides.length,6);assert.doesNotThrow(()=>validateGuides(seed,registry));
  const oldBodies=new Set(guideData.guides.slice(0,5).map(g=>JSON.stringify(g.steps)));
  const titles=new Set(),bodies=new Set();
  for(const slug of manifest.new_guides){
    const guide=guideData.guides.find(g=>g.slug===slug),body=JSON.stringify(guide.steps);
    assert.ok(!oldBodies.has(body)&&!bodies.has(body));bodies.add(body);
    assert.ok(!titles.has(guide.title));titles.add(guide.title);
    const page=html(`guides/${slug}/index.html`),canonical=`${SITE_URL}/guides/${slug}/`;
    assert.ok(page.includes(`rel="canonical" href="${canonical}"`));
    assert.ok(html('index.html').includes(`/guides/${slug}/`));
    assert.ok(html('sitemap.xml').includes(canonical));
    assert.doesNotMatch(page,/data-coupang|FAQPage/);
    assert.ok(questionData.questions.some(q=>q.guide_slug===slug));
  }
  assert.equal((html('sitemap.xml').match(/<loc>/g)||[]).length,147);
});

test('partial component and product-state answers do not claim unverified disposal or disassembly',()=>{
  assert.match(html('guides/appliance-condition-and-parts/index.html'),/부속품/);
  assert.match(html('guides/appliance-condition-and-parts/index.html'),/종량제·재활용 배출법으로 바꿔/);
  assert.match(html('guides/sharp-tools-and-materials/index.html'),/날 분리나 분해를 권하지/);
  assert.match(html('guides/battery-and-device/index.html'),/강제로 분해하라는 안내가 아닙니다/);
  assert.match(html('item/scissors/index.html'),/부품을 분해하라는 안내가 아닙니다/);
});
