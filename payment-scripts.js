/*
 * منطق فرم نیت، اعتبارسنجی سمت کاربر و تعاملات دسترس‌پذیر رابط کاربری.
 * ---
 * Intent-form logic, client-side validation, and accessible UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // عناصر
  const params = new URLSearchParams(location.search);
  const initialCause = params.get('cause') ? params.get('cause').replace(/_/g, ' ') : '';
  const pageTitle = document.getElementById('page-title');
  const provinceSel = document.getElementById('province');
  const citySel = document.getElementById('city');
  const intentsWrap = document.getElementById('intents-wrapper');
  const form = document.getElementById('payment-form');
  const grandTotal = document.getElementById('grand-total');
  const payBtn = document.getElementById('pay-btn');
  const bouquet = document.getElementById('bouquet');
  const totalLine = document.querySelector('.total-line');
  const summary = document.querySelector('.summary');
  const payActions = document.querySelector('.pay-actions');
  const intentError = document.getElementById('intent-error');
  const thankModal = document.getElementById('thank-modal');
  const redirectButton = document.getElementById('redirect-btn');
  const modalCloseButton = document.getElementById('modal-close');
  let lastFocusedElement = null;

  // ابزار
  const faNF = new Intl.NumberFormat('fa-IR');
  const listFa = new Intl.ListFormat('fa', { type: 'conjunction', style: 'long' });

  // استان/شهر (پیوند وابسته)
  provinceSel.disabled = false;
  provinceSel.innerHTML = '<option value="" selected>استان را انتخاب کنید</option>';
  PROVINCE_LIST.forEach(p => { const o = document.createElement('option'); o.value = p; o.textContent = p; provinceSel.appendChild(o); });
  provinceSel.addEventListener('change', () => {
    const p = provinceSel.value;
    citySel.disabled = !p;
    citySel.innerHTML = '';
    const ph = document.createElement('option'); ph.value = ''; ph.selected = true;
    ph.textContent = p ? 'شهر را انتخاب کنید' : 'ابتدا استان را انتخاب کنید';
    citySel.appendChild(ph);
    getCitiesOf(p).forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; citySel.appendChild(o); });
  });

  // موبایل
  const mobileInput = document.getElementById('mobile');
  mobileInput.addEventListener('input', () => { const raw = toEnDigits(mobileInput.value).replace(/[^\d]/g, ''); mobileInput.value = raw; });
  mobileInput.addEventListener('blur', () => { const raw = toEnDigits(mobileInput.value).replace(/[^\d]/g, ''); if (!raw) return; const val = normalizeMobile(raw); if (/^09\d{9}$/.test(val)) mobileInput.value = toFaDigits(val); });
  mobileInput.addEventListener('focus', () => { const raw = toEnDigits(mobileInput.value).replace(/[^\d]/g, ''); mobileInput.value = raw; });

  // کمک‌ها
  const formatIRR = n => faNF.format(n || 0) + ' تومان';
  const stripMoney = v => toEnDigits(v).replace(/[^\d]/g, '');
  const uniqueInOrder = arr => { const seen = new Set(), out = []; arr.forEach(v => { if (v && v !== 'نیت را انتخاب کنید' && !seen.has(v)) { seen.add(v); out.push(v); } }); return out; };

  // دسته‌گل: چیدمان و هم‌پوشانی تطبیقی
  const overlapRatioByCount = n => (n <= 2 ? 0 : n === 3 ? 0.20 : n === 4 ? 0.25 : n <= 7 ? 0.30 : 0.40);
  function layoutBouquet() {
    const flowers = [...bouquet.querySelectorAll('.flower')];
    const n = flowers.length;
    const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--flower-h')) || 40;
    bouquet.style.height = h + 'px';
    if (n === 0) { bouquet.style.width = '0px'; return; }
    const r = overlapRatioByCount(n);
    const spacing = Math.round(h * (1 - r));
    const totalW = h + (n - 1) * spacing;
    bouquet.style.width = totalW + 'px';
    flowers.forEach((el, i) => { el.style.left = (i * spacing) + 'px'; });
  }
  const getIntentKeyFromRow = row => (row.querySelector('.intent-trigger')?.textContent || '').trim();
  function highlightFlower(key) {
    const el = bouquet.querySelector(`.flower[data-key="${CSS.escape(key)}"]`);
    if (!el) return; el.classList.remove('bloom-pulse'); void el.offsetWidth; el.classList.add('bloom-pulse');
  }
  function removeFlowerByKey(key) {
    const el = bouquet.querySelector(`.flower[data-key="${CSS.escape(key)}"]`);
    if (!el) return; el.classList.add('fade-out'); setTimeout(() => { el.remove(); layoutBouquet(); }, 420);
  }
  function ensureFlower(key) {
    let el = bouquet.querySelector(`.flower[data-key="${CSS.escape(key)}"]`);
    if (el) return el;
    el = document.createElement('img'); el.className = 'flower'; el.setAttribute('data-key', key);
    el.src = 'images/decorations/narges3.webp'; el.alt = '';
    bouquet.insertBefore(el, bouquet.firstChild);
    return el;
  }
  function flyFlowerFromRowToBouquet(row, onDone) {
    const fly = document.createElement('img'); fly.src = 'images/decorations/narges3.webp'; fly.alt = '';
    fly.style.cssText = 'position:fixed;width:42px;height:42px;pointer-events:none;z-index:2147483646;opacity:0;';
    const r = row.getBoundingClientRect(); const startX = r.left + r.width * 0.18, startY = r.top + r.height * 0.12;
    fly.style.left = startX + 'px'; fly.style.top = startY + 'px'; document.body.appendChild(fly);
    const bq = bouquet.getBoundingClientRect(); const endX = bq.left + 4, endY = bq.top + (bq.height / 2);
    const midX = (startX + endX) / 2 + (Math.random() * 60 - 30); const midY = Math.min(startY, endY) - (70 + Math.random() * 50);
    const dur = 760 + Math.random() * 420; const start = performance.now();
    requestAnimationFrame(function anim(t) {
      const k = Math.min(1, (t - start) / dur); const ease = k < .5 ? 2 * k * k : -1 + (4 - 2 * k) * k;
      const x = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * midX + ease * ease * endX;
      const y = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * midY + ease * ease * endY;
      fly.style.opacity = String(Math.min(1, k * 1.2));
      fly.style.transform = `translate3d(${x - startX}px, ${y - startY}px, 0) scale(${.92 + .08 * k}) rotate(${(k * 20 - 10).toFixed(1)}deg)`;
      if (k < 1) requestAnimationFrame(anim); else { fly.remove(); onDone?.(); }
    });
  }
  function upsertFlowerForRow(row) {
    const key = getIntentKeyFromRow(row);
    if (!key || key === 'نیت را انتخاب کنید') return;
    const existed = !!bouquet.querySelector(`.flower[data-key="${CSS.escape(key)}"]`);
    if (existed) { highlightFlower(key); layoutBouquet(); return; }
    layoutBouquet();
    flyFlowerFromRowToBouquet(row, () => { ensureFlower(key); layoutBouquet(); highlightFlower(key); });
  }

  // جای‌گذاری دسته‌گل میان «جمع مبلغ» و دکمه
  function positionBouquet() {
    const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--flower-h')) || 40;
    const sumRect = summary.getBoundingClientRect();
    const totalRect = totalLine.getBoundingClientRect();
    const btnRect = payBtn.getBoundingClientRect();
    const minGap = Math.ceil(h * 0.70);
    const currentGap = btnRect.top - totalRect.bottom;
    const base = 6;
    const extra = Math.max(0, minGap - currentGap);
    payActions.style.marginTop = (base + extra) + 'px';
    const gapMid = ((totalRect.bottom + btnRect.top) / 2) - sumRect.top;
    bouquet.style.top = (gapMid - (h / 2)) + 'px';
    bouquet.style.left = '50%';
    bouquet.style.transform = 'translateX(-50%)';
  }

  // کنترل اسکرول بدون CLS
  function updateScrollMode() {
    const needScroll = document.documentElement.scrollHeight > window.innerHeight + 2;
    document.body.classList.toggle('scroll-allowed', needScroll);
  }

  // ساخت منوی چندسطحی با زیرمنوی بسته پیش‌فرض
  function buildMenuList(tree = [], onPick) {
    const ul = document.createElement('ul');
    (tree || []).forEach(node => {
      const li = document.createElement('li');
      if (node.menu || node.submenu) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'menu-item parent'; btn.textContent = node.title;
        btn.setAttribute('role', 'menuitem'); btn.setAttribute('aria-haspopup', 'menu'); btn.setAttribute('aria-expanded', 'false');

        const subWrap = document.createElement('div');
        subWrap.className = 'submenu'; subWrap.setAttribute('role', 'menu'); subWrap.setAttribute('aria-hidden', 'true');
        subWrap.appendChild(buildMenuList(node.menu || node.submenu, onPick));

        function openSub() {
          // بستن سایر زیرمنوهای باز در همین سطح
          li.parentElement?.querySelectorAll(':scope > li > .submenu.open').forEach(s => {
            if (s !== subWrap) { s.classList.remove('open'); s.setAttribute('aria-hidden', 'true'); s.previousElementSibling?.setAttribute('aria-expanded', 'false'); }
          });
          btn.setAttribute('aria-expanded', 'true');
          subWrap.classList.add('open'); subWrap.setAttribute('aria-hidden', 'false');
          setTimeout(() => rovingFocus(subWrap), 0);
        }
        function closeSub() {
          btn.setAttribute('aria-expanded', 'false');
          subWrap.classList.remove('open'); subWrap.setAttribute('aria-hidden', 'true');
        }

        btn.addEventListener('click', (e) => { e.stopPropagation(); (btn.getAttribute('aria-expanded') === 'true') ? closeSub() : openSub(); });
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); openSub(); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); closeSub(); btn.focus(); }
        });

        li.append(btn, subWrap);
      } else {
        const leaf = document.createElement('button');
        leaf.type = 'button'; leaf.className = 'menu-item'; leaf.textContent = node.title;
        leaf.setAttribute('role', 'menuitem');
        leaf.addEventListener('click', (e) => { e.stopPropagation(); onPick(node.title); });
        li.append(leaf);
      }
      ul.appendChild(li);
    });
    return ul;
  }
  function rovingFocus(panel) {
    const items = [...panel.querySelectorAll('.menu-item')];
    if (!items.length) return;
    items.forEach((it, i) => { it.tabIndex = i === 0 ? 0 : -1; });
    // The roving index lives on the node: this runs on every open, so it must survive re-entry.
    panel._rovingIndex = 0;
    const setActive = i => {
      items[panel._rovingIndex].tabIndex = -1;
      panel._rovingIndex = (i + items.length) % items.length;
      items[panel._rovingIndex].tabIndex = 0;
      items[panel._rovingIndex].focus();
    };
    // Bind once per panel; re-binding on each open would stack handlers and multiply every keypress.
    if (!panel._rovingBound) {
      panel._rovingBound = true;
      panel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(panel._rovingIndex + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(panel._rovingIndex - 1); }
        else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
        else if (e.key === 'End') { e.preventDefault(); setActive(items.length - 1); }
        else if (e.key === 'Escape') { e.preventDefault(); const parentBtn = panel.previousElementSibling; panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); parentBtn?.setAttribute('aria-expanded', 'false'); parentBtn?.focus(); }
      });
    }
    items[0].focus();
  }
  function smartPlace(panel, trigger) {
    const r = trigger.getBoundingClientRect();
    panel.style.minWidth = Math.max(r.width, 260) + 'px';
    panel.classList.remove('drop-up');
    const probe = panel.getBoundingClientRect();
    const below = r.bottom + 8 + Math.max(probe.height, 160);
    const canBelow = below < innerHeight - 8;
    if (!canBelow) panel.classList.add('drop-up');
  }

  // ردیف نیت (منوها + دسته‌گل)
  function createIntentRow(defaultIntent = '') {
    const row = document.createElement('div'); row.className = 'intent-row';

    // افزودن/حذف
    const addBtn = document.createElement('button'); addBtn.type = 'button'; addBtn.className = 'icon-btn add-intent'; addBtn.innerHTML = '<img src="images/logo/add.png" alt="+"/>';
    addBtn.addEventListener('click', () => { intentsWrap.appendChild(createIntentRow()); updateRemoveState(); updateTotalAndTitle(); updateScrollMode(); });

    const removeBtn = document.createElement('button'); removeBtn.type = 'button'; removeBtn.className = 'icon-btn remove-intent'; removeBtn.innerHTML = '<img src="images/logo/remove.png" alt="-"/>';
    removeBtn.addEventListener('click', () => {
      if (removeBtn.hasAttribute('disabled')) return;
      const key = getIntentKeyFromRow(row);
      if (key) removeFlowerByKey(key);
      // Release the per-row observer before detaching the node.
      ro.disconnect();
      row.remove();
      updateRemoveState(); updateTotalAndTitle(); updateScrollMode();
    });

    // نیت
    const intentBox = document.createElement('div'); intentBox.className = 'intent-select';
    const intentTrigger = document.createElement('button');
    intentTrigger.type = 'button'; intentTrigger.className = 'intent-trigger'; intentTrigger.textContent = defaultIntent || 'نیت را انتخاب کنید';
    intentTrigger.setAttribute('aria-haspopup', 'menu'); intentTrigger.setAttribute('aria-expanded', 'false');

    const intentPanel = document.createElement('div'); intentPanel.className = 'intent-panel'; intentPanel.setAttribute('role', 'menu'); intentPanel.setAttribute('aria-hidden', 'true');
    if (Array.isArray(NIAT_CARDS) && NIAT_CARDS.length) {
      intentPanel.appendChild(buildMenuList(NIAT_CARDS, (picked) => {
        intentTrigger.textContent = picked;
        closePanel(intentTrigger, intentPanel, true);
        setAmountsEnabled(true);
        updateTotalAndTitle();
      }));
    }

    function openPanel(trigger, panel) {
      // بستن سایر پنل‌ها
      document.querySelectorAll('.intent-panel.open, .amount-panel.open').forEach(p => {
        p.classList.remove('open'); p.setAttribute('aria-hidden', 'true'); p.previousElementSibling?.setAttribute('aria-expanded', 'false');
      });
      panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); trigger.setAttribute('aria-expanded', 'true');
      smartPlace(panel, trigger); setTimeout(() => rovingFocus(panel), 0);
      const closer = (ev) => { if (!panel.contains(ev.target) && ev.target !== trigger) { closePanel(trigger, panel, true); document.removeEventListener('pointerdown', closer, true); } };
      document.addEventListener('pointerdown', closer, true);
    }
    function closePanel(trigger, panel, returnFocus) {
      panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
    }

    // Escape is bound once at creation; binding it inside openPanel would stack a new listener per open.
    intentPanel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closePanel(intentTrigger, intentPanel, true); } });

    intentTrigger.addEventListener('click', (e) => { e.stopPropagation(); intentPanel.classList.contains('open') ? closePanel(intentTrigger, intentPanel, true) : openPanel(intentTrigger, intentPanel); });
    intentTrigger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); openPanel(intentTrigger, intentPanel); } });
    intentBox.append(intentTrigger, intentPanel);

    // مبلغ
    const amountHolder = document.createElement('div'); amountHolder.className = 'amount-holder';
    const amountWrap = document.createElement('div'); amountWrap.className = 'field-wrapper';
    const amountSel = document.createElement('select'); amountSel.className = 'amount-select visually-hidden'; amountSel.setAttribute('tabindex', '-1');
    amountSel.innerHTML = `
      <option value="">مبلغ را انتخاب کنید</option>
      <option value="50000">۵۰,۰۰۰</option>
      <option value="100000">۱۰۰,۰۰۰</option>
      <option value="200000">۲۰۰,۰۰۰</option>
      <option value="500000">۵۰۰,۰۰۰</option>
      <option value="custom">مبلغ دلخواه...</option>
    `;
    const amountTrigger = document.createElement('button'); amountTrigger.type = 'button'; amountTrigger.className = 'amount-trigger'; amountTrigger.textContent = 'مبلغ را انتخاب کنید';
    amountTrigger.setAttribute('aria-haspopup', 'menu'); amountTrigger.setAttribute('aria-expanded', 'false');

    const amountPanel = document.createElement('div'); amountPanel.className = 'amount-panel'; amountPanel.setAttribute('role', 'menu'); amountPanel.setAttribute('aria-hidden', 'true');
    const amountUL = document.createElement('ul');
    [...amountSel.options].forEach(opt => {
      if (!opt.value) return;
      const li = document.createElement('li');
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'menu-item'; btn.setAttribute('role', 'menuitem');
      btn.dataset.value = opt.value; btn.textContent = opt.textContent;
      btn.addEventListener('click', () => { amountSel.value = btn.dataset.value; amountTrigger.textContent = opt.textContent; handleAmountChange(); closePanel(amountTrigger, amountPanel, true); });
      li.appendChild(btn); amountUL.appendChild(li);
    });
    amountPanel.appendChild(amountUL);

    function openAmount() {
      document.querySelectorAll('.intent-panel.open, .amount-panel.open').forEach(p => p.classList.remove('open'));
      amountPanel.classList.add('open'); amountPanel.setAttribute('aria-hidden', 'false'); amountTrigger.setAttribute('aria-expanded', 'true');
      smartPlace(amountPanel, amountTrigger); setTimeout(() => rovingFocus(amountPanel), 0);
      const closer = (ev) => { if (!amountPanel.contains(ev.target) && ev.target !== amountTrigger) { closePanel(amountTrigger, amountPanel, true); document.removeEventListener('pointerdown', closer, true); } };
      document.addEventListener('pointerdown', closer, true);
    }
    // Escape is bound once at creation; binding it inside openAmount would stack a new listener per open.
    amountPanel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closePanel(amountTrigger, amountPanel, true); } });
    amountTrigger.addEventListener('click', (e) => { e.stopPropagation(); amountPanel.classList.contains('open') ? closePanel(amountTrigger, amountPanel, true) : openAmount(); });
    amountTrigger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); openAmount(); } });

    amountWrap.append(amountTrigger, amountSel, amountPanel); amountHolder.appendChild(amountWrap);

    // مبلغ دلخواه
    const customHolder = document.createElement('div'); customHolder.className = 'custom-holder';
    const customWrap = document.createElement('div'); customWrap.className = 'field-wrapper';
    const custom = document.createElement('input'); custom.type = 'text'; custom.inputMode = 'numeric'; custom.className = 'custom-amount'; custom.placeholder = 'مبلغ دلخواه (تومان)';
    customWrap.appendChild(custom); customHolder.appendChild(customWrap);

    const syncCustomSize = () => {
      const h1 = intentTrigger.getBoundingClientRect().height || 56;
      const h2 = amountTrigger.getBoundingClientRect().height || 56;
      const avg = Math.round((h1 + h2) / 2);
      const clamped = Math.max(40, Math.min(avg, 72));
      custom.style.height = clamped + 'px';
    };
    const ro = new ResizeObserver(syncCustomSize);
    ro.observe(intentTrigger); ro.observe(amountTrigger);

    function setAmountsEnabled(enabled) {
      amountSel.disabled = !enabled; custom.disabled = !enabled;
      if (!enabled) { amountSel.value = ''; custom.value = ''; row.classList.remove('custom-visible'); amountTrigger.textContent = 'مبلغ را انتخاب کنید'; }
    }
    setAmountsEnabled(!!defaultIntent && defaultIntent !== 'نیت را انتخاب کنید');

    function handleAmountChange() {
      const isCustom = amountSel.value === 'custom';
      row.classList.toggle('custom-visible', isCustom);
      if (isCustom) { custom.value = ''; custom.focus(); } else if (amountSel.value) { upsertFlowerForRow(row); }
      if (isCustom) syncCustomSize();
      updateTotalAndTitle(); updateScrollMode();
    }
    function maybeFromCustom() {
      const raw = stripMoney(custom.value);
      custom.value = raw ? (faNF.format(parseInt(raw, 10)) + ' تومان') : '';
      updateTotalAndTitle();
      if (raw) upsertFlowerForRow(row);
      updateScrollMode();
    }
    custom.addEventListener('focus', () => { custom.value = stripMoney(custom.value); });
    custom.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); maybeFromCustom(); custom.blur(); } });
    custom.addEventListener('blur', () => { maybeFromCustom(); });

    // نصب اجزا
    row.append(addBtn, intentBox, amountHolder, customHolder, removeBtn);

    return row;
  }

  // بستن سراسری همهٔ پنل‌ها با Escape — یک شنونده برای کل صفحه
  // Single document-level listener closes every open panel (no per-row listeners).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.intent-panel.open, .amount-panel.open').forEach(p => {
      p.classList.remove('open');
      p.setAttribute('aria-hidden', 'true');
      p.previousElementSibling?.setAttribute('aria-expanded', 'false');
    });
  });

  function updateRemoveState() {
    const rows = [...intentsWrap.querySelectorAll('.intent-row')];
    rows.forEach(r => { const rm = r.querySelector('.remove-intent'); if (rows.length <= 1) rm.setAttribute('disabled', ''); else rm.removeAttribute('disabled'); });
  }

  // جمع کل و عنوان
  function parseAmount(sel, custom) {
    if (sel.value && sel.value !== 'custom') return parseInt(sel.value) || 0;
    if (sel.value === 'custom' && custom.value) return parseInt(toEnDigits(custom.value).replace(/[^\d]/g, '')) || 0;
    return 0;
  }
  function updateTotalAndTitle() {
    let sum = 0;
    const rows = [...intentsWrap.querySelectorAll('.intent-row')];
    const intents = uniqueInOrder(rows.map(r => r.querySelector('.intent-trigger')?.textContent || ''));
    rows.forEach(r => { sum += parseAmount(r.querySelector('.amount-select'), r.querySelector('.custom-amount')); });
    grandTotal.textContent = formatIRR(sum);
    if (intents.length === 0) pageTitle.textContent = 'برای انجام ثبت خیرت، اطلاعات را تکمیل کن';
    else if (intents.length === 1) pageTitle.textContent = `ثبت نیت خیر: ${intents}`;
    else pageTitle.textContent = `ثبت همزمان ${intents.length} نیت ارزشمند: ${listFa.format(intents)}`;
  }

  // شروع
  intentsWrap.appendChild(createIntentRow(initialCause || ''));
  updateRemoveState();
  updateTotalAndTitle();
  positionBouquet();
  layoutBouquet();
  updateScrollMode();
  window.addEventListener('resize', debounce(() => { positionBouquet(); layoutBouquet(); updateScrollMode(); }, 150));

  const ta = document.getElementById('donation-notes');
  const count = document.getElementById('notes-inline-count');
  if (ta && count) {
    const nf = new Intl.NumberFormat('fa-IR');
    const max = ta.maxLength || 313;
    const update = () => {
      if (ta.value.length > max) { ta.value = ta.value.slice(0, max); }
      const len = Math.min(ta.value.length, max);
      count.textContent = nf.format(len) + '/' + nf.format(max);
      count.classList.toggle('warn', len >= 300);
      count.classList.remove('bump'); void count.offsetWidth; count.classList.add('bump');
      ta.style.height = 'auto';
      ta.style.height = Math.max(ta.scrollHeight, 96) + 'px';
    };
    ta.addEventListener('beforeinput', (e) => {
      const sel = ta.selectionEnd - ta.selectionStart;
      const inserting = /insert/i.test(e.inputType);
      if (inserting && (ta.value.length - sel) >= max) e.preventDefault();
    });
    ta.addEventListener('input', update);
    ta.addEventListener('focus', update);
    update();
  }

  const trust = document.querySelector('.trust-footer');
  if (payBtn && trust) {
    const setHalfGap = () => {
      trust.style.marginTop = '';
      const orig = parseFloat(getComputedStyle(trust).marginTop) || 0;
      const pb = payBtn.getBoundingClientRect().bottom;
      const tt = trust.getBoundingClientRect().top;
      const gap = Math.max(0, tt - pb);
      const delta = gap - gap / 2;
      trust.style.marginTop = Math.max(0, orig - delta) + 'px';
    };
    setHalfGap();
    window.addEventListener('resize', debounce(setHalfGap, 150));
  }

  function setIntentError(message = '') {
    intentError.textContent = message;
    intentsWrap.setAttribute('aria-invalid', String(Boolean(message)));
  }

  function focusIntentError() {
    intentsWrap.tabIndex = -1;
    intentsWrap.focus();
  }

  function openThankModal() {
    lastFocusedElement = document.activeElement;
    thankModal.classList.add('show');
    requestAnimationFrame(() => redirectButton.focus());
  }

  function closeThankModal() {
    thankModal.classList.remove('show');
    lastFocusedElement?.focus();
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fullname = document.getElementById('fullname'), mobile = document.getElementById('mobile');
    const err = (el, msg) => {
      const message = el.closest('.input-group').querySelector('.error');
      if (message.id) el.setAttribute('aria-describedby', message.id);
      message.textContent = msg || '';
      el.setAttribute('aria-invalid', String(Boolean(msg)));
    };
    let firstInvalid = null;
    const invalidate = (el, message) => {
      err(el, message);
      firstInvalid ||= el;
    };
    const mobileRaw = toEnDigits(mobile.value).replace(/[^\d]/g, '');
    if (fullname.value.trim().length < 3) invalidate(fullname, 'نام کامل را وارد کنید'); else err(fullname);
    if (!/^09\d{9}$/.test(normalizeMobile(mobileRaw))) invalidate(mobile, 'شماره موبایل صحیح نیست'); else err(mobile);
    if (!provinceSel.value) invalidate(provinceSel, 'استان را انتخاب کنید'); else err(provinceSel);
    if (!citySel.value) invalidate(citySel, 'شهر را انتخاب کنید'); else err(citySel);

    const rows = [...intentsWrap.querySelectorAll('.intent-row')];
    const validIntentRows = rows.filter(row => {
      const intent = getIntentKeyFromRow(row);
      const amount = parseAmount(row.querySelector('.amount-select'), row.querySelector('.custom-amount'));
      return intent && intent !== 'نیت را انتخاب کنید' && amount > 0;
    });
    if (!validIntentRows.length) {
      setIntentError('حداقل یک نیت و مبلغ معتبر را انتخاب کنید.');
      if (!firstInvalid) firstInvalid = intentsWrap;
    } else {
      setIntentError();
    }

    if (firstInvalid) {
      if (firstInvalid === intentsWrap) focusIntentError(); else firstInvalid.focus();
      return;
    }

    // Trigger the existing visual confirmation only after validation succeeds.
    const b = (e.submitter || payBtn).getBoundingClientRect();
    pigeons.burstAt(b.left + b.width / 2, b.top + b.height / 2);

    const intents = uniqueInOrder(rows.map(r => r.querySelector('.intent-trigger')?.textContent || ''));
    const name = fullname.value.trim();
    const joined = intents.length ? listFa.format(intents) : 'نیت خیر';
    document.getElementById('thank-message').textContent =
      intents.length <= 1
        ? `${name} عزیز، نیت «${joined}» برای بررسی آماده است؛ اتصال به درگاه بانکی در این نسخه فعال نیست و هیچ تراکنشی ثبت یا ارسال نشده است.`
        : `${name} نیک‌اندیش، ${intents.length} نیت (${joined}) برای بررسی آماده است؛ اتصال به درگاه بانکی در این نسخه فعال نیست و هیچ تراکنشی ثبت یا ارسال نشده است.`;
    openThankModal();
  });

  redirectButton.addEventListener('click', () => {
    location.href = 'cards-form.html';
  });
  modalCloseButton.addEventListener('click', closeThankModal);
  thankModal.addEventListener('click', event => {
    if (event.target === thankModal) closeThankModal();
  });
  document.addEventListener('keydown', event => {
    if (!thankModal.classList.contains('show')) return;
    if (event.key === 'Escape') {
      closeThankModal();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = [...thankModal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.hidden && getComputedStyle(element).visibility !== 'hidden');
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!thankModal.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const pigeons = new PigeonGlide();
});
/* ساخته شده توسط مهدی باغبانپور بروجنی */
