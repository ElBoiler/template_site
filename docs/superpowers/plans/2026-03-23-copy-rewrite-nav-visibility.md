# Copy Rewrite + Nav Visibility Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite default website copy to problem-solving / local tone and make nav links hide/show when their corresponding section visibility is toggled in the admin panel.

**Architecture:** All changes are in `js/content.js`. The `DEFAULT_CONTENT` object holds all editable copy — updating it changes what visitors see on first load (before any admin customisation). The `applyContent()` function already hides sections; it is extended with a `toggleNavLink()` helper that mirrors section visibility to nav links in three places (desktop nav, mobile menu, footer).

**Tech Stack:** Vanilla JS, no build step, no test runner. Verification is done by opening `index.html` in a browser (or via a local HTTP server).

---

## Chunk 1: Copy rewrite + nav visibility

### Task 1: Update DEFAULT_CONTENT — German copy

**Files:**
- Modify: `js/content.js` (the `de` block inside `DEFAULT_CONTENT`)

- [ ] **Step 1: Open `js/content.js` and locate `DEFAULT_CONTENT.de`**

  Find the `de:` block starting around line 35. You will edit: `hero`, `about.heading`, `about.paragraphs`, `about.stats`, and each object in `services`.

- [ ] **Step 2: Replace `de.hero`**

  ```js
  hero: {
    eyebrow:  'Ihr Digitalbüro — Berlin-Brandenburg',
    headline: 'Sie führen Ihr Unternehmen. Wir kümmern uns um Ihren digitalen Auftritt.',
    subtitle: 'Viele Unternehmen wissen, dass sie online präsenter sein sollten — aber es fehlt die Zeit oder das Know-how. Wir übernehmen das für Sie: verständlich, zuverlässig und ohne Fachchinesisch.'
  },
  ```

- [ ] **Step 3: Replace `de.about`**

  ```js
  about: {
    heading: 'Digitale Präsenz — ohne Aufwand für Sie',
    paragraphs: [
      'Ein gepflegter Webauftritt, der gefunden wird und Vertrauen weckt — das wünschen sich die meisten Unternehmen. Doch zwischen Tagesgeschäft und Kundenterminen bleibt dafür selten Zeit. Genau da kommen wir ins Spiel.',
      'Wir sind ein kleines, erfahrenes Team aus der Region Berlin-Brandenburg. Wir sprechen kein Agentur-Kauderwelsch, sondern klären mit Ihnen gemeinsam, was Sie wirklich brauchen — und setzen es dann um.',
      'Ob neue Website, bessere Sichtbarkeit bei Google oder einfach jemand, der sich regelmäßig darum kümmert: Wir sind Ihr direkter Ansprechpartner — verlässlich und vor Ort.'
    ],
    stats: [
      { number: 5,   suffix: '+',  label: 'Jahre Erfahrung'      },
      { number: 30,  suffix: '+',  label: 'Kundenprojekte'        },
      { number: 100, suffix: '%',  label: 'Persönliche Betreuung' }
    ]
  },
  ```

- [ ] **Step 4: Replace `de.services`**

  ```js
  services: [
    {
      icon:  '📋',
      title: 'Produktmanagement',
      desc:  'Sie haben eine Idee oder ein laufendes Projekt, aber kein klares System dahinter? Wir bringen Struktur in Ihren digitalen Prozess — von der Planung bis zur Umsetzung.'
    },
    {
      icon:  '💻',
      title: 'Webentwicklung',
      desc:  'Ihre Website soll gefunden werden, auf dem Handy genauso gut aussehen wie am Computer und Besucher zur Kontaktaufnahme bewegen. Wir bauen das für Sie – ohne Fachjargon, ohne versteckte Kosten.'
    },
    {
      icon:  '🔍',
      title: 'SEO & Analytics',
      desc:  'Wer sucht Sie gerade — und warum findet er die Konkurrenz zuerst? Wir zeigen Ihnen, wo Sie stehen, und verbessern Ihre Sichtbarkeit bei Google Schritt für Schritt.'
    }
  ],
  ```

