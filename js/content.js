/* ============================================================
   BOYLE DIGITAL SERVICES — content.js
   Single source of truth for all editable site content.
   Loaded by both index.html and admin.html (after i18n.js).
   ============================================================ */

'use strict';

const CONTENT_KEY = 'bds_content';
const API_URL = '/api/content';

const DEFAULT_CONTENT = {
  companyName: 'Boyle Digital Services',  // language-neutral
  referencesVisible: true,                // language-neutral toggle
  locationsVisible: true,                 // language-neutral toggle
  jobsVisible:         true,
  appointmentsVisible: true,
  jobsBtnUrl:          '',
  appointmentsBtnUrl:  '',
  sectionOrder: ['about','services','gallery','locations','jobs','appointments','contact'],
  seo: {
    canonicalUrl:  '',
    ogImageUrl:    '',
    twitterHandle: '',
    businessType:  'ProfessionalService'
  },

  contact: {                               // language-neutral
    address:  '123 Digital Avenue, Dublin, Ireland',
    phone:    '+353 1 234 5678',
    email:    'hello@boyledigital.ie',
    hours: '',
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
      eyebrow:  'Ihr Digitalbüro — Berlin-Brandenburg',
      headline: 'Sie führen Ihr Unternehmen. Wir kümmern uns um Ihren digitalen Auftritt.',
      subtitle: 'Viele Unternehmen wissen, dass sie online präsenter sein sollten — aber es fehlt die Zeit oder das Know-how. Wir übernehmen das für Sie: verständlich, zuverlässig und ohne Fachchinesisch.'
    },

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
    ],

    locations: [],
    jobs:         { title: '', body: '', btnText: '' },
    appointments: { title: '', body: '', btnText: '' },
    seo:          { title: '', description: '' },
  },

  /* ── English content ─────────────────────────────────────── */
  en: {
    hero: {
      eyebrow:  'Your Digital Partner — Berlin-Brandenburg',
      headline: 'You run your business. We handle your digital presence.',
      subtitle: 'Most businesses know they should be more visible online — but there\'s never enough time or know-how. We take care of it for you: clear, reliable, and without the jargon.'
    },

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

    locations: [],
    jobs:         { title: '', body: '', btnText: '' },
    appointments: { title: '', body: '', btnText: '' },
    seo:          { title: '', description: '' },
  },

  /* ── Impressum (language-neutral legal data) ─────────────── */
  impressum: {
    anbieter_name:    '[Bitte ausfüllen: vollständiger Name oder Firmenname]',
    anbieter_strasse: '[Bitte ausfüllen: Straße und Hausnummer]',
    anbieter_ort:     '[Bitte ausfüllen: Postleitzahl und Ort]',
    anbieter_land:    '[Bitte ausfüllen: Land]',
    kontakt_email:    'hello@boyledigital.ie',
    kontakt_telefon:  '',
    vertreter:        '',
    registereintrag:  '',
    ustid:            '',
    verantwortlich:   '',
    updated:          'Mai 2026'
  },

  /* ── Datenschutzerklärung body text (HTML, per language) ─── */
  datenschutz: {
    body_de: [
      '<h2>1. Verantwortlicher</h2>',
      '<p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze ist:</p>',
      '<p>[Bitte ausfüllen: vollständiger Name]<br>[Bitte ausfüllen: Adresse]<br>',
      'E-Mail: <a href="mailto:hello@boyledigital.ie">hello@boyledigital.ie</a></p>',

      '<h2>2. Welche Daten werden verarbeitet und warum?</h2>',

      '<h3>2.1 Serverlog-Daten / IP-Adressen</h3>',
      '<p>Bei jedem Aufruf unserer Website überträgt Ihr Browser automatisch Daten an unsere Infrastruktur. ',
      'Diese Seite wird über das Netzwerk von <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA 94107, USA) ausgeliefert. ',
      'Cloudflare verarbeitet dabei Ihre IP-Adresse sowie technische Anfrage-Metadaten (Browser-Typ, Betriebssystem, Datum und Uhrzeit des Abrufs, aufgerufene URL). ',
      'Dies ist technisch notwendig, um die Website zu Ihrem Browser zu übertragen.</p>',
      '<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren und zuverlässigen Auslieferung der Website).</p>',
      '<p>Wir haben mit Cloudflare einen Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO geschlossen. Cloudflares Datenschutzrichtlinie finden Sie unter <a href="https://www.cloudflare.com/de-de/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a>.</p>',

      '<h3>2.2 Spracheinstellung</h3>',
      '<p>Unsere Website speichert Ihre Sprachpräferenz (Deutsch / Englisch) im <strong>localStorage</strong> Ihres Browsers unter dem Schlüssel <code>bds_lang</code>. ',
      'Dieser Wert verlässt Ihren Browser nicht und wird ausschließlich verwendet, um die gewählte Sprache beim nächsten Besuch beizubehalten. ',
      'Es werden keine Cookies gesetzt.</p>',
      '<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an nutzerfreundlicher Bedienung).</p>',

      '<h3>2.3 Kontaktformular</h3>',
      '<p>Unser Kontaktformular (Name, E-Mail-Adresse, Betreff, Nachricht) wird ausschließlich lokal in Ihrem Browser verarbeitet. ',
      'Bei Absenden öffnet das Formular Ihr lokales E-Mail-Programm via <code>mailto:</code>-Link. ',
      'Die eingegebenen Daten werden <strong>nicht</strong> auf unseren Servern gespeichert und <strong>nicht</strong> von uns übertragen. ',
      'Die anschließende E-Mail-Kommunikation unterliegt dem Datenschutzrecht Ihres E-Mail-Anbieters.</p>',
      '<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>',

      '<h3>2.4 Kartenansicht / OpenStreetMap</h3>',
      '<p>Falls unser Standorte-Bereich auf der Website aktiv ist und Sie diesen aufrufen, werden Kartenkacheln vom Server der <strong>OpenStreetMap Foundation</strong> geladen. ',
      'Dabei wird Ihre IP-Adresse an <code>tile.openstreetmap.org</code> übertragen. ',
      'OpenStreetMap ist ein nichtkommerzieller, gemeinnütziger Dienst. Die Datenschutzrichtlinie finden Sie unter ',
      '<a href="https://wiki.openstreetmap.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">wiki.openstreetmap.org/wiki/Privacy_Policy</a>.</p>',
      '<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.</p>',

      '<h2>3. Cookies</h2>',
      '<p>Wir setzen <strong>keine Cookies</strong>. Die unter 2.2 genannte Sprachpräferenz wird im localStorage gespeichert, nicht in einem Cookie.</p>',

      '<h2>4. Tracking und Analyse</h2>',
      '<p>Wir verwenden <strong>keine</strong> Analyse-, Tracking- oder Remarketing-Werkzeuge (weder Google Analytics, Matomo, noch andere Dienste).</p>',

      '<h2>5. Speicherdauer</h2>',
      '<p>Die unter 2.2 beschriebenen localStorage-Daten bleiben bis zur manuellen Löschung in Ihrem Browser gespeichert. Sie können diese jederzeit über die Entwicklertools Ihres Browsers löschen.</p>',
      '<p>Cloudflare-Logdaten werden gemäß den Aufbewahrungsfristen von Cloudflare gespeichert (in der Regel maximal 30 Tage).</p>',

      '<h2>6. Ihre Rechte</h2>',
      '<p>Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>',
      '<ul>',
      '<li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>',
      '<li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>',
      '<li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO)</li>',
      '<li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>',
      '<li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>',
      '<li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>',
      '<li><strong>Recht auf Widerruf einer Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)</li>',
      '</ul>',
      '<p>Da wir keine personenbezogenen Daten auf unseren Servern speichern, wird eine Auskunftsanfrage in der Regel mit dem Hinweis beantwortet, dass keine Daten vorliegen. ',
      'Anfragen richten Sie bitte an: <a href="mailto:hello@boyledigital.ie">hello@boyledigital.ie</a>. Wir antworten innerhalb von 30 Tagen.</p>',

      '<h2>7. Beschwerderecht</h2>',
      '<p>Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. ',
      'Zuständig ist die Behörde am Ort Ihres gewöhnlichen Aufenthalts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.</p>',

      '<h2>8. Änderungen dieser Datenschutzerklärung</h2>',
      '<p>Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren, um sie an geänderte Rechtslagen oder bei Änderungen des Dienstes anzupassen. ',
      'Die jeweils aktuelle Fassung finden Sie auf dieser Seite.</p>'
    ].join(''),

    body_en: [
      '<h2>1. Data Controller</h2>',
      '<p>The data controller within the meaning of the General Data Protection Regulation (GDPR) is:</p>',
      '<p>[Please fill in: full name]<br>[Please fill in: address]<br>',
      'Email: <a href="mailto:hello@boyledigital.ie">hello@boyledigital.ie</a></p>',

      '<h2>2. What data is processed and why?</h2>',

      '<h3>2.1 Server log data / IP addresses</h3>',
      '<p>Each time you visit our website your browser automatically transmits data to our infrastructure. ',
      'This site is delivered via the network of <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA 94107, USA). ',
      'Cloudflare processes your IP address and technical request metadata (browser type, OS, date and time of request, URL accessed). ',
      'This is technically necessary to deliver the website to your browser.</p>',
      '<p>Legal basis: Art. 6(1)(f) GDPR (legitimate interest in secure and reliable website delivery).</p>',
      '<p>We have entered into a data processing agreement with Cloudflare pursuant to Art. 28 GDPR. ',
      "Cloudflare's privacy policy is available at <a href=\"https://www.cloudflare.com/privacypolicy/\" target=\"_blank\" rel=\"noopener noreferrer\">cloudflare.com/privacypolicy</a>.</p>",

      '<h3>2.2 Language preference</h3>',
      '<p>Our website stores your language preference (German / English) in your browser\'s <strong>localStorage</strong> under the key <code>bds_lang</code>. ',
      'This value never leaves your browser and is used solely to remember your language choice on your next visit. ',
      'No cookies are set.</p>',
      '<p>Legal basis: Art. 6(1)(f) GDPR (legitimate interest in user-friendly operation).</p>',

      '<h3>2.3 Contact form</h3>',
      '<p>Our contact form (name, email address, subject, message) is processed exclusively in your browser. ',
      'When you submit the form, it opens your local email client via a <code>mailto:</code> link. ',
      'The data entered is <strong>not</strong> stored on our servers and is <strong>not</strong> transmitted by us. ',
      "Subsequent email communication is subject to your email provider's privacy policy.</p>",
      '<p>Legal basis: Art. 6(1)(b) GDPR (pre-contractual measures) or Art. 6(1)(a) GDPR (consent).</p>',

      '<h3>2.4 Map / OpenStreetMap</h3>',
      '<p>If our Locations section is active and you scroll to it, map tiles are loaded from the <strong>OpenStreetMap Foundation</strong> servers. ',
      'Your IP address is transmitted to <code>tile.openstreetmap.org</code>. ',
      'OpenStreetMap is a non-commercial, non-profit service. Their privacy policy is available at ',
      '<a href="https://wiki.openstreetmap.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">wiki.openstreetmap.org/wiki/Privacy_Policy</a>.</p>',
      '<p>Legal basis: Art. 6(1)(f) GDPR.</p>',

      '<h2>3. Cookies</h2>',
      '<p>We set <strong>no cookies</strong>. The language preference mentioned in 2.2 is stored in localStorage, not a cookie.</p>',

      '<h2>4. Tracking and analytics</h2>',
      '<p>We use <strong>no</strong> analytics, tracking, or remarketing tools (no Google Analytics, Matomo, or similar services).</p>',

      '<h2>5. Retention periods</h2>',
      '<p>The localStorage data described in 2.2 remains stored in your browser until manually deleted. You can delete it at any time via your browser\'s developer tools.</p>',
      '<p>Cloudflare log data is stored in accordance with Cloudflare\'s retention periods (typically up to 30 days).</p>',

      '<h2>6. Your rights</h2>',
      '<p>You have the following rights with regard to your personal data:</p>',
      '<ul>',
      '<li><strong>Right of access</strong> (Art. 15 GDPR)</li>',
      '<li><strong>Right to rectification</strong> (Art. 16 GDPR)</li>',
      '<li><strong>Right to erasure</strong> (Art. 17 GDPR)</li>',
      '<li><strong>Right to restriction of processing</strong> (Art. 18 GDPR)</li>',
      '<li><strong>Right to data portability</strong> (Art. 20 GDPR)</li>',
      '<li><strong>Right to object</strong> (Art. 21 GDPR)</li>',
      '<li><strong>Right to withdraw consent</strong> (Art. 7(3) GDPR)</li>',
      '</ul>',
      '<p>Since we do not store personal data on our servers, an access request will typically be answered by confirming no data is held. ',
      'Please direct requests to: <a href="mailto:hello@boyledigital.ie">hello@boyledigital.ie</a>. We will respond within 30 days.</p>',

      '<h2>7. Right to lodge a complaint</h2>',
      '<p>You have the right to lodge a complaint with a supervisory authority if you believe the processing of your personal data violates the GDPR. ',
      'The competent authority is that of your habitual residence, place of work, or the location of the alleged infringement.</p>',

      '<h2>8. Changes to this privacy policy</h2>',
      '<p>We reserve the right to update this privacy policy to reflect changes in legal requirements or our services. ',
      'The current version is always available on this page.</p>'
    ].join(''),

    updated: 'Mai 2026'
  }
};


