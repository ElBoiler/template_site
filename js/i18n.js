/* ============================================================
   BOYLE DIGITAL SERVICES — js/i18n.js
   Static UI translation layer (Layer 1).
   Loaded by both index.html and admin.html BEFORE content.js.
   ============================================================ */

'use strict';

const LANG_KEY     = 'bds_lang';
const VALID_LANGS  = ['de', 'en'];
const DEFAULT_LANG = 'de';

/* ── Language persistence ──────────────────────────────────── */

/** Returns the currently active language code ('de' or 'en'). */
function getLang() {
  const stored = localStorage.getItem(LANG_KEY);
  return VALID_LANGS.includes(stored) ? stored : DEFAULT_LANG;
}

/** Persists the language choice and re-renders everything. */
function setLang(lang) {
  if (!VALID_LANGS.includes(lang)) return;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
  applyTranslations(lang);
  // Re-apply editable content for the new language (index.html only)
  if (typeof applyContent === 'function' && typeof getContent === 'function') {
    applyContent(getContent(), lang);
  }
  // Sync admin content-lang tabs if present
  if (typeof switchAdminContentLang === 'function') {
    switchAdminContentLang(lang);
  }
}

/* ── Key lookup ────────────────────────────────────────────── */

/**
 * Look up a translation key in the given (or current) language.
 * Falls back to 'de' if the key is missing in the requested language.
 * @param {string} key
 * @param {string} [lang]
 * @returns {string}
 */
function T(key, lang) {
  const l = (lang && VALID_LANGS.includes(lang)) ? lang : getLang();
  return (TRANSLATIONS[l]  && TRANSLATIONS[l][key]  !== undefined ? TRANSLATIONS[l][key]  : null)
      || (TRANSLATIONS['de'] && TRANSLATIONS['de'][key] !== undefined ? TRANSLATIONS['de'][key] : null)
      || key;
}

/* ── DOM patching ──────────────────────────────────────────── */

/**
 * Patches every element carrying a data-i18n* attribute.
 *
 *  data-i18n="key"             → el.textContent
 *  data-i18n-html="key"        → el.innerHTML  (trusted admin hints only)
 *  data-i18n-placeholder="key" → el.placeholder
 *  data-i18n-value="key"       → el.textContent (for <option> elements)
 *  data-i18n-aria="key"        → el.setAttribute('aria-label', …)
 *  data-i18n-title="key"       → el.title
 */
function applyTranslations(lang) {
  const l = VALID_LANGS.includes(lang) ? lang : DEFAULT_LANG;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = T(el.getAttribute('data-i18n'), l);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = T(el.getAttribute('data-i18n-html'), l);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = T(el.getAttribute('data-i18n-placeholder'), l);
  });
  document.querySelectorAll('[data-i18n-value]').forEach(el => {
    el.textContent = T(el.getAttribute('data-i18n-value'), l);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', T(el.getAttribute('data-i18n-aria'), l));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = T(el.getAttribute('data-i18n-title'), l);
  });

  // Update active state on language switcher buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === l);
  });

  document.documentElement.lang = l;
}

/* ── Language switcher wiring ──────────────────────────────── */

function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const lang = getLang();
  document.documentElement.lang = lang;
  applyTranslations(lang);
  initLangSwitcher();
});

/* ============================================================
   TRANSLATION DICTIONARIES
   ============================================================ */

