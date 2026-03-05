/* ============================================================
   BOYLE DIGITAL SERVICES — content.js
   Single source of truth for all editable site content.
   Loaded by both index.html and admin.html (after i18n.js).
   ============================================================ */

'use strict';

const CONTENT_KEY = 'bds_content';

const DEFAULT_CONTENT = {
  companyName: 'Boyle Digital Services',  // language-neutral
  referencesVisible: true,                // language-neutral toggle

  contact: {                               // language-neutral
    address:  '123 Digital Avenue, Dublin, Ireland',
    phone:    '+353 1 234 5678',
    email:    'hello@boyledigital.ie',
    subjects: [
      { de: 'Allgemeine Anfrage',  en: 'General Inquiry'   },
      { de: 'Projektangebot',      en: 'Project Proposal'  },
      { de: 'Support',             en: 'Support'           },
      { de: 'Sonstiges',           en: 'Other'             }
    ],
    social: {
      linkedin:  '',
      twitter:   '',
      instagram: '',
      tiktok:    ''
    }
  },

  /* ── German content (default language) ──────────────────── */
  de: {
    hero: {
      eyebrow:  'Digitalagentur',
      headline: 'Wachstum durch digitale Exzellenz',
      subtitle: 'Wir helfen Unternehmen, sich in der digitalen Welt zu behaupten – durch strategisches Produktmanagement, datengetriebenes Marketing und moderne Webentwicklung.'
    },

    about: {
      heading: 'Ihr Partner für die digitale Transformation',
      paragraphs: [
        'Bei Boyle Digital Services sind wir überzeugt, dass jedes Unternehmen eine starke digitale Präsenz verdient. Gegründet mit Leidenschaft für Technologie und dem Anspruch auf messbare Ergebnisse, haben wir bereits Hunderte von Unternehmen dabei unterstützt, ihre digitale Strategie von Grund auf zu transformieren.',
        'Unser interdisziplinäres Team vereint tiefgehende technische Expertise mit kreativem Denken und datengestützten Erkenntnissen. Egal, ob Sie ein neues Produkt einführen, Ihre Marketingaktivitäten skalieren oder Ihren Webauftritt erneuern möchten – wir liefern Lösungen, die wirklich etwas bewegen.',
        'Wir sind nicht nur ein Dienstleister – wir sind ein langfristiger Partner, der in Ihren Erfolg investiert. Jede Zusammenarbeit beginnt mit einem gründlichen Verständnis Ihrer Ziele, Ihrer Zielgruppe und Ihres Wettbewerbsumfelds.'
      ],
      stats: [
        { number: 150, suffix: '+',    label: 'Zufriedene Kunden'       },
        { number: 320, suffix: '+',    label: 'Abgeschlossene Projekte' },
        { number: 8,   suffix: ' J.',  label: 'Jahre Erfahrung'         },
        { number: 98,  suffix: '%',    label: 'Kundenzufriedenheit'     }
      ]
    },

    services: [
      {
        icon:  '📋',
        title: 'Produktmanagement',
        desc:  'Strategische Roadmaps, Backlog-Priorisierung und bereichsübergreifende Teamkoordination – damit Ihre Produktvision termingerecht und budgetkonform Wirklichkeit wird.'
      },
      {
        icon:  '💻',
        title: 'Webentwicklung',
        desc:  'Individuelle, responsive Websites und Web-Applikationen mit modernen Technologien – schnell, barrierefrei und für maximale Conversion optimiert.'
      },
      {
        icon:  '🔍',
        title: 'SEO & Analytics',
        desc:  'Technische SEO-Audits, Content-Strategie und Analytics-Dashboards, die Ihnen klaren Einblick in die treibenden Faktoren Ihres Wachstums geben.'
      }
    ],

    gallery: [
      { src: 'https://picsum.photos/seed/bds1/600/400',  alt: 'Digitale Marketingkampagne',       caption: 'Digitale Marketingkampagne'      },
      { src: 'https://picsum.photos/seed/bds2/600/400',  alt: 'E-Commerce-Webplattform',          caption: 'E-Commerce-Webplattform'         },
      { src: 'https://picsum.photos/seed/bds3/600/400',  alt: 'Markenidentität Relaunch',         caption: 'Markenidentität Relaunch'        },
      { src: 'https://picsum.photos/seed/bds4/600/400',  alt: 'SaaS-Produktlaunch',               caption: 'SaaS-Produktlaunch'              },
      { src: 'https://picsum.photos/seed/bds5/600/400',  alt: 'SEO- und Analytics-Dashboard',    caption: 'SEO & Analytics Dashboard'       },
      { src: 'https://picsum.photos/seed/bds6/600/400',  alt: 'Social-Media-Strategie',           caption: 'Social-Media-Strategie'          },
      { src: 'https://picsum.photos/seed/bds7/600/400',  alt: 'Team-Workshop Zusammenarbeit',     caption: 'Team-Workshop Zusammenarbeit'    },
      { src: 'https://picsum.photos/seed/bds8/600/400',  alt: 'Mobile-App-Design',                caption: 'Mobile-App-Design'               },
      { src: 'https://picsum.photos/seed/bds9/600/400',  alt: 'E-Mail-Marketingkampagne',         caption: 'E-Mail-Marketingkampagne'        },
      { src: 'https://picsum.photos/seed/bds10/600/400', alt: 'Content-Strategie Workshop',       caption: 'Content-Strategie Workshop'      },
      { src: 'https://picsum.photos/seed/bds11/600/400', alt: 'Datenanalyse-Bericht',             caption: 'Datenanalyse-Bericht'            },
      { src: 'https://picsum.photos/seed/bds12/600/400', alt: 'Kundenerfolgsgeschichte',          caption: 'Kundenerfolgsgeschichte'         }
    ]
  },

  /* ── English content ─────────────────────────────────────── */
  en: {
    hero: {
      eyebrow:  'Digital Services Agency',
      headline: 'Driving Growth Through Digital Excellence',
      subtitle: 'We help businesses thrive in the digital landscape through strategic product management, data-driven marketing, and cutting-edge web development.'
    },

    about: {
      heading: 'Your Partner in Digital Transformation',
      paragraphs: [
        'At Boyle Digital Services, we believe every business deserves a powerful digital presence. Founded with a passion for technology and a commitment to measurable results, we\'ve helped hundreds of businesses transform their digital strategy from the ground up.',
        'Our multidisciplinary team combines deep technical expertise with creative thinking and data-driven insights. Whether you\'re launching a new product, scaling your marketing efforts, or rebuilding your web presence, we deliver solutions that move the needle.',
        'We\'re not just a service provider — we\'re a long-term partner invested in your success. Every engagement begins with a thorough understanding of your goals, audience, and competitive landscape.'
      ],
      stats: [
        { number: 150, suffix: '+',    label: 'Happy Clients'       },
        { number: 320, suffix: '+',    label: 'Projects Delivered'  },
        { number: 8,   suffix: ' yrs', label: 'Years of Experience' },
        { number: 98,  suffix: '%',    label: 'Client Satisfaction' }
      ]
    },

    services: [
      {
        icon:  '📋',
        title: 'Product Management',
        desc:  'Strategic roadmapping, backlog prioritisation, and cross-functional team alignment to bring your product vision to life on time and on budget.'
      },
      {
        icon:  '💻',
        title: 'Web Development',
        desc:  'Custom, responsive websites and web applications built with modern technologies — fast, accessible, and optimised for conversion.'
      },
      {
        icon:  '🔍',
        title: 'SEO & Analytics',
        desc:  'Technical SEO audits, content strategy, and analytics dashboards that give you clear visibility into what\'s driving your growth.'
      }
    ],

    gallery: [
      { src: 'https://picsum.photos/seed/bds1/600/400',  alt: 'Digital marketing campaign',  caption: 'Digital Marketing Campaign'  },
      { src: 'https://picsum.photos/seed/bds2/600/400',  alt: 'E-commerce web platform',     caption: 'E-Commerce Web Platform'     },
      { src: 'https://picsum.photos/seed/bds3/600/400',  alt: 'Brand identity refresh',      caption: 'Brand Identity Refresh'      },
      { src: 'https://picsum.photos/seed/bds4/600/400',  alt: 'SaaS product launch',         caption: 'SaaS Product Launch'         },
      { src: 'https://picsum.photos/seed/bds5/600/400',  alt: 'SEO and analytics dashboard', caption: 'SEO & Analytics Dashboard'   },
      { src: 'https://picsum.photos/seed/bds6/600/400',  alt: 'Social media strategy',       caption: 'Social Media Strategy'       },
      { src: 'https://picsum.photos/seed/bds7/600/400',  alt: 'Team collaboration workshop', caption: 'Team Collaboration Workshop'  },
      { src: 'https://picsum.photos/seed/bds8/600/400',  alt: 'Mobile app design',           caption: 'Mobile App Design'           },
      { src: 'https://picsum.photos/seed/bds9/600/400',  alt: 'Email marketing campaign',    caption: 'Email Marketing Campaign'    },
      { src: 'https://picsum.photos/seed/bds10/600/400', alt: 'Content strategy workshop',   caption: 'Content Strategy Workshop'   },
      { src: 'https://picsum.photos/seed/bds11/600/400', alt: 'Data analytics report',       caption: 'Data Analytics Report'       },
      { src: 'https://picsum.photos/seed/bds12/600/400', alt: 'Client success story',        caption: 'Client Success Story'        }
    ]
  }
};


