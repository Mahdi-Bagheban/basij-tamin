/* به نام خداوند بخشنده مهربان */

document.addEventListener('DOMContentLoaded', () => {
  /* ——— کل منطق فعلی شما: باز/بسته شدن پنل، منوهای کشویی، تولتیپ‌ها، سویچرها ——— */
  const body = document.body;
  const panel = document.getElementById('gateway-panel');
  const headerTrigger = document.getElementById('gateway-trigger');
  const container = document.getElementById('cards-container');
  const viewButtons = document.querySelectorAll('.view-switcher button');
  const modeButtons = document.querySelectorAll('.day-night-switcher button');
  const desktopLeft = document.getElementById('desktop-controls-left');
  const desktopRight = document.getElementById('desktop-controls-right');
  const mobileControls = document.getElementById('mobile-controls');

  setView(localStorage.getItem('cardViewMode') || 'small');
  setMode(localStorage.getItem('dayNightMode') || 'day');
  hideControls();

  let isExpanded = false;
  let isAnimating = false;

  headerTrigger?.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAnimating) return;
    isExpanded ? collapsePanel() : expandPanel();
  }); // الگوی شنونده

  function sortTopThenRight(wraps){
    return wraps
      .map((w) => ({ w, c: w.querySelector('.card'), rect: w.getBoundingClientRect() }))
      .sort((a, b) => (a.rect.top - b.rect.top) || (b.rect.left - a.rect.left));
  }

  function expandPanel(){
    isAnimating = true; isExpanded = true;
    headerTrigger?.setAttribute('aria-expanded','true');
    panel?.classList.remove('collapsed'); panel?.classList.add('expanded');
    const wraps = Array.from(document.querySelectorAll('.card-wrap'));
    const ordered = sortTopThenRight(wraps);
    ordered.forEach(({ w, c }, i) => {
      setTimeout(() => { c?.classList.add('visible'); w?.classList.add('card-ready'); }, i * 120);
    });
    const total = ordered.length * 120 + 550;
    setTimeout(() => { showControls(); isAnimating = false; }, total);
  }

  function collapsePanel(){
    isAnimating = true; isExpanded = false;
    headerTrigger?.setAttribute('aria-expanded','false');
    hideControls();
    const wraps = Array.from(document.querySelectorAll('.card-wrap'));
    const ordered = sortTopThenRight(wraps).reverse();
    ordered.forEach(({ w, c }, i) => {
      setTimeout(() => { w?.classList.remove('card-ready'); c?.classList.remove('visible'); }, i * 120);
    });
    const total = ordered.length * 120 + 400;
    setTimeout(() => { panel?.classList.remove('expanded'); panel?.classList.add('collapsed'); isAnimating = false; }, total);
  }

  container?.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;

    /* ——— پرتاب کبوترها در نقطه دقیق کلیک روی کارت ——— */
    launchPigeons(e.clientX, e.clientY); // همواره اجرا شود

    // منوی اختصاصی کارت (بدون تغییر)
    const menuData = card.getAttribute('data-menu');
    if (menuData) {
      let items = [];
      try { items = JSON.parse(menuData); } catch { items = []; }
      if (!items.length) return;
      e.stopPropagation();
      openMenuAt(e, items);
      return;
    }

    // لینک مستقیم کارت (بدون تغییر)
    const url = card.getAttribute('data-url');
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  });

  function buildMenu(items){
    const ul = document.createElement('ul');
    items.forEach(item => {
      const li = document.createElement('li');
      if (item.submenu && Array.isArray(item.submenu) && item.submenu.length){
        const span = document.createElement('span');
        span.textContent = item.title;
        span.addEventListener('click', (e) => {
          e.stopPropagation();
          ul.querySelectorAll('li.expanded').forEach(other => { if (other !== li) other.classList.remove('expanded'); });
          li.classList.toggle('expanded');
        });
        li.appendChild(span);
        li.appendChild(buildMenu(item.submenu));
      } else {
        const a = document.createElement('a');
        a.href = item.url || '#';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = item.title;
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
    return ul;
  }

  function openMenuAt(e, items){
    closeMenus();
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.appendChild(buildMenu(items));
    menu.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    document.body.appendChild(menu);
    const r = menu.getBoundingClientRect();
    let left = e.clientX - r.width / 2;
    let top = e.clientY;
    if (left < 8) left = 8;
    if (left + r.width > innerWidth - 8) left = innerWidth - r.width - 8;
    if (top + r.height > innerHeight - 8) top = innerHeight - r.height - 8;
    if (top < 8) top = 8;
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    requestAnimationFrame(() => menu.classList.add('show'));
  }

  function closeMenus(){
    document.querySelectorAll('.dropdown-menu').forEach(m => m.remove());
  }
  document.addEventListener('pointerdown', (ev) => {
    if (!ev.target.closest('.dropdown-menu')) closeMenus();
  }, true);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeMenus(); });
  window.addEventListener('resize', closeMenus);

  // Tooltip
  const tip = document.createElement('div'); tip.className = 'tooltip-pop'; document.body.appendChild(tip);
  function placeTooltip(el){
    const text = el.getAttribute('data-tooltip'); if (!text) return;
    tip.textContent = text;
    tip.style.left = '-9999px'; tip.style.top = '-9999px';
    tip.classList.add('show');
    const r = el.getBoundingClientRect();
    const pad = 10;
    const desktop = window.matchMedia('(min-width:651px)').matches;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let tx, ty;
    if (!desktop) {
      tx = r.left + (r.width - tw)/2;
      ty = r.top - th - pad;
      if (ty < 8) ty = r.bottom + pad;
    } else {
      const inLeft = !!el.closest('#desktop-controls-left');
      const preferRight = inLeft || (r.left < innerWidth/2);
      if (preferRight){ tx = r.right + pad; ty = r.top + (r.height - th)/2; if (tx + tw > innerWidth - 8) tx = innerWidth - tw - 8; }
      else { tx = r.left - tw - pad; ty = r.top + (r.height - th)/2; if (tx < 8) tx = 8; }
      if (ty < 8) ty = 8;
      if (ty + th > innerHeight - 8) ty = innerHeight - th - 8;
    }
    tx = Math.max(8, Math.min(tx, innerWidth - tw - 8));
    tip.style.left = `${tx}px`;
    tip.style.top = `${ty}px`;
  }
  function hideTooltip(){ tip.classList.remove('show'); }
  function bindTooltips(){
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      el.addEventListener('mouseenter', () => placeTooltip(el));
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('focusin', () => placeTooltip(el));
      el.addEventListener('focusout', hideTooltip);
      el.addEventListener('touchstart', () => { placeTooltip(el); setTimeout(hideTooltip, 1200); }, { passive:true });
    });
    window.addEventListener('resize', hideTooltip);
  }

  function setView(view){
    container.classList.remove('view-small','view-big');
    container.classList.add(view === 'big' ? 'view-big' : 'view-small');
    viewButtons.forEach(btn => {
      const active = btn.dataset.view === view;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    localStorage.setItem('cardViewMode', view);
  }
  viewButtons.forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));

  function setMode(mode){
    body.classList.toggle('night-mode', mode === 'night');
    modeButtons.forEach(btn => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    localStorage.setItem('dayNightMode', mode);
  }
  modeButtons.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

  function showControls(){ desktopLeft?.classList.remove('hide'); desktopRight?.classList.remove('hide'); mobileControls?.classList.remove('hide'); }
  function hideControls(){ desktopLeft?.classList.add('hide'); desktopRight?.classList.add('hide'); mobileControls?.classList.add('hide'); }

  bindTooltips();

  /* ——— افزوده: انیمیشن پرواز کبوترها ———
     حرکت با requestAnimationFrame و transform/opacity برای کارایی بالا اجرا می‌شود. */
  function launchPigeons(cx, cy){
    const imgs = [
      ...Array(6).fill('images/decorations/pigeon1.png'), // بالا-راست
      ...Array(6).fill('images/decorations/pigeon2.png')  // بالا-چپ
    ];
    imgs.forEach((src, i)=>{
      setTimeout(()=>{
        const img = document.createElement('img');
        img.className='pigeon'; img.src=src; img.alt='';
        const dur = 3.0 + Math.random()*1.0;
        img.style.setProperty('--dur', `${dur}s`);
        // محوشدن نزدیک مقصد (حدود 22٪ انتهایی مسیر)
        const fadeDur = Math.max(0.5, dur*0.28);
        img.style.setProperty('--fade', `${fadeDur}s`);
        document.body.appendChild(img);

        const startX=cx, startY=cy;
        img.style.left = (startX-14)+'px';
        img.style.top  = (startY-14)+'px';

        // جهت‌دهی: pigeon1 بالا-راست، pigeon2 بالا-چپ
        const deg = src.includes('pigeon1') ? -(20 + Math.random()*60) : -(100 + Math.random()*60);
        const rad = deg * Math.PI / 180;
        const dist = 120 + Math.random()*160;
        const dx = Math.cos(rad)*dist;
        const dy = Math.sin(rad)*dist; // منفی = صعود
        const rot = (Math.random()*34-17);

        requestAnimationFrame(()=>{
          img.style.opacity='1';
          img.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.06) rotate(${rot}deg)`;
          // شروع محوشدن کمی قبل از رسیدن
          setTimeout(()=>{ img.style.opacity='0.0'; }, Math.floor(dur*1000*0.78));
        });
        setTimeout(()=>img.remove(), Math.ceil(dur*1000) + 600);
      }, i*110);
    });
  }
});
/* ساخته شده توسط مهدی باغبانپور بروجنی */
