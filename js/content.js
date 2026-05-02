/* ============================================================
   CHAMISSO-GRUNDSCHULE — content.js
   Single source of truth for editable content across all pages.
   Loaded by every generated HTML page (after i18n.js).

   Schema (content.json / KV):
     {
       schoolName,
       contact: { address, phone, email, hours, social, subjects[] },
       homepage: { carousel[], veranstaltungen[], welcome{}, sduiUrl, brochureUrl },
       pages:    { "/route": { title, body, ... }, ... },
       posts:    [ { id, slug, date, title, excerpt, image, body }, ... ]
     }

   Pages set window.__PAGE_KEY in inline <script> so we know what to render.
   ============================================================ */

'use strict';

/* ── Theme: apply cached values instantly (prevents flash) ── */
(function () {
  try {
    const raw = localStorage.getItem('bds_theme');
    if (!raw) return;
    const theme = JSON.parse(raw);
    Object.entries(theme).forEach(function (entry) {
      document.documentElement.style.setProperty(entry[0], entry[1]);
    });
  } catch (_) {}
})();

const CONTENT_KEY = 'bds_content';
const API_URL     = '/api/content';

const DEFAULT_CONTENT = {
  schoolName: 'Chamisso-Grundschule',

  contact: {
    address: 'Senftenberger Ring 27, 13435 Berlin',
    phone:   '030 / 213 093 70',
    email:   'info@chamisso.schule.berlin.de',
    hours:   'Mo–Fr 7:30–14:00 Uhr',
    subjects: [
      'Allgemeine Anfrage',
      'Anmeldung / Einschulung',
      'EFöB',
      'Krankmeldung',
      'Förderverein',
      'Sonstiges'
    ],
    social: {
      facebook:  '',
      instagram: '',
      twitter:   ''
    }
  },

  homepage: {
    carousel: [
      { src: '/img/banner/banner-01.jpg', alt: 'Schulhof der Chamisso-Grundschule', caption: 'Willkommen an der Chamisso-Grundschule' },
      { src: '/img/banner/banner-02.jpg', alt: 'Kinder beim Singen',                caption: 'Musikalische Grundschule' },
      { src: '/img/banner/banner-03.jpg', alt: 'Schülerinnen und Schüler im Klassenraum', caption: 'Lernen mit Freude' }
    ],
    veranstaltungen: [
      { date: '2025-12-09', title: 'Schulkonzert',     body: 'Konzert der Bettina-von-Arnim-Schülerband im Musikraum.' },
      { date: '2025-12-18', title: 'Wintermarkt',      body: 'Stände, Mitmachaktionen und Glühpunsch auf dem Schulhof.' },
      { date: '2025-12-19', title: 'Weihnachtssingen', body: 'Gemeinsames Singen aller Klassen.' }
    ],
    welcome: {
      heading: 'Willkommen an der Chamisso-Grundschule',
      body: '<p>Wir sind eine Musikalische Grundschule im Berliner Bezirk Reinickendorf. Bei uns lernen, musizieren und wachsen Kinder mit unterschiedlichen Begabungen und Hintergründen — gemeinsam und mit Freude.</p><p>Auf dieser Website finden Sie Informationen zu unserem Unterricht, unseren Angeboten und dem Schulalltag.</p>'
    },
    sduiUrl:     'https://sdui.app/news',
    brochureUrl: '/downloads/chamisso-flyer.pdf'
  },

  theme: {
    '--clr-primary':      '#0B304C',
    '--clr-accent':       '#EECE03',
    '--clr-accent-hover': '#D3B502',
    '--clr-accent-light': '#F1EFE3',
    '--clr-text':         '#333333',
    '--gradient-hero':    'linear-gradient(135deg, #0B304C 0%, #1E5879 60%, #63B9D3 100%)',
  },

  pages: {},

  posts: [
    {
      id: '2025-11-30-weihnachtsbasteln',
      slug: 'weihnachtsbasteln',
      date: '2025-11-30',
      title: 'Weihnachtsbasteln',
      excerpt: 'Am Donnerstag haben wir gemeinsam gebastelt — Sterne, Karten und vieles mehr.',
      image: '/img/news/weihnachtsbasteln.jpg',
      body: '<p>Am Donnerstag haben sich alle Klassen zum gemeinsamen Weihnachtsbasteln getroffen. Mit Schere, Kleber und vielen bunten Materialien sind tolle Sterne, Karten und kleine Geschenke entstanden.</p><p>Vielen Dank an die Eltern, die uns unterstützt haben!</p>'
    },
    {
      id: '2025-11-15-museum',
      slug: 'museumsbesuch-fuenfte-klassen',
      date: '2025-11-15',
      title: 'Museumsbesuch der 5. Klassen',
      excerpt: 'Die fünften Klassen besuchten das Museum für Naturkunde und entdeckten Saurier.',
      image: '/img/news/museum.jpg',
      body: '<p>Im Rahmen des Sachunterrichts besuchten die fünften Klassen das Museum für Naturkunde Berlin. Besonders beeindruckend war der riesige Brachiosaurus im Lichthof.</p>'
    }
  ]
};