- [ ] **Step 5: Verify DE hero section in browser**

  Open `index.html` in a browser (or `http://localhost:<port>/index.html`). Clear localStorage first: open DevTools → Application → Local Storage → delete `bds_content`. Reload.

  Expected:
  - Hero eyebrow: "Ihr Digitalbüro — Berlin-Brandenburg"
  - Hero headline: "Sie führen Ihr Unternehmen. Wir kümmern uns um Ihren digitalen Auftritt."
  - About heading: "Digitale Präsenz — ohne Aufwand für Sie"
  - Stats show 5+, 30+, 100%
  - No mention of "Hunderte" or "Exzellenz"

- [ ] **Step 6: Commit**

  ```bash
  git add js/content.js
  git commit -m "content: rewrite default German copy to problem-solving local tone"
  ```

---

### Task 2: Update DEFAULT_CONTENT — English copy

**Files:**
- Modify: `js/content.js` (the `en` block inside `DEFAULT_CONTENT`)

- [ ] **Step 1: Locate `DEFAULT_CONTENT.en` in `js/content.js`**

  Find the `en:` block (around line 94). You will edit: `hero`, `about.heading`, `about.paragraphs`, `about.stats`, and each object in `services`.

- [ ] **Step 2: Replace `en.hero`**

  ```js
  hero: {
    eyebrow:  'Your Digital Partner — Berlin-Brandenburg',
    headline: 'You run your business. We handle your digital presence.',
    subtitle: 'Most businesses know they should be more visible online — but there\'s never enough time or know-how. We take care of it for you: clear, reliable, and without the jargon.'
  },
  ```

- [ ] **Step 3: Replace `en.about`**

  ```js
  about: {
    heading: 'Digital presence — handled for you',
    paragraphs: [
      'A professional website that gets found and builds trust — that\'s what most businesses want. But between daily operations and client meetings, there\'s rarely time to make it happen. That\'s where we come in.',
      'We\'re a small, experienced team from the Berlin-Brandenburg region. No agency buzzwords — just a straight conversation about what you actually need, followed by getting it done.',
      'Whether it\'s a new website, better Google visibility, or someone who keeps things running — we\'re your go-to contact: dependable and local.'
    ],
    stats: [
      { number: 5,   suffix: '+',    label: 'Years of Experience' },
      { number: 30,  suffix: '+',    label: 'Client Projects'     },
      { number: 100, suffix: '%',    label: 'Personal Service'    }
    ]
  },
  ```

- [ ] **Step 4: Replace `en.services`**

  ```js
  services: [
    {
      icon:  '📋',
      title: 'Product Management',
      desc:  'Got an idea or a running project but no clear system behind it? We bring structure to your digital workflow — from planning through to delivery.'
    },
    {
      icon:  '💻',
      title: 'Web Development',
      desc:  'Your website should get found, look great on mobile, and give visitors a reason to get in touch. We build it for you — no jargon, no hidden costs.'
    },
    {
      icon:  '🔍',
      title: 'SEO & Analytics',
      desc:  'Who\'s searching for you right now — and why are they finding your competitors first? We show you where you stand and improve your Google visibility step by step.'
    }
  ],
  ```

- [ ] **Step 5: Verify EN content in browser**

  Switch language to EN using the DE/EN toggle on `index.html`. Clear localStorage first.

  Expected:
  - Hero eyebrow: "Your Digital Partner — Berlin-Brandenburg"
  - Hero headline: "You run your business. We handle your digital presence."
  - About heading: "Digital presence — handled for you"
  - Stats: 5+ Years of Experience, 30+ Client Projects, 100% Personal Service

- [ ] **Step 6: Commit**

  ```bash
  git add js/content.js
  git commit -m "content: rewrite default English copy to problem-solving local tone"
  ```

