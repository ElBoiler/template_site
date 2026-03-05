/* ============================================================
   BOYLE DIGITAL SERVICES — admin.js
   ============================================================ */

'use strict';

const ADMIN_PW_KEY      = 'bds_admin_password';
const ADMIN_SESSION_KEY = 'bds_admin_auth';
const DEFAULT_ADMIN_PW  = 'admin'; // plaintext default — hashed on first use


/* ── Module-level i18n / content state ────────────────────── */

/** Which content block is currently shown in the admin form ('de' | 'en'). */
let adminContentLang = (typeof getLang === 'function') ? getLang() : 'de';

/** In-memory cache of the full content object (both language blocks). */
let pendingContent = null;


/* ============================================================
   AUTH — passwords are stored as SHA-256 hashes, never plaintext
   ============================================================ */

/** Returns a hex SHA-256 digest of the given string. */
async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verifies an entered password against storage.
 *   1. Nothing stored → compare against hash of DEFAULT_ADMIN_PW
 *   2. Stored value is a 64-char hex hash → compare hashes
 *   3. Legacy plaintext → compare directly, re-store as hash on success
 */
async function checkPassword(entered) {
  const stored      = localStorage.getItem(ADMIN_PW_KEY);
  const enteredHash = await hashPassword(entered);

  if (!stored) {
    return enteredHash === await hashPassword(DEFAULT_ADMIN_PW);
  }

  if (/^[0-9a-f]{64}$/.test(stored)) {
    return enteredHash === stored;
  }

  // Legacy plaintext — migrate to hash on successful login
  if (entered === stored) {
    localStorage.setItem(ADMIN_PW_KEY, enteredHash);
    return true;
  }
  return false;
}

function isAuthed() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

function showPanel() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');

  // Initialise in-memory state
  pendingContent   = getContent();
  adminContentLang = (typeof getLang === 'function') ? getLang() : 'de';

  loadFormData(adminContentLang, pendingContent);

  // Apply translations to any newly-visible admin panel elements
  if (typeof applyTranslations === 'function') {
    applyTranslations((typeof getLang === 'function') ? getLang() : 'de');
  }

  syncContentLangTabs();
}

function showLogin() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('adminPanel').classList.add('hidden');
}

/* Login form */
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const entered = document.getElementById('passwordInput').value;
  const errorEl = document.getElementById('loginError');

  if (await checkPassword(entered)) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    errorEl.textContent = '';
    showPanel();
  } else {
    errorEl.textContent = T('toast_wrong_pw');
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
});


/* ============================================================
   GALLERY EDITOR — dynamic items (max 12)
   ============================================================ */

/**
 * Clears and rebuilds the gallery editor from an array of gallery items.
 * @param {Array} galleryData - array of { src, caption, alt } objects
 */
function buildGalleryEditor(galleryData) {
  const grid = document.getElementById('galleryEditorGrid');
  if (!grid) return;
  grid.innerHTML = '';
  (galleryData || []).forEach(item => addGalleryEditorItem(item.src, item.caption, item.alt));
  refreshGalleryBadges();
  updateAddGalleryBtn();
}

/** Appends one gallery editor item (preview + URL / caption / alt fields + remove button). */
function addGalleryEditorItem(src, caption, alt) {
  const grid = document.getElementById('galleryEditorGrid');
  if (!grid) return;
  const item = document.createElement('div');
  item.className = 'gallery-editor-item';
  item.innerHTML = `
    <img class="gallery-editor-preview" alt="">
    <div class="gallery-editor-fields">
      <div class="gallery-item-header">
        <span class="gallery-item-badge"></span>
        <button type="button" class="item-remove-btn gallery-remove-btn">${T('sec_gallery_remove')}</button>
      </div>
      <div>
        <label>${T('sec_gallery_url')}</label>
        <input type="url" class="gallery-src-input" placeholder="${T('sec_gallery_url_ph')}">
      </div>
      <div>
        <label>${T('sec_gallery_caption')}</label>
        <input type="text" class="gallery-caption-input" placeholder="${T('sec_gallery_caption_ph')}">
      </div>
      <div>
        <label>${T('sec_gallery_alt')}</label>
        <input type="text" class="gallery-alt-input" placeholder="${T('sec_gallery_alt_ph')}">
      </div>
    </div>
  `;
  // Set values safely
  const preview  = item.querySelector('.gallery-editor-preview');
  const srcInput = item.querySelector('.gallery-src-input');
  const capInput = item.querySelector('.gallery-caption-input');
  const altInput = item.querySelector('.gallery-alt-input');
  srcInput.value = src     || '';
  capInput.value = caption || '';
  altInput.value = alt     || '';

  // Initial preview state
  if (src) {
    preview.src = src;
  } else {
    preview.classList.add('broken');
  }

  // Live preview on URL input
  srcInput.addEventListener('input', debounce(() => {
    updateGalleryPreview(preview, srcInput.value.trim());
  }, 600));

  // Remove button
  item.querySelector('.gallery-remove-btn').addEventListener('click', () => {
    item.remove();
    refreshGalleryBadges();
    updateAddGalleryBtn();
  });

  grid.appendChild(item);
}

