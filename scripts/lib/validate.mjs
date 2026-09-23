import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { normalize } from '../../src/search.mjs';

const text = value => typeof value === 'string' && value.trim().length > 0;
const safeURL = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
};
const validDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const officialHost = value => {
  if (!safeURL(value)) return false;
  const host = new URL(value).hostname;
  return host.endsWith('.go.kr') || host === 'go.kr'
    || ['xn--oy2b29bd3a601b.kr', 'www.xn--oy2b29bd3a601b.kr', 'www.15990903.or.kr'].includes(host);
};

export function duplicateDisposalBodies(seed) {
  const bodies = new Map();
  for (const item of seed.items.filter(item => item.verification_status === 'verified')) {
    const body = JSON.stringify([item.summary, item.steps, item.warnings]);
    bodies.set(body, [...(bodies.get(body) ?? []), item.slug]);
  }
  return [...bodies.values()].filter(slugs => slugs.length > 1);
}

export function createValidator({ schema, registry, categories }) {
  // The supplied conditional subschemas omit local type declarations;
  // strictTypes is disabled only for that authoring style. No coercion/defaults.
  const ajv = new Ajv2020({ allErrors: true, strictTypes: false });
  addFormats(ajv);
  const validateItem = ajv.compile(schema);
  const official = new Map(registry.sources.map(source => [source.url, source]));
  const categoryNames = new Set(categories.categories.map(c => c.source_label));

  return function validate(seed) {
    const errors = [];
    const fail = (code, path, message) => errors.push({ code, path, message });
    const registryIds = new Set();
    const registryUrls = new Set();
    registry.sources.forEach((source, index) => {
      const path = `/registry/sources/${index}`;
      if (!text(source.id) || registryIds.has(source.id)) fail('registry_id', `${path}/id`, 'Source ID must be unique and nonblank');
      registryIds.add(source.id);
      if (!officialHost(source.url) || registryUrls.has(source.url)) fail('registry_url', `${path}/url`, 'Unique official HTTPS URL required');
      registryUrls.add(source.url);
      if (!text(source.name) || !text(source.authority)) fail('registry_identity', path, 'Source name and authority required');
      if (!Number.isInteger(source.review_interval_days) || source.review_interval_days < 1 || source.review_interval_days > 365) fail('review_interval', `${path}/review_interval_days`, 'Review interval must be 1–365 days');
      if (!['national', 'local'].includes(source.geographic_scope)) fail('source_scope', `${path}/geographic_scope`, 'Source scope required');
      if (source.geographic_scope === 'local' && !text(source.jurisdiction)) fail('source_scope', `${path}/jurisdiction`, 'Local source jurisdiction required');
    });
    if (!seed || typeof seed !== 'object' || !Array.isArray(seed.items) || !seed.items.length) {
      fail('seed', '/items', 'Seed must contain a non-empty items array');
      return errors;
    }
    let schemaFailed = false;
    seed.items.forEach((item, index) => {
      if (!validateItem(item)) {
        schemaFailed = true;
        for (const e of validateItem.errors) {
          fail('schema', `/items/${index}${e.instancePath}`, `${e.message} ${JSON.stringify(e.params)}`);
        }
      }
    });
    // Cross-item checks assume schema-correct types; malformed data still fails closed.
    if (schemaFailed) return errors;
    const counts = {
      item_count: seed.items.length,
      verified_item_count: seed.items.filter(i => i.verification_status === 'verified').length,
      needs_research_count: seed.items.filter(i => i.verification_status === 'needs_research').length,
    };
    for (const [field, actual] of Object.entries(counts)) {
      if (seed[field] !== actual) fail('count', `/${field}`, `Expected metadata count ${actual}`);
    }
    const seen = { id: new Map(), name: new Map(), slug: new Map() };
    const slugs = new Set(seed.items.map(i => i.slug));
    const terms = new Map();
    const seoTitles = new Map();
    const seoDescriptions = new Map();
    seed.items.forEach((item, index) => {
      const root = `/items/${index}`;
      for (const field of ['id', 'name', 'slug']) {
        const key = field === 'name' ? normalize(item[field]) : item[field];
        if (!key) fail('blank', `${root}/${field}`, 'Must not be blank');
        if (seen[field].has(key)) fail('duplicate', `${root}/${field}`, `Duplicates ${seen[field].get(key)}`);
        else seen[field].set(key, item.id);
      }
      // Aliases equal to this item's own normalized name are allowed by the Pack.
      const localAliases = new Set();
      for (const [n, alias] of item.aliases.entries()) {
        const key = normalize(alias);
        if (!key) fail('blank', `${root}/aliases/${n}`, 'Alias must not be blank');
        if (localAliases.has(key)) fail('alias_duplicate', `${root}/aliases/${n}`, 'Duplicate normalized alias');
        localAliases.add(key);
      }
      for (const term of new Set([normalize(item.name), ...localAliases])) {
        if (terms.has(term) && terms.get(term) !== item.id) {
          fail('term_collision', `${root}/aliases`, `Name/alias collides with ${terms.get(term)}: ${term}`);
        } else terms.set(term, item.id);
      }
      if (!categoryNames.has(item.category)) fail('category', `${root}/category`, 'Unknown category');
      if (item.search_keywords !== undefined && (!Array.isArray(item.search_keywords) || !item.search_keywords.every(text))) {
        fail('keywords', `${root}/search_keywords`, 'Expected nonblank string array');
      }
      item.related_items.forEach((slug, n) => {
        if (!slugs.has(slug)) fail('related_reference', `${root}/related_items/${n}`, `Unknown slug: ${slug}`);
        if (slug === item.slug) fail('related_self', `${root}/related_items/${n}`, 'Self-reference is not allowed');
      });
      for (const field of ['steps', 'warnings']) {
        item[field].forEach((value, n) => {
          if (!text(value)) fail('blank', `${root}/${field}/${n}`, 'Must not be blank');
        });
      }
      if (item.verification_status === 'needs_research') {
        for (const field of ['summary', 'disposal_type', 'disposal_label', 'regional_note', 'collection_service', 'free_collection', 'regional_variation', 'seo']) {
          if (item[field] != null) fail('unverified_content', `${root}/${field}`, 'Unverified disposal content must remain null/absent');
        }
        for (const field of ['steps', 'warnings']) {
          if (item[field].length) fail('unverified_content', `${root}/${field}`, 'Unverified disposal content must remain empty');
        }
        return;
      }
      for (const field of ['summary', 'disposal_type', 'disposal_label', 'verification_level', 'verified_at']) {
        if (!text(item[field])) fail('verified_required', `${root}/${field}`, 'Verified field must not be blank');
      }
      for (const field of ['title', 'description']) {
        if (!text(item.seo?.[field])) fail('verified_required', `${root}/seo/${field}`, 'Verified SEO field required');
        const seenSeo = field === 'title' ? seoTitles : seoDescriptions;
        const value = item.seo?.[field]?.trim();
        if (value && seenSeo.has(value)) fail('seo_duplicate', `${root}/seo/${field}`, `Duplicates ${seenSeo.get(value)}`);
        else if (value) seenSeo.set(value, item.slug);
      }
      if (!item.steps.length || !item.warnings.length) fail('verified_required', root, 'Verified steps and warnings required');
      if (typeof item.regional_variation !== 'boolean') fail('verified_required', `${root}/regional_variation`, 'Boolean required');
      if (item.regional_variation && !text(item.regional_note)) fail('verified_required', `${root}/regional_note`, 'Regional explanation required');
      let authoritative = false;
      item.sources.forEach((source, n) => {
        const path = `${root}/sources/${n}`;
        for (const field of ['name', 'authority', 'checked_at']) {
          if (!text(source[field])) fail('source_required', `${path}/${field}`, 'Official source field required');
        }
        const registered = official.get(source.url);
        if (!safeURL(source.url) || !registered) fail('source_registry', `${path}/url`, 'HTTPS URL must exactly match the supplied source registry');
        else {
          if (!source.name.includes(registered.name)) fail('source_name', `${path}/name`, 'Source name differs from registry');
          if (registered.authority !== source.authority) fail('source_authority', `${path}/authority`, 'Authority differs from registry');
          if (registered.geographic_scope === 'local' && (!item.regional_variation || !item.regional_note?.includes(registered.jurisdiction.split(' ').at(-1)))) {
            fail('local_scope', `${root}/regional_note`, `Local source requires a regional warning naming ${registered.jurisdiction}`);
          }
          if (validDate(source.checked_at) && Number.isInteger(registered.review_interval_days)) {
            const nextReview = new Date(Date.parse(`${source.checked_at}T00:00:00Z`) + registered.review_interval_days * 86_400_000);
            if (Number.isNaN(nextReview.getTime()) || nextReview.getUTCFullYear() > 9999) fail('review_date', `${path}/checked_at`, 'Next review date cannot be computed');
          }
          if ([1, 2].includes(registered.tier)) authoritative = true;
        }
      });
      if (!authoritative) fail('source_tier', `${root}/sources`, 'At least one registered tier 1/2 source required');
      if (item.collection_service?.url != null && !safeURL(item.collection_service.url)) {
        fail('collection_url', `${root}/collection_service/url`, 'Collection URL must be HTTPS without credentials');
      }
    });
    return errors;
  };
}
