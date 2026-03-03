/* ============================================================
   BOYLE DIGITAL SERVICES — admin.js
   ============================================================ */

'use strict';

const ADMIN_PW_KEY = 'bds_admin_password';
const ADMIN_SESSION_KEY = 'bds_admin_auth';
const DEFAULT_ADMIN_PW = 'admin'; // plaintext default — hashed on first use

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
 * Handles three cases:
 *   1. Nothing stored → compare against hash of DEFAULT_ADMIN_PW
 *   2. Stored value is a 64-char hex hash → compare hashes
 *   3. Legacy plaintext (migrating from old version) → compare directly,
 *      then re-store as hash on success
 */
async function checkPassword(entered) {
  const stored      = localStorage.getItem(ADMIN_PW_KEY);
  const enteredHash = await hashPassword(entered);

  if (!stored) {
    // First run — no password set yet
    return enteredHash === await hashPassword(DEFAULT_ADMIN_PW);
  }

  if (/^[0-9a-f]{64}$/.test(stored)) {
    // Already a hash — compare hashes
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
  buildGalleryEditor();
  loadFormData();
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
    errorEl.textContent = 'Incorrect password. Please try again.';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
});


/* ============================================================
   GALLERY EDITOR — build dynamically
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
        alt="Gallery image ${i + 1}"
      >
      <div class="gallery-editor-fields">
        <span class="gallery-item-badge">Photo ${i + 1}</span>
        <div>
          <label for="f-gallery-${i}-src">Image URL</label>
          <input
            type="url"
            id="f-gallery-${i}-src"
            placeholder="https://example.com/image.jpg"
            data-gallery-index="${i}"
          >
        </div>
        <div>
          <label for="f-gallery-${i}-caption">Caption</label>
          <input
            type="text"
            id="f-gallery-${i}-caption"
            placeholder="Photo caption"
          >
        </div>
        <div>
          <label for="f-gallery-${i}-alt">Alt Text (accessibility)</label>
          <input
            type="text"
            id="f-gallery-${i}-alt"
            placeholder="Describe the image"
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

function updateGalleryPreview(imgEl, src) {
  if (!src) { imgEl.src = ''; imgEl.classList.add('broken'); return; }
  const test = new Image();
  test.onload  = () => { imgEl.src = src; imgEl.classList.remove('broken'); };
  test.onerror = () => { imgEl.classList.add('broken'); };
  test.src = src;
}


/* ============================================================
   LOAD FORM DATA
   ============================================================ */
function loadFormData() {
  const d = getContent(); // from content.js

  /* General */
  val('f-companyName', d.companyName);

  /* Hero */
  val('f-hero-eyebrow',  d.hero.eyebrow);
  val('f-hero-headline', d.hero.headline);
  val('f-hero-subtitle', d.hero.subtitle);

  /* About */
  val('f-about-heading', d.about.heading);
  d.about.paragraphs.forEach((p, i) => val(`f-about-p${i}`, p));

  /* Stats */
  d.about.stats.forEach((stat, i) => {
    val(`f-stat-${i}-number`, stat.number);
    val(`f-stat-${i}-suffix`, stat.suffix);
    val(`f-stat-${i}-label`,  stat.label);
  });

  /* Services */
  d.services.forEach((svc, i) => {
    val(`f-service-${i}-icon`,  svc.icon);
    val(`f-service-${i}-title`, svc.title);
    val(`f-service-${i}-desc`,  svc.desc);
  });

  /* Gallery */
  d.gallery.forEach((item, i) => {
    val(`f-gallery-${i}-src`,     item.src);
    val(`f-gallery-${i}-caption`, item.caption);
    val(`f-gallery-${i}-alt`,     item.alt);
    // Set preview image
    const preview = document.getElementById(`f-gallery-${i}-preview`);
    if (preview && item.src) {
      preview.src = item.src;
      preview.classList.remove('broken');
    }
  });

  /* Contact */
  val('f-contact-address', d.contact.address);
  val('f-contact-phone',   d.contact.phone);
  val('f-contact-email',   d.contact.email);

  /* Social */
  const social = d.contact.social || {};
  val('f-social-linkedin',  social.linkedin);
  val('f-social-twitter',   social.twitter);
  val('f-social-instagram', social.instagram);
  val('f-social-tiktok',    social.tiktok);
}