/** Re-stamps "Photo N" / "Foto N" badge text after add/remove. */
function refreshGalleryBadges() {
  document.querySelectorAll('#galleryEditorGrid .gallery-item-badge').forEach((el, i) => {
    el.textContent = `${T('sec_gallery_photo')} ${i + 1}`;
  });
}

/** Disables the Add button when 12 gallery items exist. */
function updateAddGalleryBtn() {
  const btn   = document.getElementById('addGalleryBtn');
  const count = document.querySelectorAll('#galleryEditorGrid .gallery-editor-item').length;
  if (btn) btn.disabled = count >= 12;
}

function updateGalleryPreview(imgEl, src) {
  if (!src) { imgEl.src = ''; imgEl.classList.add('broken'); return; }
  const test   = new Image();
  test.onload  = () => { imgEl.src = src; imgEl.classList.remove('broken'); };
  test.onerror = () => { imgEl.classList.add('broken'); };
  test.src = src;
}


/* ============================================================
   LOAD FORM DATA
   ============================================================ */
/**
 * Populates the admin form from a content object.
 * @param {string} lang       - 'de' | 'en'
 * @param {object} contentObj - full content object (both lang blocks + shared)
 */
function loadFormData(lang, contentObj) {
  const data = contentObj || getContent();
  const l    = (['de', 'en'].includes(lang)) ? lang : 'de';
  const ld   = data[l] || data['de']; // language-specific block

  /* General — language-neutral */
  val('f-companyName', data.companyName);

  /* Hero */
  val('f-hero-eyebrow',  ld.hero.eyebrow);
  val('f-hero-headline', ld.hero.headline);
  val('f-hero-subtitle', ld.hero.subtitle);

  /* About */
  val('f-about-heading', ld.about.heading);
  ld.about.paragraphs.forEach((p, i) => val(`f-about-p${i}`, p));

  /* Stats — dynamic editor */
  renderStatsEditor(ld.about.stats || []);

  /* Services — dynamic editor */
  renderServicesEditor(ld.services || []);

  /* Gallery — dynamic editor */
  buildGalleryEditor(ld.gallery || []);

  /* References visibility toggle */
  const refToggle = document.getElementById('f-references-visible');
  if (refToggle) refToggle.checked = (data.referencesVisible !== false);

  /* Contact — language-neutral */
  val('f-contact-address', data.contact.address);
  val('f-contact-phone',   data.contact.phone);
  val('f-contact-email',   data.contact.email);
  renderSubjectsEditor((data.contact && data.contact.subjects) || []);

  /* Social — language-neutral */
  const social = data.contact.social || {};
  val('f-social-linkedin',  social.linkedin);
  val('f-social-twitter',   social.twitter);
  val('f-social-instagram', social.instagram);
  val('f-social-tiktok',    social.tiktok);
}

/** Set a field's value */
function val(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = (value !== undefined && value !== null) ? value : '';
}

/** Get a field's trimmed value */
function get(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}


/* ============================================================
   CAPTURE FORM → CONTENT OBJECT
   ============================================================ */
