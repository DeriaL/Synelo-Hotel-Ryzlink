/*
 * Ryzlink — файлова JSON-база (zero-dependency).
 * Джерело правди для публічного сайту + логи переписок і бронювань.
 * Файл: data/db.json (сідиться з public/js/data.js при першому запуску).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Тека даних. На Railway/хмарі задаємо DATA_DIR (або том монтується у
// RAILWAY_VOLUME_MOUNT_PATH) → db.json лягає на ПОСТІЙНИЙ диск і переживає редеплой.
// Локально — просто ./data поряд з проєктом.
const DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const SEED = require('./public/js/data.js');

let db = null;

function defaultSettings() {
  return {
    _secret: crypto.randomBytes(24).toString('hex'),
    model: process.env.MODEL || 'claude-sonnet-4-5',
    ai: {
      persona: [
        'Ти — AI-консьєрж бутик-готелю Hotel Ryzlink у місті Мікулов (Південна Моравія, Чехія), у серці виноробного краю Палава.',
        'Стиль: теплий, гостинний, лаконічний, з легкою «винною» ноткою. (Мовою відповіді керує окрема директива — за замовчуванням ЧЕСЬКА, бо це чеський готель.)',
        'Мета — допомогти обрати номер чи пакет і забронювати проживання прямо в чаті.',
        'ЗАВЖДИ використовуй інструменти для цін, наявності та фактів — ніколи не вигадуй числа й деталі.',
        'Флоу: 1) уточни дати й гостей; 2) search_availability; 3) допоможи обрати; 4) перед create_reservation підтверди номер/дати/імʼя; 5) назви номер підтвердження.',
        'Пиши коротко (2–5 речень), як у месенджері. Пропонуй наступний крок.'
      ].join('\n'),
      priorities: 'Пріоритетно радь: пакет «Винний вікенд» та номер «Diamond Royal». Парам — романтичний пакет. Родинам — «Апартаменти Exclusive».'
    },
    chat: {
      greeting: 'Vítejte v **Hotel Ryzlink**! 🍷 Jsem váš AI-concierge. Pomohu vám vybrat pokoj, povím vám o wine-wellness, degustacích či restauraci — a rezervaci zajistím přímo zde, v chatu.\n\nČím mohu začít?',
      quickReplies: ['Vybrat pokoj', 'Rezervovat na víkend', 'Co je Wine Wellness?', 'Chci degustaci vína']
    }
  };
}

function seed() {
  const withOrder = function (arr) { return (arr || []).map(function (x, i) { return Object.assign({ order: i, active: true }, x); }); };
  return {
    hotel: SEED.hotel,
    hero: SEED.hero,
    banners: SEED.banners,
    faq: SEED.faq,
    knowledge: (SEED.knowledge || []).map(function (x, i) { return Object.assign({ order: i }, x); }),
    rooms: withOrder(SEED.rooms),
    packages: withOrder(SEED.packages),
    gallery: (SEED.gallery || []).map(function (g, i) { return Object.assign({ order: i }, g); }),
    settings: defaultSettings(),
    conversations: {},
    reservations: []
  };
}

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      // м'яка міграція — гарантуємо наявність ключів
      const d = seed();
      for (const k in d) if (!(k in db)) db[k] = d[k];
      if (!db.settings) db.settings = d.settings;
      if (!db.settings._secret) db.settings._secret = crypto.randomBytes(24).toString('hex');
      if (!db.settings.ai) db.settings.ai = d.settings.ai;
      if (!db.settings.chat) db.settings.chat = d.settings.chat;
      return db;
    }
  } catch (e) { console.error('[db] load failed, reseeding:', e.message); }
  db = seed();
  save();
  return db;
}

function saveNow() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = DB_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(tmp, DB_PATH);
  } catch (e) { console.error('[db] save failed:', e.message); }
}
// Синхронне збереження — для контенту адмінки та бронювань (важлива durability).
function save() { saveNow(); }
// Дебаунс — для частих логів переписки, щоб потік запитів не блокував event-loop щоразу.
let _saveTimer = null, _savePending = false;
function saveSoon() {
  if (_saveTimer) { _savePending = true; return; }
  _saveTimer = setTimeout(function () {
    _saveTimer = null; saveNow();
    if (_savePending) { _savePending = false; saveSoon(); }
  }, 500);
}

function get() { return db; }

// Публічний зріз для сайту: активні, відсортовані за пріоритетом (order).
function publicData() {
  const byOrder = function (a, b) { return (a.order || 0) - (b.order || 0); };
  return {
    hotel: db.hotel,
    hero: db.hero,
    banners: db.banners,
    faq: db.faq,
    knowledge: (db.knowledge || []).slice().sort(byOrder),
    rooms: db.rooms.filter(function (r) { return r.active !== false; }).slice().sort(byOrder),
    packages: db.packages.filter(function (p) { return p.active !== false; }).slice().sort(byOrder),
    gallery: db.gallery.slice().sort(byOrder),
    chat: db.settings.chat
  };
}

// Зберегти відредагований контент з адмінки (частковий об'єкт).
function saveContent(patch) {
  const allowed = ['hotel', 'hero', 'banners', 'faq', 'knowledge', 'rooms', 'packages', 'gallery'];
  allowed.forEach(function (k) { if (patch[k] !== undefined) db[k] = patch[k]; });
  if (patch.settings) {
    // не даємо переписати _secret ззовні
    const s = patch.settings;
    if (s.model) db.settings.model = s.model;
    if (s.ai) db.settings.ai = { persona: s.ai.persona || '', priorities: s.ai.priorities || '' };
    if (s.chat) db.settings.chat = { greeting: s.chat.greeting || '', quickReplies: s.chat.quickReplies || [] };
  }
  save();
  return publicData();
}

// --- Логи переписок ---
function logTurn(sessionId, turn) {
  if (!sessionId) sessionId = 'anon';
  const now = Date.now();
  if (!db.conversations[sessionId]) {
    // Ліміт кількості конверсацій — евіктимо найстаріші (захист від флуду/розростання файлу).
    const keys = Object.keys(db.conversations);
    if (keys.length >= 800) {
      keys.map(function (k) { return { k: k, t: db.conversations[k].lastAt || 0 }; })
        .sort(function (a, b) { return a.t - b.t; })
        .slice(0, keys.length - 799)
        .forEach(function (o) { delete db.conversations[o.k]; });
    }
    db.conversations[sessionId] = { id: sessionId, startedAt: now, lastAt: now, mode: turn.mode || 'sim', turns: [], reservations: [] };
  }
  const c = db.conversations[sessionId];
  c.lastAt = now;
  if (turn.mode) c.mode = turn.mode;
  c.turns.push({ role: turn.role, text: turn.text || '', meta: turn.meta || null, at: now });
  // тримаємо розумний ліміт
  if (c.turns.length > 400) c.turns = c.turns.slice(-400);
  saveSoon();
  return c;
}

// --- Логи бронювань (дедуп за confirmation) ---
function logReservation(r) {
  if (!r || !r.confirmation) return null;
  const exists = db.reservations.some(function (x) { return x.confirmation === r.confirmation; });
  if (!exists) {
    r.at = Date.now();
    db.reservations.unshift(r);
    if (db.reservations.length > 2000) db.reservations = db.reservations.slice(0, 2000);
    if (r.sessionId && db.conversations[r.sessionId]) {
      db.conversations[r.sessionId].reservations.push(r.confirmation);
    }
    save();
  }
  return r;
}

function conversationsList() {
  return Object.keys(db.conversations).map(function (k) {
    const c = db.conversations[k];
    const lastUser = c.turns.filter(function (t) { return t.role === 'user'; }).slice(-1)[0];
    return {
      id: c.id, startedAt: c.startedAt, lastAt: c.lastAt, mode: c.mode,
      turnCount: c.turns.length,
      reservations: c.reservations || [],
      preview: lastUser ? lastUser.text.slice(0, 80) : (c.turns[0] ? c.turns[0].text.slice(0, 80) : '')
    };
  }).sort(function (a, b) { return b.lastAt - a.lastAt; });
}

function overview() {
  return {
    rooms: db.rooms.length,
    activeRooms: db.rooms.filter(function (r) { return r.active !== false; }).length,
    packages: db.packages.length,
    galleryCats: db.gallery.length,
    galleryPhotos: db.gallery.reduce(function (n, g) { return n + (g.images ? g.images.length : 0); }, 0),
    knowledge: (db.knowledge || []).length,
    conversations: Object.keys(db.conversations).length,
    reservations: db.reservations.length,
    recentReservations: db.reservations.slice(0, 6),
    recentConversations: conversationsList().slice(0, 6)
  };
}

module.exports = {
  load: load, save: save, get: get, publicData: publicData,
  saveContent: saveContent, logTurn: logTurn, logReservation: logReservation,
  conversationsList: conversationsList, overview: overview,
  secret: function () { return db.settings._secret; },
  settings: function () { return db.settings; }
};