/** Set a field's value */
function val(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value !== undefined && value !== null ? value : '';
}

/** Get a field's trimmed value */
function get(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}


/* ============================================================
   BUILD DATA FROM FORM
   ============================================================ */
function buildDataFromForm() {
  return {
    companyName: get('f-companyName') || DEFAULT_CONTENT.companyName,

    hero: {
      eyebrow:  get('f-hero-eyebrow')  || DEFAULT_CONTENT.hero.eyebrow,
      headline: get('f-hero-headline') || DEFAULT_CONTENT.hero.headline,
      subtitle: get('f-hero-subtitle') || DEFAULT_CONTENT.hero.subtitle
    },

    about: {
      heading: get('f-about-heading') || DEFAULT_CONTENT.about.heading,
      paragraphs: [
        get('f-about-p0') || DEFAULT_CONTENT.about.paragraphs[0],
        get('f-about-p1') || DEFAULT_CONTENT.about.paragraphs[1],
        get('f-about-p2') || DEFAULT_CONTENT.about.paragraphs[2]
      ],
      stats: [0, 1, 2, 3].map(i => ({
        number: parseInt(get(`f-stat-${i}-number`), 10) || DEFAULT_CONTENT.about.stats[i].number,
        suffix: document.getElementById(`f-stat-${i}-suffix`)?.value ?? DEFAULT_CONTENT.about.stats[i].suffix,
        label:  get(`f-stat-${i}-label`) || DEFAULT_CONTENT.about.stats[i].label
      }))
    },

    services: [0, 1, 2].map(i => ({
      icon:  get(`f-service-${i}-icon`)  || DEFAULT_CONTENT.services[i].icon,
      title: get(`f-service-${i}-title`) || DEFAULT_CONTENT.services[i].title,
      desc:  get(`f-service-${i}-desc`)  || DEFAULT_CONTENT.services[i].desc
    })),

    gallery: Array.from({ length: 12 }, (_, i) => ({
      src:     get(`f-gallery-${i}-src`)     || DEFAULT_CONTENT.gallery[i].src,
      caption: get(`f-gallery-${i}-caption`) || DEFAULT_CONTENT.gallery[i].caption,
      alt:     get(`f-gallery-${i}-alt`)     || DEFAULT_CONTENT.gallery[i].alt
    })),

    contact: {
      address: get('f-contact-address'),
      phone:   get('f-contact-phone'),
      email:   get('f-contact-email'),
      social: {
        linkedin:  get('f-social-linkedin'),
        twitter:   get('f-social-twitter'),
        instagram: get('f-social-instagram'),
        tiktok:    get('f-social-tiktok')
      }
    }
  };
}


/* ============================================================
   SAVE / RESET
   ============================================================ */
document.getElementById('saveBtn').addEventListener('click', () => {
  const data = buildDataFromForm();
  saveContent(data); // from content.js
  showToast('Changes saved successfully!', 'success');
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all content to defaults? This cannot be undone.')) return;
  resetContent(); // from content.js
  loadFormData();
  showToast('Content reset to defaults.');
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
    errEl.textContent = 'Password must be at least 4 characters.';
    errEl.classList.remove('hidden');
    return;
  }

  if (newPw !== confPw) {
    errEl.textContent = 'Passwords do not match.';
    errEl.classList.remove('hidden');
    return;
  }

  // Store as SHA-256 hash — never plaintext
  const hash = await hashPassword(newPw);
  localStorage.setItem(ADMIN_PW_KEY, hash);
  document.getElementById('f-new-password').value = '';
  document.getElementById('f-confirm-password').value = '';
  showToast('Password updated!', 'success');
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
  toast.className = 'toast' + (type ? ` toast-${type}` : '');

  // Force reflow to restart animation
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
  // Override content.js auto-apply — not needed on admin page
  // (admin.html has no site markup to patch)

  if (isAuthed()) {
    showPanel();
  } else {
    showLogin();
    document.getElementById('passwordInput').focus();
  }
});
