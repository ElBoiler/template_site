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