/**
 * Reads all form fields into contentObj[lang] (language-specific fields).
 * Gallery src URLs are also synced to the OTHER language block because
 * image URLs are language-neutral.
 *
 * @param {string} lang       - 'de' | 'en'
 * @param {object} contentObj - mutated in place; both lang blocks must exist
 */
function captureFormIntoContent(lang, contentObj) {
  const l     = (['de', 'en'].includes(lang)) ? lang : 'de';
  const other = (l === 'de') ? 'en' : 'de';

  // Ensure both language blocks exist (guard against old saved data)
  if (!contentObj[l])     contentObj[l]     = JSON.parse(JSON.stringify(DEFAULT_CONTENT[l]));
  if (!contentObj[other]) contentObj[other] = JSON.parse(JSON.stringify(DEFAULT_CONTENT[other]));

  /* Hero */
  contentObj[l].hero = {
    eyebrow:  get('f-hero-eyebrow')  || DEFAULT_CONTENT[l].hero.eyebrow,
    headline: get('f-hero-headline') || DEFAULT_CONTENT[l].hero.headline,
    subtitle: get('f-hero-subtitle') || DEFAULT_CONTENT[l].hero.subtitle
  };

  /* About — paragraphs (lang-specific) */
  /* Stats — number/suffix are language-neutral; label is language-specific */
  const statRows = document.querySelectorAll('#statsList .stat-row');
  const stats    = Array.from(statRows, row => ({
    number: parseInt(row.querySelector('.stat-number-input')?.value || '0', 10) || 0,
    suffix: row.querySelector('.stat-suffix-input')?.value ?? '',
    label:  (row.querySelector('.stat-label-input')?.value || '').trim()
  }));

  contentObj[l].about = {
    heading: get('f-about-heading') || DEFAULT_CONTENT[l].about.heading,
    paragraphs: [
      get('f-about-p0') || DEFAULT_CONTENT[l].about.paragraphs[0],
      get('f-about-p1') || DEFAULT_CONTENT[l].about.paragraphs[1],
      get('f-about-p2') || DEFAULT_CONTENT[l].about.paragraphs[2]
    ],
    stats
  };

  // Sync number/suffix (language-neutral) to other lang block; preserve other lang's labels
  if (!contentObj[other].about) contentObj[other].about = {};
  const otherStats = contentObj[other].about.stats || [];
  contentObj[other].about.stats = stats.map((s, i) => ({
    number: s.number,
    suffix: s.suffix,
    label:  otherStats[i]?.label || ''
  }));

  /* Services — icon is language-neutral; title/desc are language-specific */
  const svcCards = document.querySelectorAll('#servicesList .service-card-editor');
  const services = Array.from(svcCards, card => ({
    icon:  (card.querySelector('.svc-icon-input')?.value  || '').trim(),
    title: (card.querySelector('.svc-title-input')?.value || '').trim(),
    desc:  (card.querySelector('.svc-desc-input')?.value  || '').trim()
  }));
  contentObj[l].services = services;

  // Sync icon (language-neutral) to other lang block; preserve other lang's title/desc
  const otherSvcs = contentObj[other].services || [];
  contentObj[other].services = services.map((s, i) => ({
    icon:  s.icon,
    title: otherSvcs[i]?.title || '',
    desc:  otherSvcs[i]?.desc  || ''
  }));

  /* Gallery
     - src (URL) is language-neutral → synced to other lang block
     - caption and alt are language-specific → written to [l] only         */
  const galleryItems = document.querySelectorAll('#galleryEditorGrid .gallery-editor-item');
  contentObj[l].gallery = Array.from(galleryItems, item => ({
    src:     (item.querySelector('.gallery-src-input')?.value     || '').trim(),
    caption: (item.querySelector('.gallery-caption-input')?.value || '').trim(),
    alt:     (item.querySelector('.gallery-alt-input')?.value     || '').trim()
  }));

  // Sync src to other lang block (same images for both languages)
  const otherGallery = contentObj[other].gallery || [];
  contentObj[other].gallery = contentObj[l].gallery.map((item, i) => ({
    src:     item.src,
    caption: otherGallery[i]?.caption || '',
    alt:     otherGallery[i]?.alt     || ''
  }));

  /* References visibility — language-neutral */
  const refToggle = document.getElementById('f-references-visible');
  if (refToggle) contentObj.referencesVisible = refToggle.checked;
}

