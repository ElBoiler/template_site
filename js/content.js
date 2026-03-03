/* ============================================================
   BOYLE DIGITAL SERVICES — content.js
   Single source of truth for all editable site content.
   Loaded by both index.html and admin.html.
   ============================================================ */

'use strict';

const CONTENT_KEY = 'bds_content';

const DEFAULT_CONTENT = {
  companyName: 'Boyle Digital Services',

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
  ],

  contact: {
    address:  '123 Digital Avenue, Dublin, Ireland',
    phone:    '+353 1 234 5678',
    email:    'hello@boyledigital.ie',
    social: {
      linkedin:  '',
      twitter:   '',
      instagram: '',
      tiktok:    ''
    }
  }
};


/* ============================================================
   Storage helpers
   ============================================================ */

function getContent() {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
    // Deep-merge so new default keys added later don't break old saves
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
   ============================================================ */

function applyContent(data) {
  /* Company name — nav logo + footer logo */
  document.querySelectorAll('.nav-logo, .footer-logo').forEach(el => {
    el.innerHTML = formatCompanyName(data.companyName);
  });

  /* Hero */
  setText('[data-content="hero.eyebrow"]',  data.hero.eyebrow);
  setText('[data-content="hero.headline"]', data.hero.headline);
  setText('[data-content="hero.subtitle"]', data.hero.subtitle);

  /* About */
  setText('[data-content="about.heading"]', data.about.heading);
  data.about.paragraphs.forEach((p, i) => setText(`[data-content="about.p${i}"]`, p));

  /* Stats */
  data.about.stats.forEach((stat, i) => {
    const card = document.querySelector(`[data-stat="${i}"]`);
    if (!card) return;
    const numEl = card.querySelector('[data-field="number"]');
    const sufEl = card.querySelector('[data-field="suffix"]');
    const lblEl = card.querySelector('[data-field="label"]');
    if (numEl) { numEl.textContent = stat.number; numEl.setAttribute('data-target', stat.number); }
    if (sufEl) sufEl.textContent = stat.suffix;
    if (lblEl) lblEl.textContent = stat.label;
  });

  /* Services */
  data.services.forEach((svc, i) => {
    const card = document.querySelector(`[data-service="${i}"]`);
    if (!card) return;
    setFieldText(card, 'icon',  svc.icon);
    setFieldText(card, 'title', svc.title);
    setFieldText(card, 'desc',  svc.desc);
  });

  /* Gallery */
  data.gallery.forEach((item, i) => {
    const fig = document.querySelector(`.gallery-item[data-index="${i}"]`);
    if (!fig) return;
    const img = fig.querySelector('img');
    const cap = fig.querySelector('figcaption');
    if (img) { img.src = item.src; img.alt = item.alt; }
    if (cap) cap.textContent = item.caption;
  });

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
  applyContent(getContent());
});
