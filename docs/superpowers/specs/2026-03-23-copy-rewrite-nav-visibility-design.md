# Design: Copy Rewrite + Nav Visibility
**Date:** 2026-03-23
**Status:** Approved

---

## Context

Boyle Digital Services website targets business owners in the Berlin-Brandenburg region who know they need a digital presence but lack the time or knowledge to handle it themselves. The current copy uses boastful agency language ("Wachstum durch digitale Exzellenz", "Hunderte von Unternehmen") and inflated stats that don't match the target audience. Nav links for gallery and locations do not respond to the visibility toggles already present in the admin panel.

---

## Goals

1. Rewrite default copy in both DE and EN to use problem-solving, empathetic language aimed at time-poor, non-technical local business owners.
2. Establish the Berlin-Brandenburg region as a trust signal throughout.
3. Nav links (desktop + mobile) and footer quick links for gallery and locations must show/hide in sync with their respective admin visibility checkboxes.

---

## Scope

**In scope:**
- `DEFAULT_CONTENT` in `js/content.js` — hero, about (heading + 3 paragraphs + stats), services (3 cards), footer tagline (via i18n key), both DE and EN.
- `applyContent()` in `js/content.js` — extend to toggle nav/mobile-menu/footer links for gallery and locations.
- No changes to `admin.html`, `admin.js`, `main.js`, or CSS.

**Out of scope:**
- Adding new admin visibility toggles (About, Services, Hero already lack toggles — not requested).
- Any visual/layout changes.

---

## Copy — German (DEFAULT_CONTENT.de)

### Hero
```
eyebrow:  "Ihr Digitalbüro — Berlin-Brandenburg"
headline: "Sie führen Ihr Unternehmen. Wir kümmern uns um Ihren digitalen Auftritt."
subtitle: "Viele Unternehmen wissen, dass sie online präsenter sein sollten — aber es fehlt die Zeit oder das Know-how. Wir übernehmen das für Sie: verständlich, zuverlässig und ohne Fachchinesisch."
```

### About
```
heading: "Digitale Präsenz — ohne Aufwand für Sie"

p0: "Ein gepflegter Webauftritt, der gefunden wird und Vertrauen weckt — das wünschen sich die meisten Unternehmen. Doch zwischen Tagesgeschäft und Kundenterminen bleibt dafür selten Zeit. Genau da kommen wir ins Spiel."

p1: "Wir sind ein kleines, erfahrenes Team aus der Region Berlin-Brandenburg. Wir sprechen kein Agentur-Kauderwelsch, sondern klären mit Ihnen gemeinsam, was Sie wirklich brauchen — und setzen es dann um."

p2: "Ob neue Website, bessere Sichtbarkeit bei Google oder einfach jemand, der sich regelmäßig darum kümmert: Wir sind Ihr direkter Ansprechpartner — verlässlich und vor Ort."
```

### Stats (scaled to modest, believable defaults)
```
{ number: 5,   suffix: '+',   label: 'Jahre Erfahrung'       }
{ number: 30,  suffix: '+',   label: 'Kundenprojekte'         }
{ number: 100, suffix: '%',   label: 'Persönliche Betreuung'  }
```

### Services
```
Produktmanagement:
  "Sie haben eine Idee oder ein laufendes Projekt, aber kein klares System dahinter? Wir bringen Struktur in Ihren digitalen Prozess — von der Planung bis zur Umsetzung."

Webentwicklung:
  "Ihre Website soll gefunden werden, auf dem Handy genauso gut aussehen wie am Computer und Besucher zur Kontaktaufnahme bewegen. Wir bauen das für Sie – ohne Fachjargon, ohne versteckte Kosten."

SEO & Analytics:
  "Wer sucht Sie gerade — und warum findet er die Konkurrenz zuerst? Wir zeigen Ihnen, wo Sie stehen, und verbessern Ihre Sichtbarkeit bei Google Schritt für Schritt."
```

---

## Copy — English (DEFAULT_CONTENT.en)

### Hero
```
eyebrow:  "Your Digital Partner — Berlin-Brandenburg"
headline: "You run your business. We handle your digital presence."
subtitle: "Most businesses know they should be more visible online — but there's never enough time or know-how. We take care of it for you: clear, reliable, and without the jargon."
```

