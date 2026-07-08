/*
 * Ryzlink — мок системи бронювання (за зразком сутностей D-EDGE).
 * UMD: у браузері доступний як window.RYZLINK_BOOKING, у Node — module.exports.
 * Ці ж функції викликає AI-агент (tool-use) на сервері та офлайн-симуляція в браузері.
 */
(function (root, factory) {
  var DATA = (typeof module !== 'undefined' && module.exports)
    ? require('./data.js')
    : (typeof window !== 'undefined' ? window.RYZLINK_DATA : null);
  var api = factory(DATA);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.RYZLINK_BOOKING = api;
})(this, function (DATA) {
  'use strict';

  function hashStr(s) {
    var h = 2166136261;
    s = String(s);
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  }

  // Приймає 'YYYY-MM-DD', 'DD.MM.YYYY' або Date. Повертає Date (UTC-опівночі) або null.
  // Приймає лише 'YYYY-M-D' / 'D.M.YYYY' (та Date). Валідує календарно (без rollover), завжди UTC-опівніч.
  function parseDate(v) {
    if (v instanceof Date) return isNaN(v) ? null : v;
    if (!v) return null;
    var s = String(v).trim();
    var m, y, mo, da;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) { y = +m[1]; mo = +m[2]; da = +m[3]; }
    else if ((m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/))) { y = +m[3]; mo = +m[2]; da = +m[1]; }
    else return null;
    var d = new Date(Date.UTC(y, mo - 1, da));
    // round-trip: відхиляємо календарно неможливі дати (напр. 31.02, 45.13)
    if (d.getUTCFullYear() !== y || d.getUTCMonth() !== mo - 1 || d.getUTCDate() !== da) return null;
    return d;
  }
  function todayUTC() { var n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())); }

  function fmtDate(d) {
    var dd = ('0' + d.getUTCDate()).slice(-2);
    var mm = ('0' + (d.getUTCMonth() + 1)).slice(-2);
    return dd + '.' + mm + '.' + d.getUTCFullYear();
  }

  function nightsBetween(a, b) {
    return Math.round((b - a) / 86400000);
  }

  function money(n) {
    return n.toLocaleString('cs-CZ').replace(/\s/g, ' ') + ' CZK';
  }

  function getRoom(id) {
    for (var i = 0; i < DATA.rooms.length; i++) if (DATA.rooms[i].id === id) return DATA.rooms[i];
    return null;
  }
  function listRooms() { return DATA.rooms.slice(); }
  function listPackages() { return DATA.packages.slice(); }
  function getPackage(id) {
    for (var i = 0; i < DATA.packages.length; i++) if (DATA.packages[i].id === id) return DATA.packages[i];
    return null;
  }

  /**
   * Пошук доступності номерів на діапазон дат.
   * @returns {object} { ok, error?, checkin, checkout, nights, guests, currency, options[] }
   */
  function searchAvailability(input) {
    input = input || {};
    var ci = parseDate(input.checkin);
    var co = parseDate(input.checkout);
    var adults = Math.max(1, parseInt(input.adults, 10) || 1);
    var children = Math.max(0, parseInt(input.children, 10) || 0);
    var guests = adults + children;

    if (!ci || !co) return { ok: false, error: 'Zadejte prosím správné datum příjezdu a odjezdu (např. 12.08.2026).' };
    if (ci < todayUTC()) return { ok: false, error: 'Datum příjezdu je v minulosti. Zvolte prosím budoucí termín.' };
    var nights = nightsBetween(ci, co);
    if (nights <= 0) return { ok: false, error: 'Datum odjezdu musí být pozdější než datum příjezdu.' };

    var options = DATA.rooms.map(function (r) {
      var seed = hashStr(r.id + '|' + fmtDate(ci));
      var soldOut = (seed % 17 === 0);
      var roomsLeft = soldOut ? 0 : (seed % 4) + 1;
      var fits = r.capacity >= guests;
      var total = r.price * nights;
      var note = '';
      if (!fits) note = 'Nedostatek místa pro ' + guests + ' hostů';
      else if (soldOut) note = 'Není k dispozici na tyto termíny';
      else if (roomsLeft === 1) note = 'Poslední volný pokoj!';
      return {
        roomId: r.id,
        name: r.name,
        capacity: r.capacity,
        size: r.size,
        img: r.img,
        pricePerNight: r.price,
        total: total,
        available: fits && !soldOut,
        roomsLeft: fits ? roomsLeft : 0,
        note: note
      };
    });

    return {
      ok: true,
      checkin: fmtDate(ci),
      checkout: fmtDate(co),
      nights: nights,
      guests: guests,
      adults: adults,
      children: children,
      currency: DATA.hotel.currency,
      options: options
    };
  }

  /**
   * Створення (демо) резервації. Реальна оплата не проводиться.
   * @returns {object} { ok, error?, confirmation, roomName, checkin, checkout, nights, guests, total, currency, name }
   */
  function createReservation(input) {
    input = input || {};
    var name = (input.name || '').trim();
    if (!name) return { ok: false, error: 'Uveďte prosím jméno pro rezervaci.' };

    var pkg = input.packageId ? getPackage(input.packageId) : null;
    var room = input.roomId ? getRoom(input.roomId) : null;
    if (!room && !pkg) return { ok: false, error: 'Vyberte prosím pokoj nebo balíček.' };

    var ci = parseDate(input.checkin);
    var co = parseDate(input.checkout);
    var adults = Math.max(1, parseInt(input.adults, 10) || 1);
    var children = Math.max(0, parseInt(input.children, 10) || 0);
    var guests = adults + children;

    // Guard минулих дат — для обох гілок (номер і пакет).
    var t0 = todayUTC();
    if (ci && ci < t0) return { ok: false, error: 'Datum příjezdu je v minulosti. Zvolte prosím budoucí termín.' };
    if (co && co < t0) return { ok: false, error: 'Datum odjezdu je v minulosti. Zvolte prosím budoucí termín.' };

    var nights, total, itemName;
    if (pkg) {
      nights = pkg.nights;
      total = pkg.price;
      itemName = 'Balíček «' + pkg.name + '»';
      if (!ci) ci = null;
    } else {
      if (!ci || !co) return { ok: false, error: 'Zadejte datum příjezdu a odjezdu.' };
      nights = nightsBetween(ci, co);
      if (nights <= 0) return { ok: false, error: 'Datum odjezdu musí být pozdější než datum příjezdu.' };
      if (room.capacity < guests) return { ok: false, error: 'Vybraný pokoj pojme maximálně ' + room.capacity + ' hostů.' };
      total = room.price * nights;
      itemName = room.name;
    }

    // Стабільний і практично унікальний код: нормалізовані дати + гості + тип позиції.
    var conf = 'RZL-' + (hashStr([name, (ci ? fmtDate(ci) : ''), (co ? fmtDate(co) : ''), adults, children, (room ? 'R:' + room.id : 'P:' + pkg.id)].join('|'))
      .toString(36).toUpperCase() + '000000').slice(0, 6);

    return {
      ok: true,
      confirmation: conf,
      item: itemName,
      roomName: itemName,
      checkin: ci ? fmtDate(ci) : null,
      checkout: co ? fmtDate(co) : null,
      nights: nights,
      guests: guests,
      adults: adults,
      children: children,
      total: total,
      currency: DATA.hotel.currency,
      name: name,
      note: 'Demo rezervace. Skutečná platba neprobíhá.'
    };
  }

  // Пошук відповіді у базі знань за ключовими словами (для симуляції та як довідка).
  var TOPIC_KEYWORDS = {
    location: ['де', 'адрес', 'розташ', 'мікулов', 'локац', 'брно', 'дібратись', 'дорог', 'карт'],
    breakfast: ['сніданок', 'сніданк', 'їжа вранці'],
    parking: ['парков', 'машин', 'авто', 'паркінг'],
    pets: ['твар', 'собак', 'кіт', 'кот', 'пес', 'вихован'],
    checkin: ['заїзд', 'виїзд', 'check', 'засел', 'коли можна'],
    children: ['діт', 'дитин', 'сім', 'родин'],
    wellness: ['wellness', 'веллнес', 'сауна', 'спа', 'ванн', 'джакузі', 'басейн', 'відпочин тіл'],
    restaurant: ['ресторан', 'вечер', 'кухн', 'їж', 'меню', 'обід', 'ріслінг', 'ри729'],
    winery: ['виноробн', 'винороб', 'fučík', 'фучік', 'льох', 'екскурс'],
    tasting: ['дегустац', 'спробувати вин', 'дегуст'],
    languages: ['мов', 'англ', 'чеськ', 'українськ', 'language'],
    vouchers: ['ваучер', 'подарунк', 'сертифікат', 'gift'],
    payment: ['оплат', 'плат', 'картк', 'ціна оплати', 'передоплат']
  };

  // --- Пошук по базі знань (CZ/UK, стемінг + підрядкове співставлення) ---
  var STOP = {
    // укр
    'можна': 1, 'коли': 1, 'який': 1, 'яка': 1, 'яке': 1, 'які': 1, 'мене': 1, 'нас': 1, 'вас': 1, 'для': 1, 'про': 1, 'що': 1, 'як': 1, 'чи': 1, 'там': 1, 'тут': 1, 'ваш': 1, 'ваша': 1, 'ваше': 1, 'ваші': 1, 'треба': 1, 'будь': 1, 'ласка': 1, 'хочу': 1, 'мати': 1, 'бути': 1, 'від': 1, 'при': 1, 'або': 1, 'також': 1, 'вже': 1,
    // cz
    'můžu': 1, 'můžete': 1, 'můžeme': 1, 'kolik': 1, 'kde': 1, 'kdy': 1, 'jak': 1, 'jaké': 1, 'jaká': 1, 'jaký': 1, 'jací': 1, 'jsou': 1, 'jste': 1, 'pro': 1, 'nebo': 1, 'také': 1, 'ještě': 1, 'chci': 1, 'chtěl': 1, 'mít': 1, 'být': 1, 'vaše': 1, 'váš': 1, 'vaši': 1, 'prosím': 1, 'máte': 1, 'mám': 1, 'and': 1, 'the': 1, 'you': 1, 'have': 1, 'can': 1, 'what': 1, 'how': 1, 'when': 1, 'where': 1
  };
  // Закінчення (укр + чеські). Довші — раніше (повертаємо перший збіг).
  var END = ['ování', 'ання', 'ення', 'іння', 'иння', 'ості', 'ість', 'ého', 'ému', 'ých', 'ími', 'ách', 'ích', 'ání', 'ení', 'ами', 'ями', 'ьми', 'ові', 'еві', 'ого', 'ому', 'ему', 'ими', 'ové', 'ovi', 'ost',
    'их', 'ах', 'ях', 'ою', 'ею', 'ів', 'ей', 'ам', 'ям', 'ом', 'ем', 'им', 'ий', 'ій', 'ти', 'ть', 'ся', 'сь', 'ла', 'ло', 'ли', 'на', 'но', 'ні', 'ku', 'ky', 'ce', 'ci', 'ně', 'ší', 'at', 'it', 'át', 'ít', 'es',
    'є', 'ю', 'я', 'а', 'у', 'е', 'и', 'і', 'о', 'ь', 'ě', 'í', 'ý', 'á', 'é', 'ů', 'u', 'y'];
  function ukstem(w) {
    if (w.length <= 3) return w;
    for (var i = 0; i < END.length; i++) {
      var e = END[i];
      if (w.length - e.length >= 3 && w.slice(-e.length) === e) return w.slice(0, w.length - e.length);
    }
    return w;
  }
  function words(s) { return String(s || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean); }
  function searchKnowledge(query, limit) {
    limit = limit || 3;
    var list = DATA.knowledge || [];
    if (!list.length) return [];
    var seen = {}, qs = [];
    words(query).forEach(function (w) { if (w.length < 3 || STOP[w] || !/\p{L}/u.test(w)) return; var s = ukstem(w); if (s.length < 2 || seen[s]) return; seen[s] = 1; qs.push(s); });
    if (!qs.length) return [];
    var scored = list.map(function (e) {
      var kw = (e.keywords || []).join(' ').toLowerCase();
      var title = (e.title || '').toLowerCase();
      var content = (e.content || '').toLowerCase();
      var score = 0;
      qs.forEach(function (s) {
        if (kw.indexOf(s) !== -1) score += 3;
        else if (title.indexOf(s) !== -1) score += 2;
        else if (content.indexOf(s) !== -1) score += 1;
      });
      return { entry: e, score: score };
    });
    var res = scored.filter(function (x) { return x.score >= 2; });
    if (!res.length) res = scored.filter(function (x) { return x.score >= 1; });
    res.sort(function (a, b) { return b.score - a.score; });
    return res.slice(0, limit).map(function (x) { return x.entry; });
  }

  function getInfo(topic) {
    if (topic && DATA.faq && DATA.faq[topic]) return { topic: topic, answer: DATA.faq[topic] };
    // спроба зіставити за ключовими словами (стара коротка FAQ)
    var q = String(topic || '').toLowerCase();
    for (var key in TOPIC_KEYWORDS) {
      var kws = TOPIC_KEYWORDS[key];
      for (var i = 0; i < kws.length; i++) {
        if (q.indexOf(kws[i]) !== -1 && DATA.faq && DATA.faq[key]) return { topic: key, answer: DATA.faq[key] };
      }
    }
    // запасне джерело — велика база знань
    var kbRes = searchKnowledge(topic, 1);
    if (kbRes.length) return { topic: kbRes[0].id, answer: kbRes[0].content, title: kbRes[0].title };
    return { topic: null, answer: null };
  }

  function matchTopic(text) {
    var res = getInfo(text);
    return res.topic;
  }

  return {
    setData: function (d) { if (d) DATA = d; },   // сервер живить даними з БД
    getData: function () { return DATA; },
    parseDate: parseDate,
    fmtDate: fmtDate,
    nightsBetween: nightsBetween,
    money: money,
    getRoom: getRoom,
    listRooms: listRooms,
    listPackages: listPackages,
    getPackage: getPackage,
    searchAvailability: searchAvailability,
    createReservation: createReservation,
    getInfo: getInfo,
    searchKnowledge: searchKnowledge,
    matchTopic: matchTopic
  };
});