/* ============================================================
   SUBJECTS EDITOR
   ============================================================ */

/** Fully rebuilds the subjects list from a subjects array. */
function renderSubjectsEditor(subjects) {
  const list = document.getElementById('subjectsList');
  if (!list) return;
  list.innerHTML = '';
  (subjects || []).forEach(s => addSubjectRow(s.de || '', s.en || ''));
  updateAddSubjectBtn();
  updateSubjectLangVisibility();
}

/** Appends one editable subject row (DE + EN inputs). */
function addSubjectRow(deVal, enVal) {
  const list = document.getElementById('subjectsList');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'subject-row';
  const dePh = T('sec_subjects_de_ph');
  const enPh = T('sec_subjects_en_ph');
  const rmLabel = T('sec_subjects_remove');
  row.innerHTML = `
    <div class="subject-fields">
      <div class="subject-lang subject-lang--de">
        <span class="subject-lang-badge">🇩🇪</span>
        <input type="text" class="subject-de" placeholder="${dePh}">
      </div>
      <div class="subject-lang subject-lang--en">
        <span class="subject-lang-badge">🇬🇧</span>
        <input type="text" class="subject-en" placeholder="${enPh}">
      </div>
    </div>
    <button type="button" class="subject-remove-btn">${rmLabel}</button>
  `;
  // Set values safely (avoid innerHTML injection)
  row.querySelector('.subject-de').value = deVal || '';
  row.querySelector('.subject-en').value = enVal || '';
  row.querySelector('.subject-remove-btn').addEventListener('click', () => {
    row.remove();
    updateAddSubjectBtn();
  });
  list.appendChild(row);
  updateAddSubjectBtn();
}

/** Disables the Add button when 5 rows exist. */
function updateAddSubjectBtn() {
  const btn   = document.getElementById('addSubjectBtn');
  const count = document.querySelectorAll('.subject-row').length;
  if (btn) btn.disabled = count >= 5;
}

/** Shows only the current content-language's subject inputs, hides the other. */
function updateSubjectLangVisibility() {
  const list = document.getElementById('subjectsList');
  if (!list) return;
  list.classList.toggle('showing-de', adminContentLang === 'de');
  list.classList.toggle('showing-en', adminContentLang === 'en');
}

/** Reads the contact form fields into a plain object. */
function buildContactFromForm() {
  const subjects = [];
  document.querySelectorAll('.subject-row').forEach(row => {
    const de = (row.querySelector('.subject-de')?.value || '').trim();
    const en = (row.querySelector('.subject-en')?.value || '').trim();
    if (de || en) subjects.push({ de, en });
  });

  return {
    address:  get('f-contact-address'),
    phone:    get('f-contact-phone'),
    email:    get('f-contact-email'),
    subjects,
    social: {
      linkedin:  get('f-social-linkedin'),
      twitter:   get('f-social-twitter'),
      instagram: get('f-social-instagram'),
      tiktok:    get('f-social-tiktok')
    }
  };
}


/* ============================================================
   STATS EDITOR — dynamic rows (max 6)
   ============================================================ */

/** Fully rebuilds the stats editor from a stats array. */
function renderStatsEditor(stats) {
  const list = document.getElementById('statsList');
  if (!list) return;
  list.innerHTML = '';
  (stats || []).forEach(s => addStatRow(s.number, s.suffix, s.label));
  updateAddStatBtn();
}

