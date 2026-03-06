/* ============================================================
   BOYLE DIGITAL SERVICES — main.js
   ============================================================ */

'use strict';

/* ============================================================
   1. NAVBAR — scroll effect
   ============================================================ */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });


/* ============================================================
   2. SMOOTH SCROLL (for all anchor links)
   ============================================================ */
function smoothScrollTo(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const navHeight = navbar.offsetHeight;
  const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return; // skip bare hash
    e.preventDefault();
    const id = href.slice(1);
    smoothScrollTo(id);
    closeMobileMenu();
  });
});


/* ============================================================
   3. MOBILE MENU
   ============================================================ */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (mobileMenu.classList.contains('open')) closeMobileMenu();
    if (lightbox.classList.contains('active')) closeLightbox();
  }
});


/* ============================================================
   4. ACTIVE NAV LINK (Intersection Observer per section)
   ============================================================ */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));


/* ============================================================
   5. SCROLL REVEAL ANIMATIONS
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => revealObserver.observe(el));

/** Re-registers any new .reveal elements added after initial page load (called by content.js). */
window.observeRevealEls = function () {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
};


/* ============================================================
   6. COUNTER ANIMATION
   ============================================================ */
function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1500; // ms
  const startTime = performance.now();

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counterEls = document.querySelectorAll('.counter');

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));

/** Re-registers any new .counter elements added after initial page load (called by content.js). */
window.observeCounterEls = function () {
  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
};


/* ============================================================
   7. LOCATIONS MAP  (Leaflet, lazy-loaded)
   Leaflet CSS + JS are injected dynamically when #locations
   first enters the viewport. initLocationsMap() is called by
   content.js after building the location cards.
   ============================================================ */

/**
 * Initialise (or re-initialise) the Leaflet map with the given locations array.
 * Called by content.js after applyContent() builds the cards.
 * If Leaflet hasn't loaded yet, window._pendingLocations is set and the map
 * is initialised inside the Leaflet script's onload callback instead.
 * @param {Array} locations
 */
window.initLocationsMap = function (locations) {
  const container = document.getElementById('locations-map');
  if (!container || typeof L === 'undefined') return;

  // Destroy existing instance before re-init
  if (container._leafletMap) {
    container._leafletMap.remove();
    container._leafletMap = null;
  }

  const validLocs = (locations || []).filter(l => l.lat != null && l.lng != null);
  if (!validLocs.length) {
    container.style.display = 'none';
    return;
  }
  container.style.display = '';

  const map = L.map(container, { scrollWheelZoom: false });
  container._leafletMap = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  const bounds = [];
  validLocs.forEach(loc => {
    L.marker([loc.lat, loc.lng])
      .addTo(map)
      .bindPopup(`<strong>${loc.name || ''}</strong><br>${loc.address || ''}`);
    bounds.push([loc.lat, loc.lng]);
  });

  if (bounds.length === 1) {
    map.setView(bounds[0], 14);
  } else {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
};

// Inject Leaflet CSS + JS lazily when #locations enters the viewport
(function () {
  const locSec = document.getElementById('locations');
  if (!locSec) return;

  new IntersectionObserver(function (entries, obs) {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const s = document.createElement('script');
      s.id  = 'leaflet-js';
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = function () {
        if (window._pendingLocations) {
          window.initLocationsMap(window._pendingLocations);
        }
      };
      document.head.appendChild(s);
    } else if (typeof L !== 'undefined' && window._pendingLocations) {
      window.initLocationsMap(window._pendingLocations);
    }
  }, { threshold: 0.1 }).observe(locSec);
}());


/* ============================================================
   8. GALLERY LIGHTBOX
   Uses event delegation on .gallery-grid so dynamically built
   gallery items are handled without re-binding listeners.
   ============================================================ */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

let currentLightboxIndex = 0;

/** Returns a live snapshot of all .gallery-item elements. */
function getGalleryItems() {
  return [...document.querySelectorAll('.gallery-item')];
}