/* ============================================================
   Storage helpers
   ============================================================ */

async function getContent() {
  // 1. Try Cloudflare KV via Worker API
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const remote = await res.json();
      if (remote && Object.keys(remote).length > 0) {
        return deepMerge(DEFAULT_CONTENT, remote);
      }
    }
  } catch (_) { /* fall through to localStorage */ }

  // 2. Fallback: localStorage (local file:// / offline / dev)
  try {
    const local = localStorage.getItem(CONTENT_KEY);
    if (local) return deepMerge(DEFAULT_CONTENT, JSON.parse(local));
  } catch (_) { /* fall through */ }

  // 3. Last resort: hardcoded defaults
  return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
}

async function saveContent(data) {
  const apiKey = localStorage.getItem('bds_api_key');
  if (!apiKey) {
    return { ok: false, error: 'no_api_key' };
  }
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
  localStorage.removeItem(CONTENT_KEY);
  const apiKey = localStorage.getItem('bds_api_key');
  if (apiKey) {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(DEFAULT_CONTENT)
      });
    } catch (_) { /* ignore — localStorage already cleared */ }
  }
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

  /* Locations — optional section + map (0–12 items) */
  const locationsSection = document.getElementById('locations');
  if (locationsSection) {
    locationsSection.hidden = (data.locationsVisible === false);
  }
  const locationCards = document.querySelector('.location-cards');
  if (locationCards) {
    locationCards.innerHTML = '';
    const locs = ld.locations || [];
    locs.forEach((loc, i) => {
      locationCards.insertAdjacentHTML('beforeend', buildLocationCardHTML(loc, i));
    });
    // Store for lazy Leaflet init; call now if Leaflet is already loaded
    window._pendingLocations = locs;
    if (typeof window.initLocationsMap === 'function') {
      window.initLocationsMap(locs);
    }
  }

  /* Nav link visibility — mirrors section visibility toggles */
  toggleNavLink('#gallery',   data.referencesVisible !== false);
  toggleNavLink('#locations', data.locationsVisible  !== false);

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

  /* ── Contact — opening hours ───────────────────────────── */
  toggleContactItem('hours', !!data.contact.hours);
  if (data.contact.hours) setText('[data-content="contact.hours"]', data.contact.hours);

  /* ── Jobs — optional section ────────────────────────────── */
  const jobsSection = document.getElementById('jobs');
  if (jobsSection) {
    jobsSection.hidden = (data.jobsVisible === false);
    const jobsData = ld.jobs || {};
    setText('.jobs-title', jobsData.title || '');
    const jobsBody = document.querySelector('.jobs-body');
    if (jobsBody) jobsBody.innerHTML = esc(jobsData.body || '').replace(/\n/g, '<br>');
    const jobsBtn = document.querySelector('.jobs-btn');
    if (jobsBtn) {
      const showBtn = !!(data.jobsBtnUrl && jobsData.btnText);
      jobsBtn.style.display = showBtn ? '' : 'none';
      if (showBtn) { jobsBtn.href = data.jobsBtnUrl; jobsBtn.textContent = jobsData.btnText; }
    }
  }

  /* ── Appointments — optional section ───────────────────── */
  const apptSection = document.getElementById('appointments');
  if (apptSection) {
    apptSection.hidden = (data.appointmentsVisible === false);
    const apptData = ld.appointments || {};
    setText('.appointments-title', apptData.title || '');
    const apptBody = document.querySelector('.appointments-body');
    if (apptBody) apptBody.innerHTML = esc(apptData.body || '').replace(/\n/g, '<br>');
    const apptBtn = document.querySelector('.appointments-btn');
    if (apptBtn) {
      const showBtn = !!(data.appointmentsBtnUrl && apptData.btnText);
      apptBtn.style.display = showBtn ? '' : 'none';
      if (showBtn) { apptBtn.href = data.appointmentsBtnUrl; apptBtn.textContent = apptData.btnText; }
    }
  }

  /* ── Section DOM reorder ────────────────────────────────── */
  applyDomOrder(data.sectionOrder);

  /* ── SEO meta tags + JSON-LD ────────────────────────────── */
  updateSeoMeta(data, ld);
}


