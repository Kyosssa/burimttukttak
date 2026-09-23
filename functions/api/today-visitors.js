const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export const SELECT_SQL = 'SELECT count FROM daily_visitors WHERE date = ?';
export const UPSERT_SQL = 'INSERT INTO daily_visitors (date, count, last_updated) VALUES (?, 1, ?) ON CONFLICT(date) DO UPDATE SET count = count + 1, last_updated = excluded.last_updated RETURNING count';

export function seoulDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: JSON_HEADERS });

export async function handleTodayVisitors(request, env, now = new Date()) {
  if (request.method !== 'GET' && request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const date = seoulDate(now);
  try {
    if (request.method === 'GET') {
      const row = await env.DB.prepare(SELECT_SQL).bind(date).first();
      return json({ date, count: row?.count ?? 0 });
    }
    const row = await env.DB.prepare(UPSERT_SQL).bind(date, now.toISOString()).first();
    if (!Number.isSafeInteger(row?.count) || row.count < 1) throw new Error('Invalid D1 result');
    return json({ date, count: row.count });
  } catch {
    return json({ error: 'Temporarily unavailable' }, 503);
  }
}

export function onRequest(context) {
  return handleTodayVisitors(context.request, context.env);
}