/* ============================================================
   Storage helpers
   ============================================================ */

function getContent() {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
    // Deep-merge so new default keys (e.g. new language block) don't break old saves
    return deepMerge(DEFAULT_CONTENT, JSON.parse(raw));
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  }
}

function saveContent(data) {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(data));
}

function resetContent() {
  localStorage.removeItem(CONTENT_KEY);
}

function deepMerge(defaults, overrides) {
  const result = Object.assign({}, defaults);
  for (const key of Object.keys(overrides)) {
    if (
      key in defaults &&
      typeof defaults[key] === 'object' &&
      defaults[key] !== null &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}


/* ============================================================
   DOM patching — called on index.html load
   lang: 'de' | 'en'  (defaults to getLang() from i18n.js)
   ============================================================ */

function applyContent(data, lang) {
  const l  = (lang && ['de','en'].includes(lang)) ? lang : (typeof getLang === 'function' ? getLang() : 'de');
  const ld = (data[l] && data[l].hero) ? data[l] : data['de']; // language-specific block

  /* Company name — nav logo + footer logo */
  document.querySelectorAll('.nav-logo, .footer-logo').forEach(el => {
    el.innerHTML = formatCompanyName(data.companyName);
  });

  /* Hero */
  setText('[data-content="hero.eyebrow"]',  ld.hero.eyebrow);
  setText('[data-content="hero.headline"]', ld.hero.headline);
  setText('[data-content="hero.subtitle"]', ld.hero.subtitle);

  /* About */
  setText('[data-content="about.heading"]', ld.about.heading);
  ld.about.paragraphs.forEach((p, i) => setText(`[data-content="about.p${i}"]`, p));

  /* Stats — rebuild dynamically (supports 1–6 items) */
  const statsWrap = document.querySelector('.about-stats');
  if (statsWrap) {
    statsWrap.innerHTML = '';
    (ld.about.stats || []).forEach((s, i) => {
      statsWrap.insertAdjacentHTML('beforeend',
        `<div class="stat-card reveal" data-stat="${i}">` +
          `<div class="stat-value">` +
            `<span class="stat-number counter" data-target="${Number(s.number) || 0}" data-field="number">${Number(s.number) || 0}</span>` +
            `<span class="stat-suffix" data-field="suffix">${esc(s.suffix)}</span>` +
          `</div>` +
          `<p class="stat-label" data-field="label">${esc(s.label)}</p>` +
        `</div>`
      );
    });
  }

  /* Services — rebuild dynamically (supports 1–9 items) */
  const svcGrid = document.querySelector('.services-grid');
  if (svcGrid) {
    svcGrid.innerHTML = '';
    (ld.services || []).forEach((s, i) => {
      svcGrid.insertAdjacentHTML('beforeend',
        `<div class="service-card reveal" data-service="${i}">` +
          `<span class="service-icon" aria-hidden="true" data-field="icon">${esc(s.icon)}</span>` +
          `<h3 data-field="title">${esc(s.title)}</h3>` +
          `<p data-field="desc">${esc(s.desc)}</p>` +
        `</div>`
      );
    });
  }

  /* Gallery — optional section + dynamic items (0–12) */
  const gallerySection = document.getElementById('gallery');
  if (gallerySection) {
    gallerySection.hidden = (data.referencesVisible === false);
  }
  const galleryGrid = document.querySelector('.gallery-grid');
  if (galleryGrid) {
    galleryGrid.innerHTML = '';
    (ld.gallery || []).forEach((item, i) => {
      const src = safeUrl(item.src);
      if (!src) return;
      galleryGrid.insertAdjacentHTML('beforeend',
        `<figure class="gallery-item reveal" data-index="${i}" tabindex="0" role="button">` +
          `<img src="${esc(src)}" alt="${esc(item.alt)}" loading="lazy">` +
          `<figcaption>${esc(item.caption)}</figcaption>` +
          `<div class="gallery-overlay" aria-hidden="true"><span class="zoom-icon">⊕</span></div>` +
        `</figure>`
      );
    });
  }

  /* Re-register newly built .reveal and .counter elements with main.js observers */
  if (typeof window.observeRevealEls === 'function') window.observeRevealEls();
  if (typeof window.observeCounterEls === 'function') window.observeCounterEls();

  /* Contact — hide any item whose field is blank */
  toggleContactItem('address', !!data.contact.address);
  if (data.contact.address) setText('[data-content="contact.address"]', data.contact.address);

  toggleContactItem('phone', !!data.contact.phone);
  if (data.contact.phone) {
    document.querySelectorAll('[data-content="contact.phone"]').forEach(el => {
      el.textContent = data.contact.phone;
      el.href = `tel:${data.contact.phone.replace(/[\s\-().]/g, '')}`;
    });
  }

  toggleContactItem('email', !!data.contact.email);
  if (data.contact.email) {
    document.querySelectorAll('[data-content="contact.email"]').forEach(el => {
      el.textContent = data.contact.email;
      el.href = `mailto:${data.contact.email}`;
    });
  }

  /* Subject dropdown — rebuild from admin-configured subjects */
  const subjectSelect = document.getElementById('subject');
  if (subjectSelect) {
    const subjects = (data.contact && data.contact.subjects) || [];
    while (subjectSelect.options.length > 1) subjectSelect.remove(1);
    subjects.forEach(s => {
      const label = s[l] || s.de || s.en || '';
      if (!label) return;
      const opt = document.createElement('option');
      opt.value = label;
      opt.textContent = label;
      subjectSelect.appendChild(opt);
    });
  }

  /* Social links — rebuild from URLs, hide container if all blank */
  const socialContainer = document.getElementById('socialLinksContainer');
  if (socialContainer) {
    const SOCIALS = [
      { key: 'linkedin',  abbr: 'Li', label: 'LinkedIn'    },
      { key: 'twitter',   abbr: 'Tw', label: 'Twitter / X' },
      { key: 'instagram', abbr: 'Ig', label: 'Instagram'   },
      { key: 'tiktok',    abbr: 'Tk', label: 'TikTok'      }
    ];
    const social = data.contact.social || {};
    const links  = SOCIALS
      .filter(s => safeUrl(social[s.key]))
      .map(s =>
        `<a href="${esc(safeUrl(social[s.key]))}" class="social-link" ` +
        `aria-label="${s.label}" target="_blank" rel="noopener noreferrer">${s.abbr}</a>`
      )
      .join('');
    socialContainer.innerHTML = links;
    socialContainer.style.display = links ? '' : 'none';
  }
}


/* ============================================================
   Helpers
   ============================================================ */

function setText(selector, value) {
  document.querySelectorAll(selector).forEach(el => { el.textContent = value; });
}

function setFieldText(parent, field, value) {
  const el = parent.querySelector(`[data-field="${field}"]`);
  if (el) el.textContent = value;
}

/**
 * Renders company name with the second word wrapped in a teal <span>.
 * e.g. "Boyle Digital Services" → 'Boyle <span>Digital</span> Services'
 */
function formatCompanyName(name) {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) return esc(words[0] || name);
  if (words.length === 2) return `${esc(words[0])} <span>${esc(words[1])}</span>`;
  return `${esc(words[0])} <span>${esc(words[1])}</span> ${words.slice(2).map(esc).join(' ')}`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Show or hide all elements labelled with [data-contact-item="key"]. */
function toggleContactItem(key, show) {
  document.querySelectorAll(`[data-contact-item="${key}"]`).forEach(el => {
    el.style.display = show ? '' : 'none';
  });
}

/** Returns the URL only if it uses http/https; otherwise returns ''. */
function safeUrl(url) {
  if (!url) return '';
  try {
    const p = new URL(url);
    return (p.protocol === 'http:' || p.protocol === 'https:') ? url : '';
  } catch { return ''; }
}


/* ============================================================
   Auto-apply on index.html load
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const lang = typeof getLang === 'function' ? getLang() : 'de';
  applyContent(getContent(), lang);
});


/* ============================================================
   THEME — apply stored colour scheme from localStorage
   ============================================================ */

const THEME_KEY = 'bds_theme';

/**
 * Reads bds_theme from localStorage and sets each CSS custom
 * property directly on :root (document.documentElement.style).
 * Called on every page load. No-ops if no theme is stored.
 */
function applyStoredTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return;
    const theme = JSON.parse(raw);
    Object.entries(theme).forEach(([prop, value]) => {
      document.documentElement.style.setProperty(prop, value);
    });
  } catch (e) {
    // Corrupt data — silently clear it
    localStorage.removeItem(THEME_KEY);
  }
}

/**
 * Removes all inline CSS custom properties previously set by
 * applyStoredTheme, restoring the stylesheet defaults.
 */
function removeStoredTheme() {
  const THEME_PROPS = [
    '--clr-primary', '--clr-accent', '--clr-accent-hover',
    '--clr-accent-light', '--clr-text', '--gradient-hero',
  ];
  THEME_PROPS.forEach(prop => {
    document.documentElement.style.removeProperty(prop);
  });
}

// Apply on load (runs on both index.html and admin.html)
applyStoredTheme();