const TRANSLATIONS = {

  /* ══════════════════════════════════════════════════════════
     GERMAN  (default)
  ══════════════════════════════════════════════════════════ */
  de: {

    /* ── Public nav ─────────────────────────────────────── */
    nav_about:           'Über uns',
    nav_services:        'Leistungen',
    nav_gallery:         'Referenzen',
    nav_contact:         'Kontakt',
    lang_switcher_label: 'Sprache wechseln',

    /* ── Hero CTAs ──────────────────────────────────────── */
    hero_cta_contact:  'Kontakt aufnehmen',
    hero_cta_services: 'Unsere Leistungen',

    /* ── Section eyebrows ───────────────────────────────── */
    eyebrow_about:    'Über uns',
    eyebrow_services: 'Was wir tun',
    eyebrow_gallery:  'Unsere Arbeit',
    eyebrow_contact:  'Jetzt Kontakt aufnehmen',

    /* ── Services section ───────────────────────────────── */
    services_h2:       'Umfassende digitale Leistungen',
    services_subtitle: 'Von der Strategie bis zur Umsetzung bieten wir ganzheitliche digitale Lösungen – maßgeschneidert für Ihre individuellen Geschäftsanforderungen.',

    /* ── Gallery section ────────────────────────────────── */
    gallery_h2:       'Projekte & Highlights',
    gallery_subtitle: 'Ein Einblick in unsere Arbeit, die Teams, die wir aufgebaut haben, und die Ergebnisse, die wir für unsere Kunden erzielt haben.',

    /* ── Contact section ────────────────────────────────── */
    contact_h2:           'Gespräch beginnen',
    contact_subtitle:     'Bereit, Ihre digitale Präsenz auszubauen? Wir freuen uns, mehr über Ihr Projekt zu erfahren.',
    contact_info_heading: 'Kontaktinformationen',

    /* ── Contact form labels ────────────────────────────── */
    form_label_name:    'Vollständiger Name',
    form_label_email:   'E-Mail-Adresse',
    form_label_subject: 'Betreff',
    form_label_message: 'Nachricht',

    /* ── Contact form placeholders ──────────────────────── */
    form_placeholder_name:    'Max Mustermann',
    form_placeholder_email:   'max@beispiel.de',
    form_placeholder_message: 'Erzählen Sie uns von Ihrem Projekt …',

    /* ── Subject dropdown ───────────────────────────────── */
    subject_default:  'Betreff auswählen …',

    /* ── Form submit & success ──────────────────────────── */
    form_submit:     'Nachricht senden',
    success_heading: 'Nachricht gesendet!',
    success_body:    'Vielen Dank für Ihre Nachricht. Wir melden uns innerhalb von 1–2 Werktagen bei Ihnen.',

    /* ── Validation errors ──────────────────────────────── */
    err_name_required:    'Bitte geben Sie Ihren vollständigen Namen ein.',
    err_email_required:   'Bitte geben Sie Ihre E-Mail-Adresse ein.',
    err_email_invalid:    'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    err_subject_required: 'Bitte wählen Sie einen Betreff aus.',
    err_message_short:    'Bitte geben Sie eine Nachricht ein (mindestens 10 Zeichen).',

    /* ── Footer ─────────────────────────────────────────── */
    footer_tagline:     'Wachstum durch digitale Exzellenz. Ihr vertrauensvoller Partner im digitalen Zeitalter.',
    footer_quick_links: 'Schnelllinks',
    footer_services:    'Leistungen',
    footer_contact:     'Kontakt',
    footer_about_link:  'Über uns',
    footer_copyright:   '© 2026 Boyle Digital Services. Alle Rechte vorbehalten.',
    footer_admin:       'Admin',
    footer_svc_pm:      'Produktmanagement',
    footer_svc_web:     'Webentwicklung',
    footer_svc_seo:     'SEO & Analytics',

    /* ── Accessibility labels ───────────────────────────── */
    hamburger_label:   'Navigation ein-/ausblenden',
    mobile_menu_label: 'Mobile Navigation',
    scroll_down_label: 'Nach unten scrollen',
    lightbox_close:    'Lightbox schließen',
    lightbox_prev:     'Vorheriges Bild',
    lightbox_next:     'Nächstes Bild',
    lightbox_label:    'Bildanzeige',

    /* ════════════════════════════════════════════════════════
       ADMIN — Login
    ════════════════════════════════════════════════════════ */
    admin_login_title:    'Admin-Panel',
    admin_login_subtitle: 'Geben Sie Ihr Passwort ein, um fortzufahren',
    admin_login_label:    'Passwort',
    admin_login_ph:       'Passwort eingeben',
    admin_login_btn:      'Anmelden',
    admin_login_hint:     'Standardpasswort: ',

    /* ── Admin header ───────────────────────────────────── */
    admin_view_site: 'Website anzeigen ↗',
    admin_reset_btn: 'Zurücksetzen',
    admin_save_btn:  'Änderungen speichern',

    /* ── Admin sidebar ──────────────────────────────────── */
    admin_nav_general:  '⚙ Allgemein',
    admin_nav_hero:     '🚀 Hero',
    admin_nav_about:    '💼 Über uns',
    admin_nav_services: '🛠 Leistungen',
    admin_nav_gallery:  '🖼 Referenzen',
    admin_nav_contact:  '✉ Kontakt',
    admin_nav_security: '🔒 Sicherheit',
    admin_nav_theme:    '🎨 Farbschema',

    sec_theme_h2:        'Farbschema',
    sec_theme_desc:      'Extrahieren Sie ein Farbschema aus einem Bild und wenden Sie es auf die Website an.',
    sec_theme_drop:      'Bild hier ablegen oder klicken zum Hochladen',
    sec_theme_formats:   'JPG · PNG · SVG · GIF',
    sec_theme_extracted: 'Extrahierte Farben',
    sec_theme_roles:     'Rollen zuweisen',
    sec_theme_primary:   'Primär',
    sec_theme_accent:    'Akzent',
    sec_theme_preview:   'Vorschau',
    sec_theme_apply:     'Farbschema anwenden',
    sec_theme_reset:     'Auf Standard zurücksetzen',
    toast_theme_applied: 'Farbschema angewendet!',
    toast_theme_reset:   'Farbschema auf Standard zurückgesetzt.',

    /* ── General section ────────────────────────────────── */
    sec_general_h2:    'Allgemein',
    sec_general_desc:  'Websiteweite Einstellungen, die auf allen Seiten gelten.',
    sec_general_label: 'Firmenname',
    sec_general_hint:  'Das zweite Wort wird in Petrol hervorgehoben (z. B. „Boyle <strong>Digital</strong> Services").',

    /* ── Hero section ───────────────────────────────────── */
    sec_hero_h2:           'Hero',
    sec_hero_desc:         'Das Vollbild-Banner oben auf der Seite.',
    sec_hero_eyebrow_lbl:  'Eyebrow-Beschriftung',
    sec_hero_eyebrow_hint: 'Kleiner Text in Großbuchstaben über der Überschrift.',
    sec_hero_headline_lbl: 'Überschrift',
    sec_hero_subtitle_lbl: 'Untertitel / Slogan',

    /* ── About section ──────────────────────────────────── */
    sec_about_h2:         'Über uns',
    sec_about_desc:       'Unternehmensbeschreibung und Statistik-Zähler.',
    sec_about_heading_lbl:'Abschnittsüberschrift',
    sec_about_p0:         'Absatz 1',
    sec_about_p1:         'Absatz 2',
    sec_about_p2:         'Absatz 3',
    sec_about_stats:      'Statistik-Zähler',
    sec_stat_prefix:      'Statistik',
    sec_about_number:     'Zahl',
    sec_about_suffix:     'Suffix',
    sec_about_stat_lbl:   'Beschriftung',

    /* ── Services section ───────────────────────────────── */
    sec_services_h2:   'Leistungen',
    sec_services_desc: 'Leistungskarten auf der Website hinzufügen, entfernen oder bearbeiten (bis zu 9).',
    sec_svc_card:      'Karte',
    sec_svc_icon:      'Symbol (Emoji)',
    sec_svc_title:     'Titel',
    sec_svc_desc:      'Beschreibung',

    /* ── Gallery section ────────────────────────────────── */
    sec_gallery_h2:         'Referenzen',
    sec_gallery_desc:       'Galeriefotos hinzufügen, entfernen oder bearbeiten (bis zu 12).',
    sec_gallery_photo:      'Foto',
    sec_gallery_url:        'Bild-URL',
    sec_gallery_caption:    'Bildunterschrift',
    sec_gallery_alt:        'Alt-Text (Barrierefreiheit)',
    sec_gallery_url_ph:     'https://beispiel.de/bild.jpg',
    sec_gallery_caption_ph: 'Bildunterschrift',
    sec_gallery_alt_ph:     'Bild beschreiben',

    /* ── Contact section ────────────────────────────────── */
    sec_contact_h2:        'Kontakt',
    sec_contact_desc:      'Kontaktdaten auf der Website aktualisieren.',
    sec_contact_details:   'Kontaktdaten',
    sec_contact_hide_hint: 'Lassen Sie ein Feld leer, um es auf der Website auszublenden.',
    sec_contact_address:   'Adresse',
    sec_contact_phone:     'Telefonnummer',
    sec_contact_email:     'E-Mail-Adresse',
    sec_social_h:          'Social-Media-Links',
    sec_social_hint:       'Vollständige URLs eingeben (z. B. <code>https://linkedin.com/company/ihrunternehmen</code>). Leer lassen, um die Schaltfläche auszublenden.',
    sec_social_linkedin:   'LinkedIn',
    sec_social_twitter:    'Twitter / X',
    sec_social_instagram:  'Instagram',
    sec_social_tiktok:     'TikTok',

    /* ── Security section ───────────────────────────────── */
    sec_security_h2:      'Sicherheit',
    sec_security_desc:    'Passwort des Admin-Panels ändern.',
    sec_security_new_pw:  'Neues Passwort',
    sec_security_new_ph:  'Neues Passwort eingeben',
    sec_security_conf_pw: 'Neues Passwort bestätigen',
    sec_security_conf_ph: 'Neues Passwort wiederholen',
    sec_security_btn:     'Passwort aktualisieren',

    /* ── Toast / dialog ─────────────────────────────────── */
    toast_saved:      'Änderungen erfolgreich gespeichert!',
    toast_reset:      'Inhalte auf Standardwerte zurückgesetzt.',
    toast_pw_updated: 'Passwort aktualisiert!',
    toast_wrong_pw:   'Falsches Passwort. Bitte erneut versuchen.',
    err_pw_short:     'Das Passwort muss mindestens 4 Zeichen lang sein.',
    err_pw_mismatch:  'Die Passwörter stimmen nicht überein.',
    confirm_reset:    'Alle Inhalte auf Standardwerte zurücksetzen? Dies kann nicht rückgängig gemacht werden.',

    /* ── Admin content-language tabs ────────────────────── */
    admin_lang_tab_de: '🇩🇪 Deutsch',
    admin_lang_tab_en: '🇬🇧 Englisch',

    /* ── Subjects editor (admin) ─────────────────────── */
    sec_subjects_h:       'Betreff-Optionen',
    sec_subjects_desc:    'Bis zu 5 Betreff-Optionen für das Kontaktformular definieren.',
    sec_subjects_add:     '+ Betreff hinzufügen',
    sec_subjects_remove:  'Entfernen',
    sec_subjects_de_ph:   'z. B. Allgemeine Anfrage',
    sec_subjects_en_ph:   'e.g. General Inquiry',

    /* ── Stats editor (admin) ────────────────────────── */
    sec_about_stats_desc:   'Bis zu 6 Statistiken hinzufügen. Zahl und Suffix gelten für beide Sprachen.',
    sec_stat_add:           '+ Statistik hinzufügen',

    /* ── Services editor (admin) ─────────────────────── */
    sec_svc_add:            '+ Karte hinzufügen',
    sec_svc_remove:         'Entfernen',

    /* ── Gallery / References editor (admin) ─────────── */
    sec_gallery_remove:     'Entfernen',
    sec_gallery_add:        '+ Foto hinzufügen',
    sec_gallery_visible_lbl:  'Abschnitt anzeigen',
    sec_gallery_visible_desc: 'Blendet den gesamten Referenzen-Abschnitt auf der Website aus, wenn deaktiviert.',

    /* ── Locations section (public) ──────────────────── */
    nav_locations:       'Standorte',
    eyebrow_locations:   'Standorte',
    locations_h2:        'Unsere Standorte',
    locations_subtitle:  'Besuchen Sie uns an einem unserer Standorte.',

    /* ── Locations editor (admin) ────────────────────── */
    sec_locations_h2:           'Standorte',
    sec_locations_desc:         'Standorte verwalten – bis zu 12 Einträge.',
    sec_locations_visible_lbl:  'Abschnitt anzeigen',
    sec_locations_visible_desc: 'Blendet den Standorte-Abschnitt auf der Website aus, wenn deaktiviert.',
    sec_location_name_lbl:      'Name',
    sec_location_address_lbl:   'Adresse',
    sec_location_phone_lbl:     'Telefon',
    sec_location_email_lbl:     'E-Mail',
    sec_location_hours_lbl:     'Öffnungszeiten',
    sec_location_note_lbl:      'Notiz',
    sec_location_geocode_btn:   'Auf Karte finden',
    sec_location_geocode_ok:    'Gefunden',
    sec_location_geocode_err:   'Nicht gefunden',
    sec_location_add:           '+ Standort hinzufügen',
    sec_location_remove:        'Entfernen',

    /* ── Contact opening hours ───────────────────────── */
    sec_contact_hours:   'Öffnungszeiten',

    /* ── Jobs ────────────────────────────────────────── */
    nav_jobs:            'Stellen',
    eyebrow_jobs:        'Karriere',
    jobs_h2:             'Offene Stellen',
    sec_jobs_h2:         'Stellen',
    sec_jobs_desc:       'Stellenangebote verwalten.',
    sec_jobs_visible_lbl:  'Abschnitt anzeigen',
    sec_jobs_visible_desc: 'Blendet den Stellen-Abschnitt aus, wenn deaktiviert.',
    sec_jobs_title_lbl:    'Titel',
    sec_jobs_body_lbl:     'Beschreibung',
    sec_jobs_btn_text_lbl: 'Button-Beschriftung',
    sec_jobs_btn_url_lbl:  'Button-URL (sprachunabhängig)',

    /* ── Appointments ────────────────────────────────── */
    nav_appointments:            'Termine',
    eyebrow_appointments:        'Terminvereinbarung',
    appointments_h2:             'Termin vereinbaren',
    sec_appointments_h2:         'Termine',
    sec_appointments_desc:       'Terminbuchungs-Abschnitt verwalten.',
    sec_appointments_visible_lbl:  'Abschnitt anzeigen',
    sec_appointments_visible_desc: 'Blendet den Terminbereich aus, wenn deaktiviert.',
    sec_appointments_title_lbl:    'Titel',
    sec_appointments_body_lbl:     'Beschreibung',
    sec_appointments_btn_text_lbl: 'Button-Beschriftung',
    sec_appointments_btn_url_lbl:  'Button-URL (sprachunabhängig)',

    /* ── Layout ──────────────────────────────────────── */
    sec_layout_h2:       'Seitenstruktur',
    sec_layout_desc:     'Reihenfolge der Abschnitte auf der Website festlegen.',
    sec_layout_up:       '↑',
    sec_layout_down:     '↓',
    layout_about:        'Über uns',
    layout_services:     'Leistungen',
    layout_gallery:      'Referenzen',
    layout_locations:    'Standorte',
    layout_jobs:         'Stellen',
    layout_appointments: 'Termine',
    layout_contact:      'Kontakt',
    admin_nav_layout:    '⊞ Struktur',

    /* ── SEO ──────────────────────────────────────────── */
    sec_seo_h2:                'SEO & AEO',
    sec_seo_desc:              'Suchmaschinen-Einstellungen und strukturierte Daten verwalten.',
    sec_seo_title_lbl:         'Seitentitel',
    sec_seo_metadesc_lbl:      'Meta-Beschreibung',
    sec_seo_chars_hint:        'Zeichen (Ziel: ≤ 155)',
    sec_seo_canonical_lbl:     'Kanonische URL',
    sec_seo_ogimage_lbl:       'OG-Bild-URL',
    sec_seo_twitter_lbl:       'Twitter/X-Handle',
    sec_seo_biztype_lbl:       'Unternehmenstyp (Schema)',
    sec_seo_biztype_professional: 'ProfessionalService',
    sec_seo_biztype_local:     'LocalBusiness',
    sec_seo_biztype_org:       'Organization',
    admin_nav_seo:             '🔍 SEO',

    admin_nav_storage:         '💾 Storage',
    sec_storage_h2:            'Storage & Export',
    sec_storage_api_h3:        'Cloudflare KV',
    sec_storage_api_hint:      'Gib den WORKER_SECRET ein, den du per wrangler secret put gesetzt hast.',
    sec_storage_key_lbl:       'Worker API Key',
    sec_storage_test:          'Testen',
    sec_storage_transfer_h3:   'Export / Import',
    sec_storage_transfer_hint: 'Export lädt den Inhalt als content.json. Import lädt eine exportierte Datei.',
    sec_storage_export:        '⬇ Exportieren',
    sec_storage_import:        '⬆ Importieren',
  },


  /* ══════════════════════════════════════════════════════════
     ENGLISH
  ══════════════════════════════════════════════════════════ */
  en: {

    /* ── Public nav ─────────────────────────────────────── */
    nav_about:           'About',
    nav_services:        'Services',
    nav_gallery:         'Gallery',
    nav_contact:         'Contact',
    lang_switcher_label: 'Switch language',

    /* ── Hero CTAs ──────────────────────────────────────── */
    hero_cta_contact:  'Get in Touch',
    hero_cta_services: 'Our Services',

    /* ── Section eyebrows ───────────────────────────────── */
    eyebrow_about:    'About Us',
    eyebrow_services: 'What We Do',
    eyebrow_gallery:  'Our Work',
    eyebrow_contact:  'Get In Touch',

    /* ── Services section ───────────────────────────────── */
    services_h2:       'Comprehensive Digital Services',
    services_subtitle: 'From strategy to execution, we offer end-to-end digital solutions tailored to your unique business needs.',

    /* ── Gallery section ────────────────────────────────── */
    gallery_h2:       'Projects & Highlights',
    gallery_subtitle: "A glimpse into the work we've done, the teams we've built, and the results we've achieved for our clients.",

    /* ── Contact section ────────────────────────────────── */
    contact_h2:           "Let's Start a Conversation",
    contact_subtitle:     "Ready to grow your digital presence? We'd love to hear about your project.",
    contact_info_heading: 'Contact Information',

    /* ── Contact form labels ────────────────────────────── */
    form_label_name:    'Full Name',
    form_label_email:   'Email Address',
    form_label_subject: 'Subject',
    form_label_message: 'Message',

    /* ── Contact form placeholders ──────────────────────── */
    form_placeholder_name:    'Jane Doe',
    form_placeholder_email:   'jane@example.com',
    form_placeholder_message: 'Tell us about your project…',

    /* ── Subject dropdown ───────────────────────────────── */
    subject_default:  'Select a subject…',

    /* ── Form submit & success ──────────────────────────── */
    form_submit:     'Send Message',
    success_heading: 'Message Sent!',
    success_body:    "Thank you for reaching out. We'll get back to you within 1–2 business days.",

    /* ── Validation errors ──────────────────────────────── */
    err_name_required:    'Please enter your full name.',
    err_email_required:   'Please enter your email address.',
    err_email_invalid:    'Please enter a valid email address.',
    err_subject_required: 'Please select a subject.',
    err_message_short:    'Please enter a message (at least 10 characters).',

    /* ── Footer ─────────────────────────────────────────── */
    footer_tagline:     'Driving growth through digital excellence. Your trusted partner for the digital age.',
    footer_quick_links: 'Quick Links',
    footer_services:    'Services',
    footer_contact:     'Contact',
    footer_about_link:  'About Us',
    footer_copyright:   '© 2026 Boyle Digital Services. All rights reserved.',
    footer_admin:       'Admin',
    footer_svc_pm:      'Product Management',
    footer_svc_web:     'Web Development',
    footer_svc_seo:     'SEO & Analytics',

    /* ── Accessibility labels ───────────────────────────── */
    hamburger_label:   'Toggle navigation menu',
    mobile_menu_label: 'Mobile navigation',
    scroll_down_label: 'Scroll down',
    lightbox_close:    'Close lightbox',
    lightbox_prev:     'Previous image',
    lightbox_next:     'Next image',
    lightbox_label:    'Image lightbox',

    /* ════════════════════════════════════════════════════════
       ADMIN — Login
    ════════════════════════════════════════════════════════ */
    admin_login_title:    'Admin Panel',
    admin_login_subtitle: 'Enter your password to continue',
    admin_login_label:    'Password',
    admin_login_ph:       'Enter password',
    admin_login_btn:      'Log In',
    admin_login_hint:     'Default password: ',

    /* ── Admin header ───────────────────────────────────── */
    admin_view_site: 'View Site ↗',
    admin_reset_btn: 'Reset Defaults',
    admin_save_btn:  'Save Changes',

    /* ── Admin sidebar ──────────────────────────────────── */
    admin_nav_general:  '⚙ General',
    admin_nav_hero:     '🚀 Hero',
    admin_nav_about:    '💼 About',
    admin_nav_services: '🛠 Services',
    admin_nav_gallery:  '🖼 Gallery',
    admin_nav_contact:  '✉ Contact',
    admin_nav_security: '🔒 Security',
    admin_nav_theme:    '🎨 Colour Scheme',

    sec_theme_h2:        'Colour Scheme',
    sec_theme_desc:      'Extract a colour scheme from an image and apply it to the website.',
    sec_theme_drop:      'Drop an image here, or click to upload',
    sec_theme_formats:   'JPG · PNG · SVG · GIF',
    sec_theme_extracted: 'Extracted colours',
    sec_theme_roles:     'Assign roles',
    sec_theme_primary:   'Primary',
    sec_theme_accent:    'Accent',
    sec_theme_preview:   'Preview',
    sec_theme_apply:     'Apply Colour Scheme',
    sec_theme_reset:     'Reset to Default',
    toast_theme_applied: 'Colour scheme applied!',
    toast_theme_reset:   'Colour scheme reset to default.',

    /* ── General section ────────────────────────────────── */
    sec_general_h2:    'General',
    sec_general_desc:  'Site-wide settings applied across all pages.',
    sec_general_label: 'Company Name',
    sec_general_hint:  'The second word will be highlighted in teal (e.g. "Boyle <strong>Digital</strong> Services").',

    /* ── Hero section ───────────────────────────────────── */
    sec_hero_h2:           'Hero',
    sec_hero_desc:         'The full-screen banner at the top of the page.',
    sec_hero_eyebrow_lbl:  'Eyebrow Label',
    sec_hero_eyebrow_hint: 'Small uppercase text above the headline.',
    sec_hero_headline_lbl: 'Headline',
    sec_hero_subtitle_lbl: 'Subtitle / Tagline',

    /* ── About section ──────────────────────────────────── */
    sec_about_h2:          'About',
    sec_about_desc:        'Company description and stat counters.',
    sec_about_heading_lbl: 'Section Heading',
    sec_about_p0:          'Paragraph 1',
    sec_about_p1:          'Paragraph 2',
    sec_about_p2:          'Paragraph 3',
    sec_about_stats:       'Stat Counters',
    sec_stat_prefix:       'Stat',
    sec_about_number:      'Number',
    sec_about_suffix:      'Suffix',
    sec_about_stat_lbl:    'Label',

    /* ── Services section ───────────────────────────────── */
    sec_services_h2:   'Services',
    sec_services_desc: 'Add, remove, or edit service cards displayed on the site (up to 9).',
    sec_svc_card:      'Card',
    sec_svc_icon:      'Icon (emoji)',
    sec_svc_title:     'Title',
    sec_svc_desc:      'Description',

    /* ── Gallery section ────────────────────────────────── */
    sec_gallery_h2:         'Gallery',
    sec_gallery_desc:       'Add, remove, or edit gallery photos (up to 12).',
    sec_gallery_photo:      'Photo',
    sec_gallery_url:        'Image URL',
    sec_gallery_caption:    'Caption',
    sec_gallery_alt:        'Alt Text (accessibility)',
    sec_gallery_url_ph:     'https://example.com/image.jpg',
    sec_gallery_caption_ph: 'Photo caption',
    sec_gallery_alt_ph:     'Describe the image',

    /* ── Contact section ────────────────────────────────── */
    sec_contact_h2:        'Contact',
    sec_contact_desc:      'Update the contact details shown on the site.',
    sec_contact_details:   'Contact Details',
    sec_contact_hide_hint: 'Leave any field blank to hide it from the site.',
    sec_contact_address:   'Address',
    sec_contact_phone:     'Phone Number',
    sec_contact_email:     'Email Address',
    sec_social_h:          'Social Media Links',
    sec_social_hint:       'Enter full URLs (e.g. <code>https://linkedin.com/company/yourco</code>). Leave blank to hide the button.',
    sec_social_linkedin:   'LinkedIn',
    sec_social_twitter:    'Twitter / X',
    sec_social_instagram:  'Instagram',
    sec_social_tiktok:     'TikTok',

    /* ── Security section ───────────────────────────────── */
    sec_security_h2:      'Security',
    sec_security_desc:    'Change your admin panel password.',
    sec_security_new_pw:  'New Password',
    sec_security_new_ph:  'Enter new password',
    sec_security_conf_pw: 'Confirm New Password',
    sec_security_conf_ph: 'Repeat new password',
    sec_security_btn:     'Update Password',

    /* ── Toast / dialog ─────────────────────────────────── */
    toast_saved:      'Changes saved successfully!',
    toast_reset:      'Content reset to defaults.',
    toast_pw_updated: 'Password updated!',
    toast_wrong_pw:   'Incorrect password. Please try again.',
    err_pw_short:     'Password must be at least 4 characters.',
    err_pw_mismatch:  'Passwords do not match.',
    confirm_reset:    'Reset all content to defaults? This cannot be undone.',

    /* ── Admin content-language tabs ────────────────────── */
    admin_lang_tab_de: '🇩🇪 Deutsch',
    admin_lang_tab_en: '🇬🇧 English',

    /* ── Subjects editor (admin) ─────────────────────── */
    sec_subjects_h:       'Subject Options',
    sec_subjects_desc:    'Define up to 5 subject options for the contact form.',
    sec_subjects_add:     '+ Add Subject',
    sec_subjects_remove:  'Remove',
    sec_subjects_de_ph:   'e.g. Allgemeine Anfrage',
    sec_subjects_en_ph:   'e.g. General Inquiry',

    /* ── Stats editor (admin) ────────────────────────── */
    sec_about_stats_desc:   'Add up to 6 statistics. Number and suffix apply to both languages.',
    sec_stat_add:           '+ Add Statistic',

    /* ── Services editor (admin) ─────────────────────── */
    sec_svc_add:            '+ Add Card',
    sec_svc_remove:         'Remove',

    /* ── Gallery / References editor (admin) ─────────── */
    sec_gallery_remove:     'Remove',
    sec_gallery_add:        '+ Add Photo',
    sec_gallery_visible_lbl:  'Show Section',
    sec_gallery_visible_desc: 'Hides the entire references section on the website when unchecked.',

    /* ── Locations section (public) ──────────────────── */
    nav_locations:       'Locations',
    eyebrow_locations:   'Locations',
    locations_h2:        'Our Locations',
    locations_subtitle:  'Visit us at one of our locations.',

    /* ── Locations editor (admin) ────────────────────── */
    sec_locations_h2:           'Locations',
    sec_locations_desc:         'Manage locations – up to 12 entries.',
    sec_locations_visible_lbl:  'Show section',
    sec_locations_visible_desc: 'Hides the locations section on the website when unchecked.',
    sec_location_name_lbl:      'Name',
    sec_location_address_lbl:   'Address',
    sec_location_phone_lbl:     'Phone',
    sec_location_email_lbl:     'Email',
    sec_location_hours_lbl:     'Opening hours',
    sec_location_note_lbl:      'Note',
    sec_location_geocode_btn:   'Find on map',
    sec_location_geocode_ok:    'Found',
    sec_location_geocode_err:   'Not found',
    sec_location_add:           '+ Add location',
    sec_location_remove:        'Remove',

    /* ── Contact opening hours ───────────────────────── */
    sec_contact_hours:   'Opening Hours',

    /* ── Jobs ────────────────────────────────────────── */
    nav_jobs:            'Jobs',
    eyebrow_jobs:        'Careers',
    jobs_h2:             'Open Positions',
    sec_jobs_h2:         'Jobs',
    sec_jobs_desc:       'Manage job listings.',
    sec_jobs_visible_lbl:  'Show Section',
    sec_jobs_visible_desc: 'Hides the jobs section on the website when unchecked.',
    sec_jobs_title_lbl:    'Title',
    sec_jobs_body_lbl:     'Body Text',
    sec_jobs_btn_text_lbl: 'Button Label',
    sec_jobs_btn_url_lbl:  'Button URL (language-neutral)',

    /* ── Appointments ────────────────────────────────── */
    nav_appointments:            'Appointments',
    eyebrow_appointments:        'Book an Appointment',
    appointments_h2:             'Book an Appointment',
    sec_appointments_h2:         'Appointments',
    sec_appointments_desc:       'Manage the appointments booking section.',
    sec_appointments_visible_lbl:  'Show Section',
    sec_appointments_visible_desc: 'Hides the appointments section on the website when unchecked.',
    sec_appointments_title_lbl:    'Title',
    sec_appointments_body_lbl:     'Body Text',
    sec_appointments_btn_text_lbl: 'Button Label',
    sec_appointments_btn_url_lbl:  'Button URL (language-neutral)',

    /* ── Layout ──────────────────────────────────────── */
    sec_layout_h2:       'Page Structure',
    sec_layout_desc:     'Set the order of sections on the website.',
    sec_layout_up:       '↑',
    sec_layout_down:     '↓',
    layout_about:        'About',
    layout_services:     'Services',
    layout_gallery:      'Gallery',
    layout_locations:    'Locations',
    layout_jobs:         'Jobs',
    layout_appointments: 'Appointments',
    layout_contact:      'Contact',
    admin_nav_layout:    '⊞ Structure',

    /* ── SEO ──────────────────────────────────────────── */
    sec_seo_h2:                'SEO & AEO',
    sec_seo_desc:              'Manage search engine settings and structured data.',
    sec_seo_title_lbl:         'Page Title',
    sec_seo_metadesc_lbl:      'Meta Description',
    sec_seo_chars_hint:        'characters (target: ≤ 155)',
    sec_seo_canonical_lbl:     'Canonical URL',
    sec_seo_ogimage_lbl:       'OG Image URL',
    sec_seo_twitter_lbl:       'Twitter/X Handle',
    sec_seo_biztype_lbl:       'Business Type (Schema)',
    sec_seo_biztype_professional: 'ProfessionalService',
    sec_seo_biztype_local:     'LocalBusiness',
    sec_seo_biztype_org:       'Organization',
    admin_nav_seo:             '🔍 SEO',

    admin_nav_storage:         '💾 Storage',
    sec_storage_h2:            'Storage & Export',
    sec_storage_api_h3:        'Cloudflare KV',
    sec_storage_api_hint:      'Enter the WORKER_SECRET you set via wrangler secret put WORKER_SECRET.',
    sec_storage_key_lbl:       'Worker API Key',
    sec_storage_test:          'Test',
    sec_storage_transfer_h3:   'Export / Import',
    sec_storage_transfer_hint: 'Export downloads current content as content.json. Import loads a previously exported file.',
    sec_storage_export:        '⬇ Export',
    sec_storage_import:        '⬆ Import',
  }
};
