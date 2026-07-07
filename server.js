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
    { name: 'search_availability', description: 'Перевір реальну наявність і ПОВНУ ціну на конкретні дати та кількість гостей. ЗАВЖДИ виклич перед тим, як назвати ціну чи підтвердити наявність. Повертає по кожному номеру: наявність, ціну/ніч, суму разом, скільки номерів лишилось (дефіцит) і примітки. Дати у форматі DD.MM.YYYY, лише майбутні.', input_schema: { type: 'object', properties: { checkin: { type: 'string', description: 'Дата заїзду DD.MM.YYYY' }, checkout: { type: 'string', description: 'Дата виїзду DD.MM.YYYY' }, adults: { type: 'integer' }, children: { type: 'integer' } }, required: ['checkin', 'checkout', 'adults'] } },
    { name: 'get_room_details', description: 'Повні деталі одного номера (або всіх, якщо room_id не вказано): місткість, площа, ціна, зручності, фото. Виклич, коли гість питає про конкретний номер, хоче порівняти чи обрати.', input_schema: { type: 'object', properties: { room_id: { type: 'string', enum: roomIds } } } },
    { name: 'list_packages', description: 'Усі пакети/спецпропозиції з цінами й що входить (романтика, wine-wellness, дегустації, вікенд). Виклич, коли гість хоче пропозиції, знижки, враження, романтику чи привід забронювати.', input_schema: { type: 'object', properties: {} } },
    { name: 'search_knowledge', description: 'Пошук у базі знань готелю (спарсено з сайту): години, ціни, правила, wellness, ресторан, дегустації, події, зручності, домашні тварини, паркінг, сніданок, локація/як дістатися, що подивитися поруч тощо. Використовуй для БУДЬ-ЯКОГО фактичного питання про готель. query — ЧЕСЬКОЮ.', input_schema: { type: 'object', properties: { query: { type: 'string', description: 'Ключові слова ЧЕСЬКОЮ (переклади суть питання гостя)' } }, required: ['query'] } },
    { name: 'create_reservation', description: 'Створити (демо) бронювання. Виклич ЛИШЕ після стислого підсумку + ЯВНОГО підтвердження гостя + наявного імені. Номер: room_id+checkin+checkout+adults(+children,email). Пакет: package_id(+name). Реальна оплата не проводиться.', input_schema: { type: 'object', properties: { name: { type: 'string' }, room_id: { type: 'string', enum: roomIds }, package_id: { type: 'string', enum: pkgIds }, checkin: { type: 'string' }, checkout: { type: 'string' }, adults: { type: 'integer' }, children: { type: 'integer' }, email: { type: 'string' }, phone: { type: 'string' } }, required: ['name'] } }
  ];
}
function buildSystemPrompt(lang) {
  const s = db.settings(); const hotel = db.publicData().hotel;
  const NAMES = { cs: 'češtině (Czech)', en: 'English', uk: 'ukrajinštině (Ukrainian)', ru: 'ruštině (Russian)', de: 'němčině (German)', pl: 'polštině (Polish)' };
  const hint = NAMES[lang] ? (' Підказка інтерфейсу: ймовірна мова останнього повідомлення — ' + NAMES[lang] + '.') : '';
  const _now = new Date(), _pad = function (n) { return ('0' + n).slice(-2); };
  const _fmt = function (d) { return _pad(d.getDate()) + '.' + _pad(d.getMonth() + 1) + '.' + d.getFullYear(); };
  let _toSat = (6 - _now.getDay() + 7) % 7; if (_toSat === 0) _toSat = 7;
  const _sat = new Date(_now.getTime() + _toSat * 86400000), _sun = new Date(_sat.getTime() + 86400000);
  const cur = hotel.currency || 'CZK';
  return [
    // 1) Мова
    'МОВА ВІДПОВІДІ (важливо): відповідай ТІЄЮ САМОЮ мовою, якою гість написав своє ОСТАННЄ повідомлення. Гість може перемикати мови між повідомленнями — завжди дзеркаль мову останнього повідомлення (і основний текст, і рядок SUGGESTIONS).' + hint,
    // 2) Дата
    'ДАТА: сьогодні ' + _fmt(_now) + '. Це справжня поточна дата. Пропонуй і використовуй ЛИШЕ майбутні дати (сьогодні або пізніше) — НІКОЛИ не пропонуй минулі дати чи минулі місяці. Формат дат — DD.MM.YYYY. «Найближчі вихідні» = ' + _fmt(_sat) + '–' + _fmt(_sun) + '. У SUGGESTIONS і пропозиціях дат став РЕАЛЬНІ майбутні дати цього формату.',
    // 3) Ідентичність (редагується в адмінці)
    s.ai.persona,
    // 4) Місія
    'ТВОЯ МІСІЯ: ти — ПЕРШОКЛАСНИЙ AI-консьєрж бутик-готелю. Мета — щиро допомогти гостю обрати ідеальний варіант і делікатно, впевнено довести його до бронювання. Ти уважний, теплий і компетентний; створюєш бажання приїхати, але без тиску й нав\'язливості. Веди діалог проактивно: не зупиняйся на «ось інформація» — завжди пропонуй наступний крок.',
    // 5) Пріоритети (адмінка)
    s.ai.priorities ? ('ПРІОРИТЕТИ ПРОПОЗИЦІЙ (радь ними першими, коли доречно): ' + s.ai.priorities) : '',
    // 6) Тон і стиль
    'ТОН І СТИЛЬ: тепло, вишукано, по-людськи — як консьєрж дорогого винного готелю. Стисло, як у месенджері (зазвичай 2–5 речень). Ключове — **жирним**. Емодзі зрідка й доречно (🍷). НЕ використовуй markdown-таблиці та довгі марковані списки.',
    // 7) Тільки факти з інструментів
    'ФАКТИ ЛИШЕ З ІНСТРУМЕНТІВ (антигалюцинація): будь-які ціни, наявність, години, правила, зручності — ТІЛЬКИ через інструменти (search_availability / get_room_details / list_packages / search_knowledge). НІКОЛИ не вигадуй числа, дати чи факти. Якщо потрібної інформації в базі немає — чесно скажи, що уточниш на рецепції (' + hotel.phone + ', ' + hotel.email + '), і запропонуй допомогти з іншим.',
    // 8) Картки замість тексту
    'КАРТКИ: коли показуєш номери, наявність чи пакети — ОБОВ\'ЯЗКОВО виклич відповідний інструмент і НЕ переліковуй їх текстом: інтерфейс сам покаже гарні картки з фото, цінами й кнопками. У тексті — лише короткий вступ (1–2 речення) + ОДНА впевнена рекомендація з причиною.',
    // 9) Флоу підбору/бронювання
    'ФЛОУ: 1) з\'ясуй потребу гостя; 2) для наявності/бронювання потрібні ДАТИ (заїзд+виїзд) і КІЛЬКІСТЬ гостей — якщо чогось бракує, спитай ОДНИМ коротким питанням (запропонуй зручний варіант, напр. «найближчі вихідні, для двох»); 3) виклич search_availability; 4) впевнено порекомендуй КОНКРЕТНИЙ номер під потребу + поясни ЧОМУ (вид, тераса, wine-wellness, місткість); 5) доречний апсел; 6) підтвердження бронювання (нижче).',
    // 10) Продаж і робота із запереченнями
    'ПРОДАЖ І ЦІННІСТЬ: завжди давай КОНКРЕТНУ рекомендацію (не «ось усі варіанти»). Підкреслюй цінність (виноградники Палави, wine-wellness, сніданок у ціні, тераса, атмосфера). За доречності м\'яко запропонуй пакет або винний досвід (дегустація/wellness) як приємне доповнення. Заперечення щодо ціни — покажи цінність або запропонуй дешевший номер/пакет. Немає місця на дати — ОДРАЗУ запропонуй альтернативні дати чи інший номер, не залишай гостя в глухому куті.',
    // 11) Підтвердження бронювання
    'БРОНЮВАННЯ (важливо): create_reservation виклич ЛИШЕ після того, як (а) показав гостю стислий ПІДСУМОК (номер/пакет, дати, гості, ночей, разом ' + cur + ') і гість ЯВНО підтвердив, ТА (б) маєш його ІМʼЯ (email — за бажанням). Спершу коротко попроси підтвердити й назвати імʼя. Для номера передавай room_id+checkin+checkout+adults (+children); для пакета — package_id. Після успіху — тепло привітай, назви КОД підтвердження й наступний крок; за доречності запропонуй додати дегустацію чи wellness.',
    // 12) Межі
    'МЕЖІ: тримайся теми готелю; на сторонні теми чемно повертай до бронювання/послуг. Будь чесним, ніколи не обіцяй того, чого немає в даних. Це демо — справжня оплата не проводиться (згадуй лише якщо питають про оплату).',
    // 13) База знань чеською
    'БАЗА ЗНАНЬ — ЧЕСЬКОЮ: у query для search_knowledge завжди передавай ЧЕСЬКІ ключові слова (переклади суть питання), інакше нічого не знайдеш. Відповідь гостю — його мовою.',
    // 14) SUGGESTIONS
    'НАПРИКІНЦІ КОЖНОЇ відповіді — окремим ОСТАННІМ рядком: SUGGESTIONS: варіант1 | варіант2 | варіант3 — 2–4 дуже короткі ймовірні відповіді гостя ВІД ПЕРШОЇ ОСОБИ, доречні саме до цього контексту й такі, що ведуть до бронювання (напр. «Забронювати Diamond Royal | Що входить у Wine Wellness? | Покажіть романтичний пакет»), ТІЄЮ Ж мовою, що й відповідь. Нічого не пиши після цього рядка.',
    // 15) Факти-підпис
    'Готель ' + (hotel.stars || 4) + '*. Валюта — ' + cur + '. Рецепція: ' + hotel.phone + ', ' + hotel.email + '.'
  ].filter(Boolean).join('\n');
}

async function callClaude(messages, lang) {
  const events = []; let convo = messages.slice(); const MODEL = currentModel();
  const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  for (let step = 0; step < 8; step++) {
    // Виклик з ретраєм на тимчасові помилки (429/5xx/мережа) — надійність.
    let resp = null, lastErr = null;
    const body = JSON.stringify({ model: MODEL, max_tokens: 1500, temperature: 0.6, system: buildSystemPrompt(lang), tools: buildTools(), messages: convo });
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
          body: body
        });
      } catch (e) { lastErr = e; resp = null; }
      if (resp && resp.ok) break;
      const status = resp ? resp.status : 0;
      if (attempt < 2 && (status === 0 || status === 429 || status >= 500)) { await sleep(700 * (attempt + 1)); continue; }
      if (!resp) throw lastErr || new Error('Anthropic API: network error');
      const txt = await resp.text(); throw new Error('Anthropic API ' + status + ': ' + txt.slice(0, 300));
    }
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