/** Appends one stat row with number / suffix / label inputs + remove button. */
function addStatRow(num, suf, lbl) {
  const list = document.getElementById('statsList');
  if (!list) return;
  const n   = list.querySelectorAll('.stat-row').length + 1;
  const row = document.createElement('div');
  row.className = 'stat-row';
  row.innerHTML = `
    <div class="stat-row-header">
      <span class="stat-row-label">${T('sec_stat_prefix')} ${n}</span>
      <button type="button" class="item-remove-btn stat-remove-btn">${T('sec_subjects_remove')}</button>
    </div>
    <div class="stat-row-fields">
      <div class="field-group field-group--sm">
        <label>${T('sec_about_number')}</label>
        <input type="number" class="stat-number-input" min="0">
      </div>
      <div class="field-group field-group--sm">
        <label>${T('sec_about_suffix')}</label>
        <input type="text" class="stat-suffix-input" maxlength="5">
      </div>
      <div class="field-group field-grow">
        <label>${T('sec_about_stat_lbl')}</label>
        <input type="text" class="stat-label-input">
      </div>
    </div>
  `;
  // Set values safely
  row.querySelector('.stat-number-input').value = (num !== undefined && num !== null) ? num : '';
  row.querySelector('.stat-suffix-input').value  = (suf !== undefined && suf !== null) ? suf : '';
  row.querySelector('.stat-label-input').value   = (lbl !== undefined && lbl !== null) ? lbl : '';

  // Remove button
  row.querySelector('.stat-remove-btn').addEventListener('click', () => {
    row.remove();
    renumberStatRows();
    updateAddStatBtn();
  });
  list.appendChild(row);
  updateAddStatBtn();
}

/** Re-numbers stat row header labels after a removal. */
function renumberStatRows() {
  document.querySelectorAll('#statsList .stat-row').forEach((row, i) => {
    const lbl = row.querySelector('.stat-row-label');
    if (lbl) lbl.textContent = `${T('sec_stat_prefix')} ${i + 1}`;
  });
}

/** Disables the Add button when 6 stat rows exist. */
function updateAddStatBtn() {
  const btn   = document.getElementById('addStatBtn');
  const count = document.querySelectorAll('#statsList .stat-row').length;
  if (btn) btn.disabled = count >= 6;
}


/* ============================================================
   SERVICES EDITOR — dynamic cards (max 9)
   ============================================================ */

/** Fully rebuilds the services editor from a services array. */
function renderServicesEditor(svcs) {
  const list = document.getElementById('servicesList');
  if (!list) return;
  list.innerHTML = '';
  (svcs || []).forEach(s => addServiceCard(s.icon, s.title, s.desc));
  updateAddServiceBtn();
}

/** Appends one service card editor. */
function addServiceCard(icon, title, desc) {
  const list = document.getElementById('servicesList');
  if (!list) return;
  const n    = list.querySelectorAll('.service-card-editor').length + 1;
  const card = document.createElement('div');
  card.className = 'service-card-editor card';
  card.innerHTML = `
    <div class="service-card-header">
      <span class="service-card-label">${T('sec_svc_card')} ${n}</span>
      <button type="button" class="item-remove-btn svc-remove-btn">${T('sec_svc_remove')}</button>
    </div>
    <div class="service-editor-row">
      <div class="field-group field-group--icon">
        <label>${T('sec_svc_icon')}</label>
        <input type="text" class="svc-icon-input" maxlength="4">
      </div>
      <div class="field-group field-grow">
        <label>${T('sec_svc_title')}</label>
        <input type="text" class="svc-title-input">
      </div>
    </div>
    <div class="field-group">
      <label>${T('sec_svc_desc')}</label>
      <textarea class="svc-desc-input" rows="3"></textarea>
    </div>
  `;
  // Set values safely
  card.querySelector('.svc-icon-input').value  = icon  || '';
  card.querySelector('.svc-title-input').value = title || '';
  card.querySelector('.svc-desc-input').value  = desc  || '';

  // Remove button
  card.querySelector('.svc-remove-btn').addEventListener('click', () => {
    card.remove();
    renumberServiceCards();
    updateAddServiceBtn();
  });
  list.appendChild(card);
  updateAddServiceBtn();
}

/** Re-numbers service card header labels after a removal. */
function renumberServiceCards() {
  document.querySelectorAll('#servicesList .service-card-editor').forEach((card, i) => {
    const lbl = card.querySelector('.service-card-label');
    if (lbl) lbl.textContent = `${T('sec_svc_card')} ${i + 1}`;
  });
}

/** Disables the Add button when 9 service cards exist. */
function updateAddServiceBtn() {
  const btn   = document.getElementById('addServiceBtn');
  const count = document.querySelectorAll('#servicesList .service-card-editor').length;
  if (btn) btn.disabled = count >= 9;
}


