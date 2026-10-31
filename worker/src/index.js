// 87 Kings Road open home registrations. The form lives on GitHub Pages; this Worker stores the rows.
// Routes:
//   POST /api/register      JSON {first_name,last_name,email,phone,people,message}
//   GET  /admin?key=...     registrations list
//   GET  /admin/export.csv?key=...

const ALLOWED_ORIGINS = ['https://stevebonnici.github.io', 'http://localhost:8080'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const cors = corsHeaders(request);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method === 'POST' && path === '/api/register') return handleRegister(request, env, ctx, cors);
    if (path === '/admin') return adminPage(url, env);
    if (path === '/admin/export.csv') return adminCsv(url, env);
    return Response.redirect('https://stevebonnici.github.io/87-kings-road/', 302);
  },
};

function corsHeaders(request) {
  const origin = request.headers.get('origin');
  if (!ALLOWED_ORIGINS.includes(origin)) return {};
  return { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'vary': 'origin' };
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...cors } });
}

async function handleRegister(request, env, ctx, cors) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400, cors); }
  const first_name = String(b.first_name || '').trim().slice(0, 80);
  const last_name = String(b.last_name || '').trim().slice(0, 80);
  const email = String(b.email || '').trim().slice(0, 200);
  const phone = String(b.phone || '').trim().slice(0, 40);
  const n = parseInt(b.people, 10);
  const people = n >= 1 && n <= 10 ? n : null;
  const message = String(b.message || '').trim().slice(0, 1000);
  if (!first_name || !last_name) return json({ ok: false, error: 'Please enter your first and last name.' }, 422, cors);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 422, cors);
  if (phone.replace(/\D/g, '').length < 7) return json({ ok: false, error: 'Please enter a phone number we can reach you on.' }, 422, cors);

  // One row per email address: registering again updates the first.
  await env.DB.prepare(
    `INSERT INTO registrations (first_name, last_name, email, phone, people, message)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(lower(email)) DO UPDATE SET
       first_name = excluded.first_name, last_name = excluded.last_name, phone = excluded.phone,
       people = excluded.people, message = excluded.message,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`
  ).bind(first_name, last_name, email, phone, people, message || null).run();

  // Email the application form once per address, after responding.
  ctx.waitUntil(sendApplicationForm(env, email, first_name));
  return json({ ok: true }, 200, cors);
}

// Sends via the Apps Script web app in Steve's Google account (Gmail, from steve@urgent.co.nz).
async function sendApplicationForm(env, email, first_name) {
  if (!env.MAILER_URL || !env.MAILER_SECRET) return;
  const row = await env.DB.prepare('SELECT id, form_sent_at FROM registrations WHERE lower(email) = lower(?1)').bind(email).first();
  if (!row || row.form_sent_at) return;
  let error = null;
  try {
    const r = await fetch(env.MAILER_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ secret: env.MAILER_SECRET, email, first_name }), redirect: 'follow' });
    const j = await r.json().catch(() => ({ ok: false, error: `HTTP ${r.status}` }));
    if (!j.ok) error = j.error || 'send failed';
  } catch (ex) { error = String(ex.message || ex); }
  await env.DB.prepare(
    error ? 'UPDATE registrations SET form_error = ?2 WHERE id = ?1'
          : "UPDATE registrations SET form_sent_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'), form_error = NULL WHERE id = ?1"
  ).bind(row.id, ...(error ? [error.slice(0, 300)] : [])).run();
}

// ---------- Admin ----------
function authed(url, env) { return env.ADMIN_KEY && url.searchParams.get('key') === env.ADMIN_KEY; }

async function loadRows(env) {
  return (await env.DB.prepare('SELECT * FROM registrations ORDER BY created_at DESC').all()).results;
}

async function adminPage(url, env) {
  if (!authed(url, env)) return html('<p style="font-family:sans-serif;padding:40px">Not authorised.</p>', 401);
  const rows = await loadRows(env);
  const key = url.searchParams.get('key');
  const nz = (iso) => new Date(iso).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const heads = rows.reduce((t, r) => t + (r.people || 1), 0);
  const trs = rows.map((r) => `<tr><td>${esc(r.first_name)} ${esc(r.last_name)}</td><td><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></td><td><a href="tel:${esc(r.phone.replace(/\s/g, ''))}">${esc(r.phone)}</a></td><td>${r.people || ''}</td><td>${esc(r.message || '')}</td><td>${r.form_sent_at ? nz(r.form_sent_at) : r.form_error ? `<span class="bad" title="${esc(r.form_error)}">Failed</span>` : 'Not yet'}</td><td>${nz(r.updated_at || r.created_at)}</td></tr>`).join('');
  return html(`<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Registrations · 87 Kings Road</title>
<style>
  body{font-family:system-ui,"Segoe UI",Arial,sans-serif;background:#f5f3ee;color:#1f2a22;margin:0;padding:28px max(16px,env(safe-area-inset-left,0px)) 64px}
  h1{font-weight:600;margin:0 0 4px} .total{color:#5d665f;margin:0 0 24px}
  .scroll{overflow-x:auto;border:1px solid #dcd8cf;border-radius:8px;background:#fff}
  table{border-collapse:collapse;width:100%;min-width:760px;font-size:14px} th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #ecebe6;vertical-align:top} th{font-weight:600;color:#5d665f;font-size:12px;letter-spacing:.06em;text-transform:uppercase}
  td.empty{color:#8a8f98;font-style:italic} .bad{color:#b3261e;cursor:help} a{color:inherit} .csv{color:#2f5d3a}
</style></head><body>
<h1>Open home registrations</h1><p class="total">87 Kings Road · Saturday 7 November, 2:00–3:30pm<br>${rows.length} registration${rows.length === 1 ? '' : 's'} · about <b>${heads} people</b> · <a class="csv" href="/admin/export.csv?key=${encodeURIComponent(key)}">Download as CSV</a></p>
<div class="scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>People</th><th>Note</th><th>Form emailed</th><th>Registered</th></tr></thead><tbody>${trs || '<tr><td colspan="7" class="empty">No registrations yet</td></tr>'}</tbody></table></div>
</body></html>`);
}

async function adminCsv(url, env) {
  if (!authed(url, env)) return new Response('Not authorised', { status: 401 });
  const rows = await loadRows(env);
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['First name', 'Last name', 'Email', 'Phone', 'People', 'Note', 'Form emailed (UTC)', 'Registered (UTC)'].map(q).join(',')];
  for (const r of rows) lines.push([r.first_name, r.last_name, r.email, r.phone, r.people, r.message, r.form_sent_at || (r.form_error ? 'FAILED: ' + r.form_error : ''), r.updated_at || r.created_at].map(q).join(','));
  return new Response('﻿' + lines.join('\r\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="87-kings-road-registrations.csv"' } });
}
