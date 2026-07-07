/* ============================================================
   Ryzlink — AI-консьєрж (віджет чату).
   Гібрид: якщо сервер має ANTHROPIC_API_KEY → справжній Claude з tool-use;
   інакше (або file://) → офлайн-симуляція на тих самих booking-функціях.
   ============================================================ */
(function () {
  'use strict';
  var DATA = window.RYZLINK_DATA;
  var BK = window.RYZLINK_BOOKING;

  // Сесія + логування переписок/бронювань в адмінку
  function sid() { var s = localStorage.getItem('rz_sid'); if (!s) { s = 's-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); localStorage.setItem('rz_sid', s); } return s; }
  function logTurn(role, text, meta) { try { fetch('/api/conversation', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: sid(), role: role, text: text, meta: meta || null, mode: aiMode }) }); } catch (e) {} }
  function logReservation(r, source) { try { fetch('/api/reservation', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ sessionId: sid(), source: source || 'chat' }, r)) }); } catch (e) {} }
  window.RyzlinkLog = { reservation: logReservation, sid: sid };

  // --- Локалізація кнопок віджета під мову гостя ---
  var I18N = {
    en: { bookThis: 'Book this one', choose: 'Choose', perNight: 'CZK/night', upTo: 'up to', guests: 'guests', nights: 'nights', showRooms: 'Show rooms', offers: 'Special offers', howGet: 'How to get there?', placeholder: 'Type a message…', resv: 'Reservation', guest: 'Guest', total: 'Total' },
    cs: { bookThis: 'Rezervovat tento', choose: 'Vybrat', perNight: 'CZK/noc', upTo: 'až', guests: 'hostů', nights: 'nocí', showRooms: 'Zobrazit pokoje', offers: 'Nabídky', howGet: 'Jak se dostat?', placeholder: 'Napište zprávu…', resv: 'Rezervace', guest: 'Host', total: 'Celkem' }
  };
  // Мова кнопок віджета ЗАВЖДИ дорівнює мові сайту (cs/en) — не залежить від мови повідомлення.
  var SITE_LANG = function () { var l = localStorage.getItem('rz_site_lang'); return (l === 'en') ? 'en' : 'cs'; };
  var chatLang = SITE_LANG();
  function t(k) { return (I18N[chatLang] || I18N.cs)[k] || I18N.cs[k]; }
  var BOOKMSG = {
    en: ['I would like to book the room', 'I would like to book the package'],
    cs: ['Chci rezervovat pokoj', 'Chci rezervovat balíček']
  };
  function bookMsg(i) { return (BOOKMSG[chatLang] || BOOKMSG.cs)[i]; }

  /* ---------------- Стилі віджета (самодостатні) ---------------- */
  var css = document.createElement('style');
  css.textContent = [
    '.rz-launch{position:fixed;right:22px;bottom:22px;z-index:200;display:flex;align-items:center;gap:12px;cursor:pointer;background:none;border:none}',
    '.rz-launch .rz-bubble{background:linear-gradient(135deg,#9a1c2b,#7d1220);color:#fff;width:62px;height:62px;border-radius:50%;display:grid;place-items:center;box-shadow:0 14px 34px -12px rgba(125,18,32,.75);transition:transform .2s;position:relative}',
    '.rz-launch:hover .rz-bubble{transform:scale(1.06)}',
    '.rz-launch .rz-bubble svg{width:30px;height:30px}',
    '.rz-launch .rz-dot{position:absolute;top:6px;right:6px;width:12px;height:12px;background:#c6a04e;border:2px solid #fff;border-radius:50%}',
    '.rz-launch .rz-tip{background:#fff;color:#241d1a;font:600 .8rem/1.2 Montserrat,sans-serif;padding:9px 14px;border-radius:22px;box-shadow:0 10px 26px -14px rgba(0,0,0,.5);white-space:nowrap}',
    '@media(max-width:520px){.rz-launch .rz-tip{display:none}}',
    '.rz-panel{position:fixed;right:22px;bottom:22px;z-index:201;width:390px;max-width:calc(100vw - 24px);height:600px;max-height:calc(100vh - 40px);background:#f7f2e8;border-radius:18px;box-shadow:0 30px 70px -20px rgba(30,10,14,.6);display:none;flex-direction:column;overflow:hidden;font-family:Montserrat,sans-serif}',
    '.rz-panel.open{display:flex;animation:rzpop .28s ease}',
    '@keyframes rzpop{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:none}}',
    '.rz-head{background:linear-gradient(135deg,#7d1220,#5c1420);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px}',
    '.rz-ava{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.12);display:grid;place-items:center;flex:none}',
    '.rz-ava svg{width:24px;height:24px;color:#d8c188}',
    '.rz-head .rz-meta{flex:1;min-width:0}',
    '.rz-head .rz-name{font-weight:700;font-size:.98rem}',
    '.rz-head .rz-status{font-size:.72rem;opacity:.85;display:flex;align-items:center;gap:6px;margin-top:2px}',
    '.rz-head .rz-live{width:7px;height:7px;border-radius:50%;background:#7ed07e;box-shadow:0 0 0 0 rgba(126,208,126,.6);animation:rzpulse 1.8s infinite}',
    '@keyframes rzpulse{0%{box-shadow:0 0 0 0 rgba(126,208,126,.6)}100%{box-shadow:0 0 0 8px rgba(126,208,126,0)}}',
    '.rz-close{background:rgba(255,255,255,.14);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1.2rem;flex:none}',
    '.rz-close:hover{background:rgba(255,255,255,.26)}',
    '.rz-body{flex:1;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:12px;background:#f7f2e8}',
    '.rz-msg{max-width:84%;font-size:.9rem;line-height:1.5;padding:10px 14px;border-radius:16px;white-space:pre-wrap;word-wrap:break-word}',
    '.rz-msg.bot{align-self:flex-start;background:#fff;color:#241d1a;border-bottom-left-radius:5px;box-shadow:0 4px 14px -8px rgba(0,0,0,.25)}',
    '.rz-msg.user{align-self:flex-end;background:linear-gradient(135deg,#c6a04e,#b08f42);color:#2a1f0d;border-bottom-right-radius:5px;font-weight:500}',
    '.rz-msg b{color:#7d1220}',
    '.rz-msg.user b{color:#2a1f0d}',
    '.rz-card{align-self:flex-start;background:#fff;border-radius:14px;box-shadow:0 6px 18px -10px rgba(0,0,0,.3);padding:12px 14px;max-width:88%;font-size:.86rem}',
    '.rz-cardimg{width:100%;height:120px;object-fit:cover;border-radius:9px;margin-bottom:9px;display:block;background:linear-gradient(135deg,#7d1220,#3a0d12)}',
    '.rz-tablewrap{overflow-x:auto;margin:7px 0;border-radius:8px;border:1px solid #ece3d2}',
    '.rz-mdtable{border-collapse:collapse;font-size:.78rem;width:100%;background:#fff}',
    '.rz-mdtable th,.rz-mdtable td{padding:6px 9px;text-align:left;white-space:nowrap;border-bottom:1px solid #f0e9dc}',
    '.rz-mdtable th{background:#f4ecdf;color:#7d1220;font-weight:700}',
    '.rz-mdtable tr:last-child td{border-bottom:none}',
    '.rz-ul{margin:5px 0;padding-left:18px}.rz-ul li{margin:3px 0}',
    '.rz-card .rz-crow{display:flex;justify-content:space-between;gap:10px;padding:3px 0}',
    '.rz-card .rz-ctot{border-top:1px solid #eee;margin-top:6px;padding-top:7px;font-weight:700;color:#7d1220}',
    '.rz-conf{font-family:"Cormorant Garamond",serif;font-size:1.3rem;color:#7d1220;text-align:center;letter-spacing:.04em;margin:4px 0}',
    '.rz-chips{display:flex;flex-wrap:wrap;gap:8px;align-self:flex-start;max-width:100%}',
    '.rz-chip{background:#fff;border:1px solid #e4dccc;color:#7d1220;font:600 .8rem Montserrat,sans-serif;padding:8px 13px;border-radius:20px;cursor:pointer;transition:.18s}',
    '.rz-chip:hover{background:#7d1220;color:#fff;border-color:#7d1220}',
    '.rz-typing{align-self:flex-start;background:#fff;border-radius:16px;border-bottom-left-radius:5px;padding:12px 16px;display:flex;gap:4px;box-shadow:0 4px 14px -8px rgba(0,0,0,.25)}',
    '.rz-typing span{width:7px;height:7px;border-radius:50%;background:#c6a04e;animation:rzblink 1.2s infinite}',
    '.rz-typing span:nth-child(2){animation-delay:.2s}.rz-typing span:nth-child(3){animation-delay:.4s}',
    '@keyframes rzblink{0%,60%,100%{opacity:.3}30%{opacity:1}}',
    '.rz-foot{padding:12px;background:#fff;border-top:1px solid #ece3d2;display:flex;gap:8px;align-items:flex-end}',
    '.rz-foot textarea{flex:1;resize:none;border:1px solid #e4dccc;border-radius:12px;padding:10px 12px;font:400 .9rem Montserrat,sans-serif;max-height:90px;color:#241d1a}',
    '.rz-foot textarea:focus{outline:none;border-color:#c6a04e;box-shadow:0 0 0 3px rgba(198,160,78,.2)}',
    '.rz-send{background:#7d1220;border:none;color:#fff;width:42px;height:42px;border-radius:12px;cursor:pointer;flex:none;display:grid;place-items:center}',
    '.rz-send:hover{background:#5c1420}.rz-send svg{width:20px;height:20px}',
    '@media(max-width:520px){.rz-panel{right:0;bottom:0;width:100vw;height:100vh;max-height:100vh;border-radius:0}}'
  ].join('');
  document.head.appendChild(css);

  var GLASS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h12l-1 7a5 5 0 0 1-10 0L6 3z"/><path d="M12 15v5"/><path d="M8 21h8"/></svg>';
  var SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z"/></svg>';

  /* ---------------- Розмітка ---------------- */
  var launch = document.createElement('button');
  launch.className = 'rz-launch'; launch.type = 'button';
  launch.innerHTML = '<span class="rz-tip">Zeptejte se AI concierge</span><span class="rz-bubble">' + GLASS + '<span class="rz-dot"></span></span>';

  var panel = document.createElement('div');
  panel.className = 'rz-panel';
  panel.innerHTML =
    '<div class="rz-head"><div class="rz-ava">' + GLASS + '</div>' +
      '<div class="rz-meta"><div class="rz-name">AI concierge Ryzlink</div>' +
      '<div class="rz-status"><span class="rz-live"></span><span id="rzMode">online</span></div></div>' +
      '<button class="rz-close" aria-label="Zavřít">×</button></div>' +
    '<div class="rz-body" id="rzBody"></div>' +
    '<div class="rz-foot"><textarea id="rzInput" rows="1" placeholder="Napište zprávu…"></textarea>' +
      '<button class="rz-send" id="rzSend" aria-label="Odeslat">' + SEND + '</button></div>';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(launch);
    document.body.appendChild(panel);
    bind();
    detectMode();
  });

  var body, input, modeEl, opened = false;
  var history = [];      // {role, content} — текстова історія для Claude
  var aiMode = 'sim';    // 'claude' | 'sim'

  function bind() {
    body = panel.querySelector('#rzBody');
    input = panel.querySelector('#rzInput');
    modeEl = panel.querySelector('#rzMode');
    chatLang = SITE_LANG();               // синхронізувати мову віджета з мовою сайту при старті
    if (input) input.placeholder = t('placeholder');
    launch.addEventListener('click', toggle);
    panel.querySelector('.rz-close').addEventListener('click', toggle);
    panel.querySelector('#rzSend').addEventListener('click', function () { submit(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    });
    input.addEventListener('input', function () { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 90) + 'px'; });
    // кнопки data-ask на сторінці
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ask]');
      if (t) { window.RyzlinkChat.ask(t.getAttribute('data-ask')); }
    });
  }

  function detectMode() {
    fetch('/api/status').then(function (r) { return r.json(); }).then(function (s) {
      aiMode = s.ai ? 'claude' : 'sim';
      if (modeEl) modeEl.textContent = s.ai ? ('Claude · ' + prettyModel(s.model)) : 'demo asistent';
    }).catch(function () { aiMode = 'sim'; if (modeEl) modeEl.textContent = 'demo asistent'; });
  }
  function prettyModel(m) {
    if (!m) return 'AI';
    if (/opus/.test(m)) return 'Opus';
    if (/sonnet/.test(m)) return 'Sonnet';
    if (/haiku/.test(m)) return 'Haiku';
    return m;
  }

  function toggle() {
    opened = !opened;
    panel.classList.toggle('open', opened);
    launch.style.display = opened ? 'none' : 'flex';
    if (opened && body.childElementCount === 0) greet();
    if (opened) setTimeout(function () { input.focus(); }, 150);
  }

  /* ---------------- Рендер повідомлень ---------------- */
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  // Легкий markdown-рендер: жирний/курсив, списки, таблиці, переноси.
  function inlineMd(t) {
    return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<i>$2</i>');
  }
  function splitRow(line) { return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (c) { return c.trim(); }); }
  function fmt(s) {
    s = String(s == null ? '' : s);
    var lines = s.split('\n'), out = '', i = 0;
    while (i < lines.length) {
      var line = lines[i];
      var next = lines[i + 1] || '';
      // таблиця: рядок з | і наступний — розділювач (|---|---|)
      if (line.indexOf('|') !== -1 && next.indexOf('|') !== -1 && /-/.test(next) && /^[\s|:\-]+$/.test(next.trim())) {
        var header = splitRow(line); i += 2; var rows = [];
        while (i < lines.length && lines[i].indexOf('|') !== -1 && lines[i].trim()) { rows.push(splitRow(lines[i])); i++; }
        out += '<div class="rz-tablewrap"><table class="rz-mdtable"><thead><tr>' +
          header.map(function (c) { return '<th>' + inlineMd(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inlineMd(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table></div>';
        continue;
      }
      // маркований список
      if (/^\s*[-*•]\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*•]\s+/, '')); i++; }
        out += '<ul class="rz-ul">' + items.map(function (it) { return '<li>' + inlineMd(it) + '</li>'; }).join('') + '</ul>';
        continue;
      }
      out += inlineMd(line) + (i < lines.length - 1 ? '<br>' : '');
      i++;
    }
    return out;
  }
  function roomImg(src) { return src ? '<img class="rz-cardimg" src="/' + String(src).replace(/^\//, '') + '" alt="" onerror="this.style.display=\'none\'"/>' : ''; }

  function addMsg(role, text) {
    var el = document.createElement('div');
    el.className = 'rz-msg ' + role;
    el.innerHTML = fmt(text);
    body.appendChild(el); scroll();
    logTurn(role, text);
    return el;
  }
  function addCard(html) {
    var el = document.createElement('div'); el.className = 'rz-card'; el.innerHTML = html;
    body.appendChild(el); scroll(); return el;
  }
  function addChips(items) {
    if (!items || !items.length) return;
    var wrap = document.createElement('div'); wrap.className = 'rz-chips';
    items.forEach(function (it) {
      var b = document.createElement('button'); b.className = 'rz-chip'; b.textContent = it.label;
      b.addEventListener('click', function () {
        wrap.remove();
        if (it.action) it.action(); else send(it.label);
      });
      wrap.appendChild(b);
    });
    body.appendChild(wrap); scroll();
  }
  function typing(on) {
    var ex = body.querySelector('.rz-typing');
    if (on) { if (!ex) { var t = document.createElement('div'); t.className = 'rz-typing'; t.innerHTML = '<span></span><span></span><span></span>'; body.appendChild(t); scroll(); } }
    else if (ex) ex.remove();
  }
  function scroll() { body.scrollTop = body.scrollHeight; }

  function greet() {
    var src = (chatLang === 'en' && window.RYZLINK_DATA_EN && window.RYZLINK_DATA_EN.chat) ? window.RYZLINK_DATA_EN.chat : (DATA.chat || {});
    var g = src.greeting || 'Vítejte v **Hotel Ryzlink**! 🍷 Jsem váš AI-concierge.\n\nČím mohu začít?';
    addMsg('bot', g);
    var qr = (src.quickReplies && src.quickReplies.length) ? src.quickReplies : ['Vybrat pokoj', 'Rezervovat na víkend', 'Co je Wine Wellness?', 'Chci degustaci vína'];
    addChips(qr.map(function (q) { return { label: q }; }));
  }

  /* ---------------- Відправлення ---------------- */
  function submit() {
    var v = input.value.trim(); if (!v) return;
    input.value = ''; input.style.height = 'auto';
    send(v);
  }

  function send(text) {
    chatLang = SITE_LANG(); // мова кнопок = мова сайту, а не мова повідомлення
    if (input) input.placeholder = t('placeholder');
    addMsg('user', text);
    history.push({ role: 'user', content: text });
    typing(true);

    if (aiMode === 'claude') {
      fetch('/api/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, lang: chatLang })
      }).then(function (r) { return r.json(); }).then(function (res) {
        typing(false);
        if (res.mode === 'claude') {
          var raw = res.reply || '';
          var sug = [];
          var sm = raw.match(/SUGGESTIONS:\s*([^\n]+)/i);
          if (sm) sug = sm[1].split('|').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 4);
          var shown = raw.replace(/\n*\s*SUGGESTIONS:[\s\S]*$/i, '').trim();
          if (shown) { addMsg('bot', shown); history.push({ role: 'assistant', content: shown }); }
          if (res.reservation) renderReservationCard(res.reservation);
          else renderClaudeCards(res.events || []);
          if (sug.length) addChips(sug.map(function (c) { return { label: c }; }));
          else followupChips(text);
        } else {
          // сервер попросив симуляцію / помилка → офлайн-мозок
          aiMode = 'sim'; if (modeEl) modeEl.textContent = 'demo asistent';
          simReply(text);
        }
      }).catch(function () { typing(false); aiMode = 'sim'; simReply(text); });
    } else {
      // невелика пауза для природності
      setTimeout(function () { typing(false); simReply(text); }, 420);
    }
  }

  function renderReservationCard(r) {
    addCard('<div class="rz-conf">' + r.confirmation + '</div>' +
      '<div class="rz-crow"><span>' + (r.item || t('resv')) + '</span><span>' + (r.checkin || '') + (r.checkout ? ' → ' + r.checkout : '') + '</span></div>' +
      '<div class="rz-crow"><span>' + t('guest') + '</span><span>' + esc(r.name) + '</span></div>' +
      '<div class="rz-crow rz-ctot"><span>' + t('total') + '</span><span>' + r.total.toLocaleString('cs-CZ') + ' CZK</span></div>');
    logReservation(r, 'chat');
    logTurn('bot', 'Rezervace potvrzena: ' + r.confirmation, { reservation: r.confirmation });
  }

  function followupChips(lastUser) {
    // запасні підказки (якщо Claude не дав SUGGESTIONS) — мовою гостя
    if (/подяк|дякую|thanks|danke|děkuj|dzięk|спасибо/i.test(lastUser)) return;
    addChips([{ label: t('showRooms') }, { label: t('offers') }, { label: t('howGet') }]);
  }

  // У Claude-режимі показуємо гарні картки з фото на основі викликаних інструментів
  function renderClaudeCards(events) {
    events = events || [];
    var avail = events.filter(function (e) { return e.tool === 'search_availability' && e.result && e.result.ok && e.result.options; }).map(function (e) { return e.result; }).pop();
    var rooms = events.filter(function (e) { return e.tool === 'get_room_details' && e.result && e.result.rooms; }).map(function (e) { return e.result.rooms; }).pop();
    var pkgs = events.filter(function (e) { return e.tool === 'list_packages' && e.result && e.result.packages; }).map(function (e) { return e.result.packages; }).pop();

    if (avail) {
      var any = false;
      avail.options.forEach(function (o) {
        if (!o.available) return; any = true;
        addCard(roomImg(o.img) +
          '<div class="rz-crow"><b>' + o.name + '</b><span>' + o.total.toLocaleString('cs-CZ') + ' CZK</span></div>' +
          '<div style="color:#6f635a;margin:4px 0 8px">' + avail.nights + ' ' + t('nights') + ' · ' + t('upTo') + ' ' + o.capacity + ' ' + t('guests') + (o.note ? ' · <span style="color:#a3182a">' + o.note + '</span>' : '') + '</div>' +
          '<button class="rz-chip" data-cbook="' + o.roomId + '">' + t('bookThis') + '</button>');
      });
      if (any) return bindClaudeBook();
    }
    if (rooms) {
      rooms.forEach(function (r) {
        addCard(roomImg(r.img) +
          '<div class="rz-crow"><b>' + r.name + '</b><span>' + r.price.toLocaleString('cs-CZ') + ' ' + t('perNight') + '</span></div>' +
          '<div style="color:#6f635a;margin:4px 0 8px">' + (r.short || '') + ' · ' + t('upTo') + ' ' + r.capacity + ' ' + t('guests') + '</div>' +
          '<button class="rz-chip" data-cbook="' + r.id + '">' + t('choose') + ' ' + r.name + '</button>');
      });
      return bindClaudeBook();
    }
    if (pkgs) {
      pkgs.forEach(function (p) {
        addCard(roomImg(p.img) +
          '<div class="rz-crow"><b>' + p.name + '</b><span>' + p.price.toLocaleString('cs-CZ') + ' CZK</span></div>' +
          '<div style="color:#6f635a;margin:4px 0 8px">' + (p.desc || '') + '</div>' +
          '<button class="rz-chip" data-cbookpkg="' + p.id + '">' + t('choose') + ' «' + p.name + '»</button>');
      });
      return bindClaudeBook();
    }
  }
  function bindClaudeBook() {
    Array.prototype.forEach.call(body.querySelectorAll('[data-cbook]'), function (b) {
      if (b._cb) return; b._cb = 1;
      b.addEventListener('click', function () { var r = BK.getRoom(b.getAttribute('data-cbook')); send(bookMsg(0) + ' ' + (r ? r.name : '')); });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-cbookpkg]'), function (b) {
      if (b._cb) return; b._cb = 1;
      b.addEventListener('click', function () { var p = BK.getPackage(b.getAttribute('data-cbookpkg')); send(bookMsg(1) + ' «' + (p ? p.name : '') + '»'); });
    });
  }

  /* ============================================================
     ОФЛАЙН-СИМУЛЯЦІЯ (демо-мозок)
     ============================================================ */
  var sim = { stage: 'idle', pending: null, slots: { checkin: '', checkout: '', adults: 2, children: 0 } };
  var MONTHS = ['січ', 'лют', 'бере', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вере', 'жовт', 'листо', 'груд'];

  function pad(n) { return ('0' + n).slice(-2); }
  function fmtD(d) { return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear(); }

  function parseGuests(t) {
    var s = t.toLowerCase();
    var out = {};
    var ma = s.match(/(\d+)\s*(дорос|особ|гост|люд|чолов)/);
    if (ma) out.adults = +ma[1];
    else if (/удвох|двоє|для двох|вдвох/.test(s)) out.adults = 2;
    else if (/сам|одн[аий]|соло/.test(s)) out.adults = 1;
    else if (/трьох|троє/.test(s)) out.adults = 3;
    else if (/чотир|четверо/.test(s)) out.adults = 4;
    var mc = s.match(/(\d+)\s*(дит|діт)/);
    if (mc) out.children = +mc[1];
    else if (/з дитин|дитин|малюк/.test(s)) out.children = 1;
    return out;
  }

  function parseDates(t) {
    var s = t.toLowerCase();
    var now = new Date();
    // "на вихідні / вікенд" → найближча субота-неділя
    if (/вихідн|вікенд|weekend/.test(s)) {
      var d = new Date(now); var day = d.getDay();
      var toSat = (6 - day + 7) % 7; if (toSat === 0) toSat = 7;
      var sat = new Date(d.getTime() + toSat * 86400000);
      var sun = new Date(sat.getTime() + 2 * 86400000);
      return { checkin: fmtD(sat), checkout: fmtD(sun) };
    }
    // дві дати DD.MM
    var re = /(\d{1,2})[.\/](\d{1,2})(?:[.\/](\d{2,4}))?/g, m, dates = [];
    while ((m = re.exec(s))) {
      var yr = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : now.getFullYear();
      var dt = new Date(yr, +m[2] - 1, +m[1]);
      if (dt < now && !m[3]) dt.setFullYear(yr + 1);
      dates.push(dt);
    }
    if (dates.length >= 2) return { checkin: fmtD(dates[0]), checkout: fmtD(dates[1]) };
    if (dates.length === 1) { var out = { checkin: fmtD(dates[0]) }; var nx = new Date(dates[0].getTime() + 86400000); out.checkout = fmtD(nx); return out; }
    // "12 серпня" [– 14 серпня]
    var mm = s.match(/(\d{1,2})\s*(січ|лют|бере|квіт|трав|черв|лип|серп|вере|жовт|листо|груд)/);
    if (mm) {
      var mi = MONTHS.indexOf(mm[2]);
      var d1 = new Date(now.getFullYear(), mi, +mm[1]); if (d1 < now) d1.setFullYear(now.getFullYear() + 1);
      var d2 = new Date(d1.getTime() + 2 * 86400000);
      return { checkin: fmtD(d1), checkout: fmtD(d2) };
    }
    return null;
  }

  function findRoomInText(t) {
    var s = t.toLowerCase();
    if (/royal.*терас|терас|з терасою/.test(s)) return 'royal-terrace';
    if (/diamond\s*royal|даймонд\s*рояль|роял/.test(s)) return 'diamond-royal';
    if (/diamond|даймонд/.test(s)) return 'diamond';
    if (/ексклюзив|апартамент/.test(s)) return 'exclusive';
    if (/класич|classic|стандарт/.test(s)) return 'classic';
    return null;
  }
  function findPkgInText(t) {
    var s = t.toLowerCase();
    if (/романтич|свят.*гор/.test(s)) return 'romantic';
    if (/вихідн|вікенд|weekend|ріслінг/.test(s)) return 'weekend';
    if (/wellness|велнес|спа|винн.*ванн|оздоров/.test(s)) return 'wellness30';
    if (/класик|classika|мікуловськ/.test(s)) return 'classika';
    if (/пакет|пропозиц|спец|balíč|balic|nabídk|nabidk/.test(s)) return 'ANY';
    return null;
  }

  // --- Розпізнавання наміру при очікуванні імені (щоб не бронювати «ні хочу інше») ---
  function isDecline(s) {
    var toks = s.split(/[\s,.!?]+/);
    if (toks.indexOf('ні') !== -1 || toks.indexOf('нє') !== -1 || toks.indexOf('нет') !== -1 || toks.indexOf('no') !== -1) return true;
    return /скасув|відмін|назад|не треба|не хочу|не буду|передума|розхот|інше|інший|іншу|іншого|стоп|почека|потім|не зараз|нема потреб|нічого/.test(s);
  }
  function isQuestion(s) {
    if (s.indexOf('?') !== -1) return true;
    var q = ['чи', 'як', 'коли', 'скільки', 'де', 'що', 'який', 'яка', 'яке', 'які', 'чому', 'хто', 'можна', 'розкажи', 'розкажіть', 'підкажи', 'підкажіть'];
    if (q.indexOf(s.split(/\s+/)[0]) !== -1) return true;
    return /скільки кошт|чи можна|що таке|яка ціна|коли працю/.test(s);
  }
  function looksLikeIntent(s) {
    return /номер|пакет|апартам|diamond|classic|exclusive|royal|вихідн|дегустац|сауна|wellness|велнес|ресторан|поміня|змінит|інший варіант/.test(s) || /\d{1,2}[.\/]\d{1,2}/.test(s);
  }
  function looksLikeName(t) {
    t = t.trim();
    if (t.length < 2 || t.length > 40) return false;
    if (/\d/.test(t)) return false;
    var toks = t.split(/\s+/);
    if (toks.length > 3) return false;
    if (!/^[a-zа-яіїєґ'ʼ.\-\s]+$/i.test(t)) return false;
    var bad = ['ні', 'нє', 'так', 'хочу', 'треба', 'номер', 'пакет', 'дата', 'ціна', 'вино', 'сауна', 'привіт', 'дякую', 'ок', 'окей', 'стоп', 'інше', 'інший', 'іншу', 'нічого'];
    for (var i = 0; i < toks.length; i++) if (bad.indexOf(toks[i].toLowerCase()) !== -1) return false;
    return true;
  }

  function simReply(text) {
    var s = text.toLowerCase().trim();

    // очікуємо імʼя для завершення бронювання
    if (sim.stage === 'awaiting_name') {
      // 1) відмова / зміна наміру — НЕ бронюємо
      if (isDecline(s)) {
        sim.stage = 'idle'; sim.pending = null;
        return botSay('Rozumím, nerezervuji 🙂 Co byste si přál/a místo toho?', [{ label: 'Zobrazit pokoje' }, { label: 'Nabídky' }, { label: 'Wine Wellness' }]);
      }
      // 2) це питання чи новий запит, а не імʼя — обробляємо як звичайне повідомлення
      if (isQuestion(s) || looksLikeIntent(s)) {
        sim.stage = 'idle'; sim.pending = null;
        return simReply(text);
      }
      // 3) не схоже на імʼя — ввічливо перепитуємо
      if (!looksLikeName(text)) {
        return botSay('Omlouvám se, nejsem si jistá, že je to jméno 🙂 Napište prosím **jméno a příjmení** pro rezervaci — nebo klikněte na «Zrušit».',
          [{ label: 'Zrušit', action: function () { sim.stage = 'idle'; sim.pending = null; botSay('Zrušeno. Jak mohu pomoci?', [{ label: 'Zobrazit pokoje' }, { label: 'Nabídky' }]); } }]);
      }
      // 4) все гаразд — бронюємо
      var name = text.trim();
      var out = BK.createReservation({
        name: name, roomId: sim.pending.roomId, packageId: sim.pending.packageId,
        checkin: sim.pending.checkin, checkout: sim.pending.checkout,
        adults: sim.pending.adults, children: sim.pending.children
      });
      if (!out.ok) return botSay(out.error + '\nZkusme to znovu — zadejte prosím správné údaje.');
      sim.stage = 'idle'; sim.pending = null;
      botSay('Hotovo, ' + firstName(name) + '! ✨ Rezervace potvrzena:');
      setTimeout(function () {
        renderReservationCard(out);
        botSay('Detaily jsme poslali na e-mail (demo). Příjemný pobyt v Ryzlink! 🍷', [{ label: 'Rezervovat další' }, { label: 'Co dělat v okolí?' }]);
      }, 350);
      return;
    }

    // оновити слоти з тексту
    var g = parseGuests(text); if (g.adults) sim.slots.adults = g.adults; if (g.children != null) sim.slots.children = g.children;
    var d = parseDates(text); if (d) { sim.slots.checkin = d.checkin; if (d.checkout) sim.slots.checkout = d.checkout; }

    var room = findRoomInText(text);
    var pkg = findPkgInText(text);
    var wantsBook = /заброн|бронюва|book|rezerv|ubytov|přenoc|pobyt|номер|проживанн|зупинит|переночув|ніч|поселит/.test(s);

    // Привітання / допомога
    if (/^(ahoj|dobr|zdrav|vít|čau|hi|hello|hey)/.test(s) && !wantsBook) {
      return botSay('Vítejte! 🍷 Pomohu vybrat pokoj a zarezervovat. Řekněte termín a počet hostů — nebo zvolte možnost níže.',
        [{ label: 'Vybrat pokoj' }, { label: 'Nabídky' }]);
    }

    // Пакети
    if (pkg) {
      if (pkg === 'ANY') {
        listPackages();
        return;
      }
      var p = BK.getPackage(pkg);
      sim.pending = { packageId: pkg, checkin: sim.slots.checkin, adults: sim.slots.adults };
      botSay('**' + p.name + '** — ' + p.desc + '\n\nCena: **' + p.price.toLocaleString('cs-CZ') + ' CZK** za ' + p.nights + ' nocí.');
      sim.stage = 'awaiting_name';
      return botSay('Zarezervujeme? Napište prosím **jméno a příjmení** pro rezervaci.', [{ label: 'Nejdřív pokoje' , action:function(){ sim.stage='idle'; recommendRooms(); } }]);
    }

    // Інфо-питання — відповідь із бази знань (спарсено з сайту)
    if (!wantsBook && !room && !pkg) {
      var kb = BK.searchKnowledge(text, 2);
      if (kb.length) {
        var ans = kb[0].content;
        if (kb.length > 1 && kb[1].content !== kb[0].content) ans += '\n\n' + kb[1].content;
        botSay(ans, [{ label: 'Vybrat pokoj' }, { label: 'Rezervovat' }]);
        return;
      }
    }

    // Обрано конкретний номер
    if (room) {
      if (!sim.slots.checkin || !sim.slots.checkout) {
        sim.pending = { roomId: room, adults: sim.slots.adults, children: sim.slots.children };
        return botSay('Skvělá volba — **' + BK.getRoom(room).name + '**! Na jaké **termíny** plánujete (příjezd a odjezd)?',
          [{ label: 'Na víkend', action: function () { send('na víkend, ' + BK.getRoom(room).name); } }]);
      }
      return offerRoom(room);
    }

    // Є дати → показати доступність
    if (sim.slots.checkin && sim.slots.checkout && (wantsBook || d)) {
      return showAvailability();
    }

    // Хоче бронювати, але бракує дат
    if (wantsBook) {
      if (!sim.slots.checkin) return botSay('S radostí zarezervuji! Řekněte prosím **termíny** (příjezd – odjezd) a počet osob.',
        [{ label: 'Na víkend, ve dvou', action: function () { send('na víkend, ve dvou'); } }]);
      return showAvailability();
    }

    // Підбір номера
    if (/підбер|підібр|порад|який номер|рекоменд|варіант|обрати|номер|vybrat pokoj|zobrazit pokoj|doporuč|doporuc|který pokoj|pokoje/.test(s)) {
      return recommendRooms();
    }

    // Fallback
    botSay('Jsem tu, abych pomohla s výběrem a rezervací v Ryzlink. Mohu:\n• vybrat **pokoj** podle termínů a hostů\n• povědět o **wine-wellness**, **restauraci**, **degustacích**\n• **zarezervovat** pobyt přímo tady',
      [{ label: 'Vybrat pokoj' }, { label: 'Nabídky' }, { label: 'Wine Wellness' }, { label: 'Jak se dostat?' }]);
  }

  function botSay(text, chips) {
    typing(true);
    setTimeout(function () {
      typing(false); addMsg('bot', text); if (chips) addChips(chips);
    }, 260);
  }

  function recommendRooms() {
    botSay('Zde jsou naše pokoje — od útulných klasických po apartmá s panoramatickou terasou:');
    setTimeout(function () {
      DATA.rooms.forEach(function (r) {
        addCard(roomImg(r.img) +
          '<div class="rz-crow"><b>' + r.name + '</b><span>' + r.price.toLocaleString('cs-CZ') + ' CZK/noc</span></div>' +
          '<div style="color:#6f635a;margin:4px 0 8px">' + r.short + ' · až ' + r.capacity + ' hostů</div>' +
          '<button class="rz-chip" data-pickroom="' + r.id + '">Vybrat ' + r.name + '</button>');
      });
      bindPick();
      botSay('Řekněte **termíny** — a já ověřím dostupnost a cenu přesně na vaše období.');
    }, 350);
  }

  function listPackages() {
    botSay('Naše hotové balíčky zážitků:');
    setTimeout(function () {
      DATA.packages.forEach(function (p) {
        addCard('<div class="rz-crow"><b>' + p.name + '</b><span>' + p.price.toLocaleString('cs-CZ') + ' CZK</span></div>' +
          '<div style="color:#6f635a;margin:4px 0 8px">' + p.desc + '</div>' +
          '<button class="rz-chip" data-pickpkg="' + p.id + '">Vybrat «' + p.name + '»</button>');
      });
      bindPick();
    }, 350);
  }

  function showAvailability() {
    var res = BK.searchAvailability(sim.slots);
    if (!res.ok) return botSay(res.error);
    botSay('Zde je volné na **' + res.checkin + ' → ' + res.checkout + '** (' + res.guests + ' hostů, ' + res.nights + ' nocí):');
    setTimeout(function () {
      var any = false;
      res.options.forEach(function (o) {
        if (!o.available) return; any = true;
        addCard(roomImg(o.img) +
          '<div class="rz-crow"><b>' + o.name + '</b><span>' + o.total.toLocaleString('cs-CZ') + ' CZK</span></div>' +
          '<div style="color:#6f635a;margin:4px 0 8px">' + res.nights + ' nocí · až ' + o.capacity + ' hostů' + (o.note ? ' · <span style="color:#a3182a">' + o.note + '</span>' : '') + '</div>' +
          '<button class="rz-chip" data-pickroom="' + o.roomId + '">Rezervovat tento</button>');
      });
      if (!any) return botSay('Bohužel na tyto termíny nejsou volné pokoje. Zkusíme jiné termíny?');
      bindPick();
    }, 350);
  }

  function offerRoom(roomId) {
    var res = BK.searchAvailability(sim.slots);
    var opt = res.ok && res.options.filter(function (o) { return o.roomId === roomId; })[0];
    if (!opt || !opt.available) return botSay('Tento pokoj je na zvolené termíny nedostupný 😕. Zobrazit alternativy?', [{ label: 'Ano, zobrazit', action: showAvailability }]);
    sim.pending = { roomId: roomId, checkin: sim.slots.checkin, checkout: sim.slots.checkout, adults: sim.slots.adults, children: sim.slots.children };
    botSay('**' + opt.name + '** na ' + res.checkin + ' → ' + res.checkout + ' (' + res.nights + ' nocí) — **' + opt.total.toLocaleString('cs-CZ') + ' CZK**.');
    sim.stage = 'awaiting_name';
    botSay('Pro dokončení rezervace napište prosím **jméno a příjmení**.', [{ label: 'Otevřít formulář', action: function () { window.RyzlinkBookingUI.open({ roomId: roomId, checkin: sim.slots.checkin, checkout: sim.slots.checkout }); } }]);
  }

  function bindPick() {
    Array.prototype.forEach.call(body.querySelectorAll('[data-pickroom]'), function (b) {
      if (b._bound) return; b._bound = true;
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-pickroom');
        if (!sim.slots.checkin || !sim.slots.checkout) {
          sim.pending = { roomId: id }; addMsg('user', 'Vybírám: ' + BK.getRoom(id).name);
          return botSay('Na jaké **termíny**? (příjezd – odjezd)', [{ label: 'Na víkend', action: function () { send('na víkend'); } }]);
        }
        addMsg('user', 'Rezervuji: ' + BK.getRoom(id).name);
        offerRoom(id);
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-pickpkg]'), function (b) {
      if (b._bound) return; b._bound = true;
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-pickpkg');
        addMsg('user', 'Vybírám balíček: ' + BK.getPackage(id).name);
        var p = BK.getPackage(id);
        sim.pending = { packageId: id, checkin: sim.slots.checkin, adults: sim.slots.adults };
        sim.stage = 'awaiting_name';
        botSay('Výborně! Balíček **' + p.name + '** — ' + p.price.toLocaleString('cs-CZ') + ' CZK. Napište **jméno a příjmení** pro rezervaci.');
      });
    });
  }

  function firstName(full) { return full.trim().split(/\s+/)[0]; }

  /* ---------------- Публічний API ---------------- */
  window.RyzlinkChat = {
    open: function () { if (!opened) toggle(); },
    ask: function (text) {
      if (!opened) toggle();
      setTimeout(function () { if (body.childElementCount === 0) greet(); send(text); }, opened ? 0 : 260);
    },
    setLang: function (lang) {
      chatLang = lang;
      if (input) input.placeholder = t('placeholder');
      // якщо чат ще без діалогу — перепоказати привітання новою мовою
      if (body && body.childElementCount <= 2) { body.innerHTML = ''; greet(); }
    }
  };
})();
