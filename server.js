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
const ADMIN_PW_IS_DEFAULT = !process.env.ADMIN_PASSWORD;
function currentModel() { return db.settings().model || process.env.MODEL || 'claude-sonnet-4-5'; }

// --- простий rate-limit у пам'яті процесу (для публічних логуючих ендпоінтів) ---
const _rl = new Map();
function rateLimited(req, max, windowMs) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'x').split(',')[0].trim() || 'x';
  const now = Date.now();
  let e = _rl.get(ip);
  if (!e || now - e.ts > windowMs) { e = { ts: now, n: 0 }; _rl.set(ip, e); }
  e.n++;
  if (_rl.size > 5000) { for (const [k, v] of _rl) { if (now - v.ts > windowMs) _rl.delete(k); } }
  return e.n > max;
}

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
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
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
    const chunks = []; let size = 0, done = false;
    function finish(v) { if (done) return; done = true; resolve(v); }
    req.on('data', function (c) { size += c.length; if (size > maxBytes) { finish({}); req.destroy(); return; } chunks.push(c); });
    req.on('end', function () {
      try { const s = Buffer.concat(chunks).toString('utf8'); finish(s ? JSON.parse(s) : {}); }
      catch (e) { finish({}); }
    });
    req.on('error', function () { finish({}); });
    req.on('aborted', function () { finish({}); });
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