/* ============================================================
   CONTENT LANGUAGE SWITCHER (admin form tabs: 🇩🇪 / 🇬🇧)
   ============================================================ */

/**
 * Switch which language's content is shown in the admin form.
 * Also called by setLang() in i18n.js when the UI lang changes.
 *
 * @param {string} newLang - 'de' | 'en'
 */
function switchAdminContentLang(newLang) {
  if (!['de', 'en'].includes(newLang)) return;
  if (!pendingContent) pendingContent = getContent();

  // Flush the currently visible form state into pendingContent
  captureFormIntoContent(adminContentLang, pendingContent);
  pendingContent.companyName = get('f-companyName') || DEFAULT_CONTENT.companyName;
  pendingContent.contact     = buildContactFromForm();

  adminContentLang = newLang;

  // Reload form with the new language's data
  loadFormData(adminContentLang, pendingContent);

  // Refresh subject language visibility after reload
  updateSubjectLangVisibility();

  // Update tab active states
  syncContentLangTabs();
}

/** Keeps the content-language tab buttons in sync with adminContentLang. */
function syncContentLangTabs() {
  document.querySelectorAll('#adminLangTabs .admin-lang-tab').forEach(tab => {
    const active = tab.dataset.lang === adminContentLang;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}


/* ============================================================
   SAVE / RESET
   ============================================================ */
document.getElementById('saveBtn').addEventListener('click', () => {
  if (!pendingContent) pendingContent = getContent();

  // Flush the currently visible tab's fields
  captureFormIntoContent(adminContentLang, pendingContent);

  // Capture shared (language-neutral) fields
  pendingContent.companyName = get('f-companyName') || DEFAULT_CONTENT.companyName;
  pendingContent.contact     = buildContactFromForm();

  saveContent(pendingContent); // from content.js
  showToast(T('toast_saved'), 'success');
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm(T('confirm_reset'))) return;
  resetContent();                          // wipes localStorage → content.js
  pendingContent = getContent();           // re-reads defaults
  loadFormData(adminContentLang, pendingContent);
  showToast(T('toast_reset'));
});


/* ============================================================
   PASSWORD CHANGE
   ============================================================ */
document.getElementById('changePasswordBtn').addEventListener('click', async () => {
  const newPw  = document.getElementById('f-new-password').value;
  const confPw = document.getElementById('f-confirm-password').value;
  const errEl  = document.getElementById('passwordChangeError');

  errEl.classList.add('hidden');

  if (!newPw || newPw.length < 4) {
    errEl.textContent = T('err_pw_short');
    errEl.classList.remove('hidden');
    return;
  }

  if (newPw !== confPw) {
    errEl.textContent = T('err_pw_mismatch');
    errEl.classList.remove('hidden');
    return;
  }

  // Store as SHA-256 hash — never plaintext
  const hash = await hashPassword(newPw);
  localStorage.setItem(ADMIN_PW_KEY, hash);
  document.getElementById('f-new-password').value  = '';
  document.getElementById('f-confirm-password').value = '';
  showToast(T('toast_pw_updated'), 'success');
});


/* ============================================================
   SIDEBAR NAVIGATION — highlight active section on scroll
   ============================================================ */
const sidebarLinks = document.querySelectorAll('.sidebar-link');

sidebarLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (!target) return;

    const content = document.getElementById('adminContent');
    const offset  = target.offsetTop - 24;
    content.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

// Highlight sidebar link based on scroll
const adminContent = document.getElementById('adminContent');
if (adminContent) {
  adminContent.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.admin-section');
    let current = '';

    sections.forEach(sec => {
      const top = sec.offsetTop - adminContent.scrollTop - 60;
      if (top <= 0) current = sec.id;
    });

    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.classList.toggle('active', href === current || (!current && href === 'sec-general'));
    });
  }, { passive: true });
}


/* ============================================================
   TOAST
   ============================================================ */
let toastTimer = null;

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className   = 'toast' + (type ? ` toast-${type}` : '');

  // Force reflow to restart CSS animation
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}


/* ============================================================
   UTILITIES
   ============================================================ */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}


