/* Ryzlink Admin — SPA (zero-dependency), dvojjazyčné CZ/EN */
(function () {
  'use strict';

  /* ---------- i18n (CZ / EN) ---------- */
  var DICT = {
    cs: {
      login_title: 'Ovládací panel', login_pass: 'Heslo administrátora', login_btn: 'Přihlásit se', login_hint: 'Výchozí:',
      login_err: 'Chyba přihlášení', net_err: 'Chyba sítě',
      save_btn: 'Uložit změny', unsaved: '● neuložené změny', saved_ok: 'Uloženo ✓', save_err: 'Chyba ukládání',
      open_site: '↗ Otevřít web', logout: '⎋ Odhlásit se',
      tab_dashboard: 'Dashboard', tab_rooms: 'Pokoje', tab_packages: 'Balíčky / služby', tab_gallery: 'Galerie',
      tab_content: 'Bannery / Obsah', tab_knowledge: 'Znalostní báze', tab_ai: 'AI agent', tab_conversations: 'Konverzace', tab_reservations: 'Rezervace',
      photo_uploaded: 'Foto nahráno ✓', error: 'Chyba', del: 'Smazat', del_cat: 'Smazat kategorii', upload: '⬆ Nahrát', by_url: 'Za URL', url_prompt: 'URL nebo cesta obrázku:',
      stat_activerooms: 'Aktivní pokoje', stat_packages: 'Balíčky / služby', stat_photos: 'Fotky v galerii', stat_kb: 'Znalostní báze (záznamů)', stat_convos: 'Konverzace', stat_reservations: 'Rezervace',
      recent_reservations: 'Poslední rezervace', recent_convos: 'Poslední konverzace', no_reservations: 'Zatím žádné rezervace', no_convos: 'Zatím žádné konverzace', msgs: 'zpráv', empty_val: '(prázdné)',
      add_room: '+ Přidat pokoj', new_room: 'Nový pokoj', add_pkg: '+ Přidat balíček', new_pkg: 'Nový balíček', badge_new: 'Novinka',
      active: 'Aktivní', up: 'Nahoru', down: 'Dolů', no_name: '(bez názvu)', confirm_del: 'Smazat',
      f_name: 'Název', f_subtitle: 'Podtitul', f_capacity: 'Kapacita (hostů)', f_area: 'Plocha, m²', f_price_night: 'Cena za noc, CZK',
      f_features: 'Vybavení (přes čárku)', f_desc: 'Popis', f_mainphoto: 'Hlavní foto', f_badge: 'Odznak', badge_ph: 'Víkend! / Novinka',
      f_nights: 'Nocí', f_price_from: 'Cena od, CZK', f_includes: 'Co je zahrnuto (přes čárku)', f_photo: 'Foto',
      add_cat: '+ Přidat kategorii', new_cat: 'Nová kategorie', confirm_del_cat: 'Smazat kategorii',
      hotel_info: 'Informace o hotelu', f_slogan_hero: 'Slogan (velký na hero)', f_address: 'Adresa', f_city: 'Město', f_phone: 'Telefon', f_email: 'E-mail', f_currency: 'Měna', f_stars: 'Hvězd',
      hero_card: 'Hero (hlavní banner)', f_slogan: 'Slogan', bg_photos_slider: 'Fotky na pozadí (slider)',
      banner_wellness: 'Banner «Wine Wellness»', banner_restaurant: 'Banner «Restaurace»', banner_winery: 'Banner «Vinařství»',
      f_eyebrow: 'Nadtitul', f_button: 'Tlačítko (text)', f_title: 'Nadpis', bg_photos: 'Fotky na pozadí', faq_card: 'Krátká FAQ (interní)',
      faq_location: 'Lokalita', faq_breakfast: 'Snídaně', faq_parking: 'Parkování', faq_pets: 'Zvířata', faq_checkin: 'Příjezd/odjezd', faq_children: 'Děti', faq_wellness: 'Wellness', faq_restaurant: 'Restaurace', faq_winery: 'Vinařství', faq_tasting: 'Degustace', faq_languages: 'Jazyky', faq_vouchers: 'Poukazy', faq_payment: 'Platba',
      kb_search_ph: '🔎 Hledat ve znalostní bázi…', add_entry: '+ Přidat záznam', new_entry: 'Nový záznam', kb_hint_suffix: 'záznamů — z nich odpovídá AI agent', confirm_del_entry: 'Smazat záznam',
      f_category: 'Kategorie', cat_ph: 'Hotel / Wellness / Restaurace…', f_keywords: 'Klíčová slova (přes čárku)', keywords_hint: 'Podle jakých slov to host najde — synonyma vítána', f_content: 'Obsah (odpověď agenta)',
      model_behavior: 'Model a chování', f_model: 'Model Claude', model_hint: 'Funguje s ANTHROPIC_API_KEY. Bez klíče běží offline simulace.',
      f_persona: 'Persona / systémový prompt', persona_hint: 'Kdo je agent, tón, pravidla dialogu.', f_priorities: 'Priority nabídek', priorities_hint: 'Co agent doporučuje první (pokoje/balíčky/akce).',
      chat_greet_card: 'Uvítání a rychlé odpovědi v chatu', f_greeting: 'Uvítací zpráva', greeting_hint: 'Podporuje **tučné** a zalomení řádků.', quickreplies_label: 'Tlačítka rychlých odpovědí', add_btn: '+ přidat', qr_prompt: 'Text rychlé odpovědi:',
      model_sonnet45: 'Claude Sonnet 4.5 (vyvážený, levnější)', model_sonnet5: 'Claude Sonnet 5 (chytřejší, dražší)', model_opus: 'Claude Opus 4.8 (nejchytřejší)', model_haiku: 'Claude Haiku 4.5 (nejlevnější, nejrychlejší)',
      loading: 'Načítání…', select_convo: 'Vyberte konverzaci vlevo', empty2: 'Prázdné', convo_notfound: 'Konverzace pro tuto rezervaci nenalezena',
      meta_reservation: '✓ Rezervace: ', meta_proposed: '💡 Navrženo: ', no_convo_for_res: 'Tato rezervace vznikla přes formulář na webu — samostatná konverzace není.',
      all_reservations: 'Všechny rezervace', th_num: 'č.', th_item: 'Pokoj/balíček', th_guest: 'Host', th_dates: 'Termín', th_total: 'Celkem', th_source: 'Zdroj', th_time: 'Čas',
      source_site: 'web', open_convo_row: 'Otevřít konverzaci této rezervace', no_convo_tooltip: 'Bez konverzace (formulář na webu)', res_hint: '💬 Klikněte na řádek se zdrojem «chat» pro zobrazení konverzace, ze které rezervace vznikla.'
    },
    en: {
      login_title: 'Control panel', login_pass: 'Admin password', login_btn: 'Log in', login_hint: 'Default:',
      login_err: 'Login error', net_err: 'Network error',
      save_btn: 'Save changes', unsaved: '● unsaved changes', saved_ok: 'Saved ✓', save_err: 'Save error',
      open_site: '↗ Open site', logout: '⎋ Log out',
      tab_dashboard: 'Dashboard', tab_rooms: 'Rooms', tab_packages: 'Packages / services', tab_gallery: 'Gallery',
      tab_content: 'Banners / Content', tab_knowledge: 'Knowledge base', tab_ai: 'AI agent', tab_conversations: 'Conversations', tab_reservations: 'Reservations',
      photo_uploaded: 'Photo uploaded ✓', error: 'Error', del: 'Delete', del_cat: 'Delete category', upload: '⬆ Upload', by_url: 'By URL', url_prompt: 'Image URL or path:',
      stat_activerooms: 'Active rooms', stat_packages: 'Packages / services', stat_photos: 'Gallery photos', stat_kb: 'Knowledge base (entries)', stat_convos: 'Conversations', stat_reservations: 'Reservations',
      recent_reservations: 'Recent reservations', recent_convos: 'Recent conversations', no_reservations: 'No reservations yet', no_convos: 'No conversations yet', msgs: 'msgs', empty_val: '(empty)',
      add_room: '+ Add room', new_room: 'New room', add_pkg: '+ Add package', new_pkg: 'New package', badge_new: 'New',
      active: 'Active', up: 'Up', down: 'Down', no_name: '(no name)', confirm_del: 'Delete',
      f_name: 'Name', f_subtitle: 'Subtitle', f_capacity: 'Capacity (guests)', f_area: 'Area, m²', f_price_night: 'Price per night, CZK',
      f_features: 'Amenities (comma-separated)', f_desc: 'Description', f_mainphoto: 'Main photo', f_badge: 'Badge', badge_ph: 'Weekend! / New',
      f_nights: 'Nights', f_price_from: 'Price from, CZK', f_includes: "What's included (comma-separated)", f_photo: 'Photo',
      add_cat: '+ Add category', new_cat: 'New category', confirm_del_cat: 'Delete category',
      hotel_info: 'Hotel information', f_slogan_hero: 'Slogan (large on hero)', f_address: 'Address', f_city: 'City', f_phone: 'Phone', f_email: 'E-mail', f_currency: 'Currency', f_stars: 'Stars',
      hero_card: 'Hero (main banner)', f_slogan: 'Slogan', bg_photos_slider: 'Background photos (slider)',
      banner_wellness: 'Banner «Wine Wellness»', banner_restaurant: 'Banner «Restaurant»', banner_winery: 'Banner «Winery»',
      f_eyebrow: 'Eyebrow', f_button: 'Button (text)', f_title: 'Title', bg_photos: 'Background photos', faq_card: 'Short FAQ (internal)',
      faq_location: 'Location', faq_breakfast: 'Breakfast', faq_parking: 'Parking', faq_pets: 'Pets', faq_checkin: 'Check-in/out', faq_children: 'Children', faq_wellness: 'Wellness', faq_restaurant: 'Restaurant', faq_winery: 'Winery', faq_tasting: 'Tasting', faq_languages: 'Languages', faq_vouchers: 'Vouchers', faq_payment: 'Payment',
      kb_search_ph: '🔎 Search the knowledge base…', add_entry: '+ Add entry', new_entry: 'New entry', kb_hint_suffix: 'entries — the AI agent answers from these', confirm_del_entry: 'Delete entry',
      f_category: 'Category', cat_ph: 'Hotel / Wellness / Restaurant…', f_keywords: 'Keywords (comma-separated)', keywords_hint: 'Words guests may use — synonyms welcome', f_content: "Content (agent's answer)",
      model_behavior: 'Model & behavior', f_model: 'Claude model', model_hint: 'Works with ANTHROPIC_API_KEY. Without a key it runs an offline simulation.',
      f_persona: 'Persona / system prompt', persona_hint: 'Who the agent is, tone, dialogue rules.', f_priorities: 'Offer priorities', priorities_hint: 'What the agent recommends first (rooms/packages/deals).',
      chat_greet_card: 'Chat greeting & quick replies', f_greeting: 'Welcome message', greeting_hint: 'Supports **bold** and line breaks.', quickreplies_label: 'Quick reply buttons', add_btn: '+ add', qr_prompt: 'Quick reply text:',
      model_sonnet45: 'Claude Sonnet 4.5 (balanced, cheaper)', model_sonnet5: 'Claude Sonnet 5 (smarter, pricier)', model_opus: 'Claude Opus 4.8 (smartest)', model_haiku: 'Claude Haiku 4.5 (cheapest, fastest)',
      loading: 'Loading…', select_convo: 'Select a conversation on the left', empty2: 'Empty', convo_notfound: 'Conversation for this reservation not found',
      meta_reservation: '✓ Reservation: ', meta_proposed: '💡 Proposed: ', no_convo_for_res: 'This reservation was made via the website form — no separate conversation.',
      all_reservations: 'All reservations', th_num: 'No.', th_item: 'Room/package', th_guest: 'Guest', th_dates: 'Dates', th_total: 'Total', th_source: 'Source', th_time: 'Time',
      source_site: 'site', open_convo_row: "Open this reservation's conversation", no_convo_tooltip: 'No conversation (website form)', res_hint: '💬 Click a row with source «chat» to open the conversation that led to the booking.'
    }
  };
  var AL = localStorage.getItem('rz_admin_lang') || 'cs';
  function t(k) { return (DICT[AL] && DICT[AL][k]) || (DICT.cs && DICT.cs[k]) || k; }

  var TOKEN = localStorage.getItem('rz_admin_token') || '';
  var content = null, overview = null, dirty = false, tab = 'dashboard';

  /* ---------- DOM helper ---------- */
  function h(tag, attrs) {
    var e = document.createElement(tag);
    attrs = attrs || {};
    for (var k in attrs) {
      var v = attrs[k]; if (v == null) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++) {
      var kids = arguments[i]; if (kids == null) continue;
      (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
        if (c == null) return;
        e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      });
    }
    return e;
  }
  function $(s) { return document.querySelector(s); }

  /* ---------- API ---------- */
  function api(method, path, body) {
    return fetch(path, {
      method: method,
      headers: Object.assign({ 'Content-Type': 'application/json' }, TOKEN ? { 'Authorization': 'Bearer ' + TOKEN } : {}),
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) { if (r.status === 401) { showLogin(); throw new Error('unauthorized'); } return r.text().then(function (txt) { try { return txt ? JSON.parse(txt) : {}; } catch (e) { throw new Error('bad_response'); } }); });
  }
  function toast(msg, type) {
    var el = $('#toast'); el.textContent = msg; el.className = 'toast show ' + (type || '');
    setTimeout(function () { el.className = 'toast ' + (type || ''); }, 2600);
  }
  function setDirty(v) {
    dirty = v; $('#saveBtn').disabled = !v;
    $('#saveState').textContent = v ? t('unsaved') : '';
    $('#saveState').className = 'save-state' + (v ? ' dirty' : '');
  }

  /* ---------- Мова ---------- */
  function applyStatic() {
    document.documentElement.lang = AL;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { var v = t(el.getAttribute('data-i18n')); if (v) el.textContent = v; });
    $('#pageTitle').textContent = t('tab_' + tab);
    $('#saveBtn').textContent = t('save_btn');
    if (dirty) $('#saveState').textContent = t('unsaved');
  }
  function setLang(lang) {
    AL = lang; localStorage.setItem('rz_admin_lang', lang);
    document.querySelectorAll('.lang-toggle button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-lang') === lang); });
    applyStatic();
    if (!$('#app').hidden) render();
  }
  document.querySelectorAll('.lang-toggle').forEach(function (tg) {
    tg.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  });

  /* ---------- Логін ---------- */
  function showLogin() { $('#app').hidden = true; $('#login').style.display = 'grid'; }
  function showApp() { $('#login').style.display = 'none'; $('#app').hidden = false; }
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var pass = $('#loginPass').value;
    fetch('/admin/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pass }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.ok) { TOKEN = d.token; localStorage.setItem('rz_admin_token', TOKEN); $('#loginErr').textContent = ''; boot(); } else $('#loginErr').textContent = d.error || t('login_err'); })
      .catch(function () { $('#loginErr').textContent = t('net_err'); });
  });
  $('#logoutBtn').addEventListener('click', function () { if (dirty && !confirm(AL === 'en' ? 'You have unsaved changes. Discard and log out?' : 'Máte neuložené změny. Zahodit a odhlásit se?')) return; localStorage.removeItem('rz_admin_token'); TOKEN = ''; setDirty(false); showLogin(); });

  /* ---------- Навігація ---------- */
  var pendingConvoId = null;
  function goTab(name) {
    tab = name;
    document.querySelectorAll('#sideNav button').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-tab') === name); });
    $('#pageTitle').textContent = t('tab_' + name);
    render();
  }
  window.__goTab = goTab;
  /* ---------- Мобільний сайдбар ---------- */
  function closeSidebar() { var s = document.querySelector('.sidebar'); if (s) s.classList.remove('open'); var bd = $('#sideBackdrop'); if (bd) bd.classList.remove('show'); }
  function toggleSidebar() { var s = document.querySelector('.sidebar'); if (!s) return; var open = s.classList.toggle('open'); var bd = $('#sideBackdrop'); if (bd) bd.classList.toggle('show', open); }
  var _sideToggle = $('#sideToggle'); if (_sideToggle) _sideToggle.addEventListener('click', toggleSidebar);
  var _sideBackdrop = $('#sideBackdrop'); if (_sideBackdrop) _sideBackdrop.addEventListener('click', closeSidebar);
  document.querySelectorAll('#sideNav button').forEach(function (b) { b.addEventListener('click', function () { goTab(b.getAttribute('data-tab')); closeSidebar(); }); });
  $('#saveBtn').addEventListener('click', saveAll);
  // Захист від втрати незбережених правок при закритті/оновленні вкладки.
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  function boot() {
    showApp();
    Promise.all([api('GET', '/admin/api/content'), api('GET', '/admin/api/overview')])
      .then(function (r) { content = r[0]; overview = r[1]; setDirty(false); applyStatic(); render(); })
      .catch(function (e) { if (String(e && e.message) !== 'unauthorized') { toast(AL === 'en' ? 'Failed to load data — check connection' : 'Nepodařilo se načíst data — zkontrolujte připojení', 'err'); } });
  }
  var _saving = false;
  function saveAll() {
    if (_saving) return; // без дубль-сейву при швидких кліках
    _saving = true; $('#saveBtn').disabled = true;
    content.rooms.forEach(function (r, i) { r.order = i; });
    content.packages.forEach(function (p, i) { p.order = i; });
    content.gallery.forEach(function (g, i) { g.order = i; });
    if (content.knowledge) content.knowledge.forEach(function (k, i) { k.order = i; });
    api('PUT', '/admin/api/content', content).then(function (d) {
      if (d.ok) { setDirty(false); toast(t('saved_ok'), 'ok'); api('GET', '/admin/api/overview').then(function (o) { overview = o; }); }
      else { toast(t('save_err'), 'err'); $('#saveBtn').disabled = false; }
    }).catch(function () { toast(t('save_err'), 'err'); $('#saveBtn').disabled = false; })
      .then(function () { _saving = false; });
  }

  /* ---------- Поля ---------- */
  function inp(obj, key, opts) {
    opts = opts || {};
    var e = h(opts.textarea ? 'textarea' : 'input', { type: opts.type || 'text' });
    e.value = obj[key] != null ? obj[key] : '';
    if (opts.placeholder) e.placeholder = opts.placeholder;
    if (opts.min != null) e.min = opts.min;
    e.addEventListener('input', function () { obj[key] = opts.type === 'number' ? (parseFloat(e.value) || 0) : e.value; setDirty(true); });
    return e;
  }
  function field(label, node, hint) { return h('div', { class: 'field' }, label ? h('label', {}, label) : null, node, hint ? h('div', { class: 'hint' }, hint) : null); }
  function arrField(label, obj, key, hint) {
    var e = h('input', { type: 'text' });
    e.value = (obj[key] || []).join(', ');
    e.addEventListener('input', function () { obj[key] = e.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean); setDirty(true); });
    return field(label, e, hint);
  }

  /* ---------- Завантаження зображень ---------- */
  var fileInput = h('input', { type: 'file', accept: 'image/*', style: 'display:none' });
  document.body.appendChild(fileInput);
  function pickImage(cb) {
    fileInput.value = '';
    fileInput.onchange = function () {
      var f = fileInput.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        api('POST', '/admin/api/upload', { filename: f.name.replace(/\.[^.]+$/, ''), dataUrl: rd.result })
          .then(function (d) { if (d.ok) { cb(d.path); toast(t('photo_uploaded'), 'ok'); } else toast(d.error || t('error'), 'err'); });
      };
      rd.readAsDataURL(f);
    };
    fileInput.click();
  }
  function imageList(arr) {
    var box = h('div', { class: 'gal-grid' });
    function draw() {
      box.innerHTML = '';
      arr.forEach(function (src, i) {
        box.appendChild(h('div', { class: 'gal-item' },
          h('img', { src: '/' + src.replace(/^\//, ''), onerror: function () { this.style.opacity = .3; } }),
          h('button', { class: 'del', title: t('del'), onclick: function () { arr.splice(i, 1); setDirty(true); draw(); } }, '×')));
      });
      box.appendChild(h('div', { class: 'gal-add', onclick: function () { pickImage(function (p) { arr.push(p); setDirty(true); draw(); }); } }, h('span', { html: '⬆' }), t('upload')));
      box.appendChild(h('div', { class: 'gal-add', onclick: function () { var u = prompt(t('url_prompt')); if (u) { arr.push(u.trim()); setDirty(true); draw(); } } }, h('span', { html: '🔗' }), t('by_url')));
    }
    draw(); return box;
  }

  /* ---------- Render dispatcher ---------- */
  function render() {
    var c = $('#content'); c.innerHTML = '';
    if (!content && tab !== 'conversations' && tab !== 'reservations') return;
    ({ dashboard: renderDashboard, rooms: renderRooms, packages: renderPackages, gallery: renderGallery, content: renderContentTab, knowledge: renderKnowledge, ai: renderAI, conversations: renderConversations, reservations: renderReservations }[tab] || function () {})(c);
  }

  /* ---------- Дашборд ---------- */
  function renderDashboard(c) {
    var o = overview || {};
    c.appendChild(h('div', { class: 'stats' },
      stat(o.activeRooms + '/' + o.rooms, t('stat_activerooms')),
      stat(o.packages, t('stat_packages')),
      stat(o.galleryPhotos, t('stat_photos')),
      stat(o.knowledge, t('stat_kb')),
      stat(o.conversations, t('stat_convos')),
      stat(o.reservations, t('stat_reservations'))));
    c.appendChild(h('div', { class: 'grid grid-2' },
      h('div', { class: 'card' }, h('h3', {}, t('recent_reservations')),
        (o.recentReservations && o.recentReservations.length)
          ? h('ul', { class: 'mini-list' }, o.recentReservations.map(function (r) { return h('li', {}, h('span', {}, (r.name || '—') + ' · ' + (r.item || '')), h('span', { class: 'badge' }, r.confirmation)); }))
          : h('div', { class: 'empty' }, t('no_reservations'))),
      h('div', { class: 'card' }, h('h3', {}, t('recent_convos')),
        (o.recentConversations && o.recentConversations.length)
          ? h('ul', { class: 'mini-list' }, o.recentConversations.map(function (cv) { return h('li', {}, h('span', {}, cv.preview || t('empty_val')), h('span', { class: 'badge' }, cv.turnCount + ' ' + t('msgs'))); }))
          : h('div', { class: 'empty' }, t('no_convos')))));
  }
  function stat(num, lbl) { return h('div', { class: 'stat' }, h('div', { class: 'num' }, num == null ? '—' : num), h('div', { class: 'lbl' }, lbl)); }

  /* ---------- Номери / Пакети ---------- */
  function renderRooms(c) {
    c.appendChild(h('div', { class: 'add-bar' }, h('button', { class: 'btn btn-gold', onclick: function () {
      content.rooms.push({ id: 'room-' + Date.now().toString(36), name: t('new_room'), short: '', desc: '', capacity: 2, size: 20, price: 2000, features: [], img: '', gallery: [], active: true }); setDirty(true); render();
    } }, t('add_room'))));
    content.rooms.forEach(function (r, i) { c.appendChild(itemEditor(r, i, content.rooms, 'room')); });
  }
  function renderPackages(c) {
    c.appendChild(h('div', { class: 'add-bar' }, h('button', { class: 'btn btn-gold', onclick: function () {
      content.packages.push({ id: 'pkg-' + Date.now().toString(36), name: t('new_pkg'), badge: t('badge_new'), nights: 2, price: 5000, desc: '', includes: [], img: '', active: true }); setDirty(true); render();
    } }, t('add_pkg'))));
    content.packages.forEach(function (p, i) { c.appendChild(itemEditor(p, i, content.packages, 'pkg')); });
  }
  function itemEditor(it, idx, arr, kind) {
    var head = h('div', { class: 'item-head' },
      h('img', { class: 'thumb', src: it.img ? '/' + it.img.replace(/^\//, '') : '', onerror: function () { this.style.visibility = 'hidden'; } }),
      h('div', { class: 'it-title' }, it.name || t('no_name')),
      h('label', { class: 'toggle' }, (function () { var cb = h('input', { type: 'checkbox' }); cb.checked = it.active !== false; cb.addEventListener('change', function () { it.active = cb.checked; setDirty(true); }); return cb; })(), t('active')),
      h('div', { class: 'ord' },
        h('button', { title: t('up'), onclick: function () { if (idx > 0) { arr.splice(idx - 1, 0, arr.splice(idx, 1)[0]); setDirty(true); render(); } } }, '▲'),
        h('button', { title: t('down'), onclick: function () { if (idx < arr.length - 1) { arr.splice(idx + 1, 0, arr.splice(idx, 1)[0]); setDirty(true); render(); } } }, '▼')),
      h('button', { class: 'btn btn-danger btn-sm', onclick: function () { if (confirm(t('confirm_del') + ' «' + (it.name || '') + '»?')) { arr.splice(idx, 1); setDirty(true); render(); } } }, t('del')));
    var nameI = inp(it, 'name'); nameI.addEventListener('input', function () { head.querySelector('.it-title').textContent = nameI.value || t('no_name'); });
    var imgI = inp(it, 'img', { placeholder: 'assets/gallery/pokoje-01.jpg' });
    var imgPick = h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { pickImage(function (p) { it.img = p; imgI.value = p; head.querySelector('.thumb').src = '/' + p; head.querySelector('.thumb').style.visibility = 'visible'; setDirty(true); }); } }, t('upload'));
    var fields;
    if (kind === 'room') {
      fields = h('div', { class: 'grid grid-2' },
        field(t('f_name'), nameI), field(t('f_subtitle'), inp(it, 'short')),
        field(t('f_capacity'), inp(it, 'capacity', { type: 'number', min: 1 })),
        field(t('f_area'), inp(it, 'size', { type: 'number', min: 1 })),
        field(t('f_price_night'), inp(it, 'price', { type: 'number', min: 0 })),
        arrField(t('f_features'), it, 'features'),
        h('div', { class: 'field', style: 'grid-column:1/-1' }, h('label', {}, t('f_desc')), inp(it, 'desc', { textarea: true })),
        h('div', { class: 'field', style: 'grid-column:1/-1' }, h('label', {}, t('f_mainphoto')), h('div', { class: 'row-actions' }, imgI, imgPick)));
    } else {
      fields = h('div', { class: 'grid grid-2' },
        field(t('f_name'), nameI), field(t('f_badge'), inp(it, 'badge', { placeholder: t('badge_ph') })),
        field(t('f_nights'), inp(it, 'nights', { type: 'number', min: 1 })),
        field(t('f_price_from'), inp(it, 'price', { type: 'number', min: 0 })),
        arrField(t('f_includes'), it, 'includes'), h('div', {}),
        h('div', { class: 'field', style: 'grid-column:1/-1' }, h('label', {}, t('f_desc')), inp(it, 'desc', { textarea: true })),
        h('div', { class: 'field', style: 'grid-column:1/-1' }, h('label', {}, t('f_photo')), h('div', { class: 'row-actions' }, imgI, imgPick)));
    }
    return h('div', { class: 'item' }, head, fields);
  }

  /* ---------- Галерея ---------- */
  function renderGallery(c) {
    c.appendChild(h('div', { class: 'add-bar' }, h('button', { class: 'btn btn-gold', onclick: function () { content.gallery.push({ key: 'cat-' + Date.now().toString(36), label: t('new_cat'), images: [] }); setDirty(true); render(); } }, t('add_cat'))));
    content.gallery.forEach(function (g, i) {
      c.appendChild(h('div', { class: 'gal-cat' },
        h('h4', {}, inp(g, 'label'),
          h('button', { class: 'btn btn-danger btn-sm', onclick: function () { if (confirm(t('confirm_del_cat') + ' «' + g.label + '»?')) { content.gallery.splice(i, 1); setDirty(true); render(); } } }, t('del_cat'))),
        imageList(g.images)));
    });
  }

  /* ---------- Банери / Контент ---------- */
  function renderContentTab(c) {
    var ht = content.hotel;
    c.appendChild(h('div', { class: 'card' }, h('h3', {}, t('hotel_info')),
      h('div', { class: 'grid grid-2' },
        field(t('f_name'), inp(ht, 'name')), field(t('f_slogan_hero'), inp(ht, 'tagline')),
        field(t('f_address'), inp(ht, 'address')), field(t('f_city'), inp(ht, 'city')),
        field(t('f_phone'), inp(ht, 'phone')), field(t('f_email'), inp(ht, 'email')),
        field(t('f_currency'), inp(ht, 'currency')), field(t('f_stars'), inp(ht, 'stars', { type: 'number', min: 1 })),
        field('Facebook', inp(ht.social, 'facebook')), field('Instagram', inp(ht.social, 'instagram')), field('LinkedIn', inp(ht.social, 'linkedin')))));

    c.appendChild(h('div', { class: 'card' }, h('h3', {}, t('hero_card')),
      field(t('f_slogan'), inp(content.hero, 'tagline')),
      h('label', { class: 'field' }, t('bg_photos_slider')), imageList(content.hero.images)));

    var bm = { wellness: 'banner_wellness', restaurant: 'banner_restaurant', winery: 'banner_winery' };
    Object.keys(bm).forEach(function (key) {
      var b = content.banners[key]; if (!b) return;
      c.appendChild(h('div', { class: 'card' }, h('h3', {}, t(bm[key])),
        h('div', { class: 'grid grid-2' },
          field(t('f_eyebrow'), inp(b, 'eyebrow')), field(t('f_button'), inp(b, 'button')),
          h('div', { class: 'field', style: 'grid-column:1/-1' }, h('label', {}, t('f_title')), inp(b, 'title', { textarea: true }))),
        h('label', { class: 'field' }, t('bg_photos')), imageList(b.images)));
    });

    var FAQK = ['location', 'breakfast', 'parking', 'pets', 'checkin', 'children', 'wellness', 'restaurant', 'winery', 'tasting', 'languages', 'vouchers', 'payment'];
    var faqCard = h('div', { class: 'card' }, h('h3', {}, t('faq_card')));
    FAQK.forEach(function (k) { if (content.faq[k] == null) content.faq[k] = ''; faqCard.appendChild(field(t('faq_' + k), inp(content.faq, k, { textarea: true }))); });
    c.appendChild(faqCard);
  }

  /* ---------- База знань ---------- */
  function renderKnowledge(c) {
    if (!content.knowledge) content.knowledge = [];
    var list = h('div', {});
    var search = h('input', { type: 'text', placeholder: t('kb_search_ph'), style: 'flex:1;max-width:360px;background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:.55em .7em;color:#fff' });
    search.addEventListener('input', function () {
      var q = search.value.toLowerCase();
      [].forEach.call(list.querySelectorAll('.item'), function (el) { el.style.display = (!q || (el.getAttribute('data-search') || '').indexOf(q) !== -1) ? '' : 'none'; });
    });
    c.appendChild(h('div', { class: 'add-bar' },
      h('button', { class: 'btn btn-gold', onclick: function () { content.knowledge.unshift({ id: 'kb-' + Date.now().toString(36), category: 'Hotel', title: t('new_entry'), keywords: [], content: '' }); setDirty(true); render(); } }, t('add_entry')),
      search,
      h('span', { style: 'color:var(--muted);align-self:center;font-size:.8rem' }, content.knowledge.length + ' ' + t('kb_hint_suffix'))));
    c.appendChild(list);
    content.knowledge.forEach(function (k, i) { list.appendChild(kbItem(k, i)); });
  }
  function kbItem(k, i) {
    var searchStr = ((k.title || '') + ' ' + (k.category || '') + ' ' + ((k.keywords || []).join(' ')) + ' ' + (k.content || '')).toLowerCase();
    var titleI = inp(k, 'title');
    var head = h('div', { class: 'item-head' },
      h('div', { class: 'it-title' }, k.title || t('no_name')),
      h('span', { class: 'badge' }, k.category || '—'),
      h('div', { class: 'ord' },
        h('button', { title: t('up'), onclick: function () { if (i > 0) { content.knowledge.splice(i - 1, 0, content.knowledge.splice(i, 1)[0]); setDirty(true); render(); } } }, '▲'),
        h('button', { title: t('down'), onclick: function () { if (i < content.knowledge.length - 1) { content.knowledge.splice(i + 1, 0, content.knowledge.splice(i, 1)[0]); setDirty(true); render(); } } }, '▼')),
      h('button', { class: 'btn btn-danger btn-sm', onclick: function () { if (confirm(t('confirm_del_entry') + ' «' + (k.title || '') + '»?')) { content.knowledge.splice(i, 1); setDirty(true); render(); } } }, t('del')));
    titleI.addEventListener('input', function () { head.querySelector('.it-title').textContent = titleI.value || t('no_name'); });
    var fields = h('div', { class: 'grid grid-2' },
      field(t('f_title'), titleI),
      field(t('f_category'), inp(k, 'category', { placeholder: t('cat_ph') })),
      h('div', { style: 'grid-column:1/-1' }, arrField(t('f_keywords'), k, 'keywords', t('keywords_hint'))),
      h('div', { class: 'field', style: 'grid-column:1/-1' }, h('label', {}, t('f_content')), inp(k, 'content', { textarea: true })));
    return h('div', { class: 'item', 'data-search': searchStr }, head, fields);
  }

  /* ---------- AI ---------- */
  function renderAI(c) {
    var s = content.settings; if (!s.ai) s.ai = { persona: '', priorities: '' }; if (!s.chat) s.chat = { greeting: '', quickReplies: [] };
    var modelSel = h('select', {});
    [['claude-sonnet-4-5', t('model_sonnet45')], ['claude-sonnet-5', t('model_sonnet5')], ['claude-opus-4-8', t('model_opus')], ['claude-haiku-4-5-20251001', t('model_haiku')]].forEach(function (m) {
      var o = h('option', { value: m[0] }, m[1]); if (s.model === m[0]) o.selected = true; modelSel.appendChild(o);
    });
    modelSel.addEventListener('change', function () { s.model = modelSel.value; setDirty(true); });
    c.appendChild(h('div', { class: 'card' }, h('h3', {}, t('model_behavior')),
      field(t('f_model'), modelSel, t('model_hint')),
      field(t('f_persona'), inp(s.ai, 'persona', { textarea: true }), t('persona_hint')),
      field(t('f_priorities'), inp(s.ai, 'priorities', { textarea: true }), t('priorities_hint'))));

    var chipsBox = h('div', { class: 'chips-edit' });
    function drawChips() {
      chipsBox.innerHTML = '';
      (s.chat.quickReplies || []).forEach(function (q, i) { chipsBox.appendChild(h('span', { class: 'chip-edit' }, q, h('button', { onclick: function () { s.chat.quickReplies.splice(i, 1); setDirty(true); drawChips(); } }, '×'))); });
      chipsBox.appendChild(h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { var v = prompt(t('qr_prompt')); if (v) { s.chat.quickReplies = s.chat.quickReplies || []; s.chat.quickReplies.push(v.trim()); setDirty(true); drawChips(); } } }, t('add_btn')));
    }
    drawChips();
    c.appendChild(h('div', { class: 'card' }, h('h3', {}, t('chat_greet_card')),
      field(t('f_greeting'), inp(s.chat, 'greeting', { textarea: true }), t('greeting_hint')),
      h('label', { class: 'field' }, t('quickreplies_label')), chipsBox));
  }

  /* ---------- Переписки ---------- */
  function renderConversations(c) {
    var list = h('div', { class: 'convo-list' }, h('div', { class: 'empty' }, t('loading')));
    var view = h('div', { class: 'convo-view' }, h('div', { class: 'empty' }, t('select_convo')));
    c.appendChild(h('div', { class: 'convo-layout' }, list, view));
    api('GET', '/admin/api/conversations').then(function (d) {
      list.innerHTML = '';
      if (!d.list || !d.list.length) { list.appendChild(h('div', { class: 'empty' }, t('no_convos'))); pendingConvoId = null; return; }
      var byId = {};
      d.list.forEach(function (cv) {
        var item = h('div', { class: 'c-item' },
          h('div', { class: 'c-top' }, h('span', {}, cv.mode === 'claude' ? '🤖 Claude' : '💬 demo'), h('span', {}, fmtTime(cv.lastAt))),
          h('div', { class: 'c-prev' }, cv.preview || t('empty_val')),
          cv.reservations && cv.reservations.length ? h('span', { class: 'badge' }, '✓ ' + cv.reservations.join(', ')) : null);
        item.addEventListener('click', function () { selectConvo(list, view, item, cv.id); });
        list.appendChild(item); byId[cv.id] = item;
      });
      if (pendingConvoId) {
        var it = byId[pendingConvoId];
        if (it) { selectConvo(list, view, it, pendingConvoId); if (it.scrollIntoView) it.scrollIntoView({ block: 'nearest' }); }
        else toast(t('convo_notfound'), 'err');
        pendingConvoId = null;
      }
    });
  }
  function selectConvo(list, view, item, id) { list.querySelectorAll('.c-item').forEach(function (x) { x.classList.remove('active'); }); item.classList.add('active'); openConversation(id, view); }
  function openResConvo(r) { if (!r.sessionId) { toast(t('no_convo_for_res'), ''); return; } pendingConvoId = r.sessionId; goTab('conversations'); }
  function openConversation(id, view) {
    view.innerHTML = '<div class="empty">' + t('loading') + '</div>';
    api('GET', '/admin/api/conversation?id=' + encodeURIComponent(id)).then(function (cvn) {
      view.innerHTML = '';
      if (!cvn || !cvn.turns) { view.appendChild(h('div', { class: 'empty' }, t('empty2'))); return; }
      cvn.turns.forEach(function (tt) {
        var meta = tt.meta ? renderMeta(tt.meta) : null;
        view.appendChild(h('div', { class: 'msg ' + (tt.role === 'user' ? 'user' : 'bot') },
          h('div', { html: escapeHtml(tt.text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>') }), meta, h('div', { class: 'mt' }, fmtTime(tt.at))));
      });
      view.scrollTop = view.scrollHeight;
    });
  }
  function renderMeta(m) {
    if (m.reservation) return h('div', { class: 'msg-meta' }, t('meta_reservation') + m.reservation);
    if (m.proposed) return h('div', { class: 'msg-meta' }, t('meta_proposed') + (Array.isArray(m.proposed) ? m.proposed.join(', ') : m.proposed));
    if (m.tool) return h('div', { class: 'msg-meta' }, '⚙ ' + m.tool);
    return null;
  }

  /* ---------- Бронювання ---------- */
  function renderReservations(c) {
    var wrap = h('div', { class: 'card' }, h('h3', {}, t('all_reservations')), h('div', { class: 'empty' }, t('loading')));
    c.appendChild(wrap);
    api('GET', '/admin/api/reservations').then(function (d) {
      wrap.innerHTML = ''; wrap.appendChild(h('h3', {}, t('all_reservations') + ' (' + (d.list ? d.list.length : 0) + ')'));
      if (!d.list || !d.list.length) { wrap.appendChild(h('div', { class: 'empty' }, t('no_reservations'))); return; }
      var rows = d.list.map(function (r) {
        var hasChat = !!r.sessionId;
        var tr = h('tr', { class: hasChat ? 'clickable' : '', title: hasChat ? t('open_convo_row') : t('no_convo_tooltip') },
          h('td', {}, h('span', { class: 'conf' }, r.confirmation)),
          h('td', {}, r.item || ((r.roomId || r.packageId) || '')),
          h('td', {}, r.name || '—'),
          h('td', {}, (r.checkin || '') + (r.checkout ? ' → ' + r.checkout : '')),
          h('td', {}, (r.total != null ? r.total.toLocaleString('cs-CZ') + ' ' + (r.currency || 'CZK') : '')),
          h('td', {}, h('span', { class: 'chip' + (hasChat ? ' chip-link' : '') }, (r.source || t('source_site')) + (hasChat ? ' ↗' : ''))),
          h('td', {}, fmtTime(r.at)));
        if (hasChat) tr.addEventListener('click', function () { openResConvo(r); });
        return tr;
      });
      wrap.appendChild(h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' },
        h('thead', {}, h('tr', {}, [t('th_num'), t('th_item'), t('th_guest'), t('th_dates'), t('th_total'), t('th_source'), t('th_time')].map(function (x) { return h('th', {}, x); }))),
        h('tbody', {}, rows))));
      wrap.appendChild(h('p', { style: 'color:var(--muted);font-size:.78rem;margin-top:12px' }, t('res_hint')));
    });
  }

  /* ---------- utils ---------- */
  function fmtTime(ts) { if (!ts) return ''; var d = new Date(ts); return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function escapeHtml(s) { return String(s || '').replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  /* ---------- start ---------- */
  document.querySelectorAll('.lang-toggle button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-lang') === AL); });
  applyStatic();
  if (TOKEN) boot(); else showLogin();
})();
