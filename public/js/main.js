/* Ryzlink — рендер секцій, слайдери, галерея-лайтбокс, модалка бронювання. */
(function () {
  'use strict';
  var DATA = window.RYZLINK_DATA;
  var BK = window.RYZLINK_BOOKING;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return n.toLocaleString('cs-CZ') + ' CZK'; };
  var IMGERR = "this.onerror=null;this.classList.add('img-failed');this.removeAttribute('src')";

  /* ============ МОВА (CZ / EN) ============ */
  var EN = window.RYZLINK_DATA_EN || null;
  var I18N = window.RZ_I18N || { cs: {}, en: {} };
  var LANG = localStorage.getItem('rz_site_lang') || 'cs';
  function T(k) { return (I18N[LANG] && I18N[LANG][k]) || (I18N.cs && I18N.cs[k]) || k; }
  function rL(r) { var e = (LANG === 'en' && EN && EN.rooms && EN.rooms[r.id]) || null; return { id: r.id, name: e ? e.name : r.name, short: e ? e.short : r.short, desc: e ? e.desc : r.desc, features: e ? e.features : r.features, img: r.img, capacity: r.capacity, size: r.size, price: r.price, gallery: r.gallery }; }
  function pL(p) { var e = (LANG === 'en' && EN && EN.packages && EN.packages[p.id]) || null; var o = {}; for (var k in p) o[k] = p[k]; if (e) { o.name = e.name; o.badge = e.badge; o.desc = e.desc; o.includes = e.includes; } return o; }
  function gLabel(g) { return (LANG === 'en' && EN && EN.gallery && EN.gallery[g.key]) || g.label; }
  function bL(b, key) { var e = (LANG === 'en' && EN && EN.banners && EN.banners[key]) || null; return { eyebrow: e ? e.eyebrow : b.eyebrow, title: e ? e.title : b.title, button: e ? e.button : b.button, images: b.images, target: b.target }; }
  function heroTag() { return (LANG === 'en' && EN && EN.hero && EN.hero.tagline) || DATA.hero.tagline; }
  function roomName(id) { var r = BK.getRoom(id); if (!r) return id; return (LANG === 'en' && EN && EN.rooms && EN.rooms[id] && EN.rooms[id].name) || r.name; }
  function roomDesc(id) { var r = BK.getRoom(id); if (!r) return ''; return (LANG === 'en' && EN && EN.rooms && EN.rooms[id] && EN.rooms[id].desc) || r.desc; }
  function pkgName(id) { var p = BK.getPackage(id); if (!p) return id; return (LANG === 'en' && EN && EN.packages && EN.packages[id] && EN.packages[id].name) || p.name; }
  function pkgDesc(id) { var p = BK.getPackage(id); if (!p) return ''; return (LANG === 'en' && EN && EN.packages && EN.packages[id] && EN.packages[id].desc) || p.desc; }

  function applyStaticI18n() {
    document.documentElement.lang = LANG;
    $$('[data-i18n]').forEach(function (el) { var v = T(el.getAttribute('data-i18n')); if (v) el.textContent = v; });
    $$('[data-i18n-html]').forEach(function (el) { var v = T(el.getAttribute('data-i18n-html')); if (v) el.innerHTML = v; });
    var ht = $('#heroTitle'); if (ht) ht.textContent = heroTag();
  }
  function setLang(lang) {
    if (lang === LANG) return;
    LANG = lang; localStorage.setItem('rz_site_lang', lang);
    $$('#langToggle button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-lang') === lang); });
    applyStaticI18n();
    renderRooms(); renderGallery(); renderBanners(); renderPackages();
    if (window.RyzlinkChat && window.RyzlinkChat.setLang) window.RyzlinkChat.setLang(lang);
  }
  function initLang() {
    $$('#langToggle button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === LANG);
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
    });
    applyStaticI18n();
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ask-key]'); if (t && window.RyzlinkChat) window.RyzlinkChat.ask(T(t.getAttribute('data-ask-key')));
    });
  }

  /* ============ HERO (крос-фейд) ============ */
  function renderHero() {
    var box = $('#heroSlider'); if (!box) return;
    box.innerHTML = DATA.hero.images.map(function (u, i) {
      return '<div class="hero-slide' + (i === 0 ? ' active' : '') + '" style="background-image:url(\'' + u + '\')"></div>';
    }).join('');
    crossfade($$('.hero-slide', box), 6000);
  }
  function crossfade(slides, ms) {
    if (slides.length < 2) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove('active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('active');
    }, ms);
  }

  /* ============ СЛАЙДЕР НОМЕРІВ ============ */
  var roomIdx = 0;
  function renderRooms() {
    var wrap = $('#roomsSlider'); if (!wrap) return;
    var track = document.createElement('div'); track.className = 'rooms-track'; track.id = 'roomsTrack';
    track.innerHTML = DATA.rooms.map(function (r0) {
      var r = rL(r0);
      return '' +
        '<div class="room-slide">' +
          '<div class="rs-media"><img src="' + r.img + '" alt="' + r.name + '" onerror="' + IMGERR + '"/></div>' +
          '<div class="rs-text">' +
            '<span class="eyebrow">' + T('room_eyebrow') + '</span>' +
            '<h3>' + r.name + '</h3>' +
            '<p>' + r.desc + '</p>' +
            '<div class="rs-meta"><span>' + T('room_upto') + ' <b>' + r.capacity + '</b> ' + T('room_guests') + '</span><span><b>' + r.size + '</b> m²</span><span><b>' + r.price.toLocaleString('cs-CZ') + '</b> ' + T('room_pernight') + '</span></div>' +
            '<div class="rs-actions">' +
              '<button class="btn btn-outline" data-showroom="' + r.id + '">' + T('room_showroom') + '</button>' +
              '<button class="btn btn-red" data-book-room="' + r.id + '">' + T('room_book') + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');
    wrap.innerHTML = ''; wrap.appendChild(track);
    var dots = $('#roomsDots');
    dots.innerHTML = DATA.rooms.map(function (_, i) { return '<button data-rd="' + i + '"' + (i === 0 ? ' class="active"' : '') + '></button>'; }).join('');
    dots.addEventListener('click', function (e) { var b = e.target.closest('[data-rd]'); if (b) goRoom(+b.getAttribute('data-rd')); });
    // свайп
    addSwipe(wrap, function (dir) { goRoom(roomIdx + dir); });
    goRoom(0);
  }
  function goRoom(i) {
    var n = DATA.rooms.length; roomIdx = (i + n) % n;
    var track = $('#roomsTrack'); if (track) track.style.transform = 'translateX(' + (-roomIdx * 100) + '%)';
    $$('#roomsDots button').forEach(function (d, k) { d.classList.toggle('active', k === roomIdx); });
  }

  /* ============ ГАЛЕРЕЯ (мозаїка + лайтбокс) ============ */
  function renderGallery() {
    var m = $('#galleryMosaic'); if (!m) return;
    var tall = { hotel: 1, restaurace: 1, vinarstvi: 1 };
    m.innerHTML = DATA.gallery.map(function (cat) {
      var cover = cat.images[0]; var label = gLabel(cat);
      return '<div class="g-tile' + (tall[cat.key] ? ' tall' : '') + '" data-cat="' + cat.key + '">' +
        '<img src="' + cover + '" alt="' + label + '" loading="lazy" onerror="' + IMGERR + '"/>' +
        '<span class="g-count">' + cat.images.length + ' ' + T('gallery_count') + '</span>' +
        '<span class="g-label">' + label + '</span></div>';
    }).join('');
    if (m._bound) return; m._bound = 1;
    m.addEventListener('click', function (e) {
      var t = e.target.closest('[data-cat]'); if (!t) return;
      var cat = DATA.gallery.filter(function (c) { return c.key === t.getAttribute('data-cat'); })[0];
      openLightbox(cat.images, 0, gLabel(cat));
    });
  }

  /* ============ БАНЕРИ ============ */
  function renderBanners() {
    $$('[data-banner]').forEach(function (sec) {
      var key = sec.getAttribute('data-banner');
      var b = DATA.banners[key]; if (!b) return; b = bL(b, key);
      sec.innerHTML =
        '<div class="banner-slider">' + b.images.map(function (u, i) {
          return '<div class="banner-slide' + (i === 0 ? ' active' : '') + '" style="background-image:url(\'' + u + '\')"></div>';
        }).join('') + '</div>' +
        '<div class="banner-inner reveal"><span class="eyebrow">' + b.eyebrow + '</span>' +
        '<h2>' + b.title + '</h2>' +
        '<button class="btn btn-red btn-lg" data-scroll="' + (b.target || '#top') + '">' + b.button + '</button></div>';
      crossfade($$('.banner-slide', sec), 7000);
    });
  }

  /* ============ СЛАЙДЕР ПАКЕТІВ ============ */
  var pkgIdx = 0;
  function renderPackages() {
    var track = $('#packagesTrack'); if (!track) return;
    track.innerHTML = DATA.packages.map(function (p0) {
      var p = pL(p0);
      return '' +
        '<article class="pkg-card">' +
          '<div class="pkg-photo"><img src="' + p.img + '" alt="' + p.name + '" loading="lazy" onerror="' + IMGERR + '"/>' +
            '<span class="pkg-badge">' + p.badge + '</span></div>' +
          '<div class="pkg-body"><h3>' + p.name + '</h3>' +
            '<div class="pkg-foot"><div class="pkg-price"><small>' + T('pkg_pricefrom') + '</small><strong>' + p.price.toLocaleString('cs-CZ') + ' ' + T('pkg_crowns') + '</strong></div>' +
            '<button class="pkg-go" data-book-pkg="' + p.id + '" aria-label="' + T('room_book') + '">▶</button></div>' +
          '</div>' +
        '</article>';
    }).join('');
    $('#pkgPrev').addEventListener('click', function () { goPkg(pkgIdx - 1); });
    $('#pkgNext').addEventListener('click', function () { goPkg(pkgIdx + 1); });
    addSwipe($('.packages-viewport'), function (dir) { goPkg(pkgIdx + dir); });
    window.addEventListener('resize', function () { goPkg(pkgIdx); });
    goPkg(0);
  }
  function pkgPerView() { return window.innerWidth <= 600 ? 1 : (window.innerWidth <= 1080 ? 2 : 3); }
  function goPkg(i) {
    var track = $('#packagesTrack'); if (!track) return;
    var per = pkgPerView(); var max = Math.max(0, DATA.packages.length - per);
    pkgIdx = Math.max(0, Math.min(i, max));
    var card = track.children[0];
    var step = card ? (card.getBoundingClientRect().width + 24) : 0;
    track.style.transform = 'translateX(' + (-pkgIdx * step) + 'px)';
  }

  /* ============ ЛАЙТБОКС ============ */
  var lb = { imgs: [], i: 0, cap: '' };
  function openLightbox(imgs, start, cap) {
    lb.imgs = imgs; lb.i = start || 0; lb.cap = cap || '';
    $('#lightbox').classList.add('open'); $('#lightbox').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; showLb();
  }
  function showLb() {
    $('#lbImg').src = lb.imgs[lb.i];
    $('#lbCaption').textContent = lb.cap + ' · ' + (lb.i + 1) + '/' + lb.imgs.length;
  }
  function closeLb() { $('#lightbox').classList.remove('open'); $('#lightbox').setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  function lbStep(d) { lb.i = (lb.i + d + lb.imgs.length) % lb.imgs.length; showLb(); }
  function initLightbox() {
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { lbStep(-1); });
    $('#lbNext').addEventListener('click', function () { lbStep(1); });
    $('#lightbox').addEventListener('click', function (e) { if (e.target.id === 'lightbox') closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!$('#lightbox').classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') lbStep(-1);
      if (e.key === 'ArrowRight') lbStep(1);
    });
    addSwipe($('#lightbox'), function (dir) { lbStep(dir); });
  }

  /* ============ Свайп-хелпер ============ */
  function addSwipe(el, cb) {
    if (!el) return; var x0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) cb(dx < 0 ? 1 : -1); x0 = null;
    });
  }

  /* ============ Хедер / скрол / службове ============ */
  function initChrome() {
    var header = $('#siteHeader');
    var toTop = $('#toTop');
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 60);
      if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
    };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    var nav = $('#mainNav'), toggle = $('#navToggle');
    if (toggle) toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    $$('#mainNav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-scroll]'); if (!t) return;
      var el = $(t.getAttribute('data-scroll')); if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function initBookingBarDates() {
    var t = new Date(), t1 = new Date(t.getTime() + 86400000);
    var ci = $('#bbCheckin'), co = $('#bbCheckout');
    if (ci) { ci.value = iso(t); ci.min = iso(t); }
    if (co) { co.value = iso(t1); co.min = iso(t1); }
  }

  /* ============================================================
     МОДАЛКА БРОНЮВАННЯ
     ============================================================ */
  var modal, modalBody;
  var state = { checkin: '', checkout: '', adults: 2, children: 0, roomId: null, packageId: null };
  function openModal() { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }

  function stepSearch(preRoomId) {
    state.roomId = preRoomId || null; state.packageId = null;
    var room = preRoomId ? BK.getRoom(preRoomId) : null;
    modalBody.innerHTML =
      '<div class="mb-head"><span class="eyebrow">' + T('m_rez') + '</span><h3>' + (room ? roomName(preRoomId) : T('m_check')) + '</h3></div>' +
      (room ? '<p style="color:var(--muted);margin-top:-4px">' + roomDesc(preRoomId) + '</p>' : '') +
      '<div class="mb-form">' +
        '<div><label>' + T('m_arrival') + '</label><input type="date" id="mCheckin" value="' + (state.checkin || '') + '"/></div>' +
        '<div><label>' + T('m_departure') + '</label><input type="date" id="mCheckout" value="' + (state.checkout || '') + '"/></div>' +
        '<div><label>' + T('m_adults') + '</label><input type="number" id="mAdults" min="1" max="6" value="' + state.adults + '"/></div>' +
        '<div><label>' + T('m_children') + '</label><input type="number" id="mChildren" min="0" max="6" value="' + state.children + '"/></div>' +
      '</div><div class="mb-actions"><button class="btn btn-red btn-lg" id="mSearchBtn">' + T('m_checkbtn') + '</button></div>' + aiHint();
    $('#mSearchBtn').addEventListener('click', function () {
      state.checkin = $('#mCheckin').value; state.checkout = $('#mCheckout').value;
      state.adults = +$('#mAdults').value || 1; state.children = +$('#mChildren').value || 0;
      var res = BK.searchAvailability(state);
      if (!res.ok) { flash(res.error); return; }
      if (state.roomId) { var o = res.options.filter(function (x) { return x.roomId === state.roomId; })[0]; if (o && o.available) return stepGuest(res, o); }
      stepResults(res);
    });
  }
  function stepResults(res) {
    var list = res.options.map(function (o) {
      var noteLoc = (o.available && o.roomsLeft === 1) ? T('m_lastroom') : (!o.available ? T('m_noplace') : '');
      var btn = o.available ? '<button class="btn btn-red" data-pick="' + o.roomId + '">' + T('m_select') + '</button>' : '<span style="font-size:.78rem;color:var(--muted)">' + noteLoc + '</span>';
      var img = o.img ? '<img class="mb-room-img" src="/' + o.img.replace(/^\//, '') + '" alt="" onerror="this.style.visibility=\'hidden\'"/>' : '<span class="mb-room-img"></span>';
      return '<div class="mb-room' + (o.available ? '' : ' off') + '">' + img +
        '<div class="mb-room-body">' +
          '<div class="row"><strong>' + roomName(o.roomId) + '</strong><span>' + money(o.total) + '</span></div>' +
          '<div class="row" style="color:var(--muted);font-size:.82rem"><span>' + res.nights + ' ' + T('nights') + ' · ' + T('room_upto') + ' ' + o.capacity + ' ' + T('room_guests') + ' · ' + o.size + ' m²</span>' + (o.available && noteLoc ? '<span style="color:var(--gold-soft)">' + noteLoc + '</span>' : '') + '</div>' +
          '<div class="mb-actions" style="margin-top:8px">' + btn + '</div>' +
        '</div></div>';
    }).join('');
    modalBody.innerHTML = '<div class="mb-head"><span class="eyebrow">' + res.checkin + ' → ' + res.checkout + ' · ' + res.guests + ' ' + T('room_guests') + '</span><h3>' + T('m_available') + '</h3></div>' + list +
      '<div class="mb-actions"><button class="btn btn-outline" id="mBack">' + T('m_changedate') + '</button></div>' + aiHint();
    $('#mBack').addEventListener('click', function () { stepSearch(); });
    $$('[data-pick]', modalBody).forEach(function (b) { b.addEventListener('click', function () { stepGuest(res, res.options.filter(function (x) { return x.roomId === b.getAttribute('data-pick'); })[0]); }); });
  }
  function stepGuest(res, opt) {
    state.roomId = opt.roomId;
    modalBody.innerHTML = '<div class="mb-head"><span class="eyebrow">' + T('m_laststep') + '</span><h3>' + T('m_yourdata') + '</h3></div>' +
      '<div class="mb-summary"><div class="row"><span>' + T('m_room') + '</span><strong>' + roomName(opt.roomId) + '</strong></div>' +
        '<div class="row"><span>' + T('m_term') + '</span><span>' + res.checkin + ' → ' + res.checkout + ' (' + res.nights + ' ' + T('nights') + ')</span></div>' +
        '<div class="row"><span>' + T('m_guests') + '</span><span>' + res.adults + ' ' + T('m_adults') + ' · ' + res.children + ' ' + T('m_children') + '</span></div>' +
        '<div class="row total"><span>' + T('m_total') + '</span><span>' + money(opt.total) + '</span></div></div>' +
      '<div class="mb-form"><div class="full"><label>' + T('m_name') + '</label><input id="gName" placeholder="' + T('m_name_ph') + '"/></div>' +
        '<div><label>' + T('m_email') + '</label><input id="gEmail" type="email"/></div><div><label>' + T('m_phone') + '</label><input id="gPhone"/></div></div>' +
      '<div class="mb-actions"><button class="btn btn-outline" id="mBack2">←</button><button class="btn btn-red btn-lg" id="mConfirm">' + T('m_confirm') + '</button></div>' +
      '<p class="mb-note">' + T('m_demo') + '</p>';
    $('#mBack2').addEventListener('click', function () { stepResults(res); });
    $('#mConfirm').addEventListener('click', function () {
      var out = BK.createReservation({ name: $('#gName').value, email: $('#gEmail').value, phone: $('#gPhone').value, roomId: state.roomId, checkin: state.checkin, checkout: state.checkout, adults: state.adults, children: state.children });
      if (!out.ok) { flash(out.error); return; } stepSuccess(out);
    });
  }
  function stepPackage(pkgId) {
    var p = BK.getPackage(pkgId); if (!p) return;
    state.packageId = pkgId; state.roomId = null;
    modalBody.innerHTML = '<div class="mb-head"><span class="eyebrow">' + T('m_pkg') + ' · ' + p.nights + ' ' + T('nights') + '</span><h3>' + pkgName(pkgId) + '</h3></div>' +
      '<p style="color:var(--muted);margin-top:-4px">' + pkgDesc(pkgId) + '</p>' +
      '<div class="mb-summary"><div class="row total"><span>' + T('m_pricefrom') + '</span><span>' + money(p.price) + '</span></div></div>' +
      '<div class="mb-form"><div><label>' + T('m_prefarrival') + '</label><input type="date" id="gCi" value="' + (state.checkin || '') + '"/></div><div><label>' + T('m_guests') + '</label><input type="number" id="gAd" min="1" max="6" value="2"/></div>' +
        '<div class="full"><label>' + T('m_name') + '</label><input id="gName" placeholder="' + T('m_name_ph') + '"/></div><div><label>' + T('m_email') + '</label><input id="gEmail" type="email"/></div><div><label>' + T('m_phone') + '</label><input id="gPhone"/></div></div>' +
      '<div class="mb-actions"><button class="btn btn-red btn-lg" id="mConfirmP">' + T('m_bookpkg') + '</button></div><p class="mb-note">' + T('m_demo') + '</p>';
    $('#mConfirmP').addEventListener('click', function () {
      var out = BK.createReservation({ name: $('#gName').value, email: $('#gEmail').value, phone: $('#gPhone').value, packageId: pkgId, checkin: $('#gCi').value, adults: +$('#gAd').value || 2 });
      if (!out.ok) { flash(out.error); return; } stepSuccess(out);
    });
  }
  function stepSuccess(out) {
    if (window.RyzlinkLog) window.RyzlinkLog.reservation(out, 'modal');
    var itemLoc = state.packageId ? (T('m_pkg') + ' «' + pkgName(state.packageId) + '»') : roomName(state.roomId);
    modalBody.innerHTML = '<div class="mb-success"><div class="check">✓</div><div class="mb-head" style="text-align:center"><span class="eyebrow">' + T('m_confirmed') + '</span></div>' +
      '<p style="color:var(--muted)">' + T('m_confnum') + '</p><div class="mb-conf">' + out.confirmation + '</div>' +
      '<div class="mb-summary" style="text-align:left"><div class="row"><span>' + (state.packageId ? T('m_pkg') : T('m_room')) + '</span><strong>' + itemLoc + '</strong></div>' +
        (out.checkin ? '<div class="row"><span>' + T('m_term') + '</span><span>' + out.checkin + (out.checkout ? ' → ' + out.checkout : '') + '</span></div>' : '') +
        '<div class="row"><span>' + T('m_guest') + '</span><span>' + out.name + '</span></div><div class="row total"><span>' + T('m_total') + '</span><span>' + money(out.total) + '</span></div></div>' +
      '<div class="mb-ai-hint">' + T('m_success') + '</div>' +
      '<div class="mb-actions" style="margin-top:16px"><button class="btn btn-outline" id="mDone">' + T('m_done') + '</button></div></div>';
    $('#mDone').addEventListener('click', closeModal);
  }
  function aiHint() { return '<div class="mb-ai-hint">' + T('m_aihint') + '</div>'; }
  function flash(msg) { var old = modalBody.querySelector('.flash-msg'); if (old) old.remove(); var el = document.createElement('div'); el.className = 'mb-note flash-msg'; el.style.marginTop = '10px'; el.textContent = msg; modalBody.appendChild(el); }

  function initBooking() {
    modal = $('#bookingModal'); modalBody = $('#modalBody');
    var bar = $('#bookingBar');
    if (bar) bar.addEventListener('submit', function (e) {
      e.preventDefault();
      state.checkin = $('#bbCheckin').value; state.checkout = $('#bbCheckout').value;
      state.adults = +$('#bbAdults').value || 1; state.children = +$('#bbChildren').value || 0;
      var res = BK.searchAvailability(state); openModal();
      if (!res.ok) { stepSearch(); flash(res.error); } else { stepResults(res); }
    });
    document.addEventListener('click', function (e) {
      var openBtn = e.target.closest('[data-open-booking]');
      var roomBtn = e.target.closest('[data-book-room]');
      var pkgBtn = e.target.closest('[data-book-pkg]');
      var showBtn = e.target.closest('[data-showroom]');
      var closeBtn = e.target.closest('[data-close-booking]');
      if (openBtn) { openModal(); syncDates(); stepSearch(); }
      if (roomBtn) { openModal(); syncDates(); stepSearch(roomBtn.getAttribute('data-book-room')); }
      if (pkgBtn) { openModal(); syncDates(); stepPackage(pkgBtn.getAttribute('data-book-pkg')); }
      if (showBtn) { var r = BK.getRoom(showBtn.getAttribute('data-showroom')); if (r) openLightbox(r.gallery || [r.img], 0, r.name); }
      if (closeBtn) closeModal();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }
  function syncDates() {
    var ci = $('#bbCheckin'), co = $('#bbCheckout'), a = $('#bbAdults'), c = $('#bbChildren');
    if (ci && ci.value) state.checkin = ci.value; if (co && co.value) state.checkout = co.value;
    if (a) state.adults = +a.value || 2; if (c) state.children = +c.value || 0;
  }
  window.RyzlinkBookingUI = { open: function (o) { o = o || {}; openModal(); syncDates(); if (o.checkin) state.checkin = o.checkin; if (o.checkout) state.checkout = o.checkout; if (o.packageId) stepPackage(o.packageId); else stepSearch(o.roomId || null); } };

  /* ============ init ============ */
  document.addEventListener('DOMContentLoaded', function () {
    renderHero(); renderRooms(); renderGallery(); renderBanners(); renderPackages();
    initLightbox(); initChrome(); initReveal(); initBookingBarDates(); initBooking(); initLang();
  });
})();
