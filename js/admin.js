/* ============================================================
   CHAMISSO-GRUNDSCHULE — admin.js
   Minimal admin: posts (Beiträge), contact, events.
   Page-body editing is deferred — pages currently come from
   the static build (pages/*.json) and are not user-editable
   here. To extend, add a "Seiten" tab + form, persisting via
   data.pages[route] = { title, body }.
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


  let data = null;


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
      id,
      slug,
      date,
      title,
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
    } else {
      apiKeyInput.focus();
    }
  })();


  /* ============================================================
     COLOUR SCHEME SECTION
     ============================================================ */

  let colorThief        = null;
  try { colorThief = new ColorThief(); } catch (_) { /* CDN unavailable */ }

  let extractedSwatches = [];   // [{ hex, r, g, b }, ...]
  let pendingPrimary    = null; // hex string
  let pendingAccent     = null; // hex string

  /* ── Colour utilities ─────────────────────────────────── */

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
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
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hue2rgb = (p2, q2, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p2 + (q2 - p2) * 6 * t;
        if (t < 1/2) return q2;
        if (t < 2/3) return p2 + (q2 - p2) * (2/3 - t) * 6;
        return p2;
      };
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
  }

  function isValidHex(s) { return /^#[0-9a-fA-F]{6}$/.test(s); }

  /**
   * Given two hex colours, compute the full theme object.
   * Primary is darkened to L≤20 so it works on nav/footer backgrounds.
   */
  function computeTheme(primaryHex, accentHex) {
    const pRgb = hexToRgb(primaryHex);
    const pHsl = rgbToHsl(pRgb.r, pRgb.g, pRgb.b);
    const aRgb = hexToRgb(accentHex);
    const aHsl = rgbToHsl(aRgb.r, aRgb.g, aRgb.b);

    const primary     = pHsl.l > 20 ? hslToHex(pHsl.h, Math.min(pHsl.s, 65), 18) : primaryHex;
    const accentHover = hslToHex(aHsl.h, aHsl.s, Math.max(aHsl.l - 15, 5));
    const accentLight = hslToHex(aHsl.h, Math.min(aHsl.s, 40), 95);
    const text        = hslToHex(pHsl.h, Math.min(pHsl.s, 20), 20);

    return {
      '--clr-primary':      primary,
      '--clr-accent':       accentHex,
      '--clr-accent-hover': accentHover,
      '--clr-accent-light': accentLight,
      '--clr-text':         text,
      '--gradient-hero':    `linear-gradient(135deg, ${primary} 0%, ${accentHex} 100%)`,
    };
  }

  /* ── DOM refs ─────────────────────────────────────────── */

  const themeDropZone    = $('themeDropZone');
  const themeImageInput  = $('themeImageInput');
  const themePaletteCard = $('themePaletteCard');
  const themeSwatchesEl  = $('themeSwatches');
  const themeImgThumb    = $('themeImgThumbnail');
  const rolePopupPrimary = $('rolePopupPrimary');
  const rolePopupAccent  = $('rolePopupAccent');
  const roleHexPrimary   = $('roleHexPrimary');
  const roleHexAccent    = $('roleHexAccent');
  const roleDotPrimary   = $('roleDotPrimary');
  const roleDotAccent    = $('roleDotAccent');
  const themeSaveStatus  = $('themeSaveStatus');

  /* ── UI helpers ───────────────────────────────────────── */

  function setRoleColour(role, hex) {
    if (role === 'Primary') {
      pendingPrimary = hex;
      roleDotPrimary.style.background = hex;
      roleHexPrimary.value = hex;
      roleHexPrimary.classList.remove('is-invalid');
    } else {
      pendingAccent = hex;
      roleDotAccent.style.background = hex;
      roleHexAccent.value = hex;
      roleHexAccent.classList.remove('is-invalid');
    }
  }

  function previewTheme() {
    if (!pendingPrimary || !pendingAccent) return;
    const theme = computeTheme(pendingPrimary, pendingAccent);
    Object.entries(theme).forEach(([p, v]) =>
      document.documentElement.style.setProperty(p, v)
    );
  }

  function buildSwatchPopup(popupEl, role) {
    popupEl.innerHTML = '';
    extractedSwatches.forEach(sw => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-swatch';
      btn.style.background = sw.hex;
      btn.title = sw.hex;
      btn.setAttribute('role', 'option');
      btn.addEventListener('click', () => {
        setRoleColour(role, sw.hex);
        previewTheme();
        popupEl.classList.add('hidden');
      });
      popupEl.appendChild(btn);
    });
  }

  function renderExtractedSwatches() {
    themeSwatchesEl.innerHTML = '';
    extractedSwatches.forEach(sw => {
      const div = document.createElement('div');
      div.className = 'theme-swatch';
      div.style.background = sw.hex;
      div.title = sw.hex;
      themeSwatchesEl.appendChild(div);
    });
  }

  /* ── Auto role assignment ─────────────────────────────── */

  function autoAssignRoles(swatches) {
    const sorted = [...swatches].sort((a, b) =>
      rgbToHsl(a.r, a.g, a.b).l - rgbToHsl(b.r, b.g, b.b).l
    );
    const primary  = sorted[0];
    const rest     = swatches.filter(s => s !== primary);
    const accent   = rest.length
      ? rest.reduce((best, s) =>
          rgbToHsl(s.r, s.g, s.b).s > rgbToHsl(best.r, best.g, best.b).s ? s : best,
          rest[0])
      : primary;
    return { primary: primary.hex, accent: accent.hex };
  }

  /* ── Image upload & extraction ────────────────────────── */

  function handleImageFile(file) {
    if (!file || !file.type.match(/^image\/(jpeg|png|gif)$/)) return;
    if (!colorThief) {
      showStatus(themeSaveStatus, 'Farb-Bibliothek nicht geladen.', 'error');
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const palette = colorThief.getPalette(img, 6);
        extractedSwatches = palette.map(([r, g, b]) => ({ r, g, b, hex: rgbToHex(r, g, b) }));
      } catch (_) {
        extractedSwatches = [{ r: 11, g: 48, b: 76, hex: '#0b304c' }];
      }

      const { primary, accent } = autoAssignRoles(extractedSwatches);
      setRoleColour('Primary', primary);
      setRoleColour('Accent',  accent);

      themeImgThumb.src = url;
      renderExtractedSwatches();
      buildSwatchPopup(rolePopupPrimary, 'Primary');
      buildSwatchPopup(rolePopupAccent,  'Accent');
      previewTheme();

      themePaletteCard.hidden = false;
      URL.revokeObjectURL(url);
    };

    img.crossOrigin = 'anonymous';
    img.src = url;
  }

  /* ── Hex input sync ───────────────────────────────────── */

  function wireHexInput(inputEl, role) {
    inputEl.addEventListener('input', () => {
      const val = inputEl.value.trim();
      if (isValidHex(val)) {
        inputEl.classList.remove('is-invalid');
        if (role === 'Primary') {
          pendingPrimary = val;
          roleDotPrimary.style.background = val;
        } else {
          pendingAccent = val;
          roleDotAccent.style.background = val;
        }
        previewTheme();
      } else {
        inputEl.classList.toggle('is-invalid', val.length >= 4);
      }
    });
  }

  /* ── Event wiring ─────────────────────────────────────── */

  themeImageInput.addEventListener('change', e => handleImageFile(e.target.files[0]));

  themeDropZone.addEventListener('dragover', e => {
    e.preventDefault();
    themeDropZone.classList.add('drag-over');
  });
  themeDropZone.addEventListener('dragleave', () => themeDropZone.classList.remove('drag-over'));
  themeDropZone.addEventListener('drop', e => {
    e.preventDefault();
    themeDropZone.classList.remove('drag-over');
    handleImageFile(e.dataTransfer.files[0]);
  });
  themeDropZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); themeImageInput.click(); }
  });

  // Role picker toggle buttons
  ['Primary', 'Accent'].forEach(role => {
    const btn   = $(`rolePicker${role}`);
    const popup = $(`rolePopup${role}`);
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const other = role === 'Primary' ? 'Accent' : 'Primary';
      $(`rolePopup${other}`).classList.add('hidden');
      popup.classList.toggle('hidden');
    });
  });

  // Close popups on outside click
  document.addEventListener('click', () => {
    rolePopupPrimary.classList.add('hidden');
    rolePopupAccent.classList.add('hidden');
  });

  wireHexInput(roleHexPrimary, 'Primary');
  wireHexInput(roleHexAccent,  'Accent');

  // Apply
  $('themeApplyBtn').addEventListener('click', async () => {
    if (!pendingPrimary || !pendingAccent) {
      showStatus(themeSaveStatus, 'Bitte zuerst ein Bild hochladen.', 'error');
      return;
    }
    if (!data) { showStatus(themeSaveStatus, 'Bitte zuerst anmelden.', 'error'); return; }
    const theme = computeTheme(pendingPrimary, pendingAccent);
    data.theme = theme;
    showStatus(themeSaveStatus, 'Wird gespeichert …', 'info');
    const r = await window.saveContent(data);
    if (r.ok) {
      window.applyAndCacheTheme(theme);
      showStatus(themeSaveStatus, 'Farbschema gespeichert ✓', 'success');
    } else {
      showStatus(themeSaveStatus, 'Fehler: ' + r.error, 'error');
    }
  });

  // Reset
  $('themeResetBtn').addEventListener('click', async () => {
    if (!data) { showStatus(themeSaveStatus, 'Bitte zuerst anmelden.', 'error'); return; }
    delete data.theme;
    showStatus(themeSaveStatus, 'Wird zurückgesetzt …', 'info');
    const r = await window.saveContent(data);
    if (r.ok) {
      window.removeTheme();
      showStatus(themeSaveStatus, 'Auf Standard zurückgesetzt ✓', 'success');
    } else {
      showStatus(themeSaveStatus, 'Fehler: ' + r.error, 'error');
    }
  });

}());
