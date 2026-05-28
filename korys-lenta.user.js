// ==UserScript==
// @name         Korys -> LentaV3
// @namespace    cherryservers
// @version      3.0.6
// @description  Lenta V3 integracija Koryje
// @match        https://korys.cherryservers.com/*/server/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Pr0t0tip4s/Darbo-Skriptai/main/korys-lenta.user.js
// @downloadURL  https://raw.githubusercontent.com/Pr0t0tip4s/Darbo-Skriptai/main/korys-lenta.user.js
// ==/UserScript==

(function () {
  'use strict';

  const PLAN_INPUT_ID = 'default_plan_id';
  const LOCATION_SELECT_NAME = 'location';
  const BTN_ID = 'lentav2-link';
  const LENTA_BASE = 'https://5.199.173.132/LentaV3/#';

  const LOCATION_CODE_MAP = {
    'Lithuania': 'lt',
    'Netherlands': 'nl',
    'United States': 'us',
    'Sweden': 'se',
    'Germany': 'de',
    'Singapore': 'sg',
    'Japan': 'jp',
  };

  function slugifyPlan(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  function getSelectedLocationText() {
    const select = document.querySelector(`select[name="${LOCATION_SELECT_NAME}"]`);
    if (!select) return '';

    const option = select.options[select.selectedIndex];
    return option ? option.text.trim() : '';
  }

  function getLocationCode(locationText) {
    return LOCATION_CODE_MAP[locationText] || null;
  }

  function slugAlreadyHasLocationCode(slug) {
    return /-(lt|nl|us|se|de|sg|jp)$/i.test(slug);
  }

  function buildLentaHash() {
    const planInput = document.getElementById(PLAN_INPUT_ID);
    if (!planInput) return '';

    const planName = planInput.value.trim();
    if (!planName) return '';

    const slug = slugifyPlan(planName);

    // Jei plane jau yra lokacijos suffix, nieko nebepridedam
    if (slugAlreadyHasLocationCode(slug)) {
      return slug;
    }

    const locationText = getSelectedLocationText();
    const locCode = getLocationCode(locationText);

    return locCode ? `${slug}-${locCode}` : slug;
  }

  function ensureLink(planEl) {
    const parent = planEl && planEl.parentElement;
    if (!parent) return null;

    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    let btn = document.getElementById(BTN_ID);
    if (btn) return btn;

    const oldBtn = document.getElementById('lentav2-btn');

    btn = document.createElement('a');
    btn.id = BTN_ID;
    btn.textContent = 'LentaV3';
    btn.title = 'Atidaryti LentaV2';
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';

    btn.style.position = 'absolute';
    btn.style.right = '5px';
    btn.style.top = '50%';
    btn.style.transform = 'translateY(-50%)';
    btn.style.padding = '2px 6px';
    btn.style.fontSize = '11px';
    btn.style.cursor = 'pointer';
    btn.style.display = 'inline-block';
    btn.style.background = '#f0f0f0';
    btn.style.border = '1px solid #999';
    btn.style.borderRadius = '3px';
    btn.style.textDecoration = 'none';
    btn.style.color = '#000';
    btn.style.lineHeight = '1.4';
    btn.style.textAlign = 'center';

    if (oldBtn && oldBtn.parentNode) {
      oldBtn.parentNode.replaceChild(btn, oldBtn);
    } else {
      parent.appendChild(btn);
    }

    return btn;
  }

  function updateLink() {
    const planEl = document.getElementById(PLAN_INPUT_ID);
    if (!planEl) return;

    const btn = ensureLink(planEl);
    if (!btn) return;

    const hash = buildLentaHash();

    if (!hash) {
      btn.removeAttribute('href');
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.6';
      return;
    }

    btn.href = LENTA_BASE + hash;
    btn.style.pointerEvents = '';
    btn.style.opacity = '';
  }

  function bindEvents() {
    const planEl = document.getElementById(PLAN_INPUT_ID);
    if (planEl && !planEl.__lentaBound) {
      planEl.__lentaBound = true;
      planEl.addEventListener('input', updateLink);
      planEl.addEventListener('change', updateLink);
    }

    const locationEl = document.querySelector(`select[name="${LOCATION_SELECT_NAME}"]`);
    if (locationEl && !locationEl.__lentaBound) {
      locationEl.__lentaBound = true;
      locationEl.addEventListener('change', updateLink);
    }
  }

  function init() {
    updateLink();
    bindEvents();
  }

  window.addEventListener('load', init);

  const observer = new MutationObserver(() => {
    init();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
