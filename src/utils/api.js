// api.js — unchanged from Lesson 5
import { OMDB_API_KEY, GROQ_API_KEY, GROQ_MODELS } from '../config';

// Safe ratings only — encoded as Base64. Anything not in this list is blocked.
// G=Rw==  TV-G=VFYtRw==  TV-PG=VFYtUEc=  TV-14=VFYtMTQ=
const _sr = ['Rw==','VFYtRw==','VFYtUEc=','VFYtMTQ='].map(atob);
const _isSafe = r => !!r && _sr.some(s => r.toUpperCase() === s.toUpperCase());

export async function omdbSearch(query) {
  if (!OMDB_API_KEY) { console.warn('[OMDb] No API key'); return []; }
  const original = query.trim();
  const cleaned  = original.replace(/\.(?=[A-Za-z])/g, '').replace(/[:.]/g, ' ').replace(/\s+/g, ' ').trim();
  const terms    = [...new Set([original, cleaned])];
  const fetchTerm = term =>
    fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(term)}&type=movie`)
      .then(r => r.json()).then(d => d.Response === 'True' ? d.Search : []).catch(() => []);
  const seen = new Set(), merged = [];
  for (const arr of await Promise.all(terms.map(fetchTerm)))
    for (const m of arr)
      if (!seen.has(m.imdbID)) { seen.add(m.imdbID); merged.push(m); }
  const withRatings = await Promise.all(
    merged.map(m =>
      fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${m.imdbID}`)
        .then(r => r.json()).then(d => {
          console.log(`[OMDb] ${m.Title} (${m.imdbID}): Rated="${d.Rated}"`);
          return { ...m, Rated: d.Rated || '' };
        }).catch(() => m)
    )
  );
  const filtered = withRatings.filter(m => _isSafe(m.Rated));
  console.log(`[OMDb] Search "${query}": ${merged.length} total, ${filtered.length} after filter`);
  return filtered;
}

export async function omdbDetails(imdbID) {
  if (!OMDB_API_KEY || !imdbID) return null;
  try {
    const d = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=full`).then(r => r.json());
    if (d.Response !== 'True' || !_isSafe(d.Rated)) return null;
    return d;
  } catch { return null; }
}

export async function callGroq(messages, modelIndex = 0) {
  if (!GROQ_API_KEY) { console.error('[Groq] No API key'); return { error: 'no_key' }; }
  const model = GROQ_MODELS[modelIndex];
  if (!model) return { error: 'all_models_failed' };
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 800, temperature: 0.75 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.status === 401 || res.status === 403) return { error: 'auth' };
    if (res.status === 429 || !res.ok)
      return modelIndex + 1 < GROQ_MODELS.length ? callGroq(messages, modelIndex + 1) : { error: res.status === 429 ? 'rate_limit' : 'server_error' };
    const reply = (await res.json())?.choices?.[0]?.message?.content?.trim() || '';
    if (!reply) return modelIndex + 1 < GROQ_MODELS.length ? callGroq(messages, modelIndex + 1) : { error: 'empty_reply' };
    return { success: true, reply };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') return modelIndex + 1 < GROQ_MODELS.length ? callGroq(messages, modelIndex + 1) : { error: 'timeout' };
    return { error: 'network_error' };
  }
}