/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Wire content-language tab clicks
  document.querySelectorAll('#adminLangTabs .admin-lang-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAdminContentLang(tab.dataset.lang));
  });

  // Wire Add Subject button
  document.getElementById('addSubjectBtn')?.addEventListener('click', () => {
    if (document.querySelectorAll('.subject-row').length < 5) addSubjectRow('', '');
  });

  // Wire Add Stat button
  document.getElementById('addStatBtn')?.addEventListener('click', () => {
    if (document.querySelectorAll('#statsList .stat-row').length < 6) addStatRow('', '', '');
  });

  // Wire Add Service button
  document.getElementById('addServiceBtn')?.addEventListener('click', () => {
    if (document.querySelectorAll('#servicesList .service-card-editor').length < 9) addServiceCard('', '', '');
  });

  // Wire Add Gallery Photo button
  document.getElementById('addGalleryBtn')?.addEventListener('click', () => {
    if (document.querySelectorAll('#galleryEditorGrid .gallery-editor-item').length < 12) {
      addGalleryEditorItem('', '', '');
      refreshGalleryBadges();
      updateAddGalleryBtn();
    }
  });

  if (isAuthed()) {
    showPanel();
  } else {
    showLogin();
    document.getElementById('passwordInput').focus();
  }
});


/* ============================================================
   COLOUR SCHEME SECTION
   ============================================================ */

const colorThief       = new ColorThief();
let extractedSwatches  = [];   // Array of { hex, r, g, b }
let pendingPrimary     = null; // hex string
let pendingAccent      = null; // hex string

/* ── Colour utilities ───────────────────────────────────── */

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
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

/**
 * Given primary and accent hex values, compute the full
 * bds_theme object with all derived colour vars.
 */
function computeTheme(primaryHex, accentHex) {
  const aRgb = hexToRgb(accentHex);
  const aHsl = rgbToHsl(aRgb.r, aRgb.g, aRgb.b);

  const pRgb = hexToRgb(primaryHex);
  const pHsl = rgbToHsl(pRgb.r, pRgb.g, pRgb.b);

  // Ensure primary is dark enough for a readable dark background
  const primary = pHsl.l > 30
    ? hslToHex(pHsl.h, Math.min(pHsl.s, 60), 12)
    : primaryHex;

  // Accent hover: darken by ~15 lightness units
  const accentHover = hslToHex(aHsl.h, aHsl.s, Math.max(aHsl.l - 15, 5));

  // Accent light: very pale tint (high L, capped S)
  const accentLight = hslToHex(aHsl.h, Math.min(aHsl.s, 40), 95);

  // Text: very dark, slight hue from primary
  const text = hslToHex(pHsl.h, Math.min(pHsl.s, 25), 13);

  return {
    '--clr-primary':      primary,
    '--clr-accent':       accentHex,
    '--clr-accent-hover': accentHover,
    '--clr-accent-light': accentLight,
    '--clr-text':         text,
    '--gradient-hero':    `linear-gradient(135deg, ${primary} 0%, ${accentHex} 100%)`,
  };
}

/* ── DOM helpers ───────────────────────────────────────── */

function previewTheme(primaryHex, accentHex) {
  const theme = computeTheme(primaryHex, accentHex);
  Object.entries(theme).forEach(([prop, value]) => {
    document.documentElement.style.setProperty(prop, value);
  });
  // Sync role picker displays
  updateRolePickerUI('Primary', primaryHex);
  updateRolePickerUI('Accent',  accentHex);
}

function updateRolePickerUI(role, hex) {
  document.getElementById(`roleDot${role}`).style.background = hex;
  document.getElementById(`roleHex${role}`).textContent      = hex;
}

function buildSwatchPopup(popupEl, onPick) {
  popupEl.innerHTML = '';
  extractedSwatches.forEach(sw => {
    const btn = document.createElement('button');
    btn.type             = 'button';
    btn.className        = 'theme-swatch';
    btn.style.background = sw.hex;
    btn.title            = sw.hex;
    btn.setAttribute('role', 'option');
    btn.addEventListener('click', () => {
      onPick(sw.hex);
      popupEl.classList.add('hidden');
    });
    popupEl.appendChild(btn);
  });
}

