/*
 * Synelo Studio — брендування/водяний знак демо.
 * Позначає сайт як демонстрацію Synelo Studio (без юридичної відповідальності).
 * Самодостатній: тонкий діагональний водяний знак + клікабельний бейдж.
 */
(function () {
  'use strict';
  var URL = 'https://www.synelostudio.com/uk';

  // --- Діагональний повторюваний водяний знак (SVG-плитка) ---
  var svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='380' height='240'>" +
    "<text x='30' y='140' transform='rotate(-28 190 120)' " +
    "font-family='Montserrat, Arial, sans-serif' font-size='19' font-weight='700' " +
    "letter-spacing='2' fill='rgba(255,255,255,0.06)'>SYNELO&#160;STUDIO&#160;·&#160;DEMO</text></svg>";
  var tile = "url(\"data:image/svg+xml;utf8," + encodeURIComponent(svg) + "\")";

  var css = document.createElement('style');
  css.textContent = [
    '#synelo-wm{position:fixed;inset:0;z-index:95;pointer-events:none;background-image:' + tile + ';background-repeat:repeat}',
    '@media print{#synelo-wm{background-image:' + tile + '}}',
    '.synelo-badge{position:fixed;left:16px;bottom:16px;z-index:150;display:flex;align-items:center;gap:9px;',
    'background:rgba(20,19,24,.82);backdrop-filter:blur(6px);border:1px solid rgba(200,162,76,.35);',
    'border-radius:30px;padding:8px 14px 8px 10px;text-decoration:none;color:#eee;',
    'font-family:Montserrat,Arial,sans-serif;box-shadow:0 12px 30px -14px rgba(0,0,0,.7);transition:.2s;max-width:80vw}',
    '.synelo-badge:hover{border-color:#c8a24c;transform:translateY(-2px)}',
    '.synelo-badge .sb-dot{width:26px;height:26px;border-radius:50%;flex:none;background:conic-gradient(from 220deg,#c8a24c,#bb1a24,#c8a24c);',
    'display:grid;place-items:center;color:#1a1014;font-weight:800;font-size:.8rem}',
    '.synelo-badge .sb-txt{display:flex;flex-direction:column;line-height:1.15;min-width:0}',
    '.synelo-badge .sb-txt b{font-size:.8rem;font-weight:700;letter-spacing:.02em;white-space:nowrap}',
    '.synelo-badge .sb-txt span{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:#c8a24c;white-space:nowrap}',
    '.synelo-badge .sb-arrow{color:#c8a24c;font-size:.9rem;margin-left:2px}',
    '@media(max-width:560px){.synelo-badge{left:10px;bottom:10px;padding:6px 12px 6px 8px}.synelo-badge .sb-txt span{display:none}}'
  ].join('');
  document.head.appendChild(css);

  function build() {
    if (document.getElementById('synelo-wm')) return;
    var wm = document.createElement('div');
    wm.id = 'synelo-wm';
    wm.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wm);

    var badge = document.createElement('a');
    badge.className = 'synelo-badge';
    // В адмінці (є бічне меню) — бейдж справа; на сайті — зліва (щоб не збігатися з чатом справа).
    var isAdmin = !!document.querySelector('.sidebar');
    if (isAdmin) { badge.style.left = 'auto'; badge.style.right = '16px'; }
    badge.href = URL;
    badge.target = '_blank';
    badge.rel = 'noopener noreferrer';
    badge.title = 'Демо створено Synelo Studio — демонстрація AI-автоматизацій';
    badge.innerHTML =
      '<span class="sb-dot">S</span>' +
      '<span class="sb-txt"><b>Synelo Studio</b><span>AI demo</span></span>' +
      '<span class="sb-arrow">↗</span>';
    document.body.appendChild(badge);
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
