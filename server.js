/*
 * Ryzlink — концепт: zero-dependency Node сервер + БД + адмінка.
 * Запуск:  node server.js   (Node 18+, глобальний fetch)
 *
 *   Публічний сайт:  http://localhost:3000
 *   Адмінка:         http://localhost:3000/admin   (пароль з ADMIN_PASSWORD, за замовч. ryzlink-admin)
 *
 * Дані живуть у data/db.json (керуються з адмінки). Переписки та бронювання логуються туди ж.
 * AI: є ANTHROPIC_API_KEY → справжній Claude (tool-use); немає → браузерна симуляція.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const booking = require('./public/js/booking.js');
const db = require('./db.js');

// --- .env ---------------------------------------------------------------------
(function loadEnv() {
  try {
    const p = path.join(__dirname, '.env');
    if (!fs.existsSync(p)) return;
    fs.readFileSync(p, 'utf8').split(/\r?\n/).forEach(function (line) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) {
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    });
  } catch (e) { /* ignore */ }
})();

db.load();
function refreshBooking() { booking.setData(db.publicData()); }
refreshBooking();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const AI_ENABLED = !!API_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ryzlink-admin';
function currentModel() { return db.settings().model || process.env.MODEL || 'claude-sonnet-5'; }

// --- статика ------------------------------------------------------------------
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon'
};
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, function (err, buf) {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 Not Found'); }
    var ext = path.extname(filePath).toLowerCase();
    var headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    // код (html/js/css) не кешуємо — щоб зміни застосовувались одразу; зображення кешуємо
    headers['Cache-Control'] = (['.html', '.js', '.css', '.json'].indexOf(ext) !== -1) ? 'no-store, must-revalidate' : 'public, max-age=86400';
    res.writeHead(200, headers);
    res.end(buf);
  });
}
function sendJSON(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); }
function sendFile(res, rel, type) {
  fs.readFile(path.join(PUBLIC_DIR, rel), function (err, buf) {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': type }); res.end(buf);
  });
}
function readBody(req, maxBytes) {
  maxBytes = maxBytes || 1e6;
  return new Promise(function (resolve) {
    const chunks = []; let size = 0;
    req.on('data', function (c) { size += c.length; if (size > maxBytes) { req.destroy(); return; } chunks.push(c); });
    req.on('end', function () {
      try { const s = Buffer.concat(chunks).toString('utf8'); resolve(s ? JSON.parse(s) : {}); }
      catch (e) { resolve({}); }
    });
  });
}

// --- Авторизація адмінки (HMAC-токен) -----------------------------------------
function signToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
  const mac = crypto.createHmac('sha256', db.secret()).update(payload).digest('base64url');
  return payload + '.' + mac;
}
function verifyToken(token) {
  if (!token || token.indexOf('.') < 0) return false;
  const parts = token.split('.');
  const expected = crypto.createHmac('sha256', db.secret()).update(parts[0]).digest('base64url');
  try {
    const a = Buffer.from(parts[1]); const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    const p = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    return !(p.exp && Date.now() > p.exp);
  } catch (e) { return false; }
}
function authed(req) {
  const h = req.headers['authorization'] || '';
  return verifyToken(h.replace(/^Bearer\s+/i, ''));
}