function openLightbox(index) {
  const items = getGalleryItems();
  if (!items[index]) return;
  currentLightboxIndex = index;
  const item = items[index];
  const img  = item.querySelector('img');
  const cap  = item.querySelector('figcaption');

  lightboxImg.src              = img ? img.src : '';
  lightboxImg.alt              = img ? img.alt : '';
  lightboxCaption.textContent  = cap ? cap.textContent : '';

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  // Delay clearing src to avoid flash on close
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

function showPrev() {
  const items = getGalleryItems();
  if (!items.length) return;
  openLightbox((currentLightboxIndex - 1 + items.length) % items.length);
}

function showNext() {
  const items = getGalleryItems();
  if (!items.length) return;
  openLightbox((currentLightboxIndex + 1) % items.length);
}

// Event delegation — handles dynamically built gallery items
const galleryGrid = document.querySelector('.gallery-grid');
if (galleryGrid) {
  galleryGrid.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    openLightbox(getGalleryItems().indexOf(item));
  });

  galleryGrid.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    e.preventDefault();
    openLightbox(getGalleryItems().indexOf(item));
  });
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrev);
lightboxNext.addEventListener('click', showNext);

// Close when clicking the dark backdrop
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Arrow key navigation (Escape handled in section 3 above)
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft')  showPrev();
});


/* ============================================================
   8. CONTACT FORM VALIDATION
   ============================================================ */
const contactForm = document.getElementById('contactForm');

function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.add('error');
  error.textContent = message;
}

function clearFieldError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.remove('error');
  error.textContent = '';
}

// Inline clear on input
['name', 'email', 'subject', 'message'].forEach(id => {
  const field = document.getElementById(id);
  if (field) {
    field.addEventListener('input', () => clearFieldError(id, `${id}Error`));
    field.addEventListener('change', () => clearFieldError(id, `${id}Error`));
  }
});

contactForm.addEventListener('submit', e => {
  e.preventDefault();

  const nameVal    = document.getElementById('name').value.trim();
  const emailVal   = document.getElementById('email').value.trim();
  const subjectVal = document.getElementById('subject').value;
  const msgVal     = document.getElementById('message').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let isValid = true;

  // Name
  if (!nameVal) {
    setFieldError('name', 'nameError', T('err_name_required'));
    isValid = false;
  } else {
    clearFieldError('name', 'nameError');
  }

  // Email
  if (!emailVal) {
    setFieldError('email', 'emailError', T('err_email_required'));
    isValid = false;
  } else if (!emailRegex.test(emailVal)) {
    setFieldError('email', 'emailError', T('err_email_invalid'));
    isValid = false;
  } else {
    clearFieldError('email', 'emailError');
  }

  // Subject
  if (!subjectVal) {
    setFieldError('subject', 'subjectError', T('err_subject_required'));
    isValid = false;
  } else {
    clearFieldError('subject', 'subjectError');
  }

  // Message
  if (!msgVal || msgVal.length < 10) {
    setFieldError('message', 'messageError', T('err_message_short'));
    isValid = false;
  } else {
    clearFieldError('message', 'messageError');
  }

  if (isValid) {
    // Build and open mailto link
    const content     = (typeof getContent === 'function') ? getContent() : {};
    const recipient   = (content.contact && content.contact.email) || '';
    const subjectEl   = document.getElementById('subject');
    const subjectText = subjectEl.options[subjectEl.selectedIndex]?.text || subjectVal;

    const body = [
      `${T('form_label_name')}: ${nameVal}`,
      `${T('form_label_email')}: ${emailVal}`,
      '',
      `${T('form_label_message')}:`,
      msgVal
    ].join('\n');

    window.location.href = `mailto:${encodeURIComponent(recipient)}`
      + `?subject=${encodeURIComponent(subjectText)}`
      + `&body=${encodeURIComponent(body)}`;

    contactForm.reset();
  } else {
    // Scroll to first error
    const firstError = contactForm.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
