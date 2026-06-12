/* ============================================================
   CHAMISSO-GRUNDSCHULE — lehrerbereich.js
   Auth flow and content rendering for /lehrerbereich.
   Depends on: DOM ready (deferred via DOMContentLoaded).
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'bds_teacher_key';

  /* ── DOM refs ── */
  var loginSection    = document.getElementById('lbLogin');
  var loginForm       = document.getElementById('lbLoginForm');
  var pwInput         = document.getElementById('lbPwInput');
  var loginError      = document.getElementById('lbLoginError');
  var contentSection  = document.getElementById('lbContent');
  var logoutBtn       = document.getElementById('lbLogout');

  if (!loginSection) return; // not on this page

  /* ── Auth helpers ── */
  function storedKey() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (_) { return ''; }
  }

  function saveKey(k) {
    try { localStorage.setItem(STORAGE_KEY, k); } catch (_) {}
  }

  function clearKey() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  function apiBearerHeaders(key) {
    return { 'Authorization': 'Bearer ' + key };
  }

  /* ── Ping: returns true if key is valid ── */
  function ping(key) {
    return fetch('/api/teacher/ping', { headers: apiBearerHeaders(key) })
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });
  }

  /* ── Fetch teacher content ── */
  function fetchContent(key) {
    return fetch('/api/teacher/content', { headers: apiBearerHeaders(key) })
      .then(function (r) {
        if (!r.ok) throw new Error('auth');
        return r.json();
      });
  }

  /* ── Render helpers ── */
  function renderHandbuch(hb) {
    var bodyEl = document.getElementById('lbHandbuchBody');
    var pdfRow = document.getElementById('lbHandbuchPdf');
    var pdfLink = document.getElementById('lbHandbuchPdfLink');

    if (!hb || !hb.html) {
      if (bodyEl) bodyEl.innerHTML = '<p><em>Kein Inhalt vorhanden.</em></p>';
    } else {
      if (bodyEl) bodyEl.innerHTML = hb.html;
    }

    if (pdfRow && pdfLink && hb && hb.pdfKey) {
      var key = hb.pdfKey.replace(/^teacher-file:/, '');
      pdfLink.href = '/teacher-files/' + key;
      pdfRow.hidden = false;
    }
  }

  function renderAnnouncements(items) {
    var list  = document.getElementById('lbAnnouncementsList');
    var empty = document.getElementById('lbAnnouncementsEmpty');
    if (!list) return;

    if (!items || !items.length) {
      list.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    var sorted = items.slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });

    list.innerHTML = sorted.map(function (item) {
      var dateStr = '';
      if (item.date) {
        try {
          dateStr = new Date(item.date).toLocaleDateString('de-DE', {
            day: '2-digit', month: 'long', year: 'numeric'
          });
        } catch (_) { dateStr = item.date; }
      }
      return (
        '<li class="lb-item">' +
          (dateStr ? '<span class="lb-item-date">' + escHtml(dateStr) + '</span>' : '') +
          '<strong class="lb-item-title">' + escHtml(item.title || '') + '</strong>' +
          (item.body ? '<div class="lb-item-body prose">' + item.body + '</div>' : '') +
        '</li>'
      );
    }).join('');
  }

  function renderLinks(items) {
    var list  = document.getElementById('lbLinksList');
    var empty = document.getElementById('lbLinksEmpty');
    if (!list) return;

    if (!items || !items.length) {
      list.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    list.innerHTML = items.map(function (item) {
      return (
        '<li class="lb-link-item">' +
          '<a href="' + escAttr(item.url || '#') + '" class="lb-link" target="_blank" rel="noopener noreferrer">' +
            '<span class="lb-link-icon" aria-hidden="true">&#8599;</span>' +
            escHtml(item.label || item.url || '') +
          '</a>' +
        '</li>'
      );
    }).join('');
  }

  function renderDownloads(items) {
    var list  = document.getElementById('lbDownloadsList');
    var empty = document.getElementById('lbDownloadsEmpty');
    if (!list) return;

    if (!items || !items.length) {
      list.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    list.innerHTML = items.map(function (item) {
      var fileKey = (item.key || '').replace(/^teacher-file:/, '');
      return (
        '<li class="lb-dl-item">' +
          '<a href="/teacher-files/' + escAttr(fileKey) + '" class="lb-dl-link" download>' +
            '<span class="lb-dl-icon" aria-hidden="true">&#8659;</span>' +
            escHtml(item.name || fileKey) +
          '</a>' +
        '</li>'
      );
    }).join('');
  }

  /* ── Utility: minimal HTML escaping ── */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── Show/hide states ── */
  function showLogin(errVisible) {
    contentSection.hidden = true;
    loginSection.hidden   = false;
    if (loginError) loginError.hidden = !errVisible;
    if (pwInput) { pwInput.value = ''; pwInput.focus(); }
  }

  function showContent(tc) {
    loginSection.hidden   = true;
    contentSection.hidden = false;
    renderHandbuch(tc.handbuch || {});
    renderAnnouncements(tc.announcements || []);
    renderLinks(tc.links || []);
    renderDownloads(tc.downloads || []);
  }

  /* ── Bootstrap: check stored key ── */
  function bootstrap() {
    var key = storedKey();
    if (!key) { showLogin(false); return; }

    ping(key).then(function (valid) {
      if (!valid) { clearKey(); showLogin(false); return; }
      fetchContent(key)
        .then(showContent)
        .catch(function () { clearKey(); showLogin(false); });
    });
  }

  /* ── Login form submit ── */
  loginForm && loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = pwInput ? pwInput.value.trim() : '';
    if (!pw) return;

    var submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '…'; }
    if (loginError) loginError.hidden = true;

    ping(pw).then(function (valid) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Anmelden'; }
      if (!valid) { showLogin(true); return; }

      saveKey(pw);
      fetchContent(pw)
        .then(showContent)
        .catch(function () { clearKey(); showLogin(false); });
    });
  });

  /* ── Logout ── */
  logoutBtn && logoutBtn.addEventListener('click', function () {
    clearKey();
    showLogin(false);
  });

  /* ── Init ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
