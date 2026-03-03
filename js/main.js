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


/* ============================================================
   7. GALLERY LIGHTBOX
   ============================================================ */
const galleryItems   = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose  = document.getElementById('lightboxClose');
const lightboxPrev   = document.getElementById('lightboxPrev');
const lightboxNext   = document.getElementById('lightboxNext');

let currentLightboxIndex = 0;

function openLightbox(index) {
  currentLightboxIndex = index;
  const item = galleryItems[index];
  const img  = item.querySelector('img');
  const cap  = item.querySelector('figcaption');

  lightboxImg.src        = img.src;
  lightboxImg.alt        = img.alt;
  lightboxCaption.textContent = cap ? cap.textContent : '';

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
  const newIndex = (currentLightboxIndex - 1 + galleryItems.length) % galleryItems.length;
  openLightbox(newIndex);
}

function showNext() {
  const newIndex = (currentLightboxIndex + 1) % galleryItems.length;
  openLightbox(newIndex);
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  // Keyboard: activate on Enter/Space
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(i);
    }
  });
});

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
const contactForm     = document.getElementById('contactForm');
const successMessage  = document.getElementById('successMessage');

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
    setFieldError('name', 'nameError', 'Please enter your full name.');
    isValid = false;
  } else {
    clearFieldError('name', 'nameError');
  }

  // Email
  if (!emailVal) {
    setFieldError('email', 'emailError', 'Please enter your email address.');
    isValid = false;
  } else if (!emailRegex.test(emailVal)) {
    setFieldError('email', 'emailError', 'Please enter a valid email address.');
    isValid = false;
  } else {
    clearFieldError('email', 'emailError');
  }

  // Subject
  if (!subjectVal) {
    setFieldError('subject', 'subjectError', 'Please select a subject.');
    isValid = false;
  } else {
    clearFieldError('subject', 'subjectError');
  }

  // Message
  if (!msgVal || msgVal.length < 10) {
    setFieldError('message', 'messageError', 'Please enter a message (at least 10 characters).');
    isValid = false;
  } else {
    clearFieldError('message', 'messageError');
  }

  if (isValid) {
    // Fade out form, show success
    contactForm.style.transition = 'opacity 0.35s ease';
    contactForm.style.opacity    = '0';
    setTimeout(() => {
      contactForm.style.display = 'none';
      successMessage.classList.add('show');
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 350);
  } else {
    // Scroll to first error
    const firstError = contactForm.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
