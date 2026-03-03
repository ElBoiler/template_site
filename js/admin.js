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

  buildGalleryEditor();
  loadFormData(adminContentLang, pendingContent);

  // Apply translations to any newly-visible admin panel elements
  if (typeof applyTranslations === 'function') {
    applyTranslations((typeof getLang === 'function') ? getLang() : 'de');
  }

  refreshGalleryBadges();
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
   GALLERY EDITOR — built once, labels use data-i18n for re-translation
   ============================================================ */
function buildGalleryEditor() {
  const grid = document.getElementById('galleryEditorGrid');
  if (!grid || grid.children.length > 0) return; // already built

  for (let i = 0; i < 12; i++) {
    const item = document.createElement('div');
    item.className = 'gallery-editor-item';
    item.innerHTML = `
      <img
        class="gallery-editor-preview"
        id="f-gallery-${i}-preview"
        src=""
        alt=""
      >
      <div class="gallery-editor-fields">
        <span class="gallery-item-badge" data-gallery-badge="${i}"></span>
        <div>
          <label for="f-gallery-${i}-src" data-i18n="sec_gallery_url"></label>
          <input
            type="url"
            id="f-gallery-${i}-src"
            data-i18n-placeholder="sec_gallery_url_ph"
            data-gallery-index="${i}"
          >
        </div>
        <div>
          <label for="f-gallery-${i}-caption" data-i18n="sec_gallery_caption"></label>
          <input
            type="text"
            id="f-gallery-${i}-caption"
            data-i18n-placeholder="sec_gallery_caption_ph"
          >
        </div>
        <div>
          <label for="f-gallery-${i}-alt" data-i18n="sec_gallery_alt"></label>
          <input
            type="text"
            id="f-gallery-${i}-alt"
            data-i18n-placeholder="sec_gallery_alt_ph"
          >
        </div>
      </div>
    `;
    grid.appendChild(item);

    // Live preview update on URL change
    const srcInput = item.querySelector(`#f-gallery-${i}-src`);
    const preview  = item.querySelector(`#f-gallery-${i}-preview`);

    srcInput.addEventListener('input', debounce(() => {
      updateGalleryPreview(preview, srcInput.value.trim());
    }, 600));
  }
}

/** Re-stamps "Photo N" / "Foto N" badge text after a language change. */
function refreshGalleryBadges() {
  document.querySelectorAll('[data-gallery-badge]').forEach(el => {
    const n = parseInt(el.getAttribute('data-gallery-badge'), 10) + 1;
    el.textContent = `${T('sec_gallery_photo')} ${n}`;
  });
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

  /* Stats */
  ld.about.stats.forEach((stat, i) => {
    val(`f-stat-${i}-number`, stat.number);
    val(`f-stat-${i}-suffix`, stat.suffix);
    val(`f-stat-${i}-label`,  stat.label);
  });

  /* Services */
  ld.services.forEach((svc, i) => {
    val(`f-service-${i}-icon`,  svc.icon);
    val(`f-service-${i}-title`, svc.title);
    val(`f-service-${i}-desc`,  svc.desc);
  });

  /* Gallery */
  ld.gallery.forEach((item, i) => {
    val(`f-gallery-${i}-src`,     item.src);
    val(`f-gallery-${i}-caption`, item.caption);
    val(`f-gallery-${i}-alt`,     item.alt);
    const preview = document.getElementById(`f-gallery-${i}-preview`);
    if (preview) {
      if (item.src) {
        preview.src = item.src;
        preview.classList.remove('broken');
      } else {
        preview.src = '';
        preview.classList.add('broken');
      }
    }
  });

  /* Contact — language-neutral */
  val('f-contact-address', data.contact.address);
  val('f-contact-phone',   data.contact.phone);
  val('f-contact-email',   data.contact.email);

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

  /* About */
  contentObj[l].about = {
    heading: get('f-about-heading') || DEFAULT_CONTENT[l].about.heading,
    paragraphs: [
      get('f-about-p0') || DEFAULT_CONTENT[l].about.paragraphs[0],
      get('f-about-p1') || DEFAULT_CONTENT[l].about.paragraphs[1],
      get('f-about-p2') || DEFAULT_CONTENT[l].about.paragraphs[2]
    ],
    stats: [0, 1, 2, 3].map(i => ({
      number: parseInt(get(`f-stat-${i}-number`), 10) || DEFAULT_CONTENT[l].about.stats[i].number,
      suffix: document.getElementById(`f-stat-${i}-suffix`)?.value ?? DEFAULT_CONTENT[l].about.stats[i].suffix,
      label:  get(`f-stat-${i}-label`) || DEFAULT_CONTENT[l].about.stats[i].label
    }))
  };

  /* Services */
  contentObj[l].services = [0, 1, 2].map(i => ({
    icon:  get(`f-service-${i}-icon`)  || DEFAULT_CONTENT[l].services[i].icon,
    title: get(`f-service-${i}-title`) || DEFAULT_CONTENT[l].services[i].title,
    desc:  get(`f-service-${i}-desc`)  || DEFAULT_CONTENT[l].services[i].desc
  }));

  /* Gallery
     - src (URL) is language-neutral → write to both lang blocks
     - caption and alt are language-specific → write to [l] only         */
  contentObj[l].gallery = Array.from({ length: 12 }, (_, i) => ({
    src:     get(`f-gallery-${i}-src`)     || DEFAULT_CONTENT[l].gallery[i].src,
    caption: get(`f-gallery-${i}-caption`) || DEFAULT_CONTENT[l].gallery[i].caption,
    alt:     get(`f-gallery-${i}-alt`)     || DEFAULT_CONTENT[l].gallery[i].alt
  }));

  // Sync src URL to other language block (same image for both languages)
  contentObj[l].gallery.forEach((item, i) => {
    if (contentObj[other].gallery && contentObj[other].gallery[i]) {
      contentObj[other].gallery[i].src = item.src;
    }
  });
}

/** Reads the contact form fields into a plain object. */
function buildContactFromForm() {
  return {
    address: get('f-contact-address'),
    phone:   get('f-contact-phone'),
    email:   get('f-contact-email'),
    social: {
      linkedin:  get('f-social-linkedin'),
      twitter:   get('f-social-twitter'),
      instagram: get('f-social-instagram'),
      tiktok:    get('f-social-tiktok')
    }
  };
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

  // Refresh dynamic labels that aren't covered by data-i18n
  refreshGalleryBadges();

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

  if (isAuthed()) {
    showPanel();
  } else {
    showLogin();
    document.getElementById('passwordInput').focus();
  }
});