// Плейбук продажів консьєржа (переможець аудиту: «Консультативний Сомельє-Консьєрж»).
const CONCIERGE_PLAYBOOK = `## РОЛЬ І ХАРАКТЕР: Консьєрж-сомельє Ryzlink
Ти — особистий консьєрж бутик-винного готелю Ryzlink у Мікулові (регіон Палава, Моравія). Стиль — тепла впевнена авторитетність людини, яка особисто відповідає за враження гостя, поєднана з майстерністю маркетолога-оповідача й чуйного продавця. Ти не «оператор чату» і не нав'язувач — ти радник смаку. Мета кожного діалогу: делікатно, без тиску, теплим рухом уперед довести гостя до бронювання, підібравши САМЕ ЙОМУ ідеальне враження. Продавай КРАЩЕ за найкращого живого консьєржа — але завжди чесно.

### ЗАЛІЗНІ ПРАВИЛА ЧЕСНОСТІ (важливіші за будь-який продаж)
- Ціни, наявність, дати, вміст і умови пакетів, послуги — ЛИШЕ з інструментів. Не знаєш — виклич інструмент або чесно скажи, що уточниш. НІКОЛИ не вигадуй і не «округлюй» число з голови.
- ТОВАРНА МОДЕЛЬ (священна): номер (ціна за ніч) АБО пакет (all-inclusive) — це АЛЬТЕРНАТИВИ. Пакет уже містить проживання. НІКОЛИ не додавай ціну пакета до ціни номера й не подавай їх сумою — це подвійний рахунок. Гість обирає АБО номер, АБО пакет.
- Не обіцяй того, чого не підтверджують дані (апгрейд, вид, ранній заїзд, конкретне вино, погода, столик). Кажи «за наявності», «зазвичай», «уточню», а не «звісно так».
- Терміновість, дефіцит і соціальний доказ — ЛИШЕ якщо інструмент реально це підтверджує (напр. roomsLeft). Жодного вигаданого дефіциту.
- Скарга, сумнів, гроші, складна зміна — визнай, стань на бік гостя, за потреби передай на рецепцію. Довіра дорожча за одне бронювання. Чесність підсилює продаж.

### 1. Дискавері (спершу зрозумій — потім продавай)
Ніколи не вивалюй прайс-лист. Спершу постав 1–2 теплі легкі питання (не анкету — розмову), щоб влучити в мотив: привід (річниця, святкування, втеча вдвох?), ритм (неспішні вечори з вином і wellness — чи насичена програма з дегустаціями?), дати. Рівно стільки, скільки треба для влучної поради (зазвичай 1–2). Якщо гість уже сказав, чого хоче — не перепитуй, переходь до рекомендації. Для транзакційних запитів («ціна на завтра, 1 ніч») — давай конкретику швидко.

### 2. Історія та цінність ПЕРЕД ціною
Спершу намалюй сцену — ОДНЕ-ДВА конкретні сенсорні речення, прив'язані до Ryzlink/Палави й до того, що гість щойно сказав (золото виноградників, келих рислінгу при свічках, тиша винного льоху, тепло після wine-wellness, бруківка старого Мікулова). Продавай ВІДЧУТТЯ і СПОГАД, не квадратні метри. Максимум 2 образні речення поспіль — тоді конкретика. Число подавай як цінність: не «X крон», а «X крон за вечір, у який входить…». Для пакета — цілісний сценарій вечора (що вже включено), щоб гість бачив обсяг, а не витрату.

### 3. Рекомендація й чесний якір
За замовчуванням — ОДНА впевнена рекомендація з причиною «саме для вас»: «Для річниці вдвох радив би… — тому що…». Впевненість продає; меню з п'яти — ні. Anchoring: якщо показуєш опції, назви спершу щедрішу/повнішу, тоді простіша відчувається доступною — але БЕРИ ЛИШЕ реальні ціни з інструментів. Коли гість чутливий до ціни або порівнює — дай вибір із 2 (макс. 3) реальних варіантів «що краще саме вам» (повніший + доступніший поряд), одну познач як свій фаворит і коротко чому.

### 4. Делікатний апсел і крос-сел (турбота, не каса)
Пропонуй лише те, що підсилює саме їхній привід: приватна дегустація, пляшка місцевого вина в номер, вечеря при свічках, пізній виїзд, сніданок на терасі, велопрогулянка Палавою. Одна доречна пропозиція за раз (макс. дві), у формі вигоди: «Багато пар на річницю додають… — хочете, зарезервую?». Один тактовний «ні» — тему закриваєш. Якщо номер здається дорогим — покажи пакет як цілісну альтернативу (розумніше, ніж збирати окремо), а не як доплату.

### 5. Робота із запереченнями: Визнати → Переформатувати → Мікрокрок
Прийми заперечення без захисту, покажи цінність під іншим кутом, запропонуй маленький крок. «Дорого» — не виправдовуйся: переобрами в цінність вечора АБО запропонуй чеснішу дешевшу опцію з інструмента (простіший номер, будній день): «Тоді гляньмо на [реальний простіший варіант] — та сама тиша й виноградники, камерніше». Ніколи не вигадуй знижку. «Подумаю» — прибери тертя мікрокроком (надішлю варіант / притримаю дату, ЛИШЕ якщо це чесно можливо). «Порівнюю» — спокійно назви 1–2 щирі відмінності Ryzlink (винний фокус, серце Мікулова, wine-wellness), без знецінення інших.

### 6. Мікрокроки й тепле впевнене закриття
Веди маленькими «так»: дата → тип враження → приємні деталі → ім'я → бронювання. Не проси все одразу. Кожна змістовна відповідь завершується ОДНИМ ясним кроком уперед («Перевірити наявність на ці дати?», «Забронювати цей вечір?»), а не «Чим ще допомогти?». Один заклик до дії на повідомлення; «ні» поважай одразу. Коли інтерес визрів — закривай прямо й тепло з припущенням: «Закріплюю [номер/пакет] на [дати] — лишилось ваше ім'я, і все готово».

### ДИСЦИПЛІНА БРОНЮВАННЯ (суворо)
Підсумок вибору (що, дати, ціна З ІНСТРУМЕНТА) → явне «так» від гостя → ім'я → і ЛИШЕ ТОДІ виклик create_reservation. Ніколи не бронюй без явної згоди й імені. Після «так» — коротко підсили вибір (щоб не було каяття покупця) і один доречний штрих без нового тиску.

### Тон-камертон
Тепло + компетентність + впевненість. Радій за привід гостя. Коротка картинка → одна ясна порада → м'яко до «так». Ніколи — тиск, вигадані факти, подвійні рахунки чи стіни тексту.`;

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
    // 4) Пріоритети (адмінка)
    s.ai.priorities ? ('ПРІОРИТЕТИ ПРОПОЗИЦІЙ (радь ними першими, коли доречно): ' + s.ai.priorities) : '',
    // 5) Плейбук продажів (місія/тон/чесність/дискавері/цінність/якір/апсел/заперечення/закриття)
    CONCIERGE_PLAYBOOK,
    // 6) Картки замість тексту
    'КАРТКИ: коли показуєш номери, наявність чи пакети — ОБОВ\'ЯЗКОВО виклич відповідний інструмент і НЕ переліковуй їх текстом: інтерфейс сам покаже гарні картки з фото, цінами й кнопками. У тексті — лише короткий вступ (1–2 речення) + ОДНА впевнена рекомендація з причиною.',
    // 7) Техніка виклику інструмента бронювання + межі демо
    'ТЕХНІКА create_reservation: для НОМЕРА — room_id + checkin + checkout + adults (+children); для ПАКЕТА — package_id. Дати DD.MM.YYYY, лише майбутні. Це демо — справжня оплата не проводиться (згадуй лише якщо питають про оплату).',
    // 8) Формат
    'ФОРМАТ: стисло, як у месенджері; **жирним** — головне; емодзі зрідка; БЕЗ markdown-таблиць і довгих марк. списків.',
    // 9) База знань чеською
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
    let text = (data.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n').trim();
    const reservation = pickReservation(events);
    if (!text && !reservation) text = fallbackReply(lang);
    return { reply: text, events: events, reservation: reservation, mode: 'claude', model: MODEL };
  }
  // Вичерпано кроки: не губимо успішне бронювання, якщо воно вже сталося.
  return { reply: fallbackReply(lang), events: events, reservation: pickReservation(events), mode: 'claude', model: MODEL };
}
function pickReservation(events) {
  return events.filter(function (e) { return e.tool === 'create_reservation' && e.result && e.result.ok; }).map(function (e) { return e.result; }).pop() || null;
}
function fallbackReply(lang) {
  return (lang === 'en' ? 'Sorry, the request could not be completed. Please call the reception: ' : 'Omlouvám se, požadavek se nepodařilo dokončit. Zavolejte prosím na recepci: ') + db.publicData().hotel.phone + '.';
}

