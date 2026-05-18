/* ============================================================
   CHAMISSO-GRUNDSCHULE — admin.js
   ============================================================ */

'use strict';

(function () {

  const $ = (id) => document.getElementById(id);

  const loginSection  = $('loginSection');
  const editorSection = $('editorSection');
  const apiKeyInput   = $('apiKeyInput');
  const loginBtn      = $('loginBtn');
  const loginError    = $('loginError');
  const logoutBtn     = $('logoutBtn');

  const tabs    = document.querySelectorAll('.admin-tab');
  const panels  = document.querySelectorAll('.admin-panel');

  const postsList  = $('postsList');
  const postsEmpty = $('postsEmpty');
  const newPostBtn = $('newPostBtn');

  const postEditor      = $('postEditor');
  const postIdInput     = $('postId');
  const postTitleInput  = $('postTitle');
  const postSlugInput   = $('postSlug');
  const postDateInput   = $('postDate');
  const postImageInput  = $('postImage');
  const postExcerptInput= $('postExcerpt');
  const postBodyInput   = $('postBody');
  const savePostBtn     = $('savePostBtn');
  const deletePostBtn   = $('deletePostBtn');
  const cancelPostBtn   = $('cancelPostBtn');
  const postSaveStatus  = $('postSaveStatus');

  const contactAddress  = $('contactAddress');
  const contactPhone    = $('contactPhone');
  const contactEmail    = $('contactEmail');
  const contactHours    = $('contactHours');
  const socialFacebook  = $('socialFacebook');
  const socialInstagram = $('socialInstagram');
  const socialTwitter   = $('socialTwitter');
  const saveContactBtn  = $('saveContactBtn');
  const contactSaveStatus = $('contactSaveStatus');

  const eventsListEl     = $('eventsList');
  const newEventBtn      = $('newEventBtn');
  const saveEventsBtn    = $('saveEventsBtn');
  const eventsSaveStatus = $('eventsSaveStatus');


  let data      = null;
  let setupMode = false;


  function escAttr(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function escText(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  function showStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'admin-status admin-status--' + (kind || 'info');
    setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 4000);
  }


  /* ── Auth ─────────────────────────────────────────────── */
  async function tryLogin(key) {
    try {
      const res = await fetch('/api/ping', { headers: { 'Authorization': `Bearer ${key}` } });
      return res.ok;
    } catch { return false; }
  }

  loginBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) { loginError.textContent = 'Bitte Passwort eingeben.'; return; }
    loginError.textContent = '';
    loginBtn.disabled = true;

    if (setupMode) {
      if (key.length < 8) {
        loginError.textContent = 'Mindestens 8 Zeichen erforderlich.';
        loginBtn.disabled = false;
        return;
      }
      const r = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: key })
      });
      const json = await r.json().catch(() => ({}));
      loginBtn.disabled = false;
      if (json.ok) {
        localStorage.setItem('bds_api_key', key);
        enterEditor();
      } else {
        loginError.textContent = 'Fehler: ' + (json.error || 'Setup fehlgeschlagen');
      }
      return;
    }

    const ok = await tryLogin(key);
    loginBtn.disabled = false;
    if (!ok) {
      loginError.textContent = 'Anmeldung fehlgeschlagen. Falsches Passwort oder Worker nicht aktiv.';
      return;
    }
    localStorage.setItem('bds_api_key', key);
    enterEditor();
  });

  apiKeyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('bds_api_key');
    location.reload();
  });


  /* ── Editor entry ─────────────────────────────────────── */
  async function enterEditor() {
    loginSection.hidden = true;
    editorSection.hidden = false;
    logoutBtn.hidden = false;
    data = await window.getContent();
    renderAll();
  }

  function renderAll() {
    renderPostsList();
    fillContactFields();
    renderEvents();
    loadThemeIntoPickers();
  }


  /* ── Tabs ─────────────────────────────────────────────── */
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('is-active'));
      t.classList.add('is-active');
      const which = t.dataset.tab;
      panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === which));
    });
  });


  /* ── Posts ────────────────────────────────────────────── */
  function renderPostsList() {
    if (!data) return;
    const posts = (data.posts || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    postsEmpty.hidden = posts.length > 0;
    postsList.innerHTML = posts.map(p =>
      `<li class="post-row" data-id="${escAttr(p.id || p.slug)}">` +
        `<div class="post-row__main">` +
          `<p class="post-row__date">${escText(p.date || '')}</p>` +
          `<h3 class="post-row__title">${escText(p.title || '(Ohne Titel)')}</h3>` +
          `<p class="post-row__excerpt">${escText(p.excerpt || '')}</p>` +
        `</div>` +
        `<div class="post-row__actions">` +
          `<button type="button" class="btn-link" data-action="edit">Bearbeiten</button>` +
        `</div>` +
      `</li>`
    ).join('');
  }

  postsList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="edit"]');
    if (!btn) return;
    const id = btn.closest('.post-row').dataset.id;
    openPostEditor(id);
  });

  newPostBtn.addEventListener('click', () => openPostEditor(null));

  function openPostEditor(id) {
    const post = id ? (data.posts || []).find(p => (p.id || p.slug) === id) : null;
    postIdInput.value      = post ? (post.id || '') : '';
    postTitleInput.value   = post ? (post.title || '') : '';
    postSlugInput.value    = post ? (post.slug || '') : '';
    postDateInput.value    = post ? (post.date || '') : new Date().toISOString().slice(0, 10);
    postImageInput.value   = post ? (post.image || '') : '';
    postExcerptInput.value = post ? (post.excerpt || '') : '';
    postBodyInput.value    = post ? (post.body || '') : '';
    deletePostBtn.style.display = post ? '' : 'none';
    postEditor.hidden = false;
    postTitleInput.focus();
  }

  function closePostEditor() {
    postEditor.hidden = true;
    postSaveStatus.textContent = '';
  }

  cancelPostBtn.addEventListener('click', closePostEditor);
  postEditor.addEventListener('click', (e) => { if (e.target === postEditor) closePostEditor(); });

  postTitleInput.addEventListener('blur', () => {
    if (!postSlugInput.value.trim() && postTitleInput.value.trim()) {
      postSlugInput.value = slugify(postTitleInput.value);
    }
  });

  savePostBtn.addEventListener('click', async () => {
    const title = postTitleInput.value.trim();
    if (!title) { showStatus(postSaveStatus, 'Titel fehlt.', 'error'); return; }

    const slug = postSlugInput.value.trim() || slugify(title);
    const date = postDateInput.value || new Date().toISOString().slice(0, 10);
    const id   = postIdInput.value.trim() || `${date}-${slug}`;

    const updated = {
      id, slug, date, title,
      excerpt: postExcerptInput.value.trim(),
      image:   postImageInput.value.trim(),
      body:    postBodyInput.value
    };

    data.posts = data.posts || [];
    const existingIdx = data.posts.findIndex(p => (p.id || p.slug) === (postIdInput.value || id));
    if (existingIdx >= 0) data.posts[existingIdx] = updated;
    else                  data.posts.push(updated);

    showStatus(postSaveStatus, 'Wird gespeichert …', 'info');
    const r = await window.saveContent(data);
    if (r.ok) {
      showStatus(postSaveStatus, 'Gespeichert ✓', 'success');
      renderPostsList();
      setTimeout(closePostEditor, 700);
    } else {
      showStatus(postSaveStatus, 'Speichern fehlgeschlagen: ' + r.error, 'error');
    }
  });

  deletePostBtn.addEventListener('click', async () => {
    const id = postIdInput.value;
    if (!id) return;
    if (!confirm('Beitrag wirklich löschen?')) return;
    data.posts = (data.posts || []).filter(p => (p.id || p.slug) !== id);
    const r = await window.saveContent(data);
    if (r.ok) {
      showStatus(postSaveStatus, 'Gelöscht.', 'success');
      renderPostsList();
      setTimeout(closePostEditor, 700);
    } else {
      showStatus(postSaveStatus, 'Löschen fehlgeschlagen: ' + r.error, 'error');
    }
  });


  /* ── Contact ──────────────────────────────────────────── */
  function fillContactFields() {
    const c = (data && data.contact) || {};
    const s = c.social || {};
    contactAddress.value  = c.address || '';
    contactPhone.value    = c.phone || '';
    contactEmail.value    = c.email || '';
    contactHours.value    = c.hours || '';
    socialFacebook.value  = s.facebook || '';
    socialInstagram.value = s.instagram || '';
    socialTwitter.value   = s.twitter || '';
  }

  saveContactBtn.addEventListener('click', async () => {
    data.contact = data.contact || {};
    data.contact.address = contactAddress.value.trim();
    data.contact.phone   = contactPhone.value.trim();
    data.contact.email   = contactEmail.value.trim();
    data.contact.hours   = contactHours.value.trim();
    data.contact.social  = {
      facebook:  socialFacebook.value.trim(),
      instagram: socialInstagram.value.trim(),
      twitter:   socialTwitter.value.trim()
    };
    showStatus(contactSaveStatus, 'Wird gespeichert …', 'info');
    const r = await window.saveContent(data);
    showStatus(contactSaveStatus,
      r.ok ? 'Gespeichert ✓' : 'Fehler: ' + r.error,
      r.ok ? 'success' : 'error'
    );
  });


  /* ── Events ───────────────────────────────────────────── */
  function renderEvents() {
    const events = (data.homepage && data.homepage.veranstaltungen) || [];
    eventsListEl.innerHTML = events.map((ev, i) =>
      `<li class="event-row" data-i="${i}">` +
        `<div class="event-row__inputs">` +
          `<input type="date"  data-field="date"  value="${escAttr(ev.date || '')}">` +
          `<input type="text"  data-field="title" placeholder="Titel"  value="${escAttr(ev.title || '')}">` +
          `<textarea data-field="body" rows="2" placeholder="Beschreibung">${escText(ev.body || '')}</textarea>` +
        `</div>` +
        `<button type="button" class="btn-link btn-danger" data-action="remove">Entfernen</button>` +
      `</li>`
    ).join('');
  }

  eventsListEl.addEventListener('click', (e) => {
    const rm = e.target.closest('button[data-action="remove"]');
    if (!rm) return;
    const i = Number(rm.closest('.event-row').dataset.i);
    data.homepage = data.homepage || {};
    data.homepage.veranstaltungen = (data.homepage.veranstaltungen || []).filter((_, idx) => idx !== i);
    renderEvents();
  });

  newEventBtn.addEventListener('click', () => {
    data.homepage = data.homepage || {};
    data.homepage.veranstaltungen = data.homepage.veranstaltungen || [];
    data.homepage.veranstaltungen.push({ date: '', title: '', body: '' });
    renderEvents();
  });

  saveEventsBtn.addEventListener('click', async () => {
    data.homepage = data.homepage || {};
    const out = [];
    eventsListEl.querySelectorAll('.event-row').forEach(row => {
      out.push({
        date:  row.querySelector('[data-field="date"]').value.trim(),
        title: row.querySelector('[data-field="title"]').value.trim(),
        body:  row.querySelector('[data-field="body"]').value.trim()
      });
    });
    data.homepage.veranstaltungen = out.filter(e => e.title || e.date);
    showStatus(eventsSaveStatus, 'Wird gespeichert …', 'info');
    const r = await window.saveContent(data);
    showStatus(eventsSaveStatus,
      r.ok ? 'Gespeichert ✓' : 'Fehler: ' + r.error,
      r.ok ? 'success' : 'error'
    );
  });


  /* ── Bootstrap ────────────────────────────────────────── */
  (async function init() {
    const stored = localStorage.getItem('bds_api_key');
    if (stored && await tryLogin(stored)) {
      enterEditor();
      return;
    }
    try {
      const r = await fetch('/api/setup');
      const d = await r.json();
      if (d.needsSetup) {
        setupMode = true;
        loginSection.querySelector('.admin-help').textContent =
          'Kein Passwort gesetzt. Geben Sie ein neues Passwort ein (mind. 8 Zeichen) und klicken Sie „Anmelden", um es dauerhaft zu speichern.';
        loginBtn.textContent = 'Passwort festlegen';
      }
    } catch (_) { /* worker not reachable */ }
    apiKeyInput.focus();
  })();


  /* ============================================================
     COLOUR SCHEME SECTION
     ============================================================ */

  const COLOUR_DEFS = [
    { id: 'clr-primary',      prop: '--clr-primary',      label: 'Primär (Nav / Footer)',        def: '#0B304C' },
    { id: 'clr-accent',       prop: '--clr-accent',        label: 'Akzent (Buttons / Links)',     def: '#EECE03' },
    { id: 'clr-bg',           prop: '--clr-bg',             label: 'Seitenhintergrund',            def: '#FFFFFF' },
    { id: 'clr-text',         prop: '--clr-text',           label: 'Fließtext',                    def: '#333333' },
    { id: 'clr-surface',      prop: '--clr-surface',        label: 'Kartenhintergrund',            def: '#F8FAFC' },
    { id: 'clr-accent-light', prop: '--clr-accent-light',  label: 'Akzent Hell',                  def: '#F1EFE3' },
    { id: 'clr-accent-hover', prop: '--clr-accent-hover',  label: 'Akzent Hover',                 def: '#D3B502' },
    { id: 'clr-muted',        prop: '--clr-muted',          label: 'Gedämpfter Text',              def: '#64748B' },
    { id: 'clr-border',       prop: '--clr-border',         label: 'Rahmenfarbe',                  def: '#E2E8F0' },
    { id: 'grad-start',       prop: null,                    label: 'Hero-Gradient: Anfang',       def: '#0B304C' },
    { id: 'grad-end',         prop: null,                    label: 'Hero-Gradient: Ende',         def: '#63B9D3' },
  ];

  /* ── Colour utilities ─────────────────────────────────────── */

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }
  function hslToHex(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    if (s === 0) { const v = Math.round(l * 255); return rgbToHex(v, v, v); }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const hue2rgb = (p2, q2, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p2 + (q2 - p2) * 6 * t;
      if (t < 1/2) return q2;
      if (t < 2/3) return p2 + (q2 - p2) * (2/3 - t) * 6;
      return p2;
    };
    return rgbToHex(
      Math.round(hue2rgb(p, q, h + 1/3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1/3) * 255)
    );
  }
  function isValidHex(s) { return /^#[0-9a-fA-F]{6}$/.test(s); }

  /* ── Picker helpers ───────────────────────────────────────── */

  function getPickerVal(id)      { const e = $(`picker-${id}`); return e ? e.value : null; }
  function setPickerVal(id, hex) {
    if (!isValidHex(hex)) return;
    const p = $(`picker-${id}`), h = $(`hex-${id}`);
    if (p) p.value = hex;
    if (h) { h.value = hex; h.classList.remove('is-invalid'); }
  }

  function applyPreview() {
    const root = document.documentElement;
    COLOUR_DEFS.forEach(d => { if (d.prop) root.style.setProperty(d.prop, getPickerVal(d.id) || d.def); });
    const gs = getPickerVal('grad-start') || '#0B304C';
    const ge = getPickerVal('grad-end')   || '#63B9D3';
    root.style.setProperty('--gradient-hero', `linear-gradient(135deg, ${gs} 0%, ${ge} 100%)`);
  }

  function collectTheme() {
    const t = {};
    COLOUR_DEFS.forEach(d => { if (d.prop) t[d.prop] = getPickerVal(d.id) || d.def; });
    const gs = getPickerVal('grad-start') || '#0B304C';
    const ge = getPickerVal('grad-end')   || '#63B9D3';
    t['--gradient-hero'] = `linear-gradient(135deg, ${gs} 0%, ${ge} 100%)`;
    return t;
  }

  function loadThemeIntoPickers() {
    if (!$('themeColourGrid')) return;
    const theme = (data && data.theme) || {};
    COLOUR_DEFS.forEach(d => { if (d.prop && theme[d.prop]) setPickerVal(d.id, theme[d.prop]); });
    const grad = theme['--gradient-hero'];
    if (grad) {
      const m = grad.match(/#[0-9a-fA-F]{6}/gi);
      if (m && m[0]) setPickerVal('grad-start', m[0]);
      if (m && m[1]) setPickerVal('grad-end',   m[1]);
    }
    applyPreview();
  }

  /* ── Build colour grid ────────────────────────────────────── */

  function buildColourGrid() {
    const grid = $('themeColourGrid');
    if (!grid) return;
    grid.innerHTML = '';
    COLOUR_DEFS.forEach(def => {
      const row = document.createElement('div');
      row.className = 'theme-colour-row';
      row.innerHTML =
        `<input type="color" id="picker-${def.id}" class="theme-colour-picker" value="${def.def}">` +
        `<input type="text"  id="hex-${def.id}"    class="theme-colour-hex" maxlength="7" placeholder="${def.def}" value="${def.def}">` +
        `<label for="picker-${def.id}" class="theme-colour-label">${def.label}</label>`;
      const picker = row.querySelector('.theme-colour-picker');
      const hexEl  = row.querySelector('.theme-colour-hex');
      picker.addEventListener('input', () => { hexEl.value = picker.value; applyPreview(); });
      hexEl.addEventListener('input', () => {
        const v = hexEl.value.trim();
        if (isValidHex(v)) { picker.value = v; hexEl.classList.remove('is-invalid'); applyPreview(); }
        else hexEl.classList.toggle('is-invalid', v.length >= 4);
      });
      grid.appendChild(row);
    });
  }

  /* ── Image seed ───────────────────────────────────────────── */

  let colorThief = null;
  try { colorThief = new ColorThief(); } catch (_) { /* CDN unavailable */ }

  function handleImageFile(file) {
    if (!file || !file.type.match(/^image\/(jpeg|png|gif|avif|webp)$/)) return;
    if (!colorThief) { showStatus($('themeSaveStatus'), 'Farb-Bibliothek nicht geladen.', 'error'); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let swatches;
      try {
        swatches = colorThief.getPalette(img, 6).map(([r, g, b]) => ({ r, g, b, hex: rgbToHex(r, g, b) }));
      } catch (_) { swatches = [{ r: 11, g: 48, b: 76, hex: '#0b304c' }]; }

      const byL  = [...swatches].sort((a, b) => rgbToHsl(a.r, a.g, a.b).l - rgbToHsl(b.r, b.g, b.b).l);
      const prim = byL[0];
      const rest = swatches.filter(s => s !== prim);
      const acc  = rest.length
        ? rest.reduce((best, s) => rgbToHsl(s.r, s.g, s.b).s > rgbToHsl(best.r, best.g, best.b).s ? s : best, rest[0])
        : prim;

      const pH = rgbToHsl(prim.r, prim.g, prim.b), aH = rgbToHsl(acc.r, acc.g, acc.b);
      const primary = pH.l > 20 ? hslToHex(pH.h, Math.min(pH.s, 65), 18) : prim.hex;

      const seeded = {
        'clr-primary':      primary,
        'clr-accent':       acc.hex,
        'clr-accent-hover': hslToHex(aH.h, aH.s, Math.max(aH.l - 15, 5)),
        'clr-accent-light': hslToHex(aH.h, Math.min(aH.s, 40), 95),
        'clr-text':         hslToHex(pH.h, Math.min(pH.s, 20), 20),
        'grad-start':       primary,
        'grad-end':         hslToHex(aH.h, Math.max(aH.s - 20, 20), Math.min(aH.l + 10, 80)),
      };
      Object.entries(seeded).forEach(([id, hex]) => setPickerVal(id, hex));

      const thumb = $('themeImgThumbnail'), row = $('themeExtractedRow');
      if (thumb) { thumb.onload = () => URL.revokeObjectURL(url); thumb.src = url; }
      if (row) row.hidden = false;
      const swEl = $('themeSwatches');
      if (swEl) swEl.innerHTML = swatches.map(s =>
        `<div class="theme-swatch" style="background:${s.hex}" title="${s.hex}"></div>`
      ).join('');

      applyPreview();
    };
    img.src = url;
  }

  /* ── Event wiring ─────────────────────────────────────────── */

  const themeDropZone   = $('themeDropZone');
  const themeImageInput = $('themeImageInput');
  themeImageInput.addEventListener('change', e => handleImageFile(e.target.files[0]));
  themeDropZone.addEventListener('dragover', e => { e.preventDefault(); themeDropZone.classList.add('drag-over'); });
  themeDropZone.addEventListener('dragleave', () => themeDropZone.classList.remove('drag-over'));
  themeDropZone.addEventListener('drop', e => { e.preventDefault(); themeDropZone.classList.remove('drag-over'); handleImageFile(e.dataTransfer.files[0]); });
  themeDropZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); themeImageInput.click(); } });

  $('themeApplyBtn').addEventListener('click', async () => {
    if (!data) { showStatus($('themeSaveStatus'), 'Bitte zuerst anmelden.', 'error'); return; }
    const theme = collectTheme();
    data.theme = theme;
    showStatus($('themeSaveStatus'), 'Wird gespeichert …', 'info');
    const r = await window.saveContent(data);
    if (r.ok) { window.applyAndCacheTheme(theme); showStatus($('themeSaveStatus'), 'Farbschema gespeichert ✓', 'success'); }
    else showStatus($('themeSaveStatus'), 'Fehler: ' + r.error, 'error');
  });

  $('themeResetBtn').addEventListener('click', async () => {
    if (!data) { showStatus($('themeSaveStatus'), 'Bitte zuerst anmelden.', 'error'); return; }
    delete data.theme;
    COLOUR_DEFS.forEach(d => setPickerVal(d.id, d.def));
    applyPreview();
    showStatus($('themeSaveStatus'), 'Wird zurückgesetzt …', 'info');
    const r = await window.saveContent(data);
    if (r.ok) { window.removeTheme(); showStatus($('themeSaveStatus'), 'Auf Standard zurückgesetzt ✓', 'success'); }
    else showStatus($('themeSaveStatus'), 'Fehler: ' + r.error, 'error');
  });

  buildColourGrid();

}());
