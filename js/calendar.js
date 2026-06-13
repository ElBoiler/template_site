/* ============================================================
   calendar.js — Month-grid and list view for Veranstaltungen
   Exposes: window.initCalendar(events), window.renderMiniCalendar(events)
   ============================================================ */
'use strict';

(function () {

  var MONTHS_DE    = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  var MONTHS_SHORT = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  var DAYS_DE      = ['Mo','Di','Mi','Do','Fr','Sa','So'];
  var CAT_COLORS   = { Schule:'#4A90D9', Kultur:'#9B59B6', Sport:'#27AE60', Eltern:'#E67E22', Sonstiges:'#7F8C8D' };

  var _events = [];
  var _year   = 0;
  var _month  = 0;

  /* ── public API ───────────────────────────────────────── */

  function initCalendar(events) {
    _events = events || [];
    var now = new Date();
    _year  = now.getFullYear();
    _month = now.getMonth();
    render();
    bindControls();
  }

  function renderMiniCalendar(events) {
    var el = document.getElementById('miniCalendar');
    if (!el) return;
    var now = new Date();
    el.innerHTML = buildGridHtml(now.getFullYear(), now.getMonth(), events || [], true);
  }

  window.initCalendar       = initCalendar;
  window.renderMiniCalendar = renderMiniCalendar;

  /* ── helpers ──────────────────────────────────────────── */

  function parseDate(iso) {
    if (!iso) return null;
    var p = iso.split('-');
    if (p.length < 3) return null;
    return new Date(+p[0], +p[1] - 1, +p[2], 12);
  }

  function isoKey(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function catColor(ev) { return CAT_COLORS[ev.category] || CAT_COLORS.Sonstiges; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function fmtTime(t) { return t ? String(t).slice(0, 5) : ''; }

  /* ── grid builder ─────────────────────────────────────── */

  function buildGridHtml(year, month, events, mini) {
    var byDay = {};
    events.forEach(function (ev) {
      var d = parseDate(ev.date);
      if (!d || d.getFullYear() !== year || d.getMonth() !== month) return;
      var k = isoKey(d);
      if (!byDay[k]) byDay[k] = [];
      byDay[k].push(ev);
    });

    var firstDay    = new Date(year, month, 1).getDay();
    var startOffset = firstDay === 0 ? 6 : firstDay - 1;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var todayKey    = isoKey(new Date());

    var html = '<div class="cal-grid' + (mini ? ' cal-grid--mini' : '') + '">';
    DAYS_DE.forEach(function (d) { html += '<div class="cal-head">' + d + '</div>'; });
    for (var i = 0; i < startOffset; i++) {
      html += '<div class="cal-cell cal-cell--empty"></div>';
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var key = year + '-' +
        String(month + 1).padStart(2, '0') + '-' +
        String(day).padStart(2, '0');
      var evs  = byDay[key] || [];
      var cls  = 'cal-cell' +
        (key === todayKey ? ' cal-cell--today' : '') +
        (evs.length ? ' cal-cell--has-events' : '');
      var dots = evs.map(function (ev) {
        return '<span class="cal-dot" style="background:' + catColor(ev) + '"></span>';
      }).join('');
      var bind = (evs.length && !mini)
        ? ' data-date="' + key + '" tabindex="0" role="button" aria-label="' +
          evs.length + ' Veranstaltung(en) am ' + day + '. ' + MONTHS_DE[month] + '"'
        : '';
      html += '<div class="' + cls + '"' + bind + '>' +
        '<span class="cal-day-num">' + day + '</span>' +
        (dots ? '<div class="cal-dots">' + dots + '</div>' : '') +
        '</div>';
    }
    html += '</div>';
    return html;
  }

  /* ── list builder ─────────────────────────────────────── */

  function buildListHtml(events) {
    if (!events.length) return '<p class="cal-empty">Keine Veranstaltungen geplant.</p>';

    var sorted = events.slice().sort(function (a, b) {
      return (a.date || '').localeCompare(b.date || '');
    });

    var groups = new Map();
    sorted.forEach(function (ev) {
      var d = parseDate(ev.date);
      if (!d) return;
      var k = d.getFullYear() * 100 + d.getMonth();
      if (!groups.has(k)) {
        groups.set(k, { label: MONTHS_DE[d.getMonth()] + ' ' + d.getFullYear(), items: [] });
      }
      groups.get(k).items.push(ev);
    });

    var html = '<div class="cal-list">';
    groups.forEach(function (g) {
      html += '<div class="cal-list-group">' +
        '<h3 class="cal-list-month">' + esc(g.label) + '</h3>' +
        '<ul class="cal-list-items">';
      g.items.forEach(function (ev) {
        var d    = parseDate(ev.date);
        var day  = d ? d.getDate() : '';
        var mon  = d ? MONTHS_SHORT[d.getMonth()] : '';
        var time = (!ev.allDay && ev.startTime)
          ? ' &middot; ' + fmtTime(ev.startTime) + (ev.endTime ? '&ndash;' + fmtTime(ev.endTime) : '') + ' Uhr'
          : '';
        var loc  = ev.location ? ' &middot; ' + esc(ev.location) : '';
        html +=
          '<li class="cal-list-item">' +
            '<div class="cal-list-date"><strong>' + day + '</strong>' + mon + '</div>' +
            '<div class="cal-list-body">' +
              '<p class="cal-list-title">' + esc(ev.title || '') + '</p>' +
              '<p class="cal-list-meta">' + esc(ev.category || 'Sonstiges') + time + loc + '</p>' +
              (ev.body ? '<p class="cal-list-desc">' + esc(ev.body) + '</p>' : '') +
            '</div>' +
          '</li>';
      });
      html += '</ul></div>';
    });
    html += '</div>';
    return html;
  }

  /* ── detail panel ─────────────────────────────────────── */

  function showDetail(dateKey) {
    var panel = document.getElementById('calDetail');
    if (!panel) return;
    var evs = _events.filter(function (ev) { return ev.date === dateKey; });
    if (!evs.length) { panel.hidden = true; return; }

    var d     = parseDate(dateKey);
    var label = d
      ? d.getDate() + '. ' + MONTHS_DE[d.getMonth()] + ' ' + d.getFullYear()
      : dateKey;

    panel.innerHTML =
      '<div class="cal-detail-header">' +
        '<h3>' + esc(label) + '</h3>' +
        '<button class="cal-detail-close" id="calDetailClose" aria-label="Schließen">&times;</button>' +
      '</div>' +
      evs.map(function (ev) {
        var time = (!ev.allDay && ev.startTime)
          ? '<p class="cal-detail-time">' + fmtTime(ev.startTime) +
            (ev.endTime ? ' &ndash; ' + fmtTime(ev.endTime) : '') + ' Uhr</p>'
          : '';
        var loc = ev.location ? '<p class="cal-detail-loc">' + esc(ev.location) + '</p>' : '';
        return '<div class="cal-detail-event">' +
          '<p class="cal-detail-title">' + esc(ev.title || '') + '</p>' +
          time + loc +
          (ev.body ? '<p class="cal-detail-body">' + esc(ev.body) + '</p>' : '') +
          '</div>';
      }).join('<hr class="cal-detail-divider">');

    panel.hidden = false;
    document.getElementById('calDetailClose').addEventListener('click', function () {
      panel.hidden = true;
    });
  }

  /* ── render ───────────────────────────────────────────── */

  function render() {
    var label = document.getElementById('calMonthLabel');
    if (label) label.textContent = MONTHS_DE[_month] + ' ' + _year;

    var gridEl = document.getElementById('calGrid');
    if (gridEl) gridEl.innerHTML = buildGridHtml(_year, _month, _events, false);

    var listEl = document.getElementById('calList');
    if (listEl) listEl.innerHTML = buildListHtml(_events);

    var detail = document.getElementById('calDetail');
    if (detail) detail.hidden = true;
  }

  /* ── controls ─────────────────────────────────────────── */

  function bindControls() {
    var prev  = document.getElementById('calPrev');
    var next  = document.getElementById('calNext');
    var tGrid = document.getElementById('calToggleGrid');
    var tList = document.getElementById('calToggleList');
    var grid  = document.getElementById('calGrid');

    if (prev) prev.addEventListener('click', function () {
      if (--_month < 0) { _month = 11; _year--; }
      render();
    });
    if (next) next.addEventListener('click', function () {
      if (++_month > 11) { _month = 0; _year++; }
      render();
    });
    if (tGrid) tGrid.addEventListener('click', function () { setView('grid'); });
    if (tList) tList.addEventListener('click', function () { setView('list'); });

    if (grid) {
      grid.addEventListener('click', function (e) {
        var cell = e.target.closest('[data-date]');
        if (cell) showDetail(cell.dataset.date);
      });
      grid.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var cell = e.target.closest('[data-date]');
        if (cell) { e.preventDefault(); showDetail(cell.dataset.date); }
      });
    }
  }

  function setView(v) {
    var grid  = document.getElementById('calGrid');
    var list  = document.getElementById('calList');
    var tGrid = document.getElementById('calToggleGrid');
    var tList = document.getElementById('calToggleList');
    if (grid)  grid.hidden  = v !== 'grid';
    if (list)  list.hidden  = v !== 'list';
    if (tGrid) { tGrid.classList.toggle('is-active', v === 'grid');  tGrid.setAttribute('aria-pressed', String(v === 'grid')); }
    if (tList) { tList.classList.toggle('is-active', v === 'list');  tList.setAttribute('aria-pressed', String(v === 'list')); }
  }

}());