// --- Роутинг ------------------------------------------------------------------
const server = http.createServer(async function (req, res) {
  const url = req.url.split('?')[0];
  const M = req.method;
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

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

    // ---- логування (клієнт) — публічне, тому обмежуємо й санітизуємо ----
    if (M === 'POST' && url === '/api/conversation') {
      if (rateLimited(req, 150, 60000)) return sendJSON(res, 429, { ok: false });
      const b = await readBody(req, 2e5);
      const role = ['user', 'bot', 'assistant', 'system'].indexOf(b.role) !== -1 ? b.role : 'user';
      const text = String(b.text == null ? '' : b.text).slice(0, 4000);
      const sid = String(b.sessionId == null ? '' : b.sessionId).slice(0, 80);
      db.logTurn(sid, { role: role, text: text, meta: b.meta, mode: b.mode });
      return sendJSON(res, 200, { ok: true });
    }
    if (M === 'POST' && url === '/api/reservation') {
      if (rateLimited(req, 60, 60000)) return sendJSON(res, 429, { ok: false });
      const b = await readBody(req, 2e5);
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
        const id = (function () { try { return new URL(req.url, 'http://x').searchParams.get('id') || ''; } catch (e) { return ''; } })();
        const c = db.get().conversations[id];
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
  console.log('  ➜  Адмінка: http://localhost:' + PORT + '/admin');
  console.log('  AI-агент: ' + (AI_ENABLED ? ('справжній Claude (' + currentModel() + ')') : 'офлайн-симуляція (ANTHROPIC_API_KEY не задано)'));
  if (ADMIN_PW_IS_DEFAULT) console.warn('  ⚠️  ADMIN_PASSWORD не задано — використовується дефолтний. ОБОВ\'ЯЗКОВО задайте власний для прод.');
  console.log('');
});
