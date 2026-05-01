/* ============================================================
   CHAMISSO-GRUNDSCHULE — main.js
   - Navbar scroll state
   - Mobile menu (hamburger)
   - Dropdown nav (desktop hover/click + keyboard ARIA)
   - Hero carousel (autoplay, dots, prev/next, reduced-motion safe)
   - Contact form validation + mailto fallback
   - Footer year
   ============================================================ */

'use strict';

(function () {

  /* ── 1. Navbar scroll state ───────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ── 2. Mobile menu ───────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function openMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
  }


  /* ── 3. Dropdown nav (desktop) ────────────────────────── */
  const dropdownItems = document.querySelectorAll('.nav-links .has-dropdown');

  function closeAllDropdowns(except) {
    dropdownItems.forEach(item => {
      if (item !== except) {
        item.dataset.open = 'false';
        const btn = item.querySelector('.dropdown-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  dropdownItems.forEach(item => {
    const toggle = item.querySelector('.dropdown-toggle');
    if (!toggle) return;
    item.dataset.open = 'false';

    // Click toggle (works for touch + click + keyboard Enter/Space)
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = item.dataset.open === 'true';
      closeAllDropdowns(item);
      item.dataset.open = isOpen ? 'false' : 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Hover open (desktop only)
    if (window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) {
      item.addEventListener('mouseenter', () => {
        closeAllDropdowns(item);
        item.dataset.open = 'true';
        toggle.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', () => {
        item.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) closeAllDropdowns(null);
  });

  // Close dropdowns + mobile menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAllDropdowns(null);
    if (mobileMenu && mobileMenu.classList.contains('open')) closeMobileMenu();
  });


  /* ── 4. Scroll reveal (cheap, optional) ───────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => obs.observe(el));
    window.observeRevealEls = function () {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
    };
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
    window.observeRevealEls = function () {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
    };
  }


  /* ── 5. Hero carousel ─────────────────────────────────── */
  const carousel = document.getElementById('heroCarousel');
  if (carousel) {
    const track = document.getElementById('carouselTrack');
    const dotsWrap = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    let slides = [];
    let dots   = [];
    let active = 0;
    let timer  = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(i) {
      if (!slides.length) return;
      active = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === active));
      dots.forEach((d, k)  => d.setAttribute('aria-current', k === active ? 'true' : 'false'));
    }

    function startAuto() {
      if (reducedMotion || slides.length < 2) return;
      stopAuto();
      timer = setInterval(() => go(active + 1), 5500);
    }

    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

    /** Called by content.js once slides are rendered. */
    window.initCarousel = function (items) {
      if (!track || !Array.isArray(items)) return;

      track.innerHTML = items.map((it, i) =>
        `<div class="carousel-slide${i === 0 ? ' is-active' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} von ${items.length}">` +
          `<img src="${it.src}" alt="${(it.alt || '').replace(/"/g, '&quot;')}" loading="${i === 0 ? 'eager' : 'lazy'}">` +
          (it.caption ? `<div class="carousel-caption">${it.caption}</div>` : '') +
        `</div>`
      ).join('');

      if (dotsWrap) {
        dotsWrap.innerHTML = items.map((_, i) =>
          `<button type="button" class="carousel-dot" role="tab" aria-current="${i === 0 ? 'true' : 'false'}" aria-label="Bild ${i + 1}"></button>`
        ).join('');
      }

      slides = Array.from(track.querySelectorAll('.carousel-slide'));
      dots   = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.carousel-dot')) : [];

      dots.forEach((d, i) => d.addEventListener('click', () => { go(i); startAuto(); }));
      active = 0;
      startAuto();
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { go(active - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { go(active + 1); startAuto(); });
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin',   stopAuto);
    carousel.addEventListener('focusout',  startAuto);
  }


  /* ── 6. Contact form (validation + mailto fallback) ───── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {

    function setFieldError(id, errId, msg) {
      const f = document.getElementById(id);
      const e = document.getElementById(errId);
      if (f) f.classList.add('error');
      if (e) e.textContent = msg;
    }

    function clearFieldError(id, errId) {
      const f = document.getElementById(id);
      const e = document.getElementById(errId);
      if (f) f.classList.remove('error');
      if (e) e.textContent = '';
    }

    ['name', 'email', 'subject', 'message'].forEach(id => {
      const f = document.getElementById(id);
      if (!f) return;
      f.addEventListener('input',  () => clearFieldError(id, `${id}Error`));
      f.addEventListener('change', () => clearFieldError(id, `${id}Error`));
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = document.getElementById('name').value.trim();
      const email   = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value;
      const msg     = document.getElementById('message').value.trim();
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      let ok = true;
      if (!name)                   { setFieldError('name', 'nameError', 'Bitte geben Sie Ihren Namen an.'); ok = false; }
      else                           clearFieldError('name', 'nameError');

      if (!email)                  { setFieldError('email', 'emailError', 'Bitte geben Sie Ihre E-Mail-Adresse an.'); ok = false; }
      else if (!re.test(email))    { setFieldError('email', 'emailError', 'Bitte geben Sie eine gültige E-Mail-Adresse an.'); ok = false; }
      else                           clearFieldError('email', 'emailError');

      if (!subject)                { setFieldError('subject', 'subjectError', 'Bitte wählen Sie einen Betreff.'); ok = false; }
      else                           clearFieldError('subject', 'subjectError');

      if (!msg || msg.length < 10) { setFieldError('message', 'messageError', 'Bitte schreiben Sie mindestens 10 Zeichen.'); ok = false; }
      else                           clearFieldError('message', 'messageError');

      if (!ok) {
        const first = contactForm.querySelector('.error');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Compose mailto link
      const data = (typeof getContent === 'function') ? await getContent() : {};
      const recipient = (data.contact && data.contact.email) || 'info@chamisso.schule.berlin.de';
      const body = [
        `Name: ${name}`,
        `E-Mail: ${email}`,
        '',
        'Nachricht:',
        msg
      ].join('\n');

      window.location.href =
        `mailto:${encodeURIComponent(recipient)}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      contactForm.reset();
    });
  }


  /* ── 7. Footer year ───────────────────────────────────── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

}());