// --- Booking-інструменти ------------------------------------------------------
function runTool(name, args) {
  args = args || {};
  switch (name) {
    case 'search_availability': return booking.searchAvailability(args);
    case 'get_room_details':
      if (args.room_id) { const r = booking.getRoom(args.room_id); return r ? { ok: true, room: r } : { ok: false, error: 'Такого номера немає.' }; }
      return { ok: true, rooms: booking.listRooms() };
    case 'list_packages': return { ok: true, packages: booking.listPackages() };
    case 'search_knowledge':
      return { ok: true, results: booking.searchKnowledge(args.query || '', 4).map(function (e) { return { title: e.title, content: e.content }; }) };
    case 'get_hotel_info': return booking.getInfo(args.topic || '');
    case 'create_reservation':
      return booking.createReservation({
        name: args.name, email: args.email, phone: args.phone,
        roomId: args.room_id, packageId: args.package_id,
        checkin: args.checkin, checkout: args.checkout, adults: args.adults, children: args.children
      });
    default: return { ok: false, error: 'unknown tool' };
  }
}
function buildTools() {
  const pub = db.publicData();
  const roomIds = pub.rooms.map(function (r) { return r.id; });
  const pkgIds = pub.packages.map(function (p) { return p.id; });
  return [
    { name: 'search_availability', description: 'Перевірити доступність номерів на дати. Завжди для цін/наявності — не вигадуй.', input_schema: { type: 'object', properties: { checkin: { type: 'string' }, checkout: { type: 'string' }, adults: { type: 'integer' }, children: { type: 'integer' } }, required: ['checkin', 'checkout', 'adults'] } },
    { name: 'get_room_details', description: 'Опис номера (або всіх).', input_schema: { type: 'object', properties: { room_id: { type: 'string', enum: roomIds } } } },
    { name: 'list_packages', description: 'Список пакетів/пропозицій з цінами.', input_schema: { type: 'object', properties: {} } },
    { name: 'search_knowledge', description: 'Пошук у базі знань готелю (спарсено з сайту): години, ціни, правила, wellness, ресторан, дегустації, події, зручності номерів, локація тощо. Використовуй для БУДЬ-ЯКОГО фактичного питання про готель.', input_schema: { type: 'object', properties: { query: { type: 'string', description: 'Питання або ключові слова гостя' } }, required: ['query'] } },
    { name: 'create_reservation', description: 'Створити (демо) бронювання після підтвердження номера/пакета, дат та імені.', input_schema: { type: 'object', properties: { name: { type: 'string' }, room_id: { type: 'string', enum: roomIds }, package_id: { type: 'string', enum: pkgIds }, checkin: { type: 'string' }, checkout: { type: 'string' }, adults: { type: 'integer' }, children: { type: 'integer' }, email: { type: 'string' }, phone: { type: 'string' } }, required: ['name'] } }
  ];
}
function buildSystemPrompt(lang) {
  const s = db.settings(); const hotel = db.publicData().hotel;
  const L = (lang === 'en') ? 'en' : 'cs';
  const LANG_NAME = (L === 'en') ? 'ENGLISH' : 'CZECH (ČEŠTINA)';
  const langLine = 'RESPONSE LANGUAGE = ' + LANG_NAME + '. Write your ENTIRE answer in ' + LANG_NAME +
    ' — every sentence of the reply AND the SUGGESTIONS line. This is an absolute rule: IGNORE the language the guest uses. Even if the guest writes in Ukrainian, Russian, Polish or any other language, you STILL answer only in ' + LANG_NAME + '. Never mix languages.';
  return [
    langLine,
    s.ai.persona,
    s.ai.priorities ? ('ПРІОРИТЕТИ ПРОПОЗИЦІЙ (враховуй першими): ' + s.ai.priorities) : '',
    'Для БУДЬ-ЯКОГО питання про готель, послуги, ціни, години, правила чи околиці — спершу виклич search_knowledge і відповідай на основі знайденого. Якщо у базі знань нічого немає — чесно скажи, що уточниш деталь на рецепції (' + hotel.phone + '), не вигадуй.',
    'База знань — ЧЕСЬКОЮ мовою. У параметр query інструмента search_knowledge ЗАВЖДИ передавай ЧЕСЬКІ ключові слова (переклади суть питання чеською), інакше нічого не знайдеш.',
    'ФОРМАТ ВІДПОВІДЕЙ: пиши стисло, як у месенджері; звичайний текст, максимум **жирний**. НЕ використовуй markdown-таблиці та довгі переліки — вони погано виглядають у чаті.',
    'Коли показуєш номери, доступність чи пакети — обовʼязково виклич відповідний інструмент (get_room_details / search_availability / list_packages) і НЕ переліковуй їх у тексті: інтерфейс сам покаже гарні картки з фото та кнопками. Дай лише короткий вступ (1 речення) і запитай наступний крок.',
    'НАПРИКІНЦІ КОЖНОЇ відповіді додай окремим ОСТАННІМ рядком: SUGGESTIONS: варіант1 | варіант2 | варіант3 — це 2–4 дуже короткі ймовірні відповіді гостя ВІД ПЕРШОЇ ОСОБИ, доречні саме до цього контексту. Не додавай нічого після цього рядка.',
    'Це демонстраційний концепт — реальна оплата не проводиться (згадуй лише якщо питають про оплату).',
    'Готель ' + (hotel.stars || 4) + '*. Валюта — ' + (hotel.currency || 'CZK') + '. Рецепція: ' + hotel.phone + ', ' + hotel.email + '.',
    '⚠️ REMINDER — the whole reply, including SUGGESTIONS, MUST be written in ' + LANG_NAME + ' only.'
  ].filter(Boolean).join('\n');
}

