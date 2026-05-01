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

}());