### About
```
heading: "Digital presence — handled for you"

p0: "A professional website that gets found and builds trust — that's what most businesses want. But between daily operations and client meetings, there's rarely time to make it happen. That's where we come in."

p1: "We're a small, experienced team from the Berlin-Brandenburg region. No agency buzzwords — just a straight conversation about what you actually need, followed by getting it done."

p2: "Whether it's a new website, better Google visibility, or someone who keeps things running — we're your go-to contact: dependable and local."
```

### Stats
```
{ number: 5,   suffix: '+',    label: 'Years of Experience' }
{ number: 30,  suffix: '+',    label: 'Client Projects'     }
{ number: 100, suffix: '%',    label: 'Personal Service'    }
```

### Services
```
Product Management:
  "Got an idea or a running project but no clear system behind it? We bring structure to your digital workflow — from planning through to delivery."

Web Development:
  "Your website should get found, look great on mobile, and give visitors a reason to get in touch. We build it for you — no jargon, no hidden costs."

SEO & Analytics:
  "Who's searching for you right now — and why are they finding your competitors first? We show you where you stand and improve your Google visibility step by step."
```

---

## Nav Visibility — Technical Design

### Current behaviour
`applyContent()` in `content.js` already sets `section.hidden` for gallery (`#gallery`) and locations (`#locations`) based on `data.referencesVisible` and `data.locationsVisible`. Nav links and mobile menu links are unaffected.

### New behaviour
After each `section.hidden` assignment, also toggle visibility of:

1. **Desktop nav** — `<li>` wrapping `<a href="#gallery">` inside `.nav-links`
2. **Mobile menu** — `<a href="#gallery">` inside `.mobile-menu`
3. **Footer quick links** — `<a href="#gallery">` inside `.footer-col ul`

Same pattern for `#locations`.

### Footer quick links — confirmed markup
`index.html` footer has a `<a href="#gallery">` inside `.footer-col ul > li` but does **not** have a `<a href="#locations">` link. So `toggleNavLink('#locations', …)` will find no footer element — that is correct and safe (no-op).

### Trigger point — explicit placement
`toggleNavLink` calls are placed at the **end of `applyContent()`**, after all section/content mutations. Both calls are unconditional (they always run, passing `true` or `false` based on the data flag). This avoids any dependency on whether the section element was found.

### Implementation — in `applyContent()` (content.js)

Add `toggleNavLink` as a **module-level helper** (outside `applyContent`, alongside `setText` etc.):

```js
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
  // Note: only #gallery exists in footer; #locations call is a safe no-op.
  document.querySelectorAll(`.footer-col a[href="${href}"]`).forEach(a => {
    if (a.parentElement && a.parentElement.tagName === 'LI') {
      a.parentElement.style.display = show ? '' : 'none';
    }
  });
}
```

At the **end of `applyContent()`**, append:
```js
toggleNavLink('#gallery',   data.referencesVisible !== false);
toggleNavLink('#locations', data.locationsVisible  !== false);
```

### No admin changes needed
The checkboxes `#f-references-visible` and `#f-locations-visible` already exist and their values are already saved/loaded. When the user saves in admin and the main page reloads, `applyContent()` handles everything.

---

## Files changed

| File | Change |
|------|--------|
| `js/content.js` | Update `DEFAULT_CONTENT` (DE + EN copy + stats). Add `toggleNavLink()` helper. Call it in `applyContent()`. |

---

## Acceptance criteria

- [ ] Hero eyebrow references Berlin-Brandenburg in both languages.
- [ ] No copy claims "hundreds of clients" or inflated percentages.
- [ ] About section reads as empathetic, problem-solving, local.
- [ ] Stats default to 5+, 30+, 100% with honest labels.
- [ ] When gallery is hidden in admin → Gallery nav link and mobile menu link disappear on the public site.
- [ ] When locations is hidden in admin → Locations nav link and mobile menu link disappear on the public site.
- [ ] Footer quick link for gallery follows the same toggle (no locations link exists in footer — confirmed).
- [ ] When sections are re-enabled, nav links reappear.
- [ ] English version mirrors all DE changes in tone and substance.