---

### Task 3: Add `toggleNavLink` helper and wire it into `applyContent`

**Files:**
- Modify: `js/content.js` — add helper function + two calls at end of `applyContent()`

- [ ] **Step 1: Add `toggleNavLink` as a module-level helper**

  Place it immediately after the `toggleContactItem` function (around line 384), before the `safeUrl` function:

  ```js
  /**
   * Shows or hides nav links (desktop + mobile) and footer quick links
   * for a given anchor href, based on whether the section is visible.
   * @param {string} href   e.g. '#gallery' or '#locations'
   * @param {boolean} show
   */
  function toggleNavLink(href, show) {
    // Desktop nav <ul class="nav-links"> — hide the <li> wrapper
    document.querySelectorAll(`.nav-links a[href="${href}"]`).forEach(a => {
      if (a.parentElement && a.parentElement.tagName === 'LI') {
        a.parentElement.style.display = show ? '' : 'none';
      }
    });
    // Mobile menu <div class="mobile-menu"> — hide the <a> directly (no <li>)
    document.querySelectorAll(`.mobile-menu a[href="${href}"]`).forEach(a => {
      a.style.display = show ? '' : 'none';
    });
    // Footer quick links <div class="footer-col"> — hide the <li> wrapper
    // Note: footer only has #gallery; #locations call is a safe no-op.
    document.querySelectorAll(`.footer-col a[href="${href}"]`).forEach(a => {
      if (a.parentElement && a.parentElement.tagName === 'LI') {
        a.parentElement.style.display = show ? '' : 'none';
      }
    });
  }
  ```

- [ ] **Step 2: Call `toggleNavLink` at the end of `applyContent()`**

  Inside `applyContent()`, find the last line before the closing `}` of the function (after the social links block). Append:

  ```js
  /* Nav link visibility — mirrors section visibility toggles */
  toggleNavLink('#gallery',   data.referencesVisible !== false);
  toggleNavLink('#locations', data.locationsVisible  !== false);
  ```

- [ ] **Step 3: Verify gallery hiding in browser**

  1. Open `admin.html`, log in, go to "Referenzen" section.
  2. Uncheck "Abschnitt anzeigen", save.
  3. Open `index.html` in the same browser.

  Expected:
  - `#gallery` section is hidden.
  - "Referenzen" nav link is gone from desktop nav.
  - "Referenzen" link is gone from mobile menu (open hamburger to verify).
  - "Referenzen" quick link is gone from footer.

- [ ] **Step 4: Verify gallery re-enabling**

  1. Back in `admin.html`, re-check "Abschnitt anzeigen", save.
  2. Reload `index.html`.

  Expected: All three "Referenzen" links reappear.

- [ ] **Step 5: Verify locations hiding in browser**

  1. In `admin.html`, go to "Standorte" section.
  2. Uncheck "Abschnitt anzeigen", save.
  3. Open `index.html`.

  Expected:
  - `#locations` section is hidden.
  - "Standorte" nav link is gone from desktop nav.
  - "Standorte" link is gone from mobile menu.
  - No footer change expected (locations has no footer quick link — correct).

- [ ] **Step 6: Commit**

  ```bash
  git add js/content.js
  git commit -m "feat: hide nav links when section is toggled off in admin"
  ```

---

## Done

All acceptance criteria from the spec should now be met:

- [ ] Hero eyebrow references Berlin-Brandenburg in both languages.
- [ ] No copy claims "hundreds of clients" or inflated percentages.
- [ ] About section reads as empathetic, problem-solving, local.
- [ ] Stats default to 5+, 30+, 100% with honest labels.
- [ ] Gallery hidden → Gallery nav + mobile link hidden.
- [ ] Locations hidden → Locations nav + mobile link hidden.
- [ ] Footer gallery quick link follows gallery toggle.
- [ ] Sections re-enabled → links reappear.
- [ ] English version mirrors DE in tone and substance.
