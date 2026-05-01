/* ============================================================
   CHAMISSO-GRUNDSCHULE — js/i18n.js
   Stub kept for backward compatibility with admin.js.
   Site is monolingual German — these helpers always return DE.
   To re-enable bilingual mode in future, restore the original
   from git history and re-add the .lang-switcher block in CSS.
   ============================================================ */

'use strict';

const LANG_KEY     = 'bds_lang';
const VALID_LANGS  = ['de'];
const DEFAULT_LANG = 'de';

function getLang() { return DEFAULT_LANG; }
function setLang(_) { /* no-op */ }

/** Translation lookup — returns the key as a German fallback. */
function T(key) {
  const dict = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.de) ? TRANSLATIONS.de : {};
  return dict[key] || key;
}

/** No static-translations sweep — pages ship in DE only. */
function applyTranslations(_) { /* no-op */ }

const TRANSLATIONS = { de: {} };

/* Expose for admin.js */
window.getLang = getLang;
window.setLang = setLang;
window.T = T;
window.applyTranslations = applyTranslations;
window.TRANSLATIONS = TRANSLATIONS;