/* ============================================================
   DOM SECTION ORDERING
   ============================================================ */
const DEFAULT_SECTION_ORDER = ['about','services','gallery','locations','jobs','appointments','contact'];

function applyDomOrder(order) {
  if (!order || !order.length) return;
  const hero = document.getElementById('hero');
  if (hero) {
    let after = hero;
    order.forEach(id => {
      const el = document.getElementById(id);
      if (el) { after.insertAdjacentElement('afterend', el); after = el; }
    });
  }
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const map = {};
    navLinks.querySelectorAll('li a[href^="#"]').forEach(a => {
      map[a.getAttribute('href').slice(1)] = a.closest('li');
    });
    order.forEach(id => { if (map[id]) navLinks.appendChild(map[id]); });
  }
  const mobileMenu = document.querySelector('.mobile-menu');
  if (mobileMenu) {
    const map = {};
    mobileMenu.querySelectorAll('a[href^="#"]').forEach(a => {
      map[a.getAttribute('href').slice(1)] = a;
    });
    order.forEach(id => { if (map[id]) mobileMenu.appendChild(map[id]); });
  }
}

/* ============================================================
   SEO META UPDATER
   ============================================================ */
function setMeta(selector, attr, value, create) {
  if (!value) return;
  let el = document.querySelector(selector);
  if (!el && create) {
    el = document.createElement(create.tagName || 'meta');
    if (create.attrName) el.setAttribute(create.attrName, create.attrValue || '');
    document.head.appendChild(el);
  }
  if (el) el.setAttribute(attr, value);
}

