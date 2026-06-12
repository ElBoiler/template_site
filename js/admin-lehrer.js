/* ============================================================
   CHAMISSO-GRUNDSCHULE — admin-lehrer.js
   Lehrerbereich tab logic for admin.html
   ============================================================ */
'use strict';

(function () {

  var $ = function (id) { return document.getElementById(id); };
  var _lbData = null;

  function showStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'admin-status admin-status--' + (kind || 'info');
    setTimeout(function () { if (el.textContent === msg) el.textContent = ''; }, 4000);
  }

  function escAttr(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function escText(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function apiKey() { return localStorage.getItem('bds_api_key'); }

  /* ── API helpers ──────────────────────────────────────── */

  async function fetchTeacherContent() {
    var key = apiKey();
    if (!key) return {};
    try {
      var res = await fetch('/api/teacher/content', { headers: { 'Authorization': 'Bearer ' + key } });
      if (res.ok) return await res.json();
    } catch (_) {}
    return {};
  }

  async function saveTeacherContent(content) {
    var key = apiKey();
    if (!key) return { ok: false, error: 'no_api_key' };
    try {
      var res = await fetch('/api/teacher/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify(content)
      });
      var j = await res.json().catch(function () { return {}; });
      return j.ok ? { ok: true } : { ok: false, error: j.error || ('http_' + res.status) };
    } catch (_) {
      return { ok: false, error: 'network' };
    }
  }

  /* ── Teacher password ─────────────────────────────────── */

  function initPwSection() {
    var btn   = $('lbSetPwBtn');
    var input = $('lbAdminPwInput');
    var st    = $('lbPwStatus');
    if (!btn) return;
    btn.addEventListener('click', async function () {
      var pw = input.value.trim();
      if (pw.length < 8) { showStatus(st, 'Mindestens 8 Zeichen erforderlich.', 'error'); return; }
      btn.disabled = true;
      showStatus(st, 'Wird gesetzt …', 'info');
      try {
        var res = await fetch('/api/teacher/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey() },
          body: JSON.stringify({ password: pw })
        });
        var j = await res.json().catch(function () { return {}; });
        showStatus(st, j.ok ? 'Passwort gesetzt ✓' : 'Fehler: ' + (j.error || 'Unbekannt'), j.ok ? 'success' : 'error');
        if (j.ok) input.value = '';
      } catch (_) {
        showStatus(st, 'Fehler beim Speichern.', 'error');
      }
      btn.disabled = false;
    });
  }

  /* ── Handbuch ─────────────────────────────────────────── */

  function renderHandbuch(tc) {
    var editor  = $('lbHandbuchEditor');
    var pdfRow  = $('lbPdfCurrent');
    var pdfName = $('lbPdfName');
    if (editor) editor.value = (tc.handbuch && tc.handbuch.html) || '';
    if (pdfRow && pdfName) {
      var pdfKey = tc.handbuch && tc.handbuch.pdfKey;
      if (pdfKey) {
        pdfName.textContent = pdfKey.replace(/^\d+-[a-z0-9]+-/, '');
        pdfRow.hidden = false;
      } else {
        pdfRow.hidden = true;
      }
    }
  }

  function initHandbuch() {
    var fileInput = $('lbPdfFile');
    var removeBtn = $('lbPdfRemove');
    if (!fileInput) return;

    fileInput.addEventListener('change', async function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var st = $('lbPdfUploadStatus');
      showStatus(st, 'Wird hochgeladen …', 'info');
      var fd = new FormData();
      fd.append('file', file);
      fd.append('label', file.name);
      try {
        var res = await fetch('/api/teacher/upload', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + apiKey() },
          body: fd
        });
        var j = await res.json().catch(function () { return {}; });
        if (j.ok) {
          _lbData = _lbData || {};
          _lbData.handbuch = _lbData.handbuch || {};
          _lbData.handbuch.pdfKey = j.key;
          renderHandbuch(_lbData);
          showStatus(st, 'Hochgeladen ✓', 'success');
        } else {
          showStatus(st, 'Fehler: ' + (j.error || 'Unbekannt'), 'error');
        }
      } catch (_) {
        showStatus(st, 'Upload fehlgeschlagen.', 'error');
      }
      e.target.value = '';
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        if (!confirm('PDF-Anhang entfernen?')) return;
        _lbData = _lbData || {};
        _lbData.handbuch = _lbData.handbuch || {};
        _lbData.handbuch.pdfKey = null;
        renderHandbuch(_lbData);
      });
    }
  }

  /* ── Announcements ────────────────────────────────────── */

  function renderAnnouncements(items) {
    var list  = $('lbAnnList');
    var empty = $('lbAnnEmpty');
    if (!list) return;
    var sorted = (items || []).slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });
    if (!sorted.length) {
      list.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    list.innerHTML = sorted.map(function (a, i) {
      return (
        '<li class="ann-row" data-ann-i="' + i + '">' +
          '<div class="ann-row__inputs">' +
            '<input type="date" data-field="ann-date" value="' + escAttr(a.date || '') + '">' +
            '<input type="text" data-field="ann-title" placeholder="Titel" value="' + escAttr(a.title || '') + '">' +
            '<textarea data-field="ann-body" rows="3" placeholder="Inhalt (HTML erlaubt)">' + escText(a.body || '') + '</textarea>' +
          '</div>' +
          '<button type="button" class="btn-link btn-danger" data-action="remove-ann">Entfernen</button>' +
        '</li>'
      );
    }).join('');
  }

  function initAnnouncements() {
    var newBtn = $('lbNewAnnBtn');
    var list   = $('lbAnnList');
    if (newBtn) {
      newBtn.addEventListener('click', function () {
        _lbData = _lbData || {};
        _lbData.announcements = _lbData.announcements || [];
        _lbData.announcements.push({ id: String(Date.now()), date: '', title: '', body: '' });
        renderAnnouncements(_lbData.announcements);
      });
    }
    if (list) {
      list.addEventListener('click', function (e) {
        var rm = e.target.closest('[data-action="remove-ann"]');
        if (!rm) return;
        var i = Number(rm.closest('[data-ann-i]').dataset.annI);
        var sorted = (_lbData.announcements || []).slice().sort(function (a, b) {
          return (b.date || '').localeCompare(a.date || '');
        });
        var item = sorted[i];
        if (!confirm('Ankündigung löschen?')) return;
        _lbData.announcements = (_lbData.announcements || []).filter(function (a) { return a.id !== item.id; });
        renderAnnouncements(_lbData.announcements);
      });
    }
  }

  function collectAnnouncements() {
    var list = $('lbAnnList');
    if (!list) return _lbData.announcements || [];
    var sorted = (_lbData.announcements || []).slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });
    return Array.from(list.querySelectorAll('[data-ann-i]')).map(function (row, i) {
      var original = sorted[i] || {};
      return {
        id:    original.id || String(Date.now() + i),
        date:  row.querySelector('[data-field="ann-date"]').value.trim(),
        title: row.querySelector('[data-field="ann-title"]').value.trim(),
        body:  row.querySelector('[data-field="ann-body"]').value.trim()
      };
    }).filter(function (a) { return a.title || a.date; });
  }

  /* ── Links ────────────────────────────────────────────── */

  function renderLinks(items) {
    var list = $('lbLinksList');
    if (!list) return;
    list.innerHTML = (items || []).map(function (l, i) {
      return (
        '<li class="lb-link-row" data-link-i="' + i + '">' +
          '<input type="text"  class="lb-link-label" placeholder="Bezeichnung" value="' + escAttr(l.label || '') + '">' +
          '<input type="url"   class="lb-link-url"   placeholder="https://…"   value="' + escAttr(l.url   || '') + '">' +
          '<button type="button" class="btn-link btn-danger" data-action="remove-link">&times;</button>' +
        '</li>'
      );
    }).join('');
  }

  function initLinks() {
    var addBtn = $('lbAddLinkBtn');
    var list   = $('lbLinksList');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        _lbData = _lbData || {};
        _lbData.links = _lbData.links || [];
        _lbData.links.push({ label: '', url: '' });
        renderLinks(_lbData.links);
      });
    }
    if (list) {
      list.addEventListener('click', function (e) {
        if (!e.target.closest('[data-action="remove-link"]')) return;
        var i = Number(e.target.closest('[data-link-i]').dataset.linkI);
        (_lbData.links || []).splice(i, 1);
        renderLinks(_lbData.links);
      });
    }
  }

  function collectLinks() {
    var list = $('lbLinksList');
    if (!list) return (_lbData && _lbData.links) || [];
    return Array.from(list.querySelectorAll('.lb-link-row')).map(function (row) {
      return {
        label: row.querySelector('.lb-link-label').value.trim(),
        url:   row.querySelector('.lb-link-url').value.trim()
      };
    }).filter(function (l) { return l.label || l.url; });
  }

  /* ── Downloads ────────────────────────────────────────── */

  function renderDownloads(items) {
    var list = $('lbDlList');
    if (!list) return;
    list.innerHTML = (items || []).map(function (d, i) {
      return (
        '<li class="lb-dl-row" data-dl-i="' + i + '">' +
          '<span class="lb-dl-name">' + escText(d.name || d.key || '') + '</span>' +
          '<button type="button" class="btn-link btn-danger" data-action="remove-dl">Löschen</button>' +
        '</li>'
      );
    }).join('');
  }

  function initDownloads() {
    var fileInput = $('lbDlFile');
    var list      = $('lbDlList');
    if (!fileInput) return;

    fileInput.addEventListener('change', async function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var name = ($('lbDlName').value.trim()) || file.name;
      var st   = $('lbDlUploadStatus');
      showStatus(st, 'Wird hochgeladen …', 'info');
      var fd = new FormData();
      fd.append('file', file);
      fd.append('label', name);
      try {
        var res = await fetch('/api/teacher/upload', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + apiKey() },
          body: fd
        });
        var j = await res.json().catch(function () { return {}; });
        if (j.ok) {
          _lbData = _lbData || {};
          _lbData.downloads = _lbData.downloads || [];
          _lbData.downloads.push({ name: name, key: j.key });
          renderDownloads(_lbData.downloads);
          showStatus(st, 'Hochgeladen ✓', 'success');
          $('lbDlName').value = '';
        } else {
          showStatus(st, 'Fehler: ' + (j.error || 'Unbekannt'), 'error');
        }
      } catch (_) {
        showStatus(st, 'Upload fehlgeschlagen.', 'error');
      }
      e.target.value = '';
    });

    if (list) {
      list.addEventListener('click', function (e) {
        if (!e.target.closest('[data-action="remove-dl"]')) return;
        var i = Number(e.target.closest('[data-dl-i]').dataset.dlI);
        if (!confirm('Download löschen?')) return;
        (_lbData.downloads || []).splice(i, 1);
        renderDownloads(_lbData.downloads);
      });
    }
  }

  /* ── Save all ─────────────────────────────────────────── */

  function initSave() {
    var saveBtn = $('lbSaveBtn');
    var st      = $('lbSaveStatus');
    if (!saveBtn) return;
    saveBtn.addEventListener('click', async function () {
      _lbData = _lbData || {};
      var editor = $('lbHandbuchEditor');
      _lbData.handbuch = _lbData.handbuch || {};
      if (editor) _lbData.handbuch.html = editor.value;
      _lbData.announcements = collectAnnouncements();
      _lbData.links         = collectLinks();
      showStatus(st, 'Wird gespeichert …', 'info');
      var r = await saveTeacherContent(_lbData);
      showStatus(st, r.ok ? 'Gespeichert ✓' : 'Fehler: ' + r.error, r.ok ? 'success' : 'error');
    });
  }

  /* ── Public init (called from admin.js renderAll) ─────── */

  async function initLehrTab() {
    _lbData = await fetchTeacherContent();
    renderHandbuch(_lbData);
    renderAnnouncements(_lbData.announcements);
    renderLinks(_lbData.links);
    renderDownloads(_lbData.downloads);
  }

  window.initLehrTab = initLehrTab;

  initPwSection();
  initHandbuch();
  initAnnouncements();
  initLinks();
  initDownloads();
  initSave();

}());