async function callClaude(messages, lang) {
  const events = []; let convo = messages.slice(); const MODEL = currentModel();
  for (let step = 0; step < 6; step++) {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1024, system: buildSystemPrompt(lang), tools: buildTools(), messages: convo })
    });
    if (!resp.ok) { const txt = await resp.text(); throw new Error('Anthropic API ' + resp.status + ': ' + txt.slice(0, 300)); }
    const data = await resp.json();
    if (data.stop_reason === 'tool_use') {
      const toolResults = [];
      for (const block of data.content) {
        if (block.type === 'tool_use') {
          const result = runTool(block.name, block.input);
          events.push({ tool: block.name, input: block.input, result: result });
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) });
        }
      }
      convo.push({ role: 'assistant', content: data.content });
      convo.push({ role: 'user', content: toolResults });
      continue;
    }
    const text = (data.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n').trim();
    const reservation = events.filter(function (e) { return e.tool === 'create_reservation' && e.result && e.result.ok; }).map(function (e) { return e.result; }).pop() || null;
    return { reply: text, events: events, reservation: reservation, mode: 'claude', model: MODEL };
  }
  return { reply: (lang === 'en' ? 'Sorry, the request could not be completed. Please call the reception: ' : 'Omlouvám se, požadavek se nepodařilo dokončit. Zavolejte prosím na recepci: ') + db.publicData().hotel.phone + '.', events: events, mode: 'claude', model: MODEL };
}