function updateSeoMeta(data, ld) {
  const seo   = data.seo  || {};
  const ldSeo = ld.seo   || {};
  const lang  = (ld === data['en']) ? 'en' : 'de';
  const title = ldSeo.title || document.title;

  if (ldSeo.title) document.title = ldSeo.title;
  document.documentElement.lang = lang;

  setMeta('meta[name="description"]', 'content', ldSeo.description,
    { attrName: 'name', attrValue: 'description' });
  setMeta('link[rel="canonical"]', 'href', seo.canonicalUrl,
    { tagName: 'link', attrName: 'rel', attrValue: 'canonical' });

  setMeta('meta[property="og:title"]',       'content', title,             { attrName: 'property', attrValue: 'og:title' });
  setMeta('meta[property="og:description"]', 'content', ldSeo.description, { attrName: 'property', attrValue: 'og:description' });
  setMeta('meta[property="og:url"]',         'content', seo.canonicalUrl,  { attrName: 'property', attrValue: 'og:url' });
  setMeta('meta[property="og:image"]',       'content', seo.ogImageUrl,    { attrName: 'property', attrValue: 'og:image' });

  if (seo.twitterHandle) {
    const handle = seo.twitterHandle.startsWith('@') ? seo.twitterHandle : '@' + seo.twitterHandle;
    setMeta('meta[name="twitter:site"]', 'content', handle, { attrName: 'name', attrValue: 'twitter:site' });
  }
  setMeta('meta[name="twitter:title"]',       'content', title,             { attrName: 'name', attrValue: 'twitter:title' });
  setMeta('meta[name="twitter:description"]', 'content', ldSeo.description, { attrName: 'name', attrValue: 'twitter:description' });
  setMeta('meta[name="twitter:image"]',       'content', seo.ogImageUrl,    { attrName: 'name', attrValue: 'twitter:image' });

  const firstLoc = (ld.locations || []).find(l => l.lat && l.lng);
  const lb = { '@type': seo.businessType || 'ProfessionalService', name: data.companyName || '' };
  if (seo.canonicalUrl)    lb.url          = seo.canonicalUrl;
  if (seo.ogImageUrl)      lb.image        = seo.ogImageUrl;
  if (data.contact.phone)  lb.telephone    = data.contact.phone;
  if (data.contact.email)  lb.email        = data.contact.email;
  if (data.contact.address) lb.address    = { '@type': 'PostalAddress', streetAddress: data.contact.address };
  if (data.contact.hours)  lb.openingHours = data.contact.hours;
  if (firstLoc) lb.geo = { '@type': 'GeoCoordinates', latitude: firstLoc.lat, longitude: firstLoc.lng };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      lb,
      { '@type': 'WebSite', name: data.companyName || '', ...(seo.canonicalUrl ? { url: seo.canonicalUrl } : {}) }
    ]
  };

  let ldScript = document.getElementById('ld-json');
  if (!ldScript) {
    ldScript = document.createElement('script');
    ldScript.id   = 'ld-json';
    ldScript.type = 'application/ld+json';
    document.head.appendChild(ldScript);
  }
  ldScript.textContent = JSON.stringify(graph);
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

