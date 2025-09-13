/* به نام خداوند بخشنده مهربان */

document.addEventListener('DOMContentLoaded', () => {
  // ارجاع‌ها
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

  let isExpanded=false, isAnimating=false;

  headerTrigger?.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAnimating) return;
    isExpanded ? collapsePanel() : expandPanel();
  });

  function sortTopThenRight(wraps){
    return wraps
      .map(w => ({ w, c:w.querySelector('.card'), rect:w.getBoundingClientRect() }))
      .sort((a,b) => (a.rect.top - b.rect.top) || (b.rect.left - a.rect.left));
  }

  function expandPanel(){
    isAnimating = true; isExpanded = true;
    headerTrigger?.setAttribute('aria-expanded','true');
    panel?.classList.remove('collapsed'); panel?.classList.add('expanded');
    const wraps = Array.from(document.querySelectorAll('.card-wrap'));
    const ordered = sortTopThenRight(wraps);
    ordered.forEach(({w,c},i) => { setTimeout(() => { c?.classList.add('visible'); w?.classList.add('card-ready'); }, i*120); });
    const total = ordered.length*120 + 550;
    setTimeout(() => { showControls(); isAnimating = false; }, total);
  }

  function collapsePanel(){
    isAnimating = true; isExpanded = false;
    headerTrigger?.setAttribute('aria-expanded','false');
    hideControls();
    const wraps = Array.from(document.querySelectorAll('.card-wrap'));
    const ordered = sortTopThenRight(wraps).reverse();
    ordered.forEach(({w,c},i) => { setTimeout(() => { w?.classList.remove('card-ready'); c?.classList.remove('visible'); }, i*120); });
    const total = ordered.length*120 + 400;
    setTimeout(() => { panel?.classList.remove('expanded'); panel?.classList.add('collapsed'); isAnimating=false; }, total);
  }

  // ——— منو/لینک کارت‌ها + افکت ———
  container?.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;

    // پرواز آرام ۱۴ کبوتر در نقطه کلیک
    pigeons.burstAt(e.clientX, e.clientY);

    // منوی اختصاصی کارت
    const menuData = card.getAttribute('data-menu');
    if (menuData){
      let items = [];
      try { items = JSON.parse(menuData); } catch { items = []; }
      if (!items.length) return;
      e.stopPropagation();
      openMenuAt(e, items);
      return;
    }

    // لینک مستقیم کارت
    const url = card.getAttribute('data-url');
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  });

  function buildMenu(items){
    const ul = document.createElement('ul');
    items.forEach(item => {
      const li = document.createElement('li');
      if (item.submenu && Array.isArray(item.submenu) && item.submenu.length){
        const span = document.createElement('span'); span.textContent = item.title;
        span.addEventListener('click', (e) => {
          e.stopPropagation();
          ul.querySelectorAll('li.expanded').forEach(o => { if (o !== li) o.classList.remove('expanded'); });
          li.classList.toggle('expanded');
        });
        li.appendChild(span);
        li.appendChild(buildMenu(item.submenu));
      } else {
        const a = document.createElement('a');
        a.href = item.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = item.title;
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
    menu.addEventListener('pointerdown', ev => ev.stopPropagation());
    document.body.appendChild(menu);
    const r = menu.getBoundingClientRect();
    let left = e.clientX - r.width/2, top = e.clientY;
    if (left < 8) left = 8;
    if (left + r.width > innerWidth - 8) left = innerWidth - r.width - 8;
    if (top + r.height > innerHeight - 8) top = innerHeight - r.height - 8;
    if (top < 8) top = 8;
    menu.style.left = left + 'px';
    menu.style.top  = top  + 'px';
    requestAnimationFrame(() => menu.classList.add('show'));
  }

  function closeMenus(){ document.querySelectorAll('.dropdown-menu').forEach(m => m.remove()); }
  document.addEventListener('pointerdown', (ev) => { if (!ev.target.closest('.dropdown-menu')) closeMenus(); }, true);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeMenus(); });
  window.addEventListener('resize', closeMenus);

  // Tooltip
  const tip = document.createElement('div'); tip.className = 'tooltip-pop'; document.body.appendChild(tip);
  function placeTooltip(el){
    const text = el.getAttribute('data-tooltip'); if (!text) return;
    tip.textContent = text;
    tip.style.left = '-9999px'; tip.style.top = '-9999px';
    tip.classList.add('show');
    const r = el.getBoundingClientRect(), pad = 10, desktop = window.matchMedia('(min-width:651px)').matches;
    const tw = tip.offsetWidth, th = tip.offsetHeight; let tx, ty;
    if (!desktop) { tx = r.left + (r.width - tw)/2; ty = r.top - th - pad; if (ty < 8) ty = r.bottom + pad; }
    else {
      const inLeft = !!el.closest('#desktop-controls-left');
      const preferRight = inLeft || (r.left < innerWidth/2);
      if (preferRight){ tx = r.right + pad; ty = r.top + (r.height - th)/2; if (tx + tw > innerWidth - 8) tx = innerWidth - tw - 8; }
      else { tx = r.left - tw - pad; ty = r.top + (r.height - th)/2; if (tx < 8) tx = 8; }
      if (ty < 8) ty = 8; if (ty + th > innerHeight - 8) ty = innerHeight - th - 8;
    }
    tx = Math.max(8, Math.min(tx, innerWidth - tw - 8));
    tip.style.left = `${tx}px`; tip.style.top = `${ty}px`;
  }
  function hideTooltip(){ tip.classList.remove('show'); }
  function bindTooltips(){
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      el.addEventListener('mouseenter', () => placeTooltip(el));
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('focusin',  () => placeTooltip(el));
      el.addEventListener('focusout', hideTooltip);
      el.addEventListener('touchstart', () => { placeTooltip(el); setTimeout(hideTooltip,1200); }, { passive:true });
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

  // ——— کلاس پرواز آرام کبوترها (آرام، پراکنده، بدون سقوط) ———
  class PigeonGlide {
    constructor(opts = {}) {
      this.urls     = opts.urls     || ['images/decorations/pigeon1.png','images/decorations/pigeon2.png'];
      this.count    = 14;
      this.size     = opts.size     ?? 28;
      this.duration = opts.duration ?? 3000;
      this.rise     = opts.rise     ?? 240;
      this.spreadUp = opts.spreadUp ?? 1.05;
      this.drift    = opts.drift    ?? 150;
      this.wobbleAmp= opts.wobbleAmp?? 10;
      this.wobbleHz = opts.wobbleHz ?? 1.1;
      this.maxTilt  = opts.maxTilt  ?? 16;
    }
    angleForIndex(i){
      const u = (i/(this.count-1) - 0.5) * 2;
      const base = (Math.PI/2) + u * this.spreadUp;
      const jitter = (Math.random()-0.5) * 0.12;
      return base + jitter;
    }
    easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
    burstAt(x, y){
      for (let i=0; i<this.count; i++){
        const img = new Image();
        img.src = this.urls[i % this.urls.length];
        img.alt = '';
        img.style.cssText = `position:fixed;left:0;top:0;width:${this.size}px;height:${this.size}px;pointer-events:none;z-index:9999;will-change:transform,opacity;`;
        document.body.appendChild(img);

        const ang   = this.angleForIndex(i);
        const phase = Math.random()*Math.PI*2;
        const drift = Math.cos(ang) * this.drift * (0.8 + Math.random()*0.4);
        const sx = x - this.size/2, sy = y - this.size/2;
        const dur = this.duration * (0.92 + Math.random()*0.2);
        const delay = i*50 + Math.random()*80;

        setTimeout(() => {
          const start = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - start) / dur);
            const e = this.easeOutCubic(t);
            const up   = -this.rise * e;
            const side = drift * e + Math.sin((t*this.wobbleHz*2*Math.PI)+phase) * this.wobbleAmp * (1 - t);
            const rot  = (this.maxTilt * Math.sin((t*2*Math.PI*0.8)+phase)).toFixed(1);
            img.style.transform = `translate(${sx + side}px, ${sy + up}px) rotate(${rot}deg)`;
            img.style.opacity   = String(1 - t);
            if (t < 1) requestAnimationFrame(step); else img.remove();
          };
          requestAnimationFrame(step);
        }, delay);
      }
    }
    burstAtElement(el){ const b=el.getBoundingClientRect(); this.burstAt(b.left + b.width/2, b.top + b.height/2); }
  }
  const pigeons = new PigeonGlide();
});

/* ساخته شده توسط مهدی باغبانپور بروجنی */
