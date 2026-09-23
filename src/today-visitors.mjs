// TODAY is an approximate anonymous browser-tab-session count, not unique people.
const COUNTED_KEY = 'burimttukttak:today-counted-date';
const PENDING_KEY = 'burimttukttak:today-pending-date';
let initialization;

export function seoulDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function loadTodayVisitors({ display, fetchImpl, storage, now = new Date() }) {
  if (!display) return;
  const date = seoulDate(now);
  let method = 'GET';
  let claimed = false;
  try {
    if (storage && storage.getItem(COUNTED_KEY) !== date && storage.getItem(PENDING_KEY) !== date) {
      // A provisional tab-only claim prevents a second POST during navigation.
      // Keep it after ambiguous network failures, where the server may have counted.
      storage.setItem(PENDING_KEY, date);
      method = 'POST';
      claimed = true;
    }
  } catch {
    method = 'GET';
  }

  try {
    const response = await fetchImpl('/api/today-visitors', {
      method, headers: { accept: 'application/json' }, cache: 'no-store', credentials: 'omit',
    });
    if (!response.ok) throw new Error('Visitor API unavailable');
    const payload = await response.json();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload?.date) || !Number.isSafeInteger(payload?.count) || payload.count < 0) throw new Error('Invalid visitor result');
    if (claimed) {
      try {
        storage.setItem(COUNTED_KEY, payload.date);
        storage.removeItem(PENDING_KEY);
      } catch { /* The provisional claim still prevents a repeated POST. */ }
    }
    display.textContent = `TODAY ${payload.count.toLocaleString('en-US')}`;
  } catch {
    display.textContent = 'TODAY —';
  }
}

export function startTodayVisitors() {
  if (initialization) return initialization;
  let storage;
  try { storage = sessionStorage; } catch { storage = null; }
  initialization = loadTodayVisitors({
    display: document.querySelector('#today-visitors'), fetchImpl: fetch, storage,
  });
  return initialization;
}

if (typeof document !== 'undefined') void startTodayVisitors();