/**
 * Shows or hides nav links (desktop + mobile) and footer quick links
 * for a given anchor href, based on whether the section is visible.
 * @param {string}  href  e.g. '#gallery' or '#locations'
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

/**
 * Build the public HTML for a single location card.
 * @param {{ name:string, address:string, phone:string, email:string, hours:string, note:string }} loc
 * @param {number} i
 * @returns {string}
 */
function buildLocationCardHTML(loc, i) {
  const rows = [
    loc.address ? `<p class="loc-row"><span class="loc-icon" aria-hidden="true">📍</span>${esc(loc.address)}</p>` : '',
    loc.phone   ? `<p class="loc-row"><span class="loc-icon" aria-hidden="true">📞</span><a href="tel:${esc(loc.phone)}">${esc(loc.phone)}</a></p>` : '',
    loc.email   ? `<p class="loc-row"><span class="loc-icon" aria-hidden="true">✉️</span><a href="mailto:${esc(loc.email)}">${esc(loc.email)}</a></p>` : '',
    loc.hours   ? `<p class="loc-row"><span class="loc-icon" aria-hidden="true">🕐</span>${esc(loc.hours)}</p>` : '',
    loc.note    ? `<p class="loc-note">${esc(loc.note)}</p>` : '',
  ].join('');
  return `<div class="location-card reveal" data-index="${i}"><h3 class="location-name">${esc(loc.name || '')}</h3>${rows}</div>`;
}


/* ============================================================
   Auto-apply on index.html load
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  const lang = typeof getLang === 'function' ? getLang() : 'de';
  applyContent(await getContent(), lang);
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