function renderExtractedSwatches() {
  const container = document.getElementById('themeSwatches');
  container.innerHTML = '';
  extractedSwatches.forEach(sw => {
    const div = document.createElement('div');
    div.className        = 'theme-swatch';
    div.style.background = sw.hex;
    div.title            = sw.hex;
    container.appendChild(div);
  });
}

/* ── Auto role assignment ──────────────────────────────── */

function autoAssignRoles(swatches) {
  // Sort by lightness ascending — darkest first
  const sorted = [...swatches].sort((a, b) => {
    return rgbToHsl(a.r, a.g, a.b).l - rgbToHsl(b.r, b.g, b.b).l;
  });

  const primary = sorted[0];

  // Most saturated among the non-darkest
  const candidates = swatches.filter(s => s !== primary);
  const accent = candidates.reduce((best, s) => {
    return rgbToHsl(s.r, s.g, s.b).s > rgbToHsl(best.r, best.g, best.b).s ? s : best;
  }, candidates[0] || primary);

  return { primary: primary.hex, accent: accent.hex };
}

/* ── Image upload & extraction ─────────────────────────── */

function handleImageFile(file) {
  if (!file || !file.type.match(/^image\/(jpeg|png|svg\+xml|gif)$/)) return;

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    try {
      const palette = colorThief.getPalette(img, 6);
      extractedSwatches = palette.map(([r, g, b]) => ({
        r, g, b, hex: rgbToHex(r, g, b)
      }));
    } catch (e) {
      // SVGs may fail canvas tainting — fall back to 1-colour
      extractedSwatches = [{ r: 8, g: 145, b: 178, hex: '#0891b2' }];
    }

    const { primary, accent } = autoAssignRoles(extractedSwatches);
    pendingPrimary = primary;
    pendingAccent  = accent;

    // Show thumbnail
    document.getElementById('themeImgThumbnail').src = url;

    // Render swatches & update role pickers
    renderExtractedSwatches();

    buildSwatchPopup(
      document.getElementById('rolePopupPrimary'),
      hex => { pendingPrimary = hex; previewTheme(pendingPrimary, pendingAccent); }
    );
    buildSwatchPopup(
      document.getElementById('rolePopupAccent'),
      hex => { pendingAccent = hex; previewTheme(pendingPrimary, pendingAccent); }
    );

    previewTheme(pendingPrimary, pendingAccent);

    // Reveal palette card
    document.getElementById('themePaletteCard').classList.remove('hidden');
    URL.revokeObjectURL(url);
  };

  img.crossOrigin = 'anonymous';
  img.src = url;
}

/* ── Event wiring ──────────────────────────────────────── */

// File input
document.getElementById('themeImageInput').addEventListener('change', e => {
  handleImageFile(e.target.files[0]);
});

// Drag and drop
const dropZone = document.getElementById('themeDropZone');

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleImageFile(e.dataTransfer.files[0]);
});

// Keyboard activation for drop zone (Enter/Space)
dropZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    document.getElementById('themeImageInput').click();
  }
});

// Role picker toggles
['Primary', 'Accent'].forEach(role => {
  const btn   = document.getElementById(`rolePicker${role}`);
  const popup = document.getElementById(`rolePopup${role}`);

  btn.addEventListener('click', e => {
    e.stopPropagation();
    // Close the other popup first
    const other = role === 'Primary' ? 'Accent' : 'Primary';
    document.getElementById(`rolePopup${other}`).classList.add('hidden');
    popup.classList.toggle('hidden');
  });
});

// Close popups on outside click
document.addEventListener('click', () => {
  document.getElementById('rolePopupPrimary').classList.add('hidden');
  document.getElementById('rolePopupAccent').classList.add('hidden');
});

// Apply button
document.getElementById('themeApplyBtn').addEventListener('click', () => {
  if (!pendingPrimary || !pendingAccent) return;
  const theme = computeTheme(pendingPrimary, pendingAccent);
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  showToast(T('toast_theme_applied'), 'success');
});

// Reset button
document.getElementById('themeResetBtn').addEventListener('click', () => {
  localStorage.removeItem(THEME_KEY);
  if (typeof removeStoredTheme === 'function') removeStoredTheme();
  showToast(T('toast_theme_reset'), '');
});