/* ============================================================
   FETCH / PERSIST
   ============================================================ */

let _cached = null;

async function getContent() {
  if (_cached) return _cached;

  // 1. Try Worker / KV
  try {
    const res = await fetch(API_URL, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      _cached = deepMerge(DEFAULT_CONTENT, data || {});
      return _cached;
    }
  } catch (_) { /* fall through */ }

  // 2. Local override (admin offline edits)
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (raw) {
      _cached = deepMerge(DEFAULT_CONTENT, JSON.parse(raw));
      return _cached;
    }
  } catch (_) { /* ignore */ }

  // 3. Defaults
  _cached = DEFAULT_CONTENT;
  return _cached;
}

async function saveContent(data) {
  _cached = data;
  try { localStorage.setItem(CONTENT_KEY, JSON.stringify(data)); } catch (_) {}

  const apiKey = localStorage.getItem('bds_api_key');
  if (!apiKey) return { ok: false, error: 'no_api_key' };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(data)
    });
    if (res.ok) return { ok: true, source: 'kv' };
    if (res.status === 401) return { ok: false, error: 'unauthorized' };
    return { ok: false, error: `http_${res.status}` };
  } catch (_) {
    return { ok: false, error: 'network' };
  }
}

async function resetContent() {
  _cached = null;
  localStorage.removeItem(CONTENT_KEY);
  const apiKey = localStorage.getItem('bds_api_key');
  if (!apiKey) return;
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(DEFAULT_CONTENT)
    });
  } catch (_) { /* ignore */ }
}

function deepMerge(defaults, overrides) {
  if (overrides == null) return defaults;
  if (Array.isArray(overrides)) return overrides;
  if (typeof overrides !== 'object') return overrides;
  const out = Object.assign({}, defaults);
  for (const k of Object.keys(overrides)) {
    const dv = defaults ? defaults[k] : undefined;
    if (dv && typeof dv === 'object' && !Array.isArray(dv) && typeof overrides[k] === 'object') {
      out[k] = deepMerge(dv, overrides[k]);
    } else {
      out[k] = overrides[k];
    }
  }
  return out;
}


/* ============================================================
   FORMAT HELPERS
   ============================================================ */