// --- Роутинг ------------------------------------------------------------------
const server = http.createServer(async function (req, res) {
  const url = req.url.split('?')[0];
  const M = req.method;

  try {
    // ---- динамічні дані сайту з БД ----
    if (M === 'GET' && url === '/js/data.js') {
      res.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-store' });
      return res.end('window.RYZLINK_DATA = ' + JSON.stringify(db.publicData()) + ';');
    }
    if (M === 'GET' && url === '/api/data') return sendJSON(res, 200, db.publicData());
    if (M === 'GET' && url === '/api/status') return sendJSON(res, 200, { ai: AI_ENABLED, model: AI_ENABLED ? currentModel() : null });

    // ---- бронювання ----
    if (M === 'POST' && url === '/api/booking/search') return sendJSON(res, 200, booking.searchAvailability(await readBody(req)));
    if (M === 'POST' && url === '/api/booking/reserve') return sendJSON(res, 200, booking.createReservation(await readBody(req)));

    // ---- чат ----
    if (M === 'POST' && url === '/api/chat') {
      const body = await readBody(req, 4e6);
      if (!AI_ENABLED) return sendJSON(res, 200, { mode: 'sim' });
      try { return sendJSON(res, 200, await callClaude(body.messages || [], body.lang)); }
      catch (e) { console.error('[chat] ' + e.message); return sendJSON(res, 200, { mode: 'error', error: e.message, fallback: 'sim' }); }
    }

    // ---- логування (клієнт) ----
    if (M === 'POST' && url === '/api/conversation') {
      const b = await readBody(req);
      db.logTurn(b.sessionId, { role: b.role, text: b.text, meta: b.meta, mode: b.mode });
      return sendJSON(res, 200, { ok: true });
    }
    if (M === 'POST' && url === '/api/reservation') {
      const b = await readBody(req);
      db.logReservation(b);
      return sendJSON(res, 200, { ok: true });
    }

    // ---- адмінка: сторінка ----
    if (M === 'GET' && (url === '/admin' || url === '/admin/')) return sendFile(res, 'admin/index.html', MIME['.html']);

    // ---- адмін-API ----
    if (url.startsWith('/admin/api/')) {
      if (M === 'POST' && url === '/admin/api/login') {
        const b = await readBody(req);
        if (b.password === ADMIN_PASSWORD) return sendJSON(res, 200, { ok: true, token: signToken() });
        return sendJSON(res, 401, { ok: false, error: 'Невірний пароль' });
      }
      if (!authed(req)) return sendJSON(res, 401, { ok: false, error: 'unauthorized' });

      if (M === 'GET' && url === '/admin/api/overview') return sendJSON(res, 200, db.overview());
      if (M === 'GET' && url === '/admin/api/content') {
        const d = db.get();
        return sendJSON(res, 200, {
          hotel: d.hotel, hero: d.hero, banners: d.banners, faq: d.faq, knowledge: d.knowledge || [],
          rooms: d.rooms, packages: d.packages, gallery: d.gallery,
          settings: { model: d.settings.model, ai: d.settings.ai, chat: d.settings.chat }
        });
      }
      if (M === 'PUT' && url === '/admin/api/content') {
        const b = await readBody(req, 8e6);
        db.saveContent(b); refreshBooking();
        return sendJSON(res, 200, { ok: true });
      }
      if (M === 'GET' && url === '/admin/api/conversations') return sendJSON(res, 200, { list: db.conversationsList() });
      if (M === 'GET' && url === '/admin/api/conversation') {
        const id = (req.url.split('?')[1] || '').replace(/^.*\bid=/, '');
        const c = db.get().conversations[decodeURIComponent(id)];
        return sendJSON(res, 200, c || { error: 'not found' });
      }
      if (M === 'GET' && url === '/admin/api/reservations') return sendJSON(res, 200, { list: db.get().reservations });
      if (M === 'POST' && url === '/admin/api/upload') {
        const b = await readBody(req, 12e6);
        const m = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(b.dataUrl || '');
        if (!m) return sendJSON(res, 400, { ok: false, error: 'bad image' });
        const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
        const safe = (b.filename || 'upload').toLowerCase().replace(/[^a-z0-9-_]/g, '').slice(0, 40) || 'img';
        const fname = 'up-' + safe + '-' + Date.now().toString(36) + '.' + ext;
        try {
          fs.mkdirSync(path.join(PUBLIC_DIR, 'assets', 'gallery'), { recursive: true });
          fs.writeFileSync(path.join(PUBLIC_DIR, 'assets', 'gallery', fname), Buffer.from(m[2], 'base64'));
          return sendJSON(res, 200, { ok: true, path: 'assets/gallery/' + fname });
        } catch (e) { return sendJSON(res, 500, { ok: false, error: e.message }); }
      }
      return sendJSON(res, 404, { ok: false, error: 'not found' });
    }

    // ---- статичні файли адмінки та сайту ----
    if (M === 'GET') return serveStatic(req, res);
    res.writeHead(405); res.end('Method Not Allowed');
  } catch (e) {
    console.error('[server]', e.message);
    if (!res.headersSent) sendJSON(res, 500, { error: 'server error' });
  }
});

server.listen(PORT, function () {
  console.log('');
  console.log('  🍷  Hotel Ryzlink — концепт запущено');
  console.log('  ➜  Сайт:    http://localhost:' + PORT);
  console.log('  ➜  Адмінка: http://localhost:' + PORT + '/admin   (пароль: ' + ADMIN_PASSWORD + ')');
  console.log('  AI-агент: ' + (AI_ENABLED ? ('справжній Claude (' + currentModel() + ')') : 'офлайн-симуляція (ANTHROPIC_API_KEY не задано)'));
  console.log('');
});