function escAttr(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escText(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(iso) {
  const months = ['Jan.', 'Feb.', 'März', 'April', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDayMonth(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { day: '', month: '' };
  const monthsShort = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return { day: String(d.getDate()), month: monthsShort[d.getMonth()] };
}


/* ============================================================
   RENDERERS
   ============================================================ */

function renderContact(data) {
  const c = data.contact || {};

  document.querySelectorAll('[data-content="contact.address"]').forEach(el => {
    if (c.address) el.innerHTML = escText(c.address).replace(/, /g, '<br>');
  });
  document.querySelectorAll('[data-content="contact.phone"]').forEach(el => {
    if (!c.phone) return;
    el.textContent = c.phone;
    if (el.tagName === 'A') el.href = `tel:${c.phone.replace(/[\s\-().\/]/g, '')}`;
  });
  document.querySelectorAll('[data-content="contact.email"]').forEach(el => {
    if (!c.email) return;
    el.textContent = c.email;
    if (el.tagName === 'A') el.href = `mailto:${c.email}`;
  });
  document.querySelectorAll('[data-content="contact.hours"]').forEach(el => {
    if (c.hours) el.textContent = c.hours;
  });

  // Subject dropdown (kontakt page)
  const subjectSelect = document.getElementById('subject');
  if (subjectSelect && Array.isArray(c.subjects)) {
    while (subjectSelect.options.length > 1) subjectSelect.remove(1);
    c.subjects.forEach(label => {
      if (!label) return;
      const opt = document.createElement('option');
      opt.value = label;
      opt.textContent = label;
      subjectSelect.appendChild(opt);
    });
  }

  // Social links — hide ones without URLs
  const socialContainer = document.getElementById('socialLinksContainer');
  if (socialContainer) {
    const social = c.social || {};
    let visible = 0;
    socialContainer.querySelectorAll('[data-social]').forEach(a => {
      const key = a.dataset.social;
      const url = social[key];
      if (url) { a.href = url; a.style.display = ''; visible++; }
      else      { a.style.display = 'none'; }
    });
    if (!visible) socialContainer.style.display = 'none';
  }
}

function renderPage(data) {
  const key = window.__PAGE_KEY;
  if (!key || !data.pages) return;
  const page = data.pages[key];
  if (!page) return;

  if (page.body) {
    document.querySelectorAll('[data-content="page.body"]').forEach(el => {
      el.innerHTML = page.body;
    });
  }
}

function renderHomepage(data) {
  const home = data.homepage || {};

  if (home.welcome) {
    document.querySelectorAll('[data-content="home.welcome.heading"]').forEach(el => {
      if (home.welcome.heading) el.textContent = home.welcome.heading;
    });
    document.querySelectorAll('[data-content="home.welcome.body"]').forEach(el => {
      if (home.welcome.body) el.innerHTML = home.welcome.body;
    });
  }

  document.querySelectorAll('[data-content="home.sduiUrl"]').forEach(el => {
    if (home.sduiUrl) el.href = home.sduiUrl;
  });
  document.querySelectorAll('[data-content="home.brochureUrl"]').forEach(el => {
    if (home.brochureUrl) el.href = home.brochureUrl;
  });

  if (typeof window.initCarousel === 'function') {
    const items = (home.carousel || []).filter(it => it && it.src);
    window.initCarousel(items);
  }

  const eventsList = document.getElementById('eventsList');
  if (eventsList) {
    const items = home.veranstaltungen || [];
    if (!items.length) {
      eventsList.innerHTML = '<li class="event-item"><div class="event-body"><p>Aktuell keine Veranstaltungen geplant.</p></div></li>';
    } else {
      eventsList.innerHTML = items.map(ev => {
        const { day, month } = formatDayMonth(ev.date);
        return (
          `<li class="event-item">` +
            `<div class="event-date"><strong>${escText(day)}</strong>${escText(month)}</div>` +
            `<div class="event-body">` +
              `<h3>${escText(ev.title || '')}</h3>` +
              (ev.body ? `<p>${escText(ev.body)}</p>` : '') +
            `</div>` +
          `</li>`
        );
      }).join('');
    }
  }

  renderNewsGrid(data, 3);
}

function renderNewsGrid(data, limit) {
  const grid  = document.getElementById('newsGrid');
  const empty = document.getElementById('newsEmpty');
  if (!grid) return;

  const posts = (data.posts || [])
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const slice = (typeof limit === 'number') ? posts.slice(0, limit) : posts;

  if (!slice.length) {
    grid.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  grid.innerHTML = slice.map(p => {
    const href = `/aktuelles/${encodeURIComponent(p.slug || p.id)}`;
    const img  = p.image ? `<a class="news-card__image" href="${href}"><img src="${escAttr(p.image)}" alt="${escAttr(p.title || '')}" loading="lazy"></a>` : '';
    return (
      `<li class="news-card">` +
        img +
        `<div class="news-card__body">` +
          `<p class="news-card__date">${escText(formatDate(p.date))}</p>` +
          `<h3 class="news-card__title"><a href="${href}">${escText(p.title || '')}</a></h3>` +
          `<p class="news-card__excerpt">${escText(p.excerpt || '')}</p>` +
          `<a class="news-card__more" href="${href}">Weiterlesen →</a>` +
        `</div>` +
      `</li>`
    );
  }).join('');
}


/* ============================================================
   THEME
   ============================================================ */

const THEME_KEY   = 'bds_theme';
const THEME_PROPS = [
  '--clr-primary', '--clr-accent', '--clr-accent-hover',
  '--clr-accent-light', '--clr-text', '--gradient-hero',
];

function applyAndCacheTheme(theme) {
  if (!theme || typeof theme !== 'object') return;
  Object.entries(theme).forEach(([p, v]) => {
    document.documentElement.style.setProperty(p, v);
  });
  try { localStorage.setItem(THEME_KEY, JSON.stringify(theme)); } catch (_) {}
}

function removeTheme() {
  THEME_PROPS.forEach(p => document.documentElement.style.removeProperty(p));
  localStorage.removeItem(THEME_KEY);
}


/* ============================================================
   APPLY
   ============================================================ */

function applyContent(data) {
  renderContact(data);
  renderPage(data);
  if (window.__PAGE_KEY === '/')          renderHomepage(data);
  if (window.__PAGE_KEY === '/aktuelles') renderNewsGrid(data, null);
}


/* ============================================================
   BOOTSTRAP
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await getContent();
    applyContent(data);
    applyAndCacheTheme(data.theme);
  } catch (err) {
    console.error('content.js: failed to load content', err);
    applyContent(DEFAULT_CONTENT);
    applyAndCacheTheme(DEFAULT_CONTENT.theme);
  }
});


/* ============================================================
   EXPORTS (for admin.js)
   ============================================================ */

window.getContent          = getContent;
window.saveContent         = saveContent;
window.resetContent        = resetContent;
window.applyContent        = applyContent;
window.DEFAULT_CONTENT     = DEFAULT_CONTENT;
window.applyAndCacheTheme  = applyAndCacheTheme;
window.removeTheme         = removeTheme;
