document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const headerTrigger = document.getElementById('gateway-trigger');
  const cards = Array.from(document.querySelectorAll('.card'));
  const wraps = Array.from(document.querySelectorAll('.card-wrap'));
  const viewButtons = document.querySelectorAll('.view-switcher button');
  const modeButtons = document.querySelectorAll('.day-night-switcher button');

  // حالت‌های ذخیره‌شده
  setView(localStorage.getItem('cardViewMode') || 'small');
  setMode(localStorage.getItem('dayNightMode') || 'day');

  function setView(view){
    const c = document.querySelector('.cards-container');
    c.classList.remove('view-small','view-big');
    c.classList.add(view === 'big' ? 'view-big' : 'view-small');
    viewButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
    localStorage.setItem('cardViewMode', view);
  }

  function setMode(mode){
    body.classList.toggle('night-mode', mode === 'night');
    modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    localStorage.setItem('dayNightMode', mode);
  }

  viewButtons.forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  modeButtons.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

  // نمایش ترتیبی کارت‌ها: کارت -> آماده شدن نرگس همان کارت
  function revealSequentially(){
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        setTimeout(() => wraps[i].classList.add('card-ready'), 260);
      }, i * 150);
    });
  }
  revealSequentially();

  // Hover/Press کارت
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => card.classList.add('hovered'));
    card.addEventListener('mouseleave', () => { card.classList.remove('hovered'); card.classList.remove('pressed'); });
    card.addEventListener('mousedown', () => card.classList.add('pressed'));
    card.addEventListener('mouseup', () => card.classList.remove('pressed'));
  });

  // ساخت منو آکاردئونی
  function buildMenu(items){
    const ul=document.createElement('ul');
    items.forEach(item=>{
      const li=document.createElement('li');
      if(item.submenu && Array.isArray(item.submenu) && item.submenu.length){
        const span=document.createElement('span');
        span.textContent=item.title;
        span.addEventListener('click', e=>{
          e.stopPropagation();
          ul.querySelectorAll('li.expanded').forEach(other=>{ if(other!==li) other.classList.remove('expanded'); });
          li.classList.toggle('expanded');
        });
        li.appendChild(span);
        li.appendChild(buildMenu(item.submenu));
      }else{
        const a=document.createElement('a');
        a.href=item.url || '#'; a.target='_blank'; a.rel='noopener noreferrer'; a.textContent=item.title;
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
    return ul;
  }

  // بازکردن منو در محل کلیک
  function openMenuAt(e, items){
    document.querySelectorAll('.dropdown-menu').forEach(m=>m.remove());
    const menu=document.createElement('div');
    menu.className='dropdown-menu';
    menu.appendChild(buildMenu(items));
    document.body.appendChild(menu);

    let left=e.clientX - menu.offsetWidth/2, top=e.clientY;
    const r=menu.getBoundingClientRect();
    if(left<8) left=8;
    if(left+r.width>innerWidth-8) left=innerWidth-r.width-8;
    if(top+r.height>innerHeight-8) top=innerHeight-r.height-8;
    if(top<8) top=8;
    menu.style.left=left+'px';
    menu.style.top =top +'px';
    setTimeout(()=>menu.classList.add('show'),10);
  }

  // کبوترهای آرام
  function spawnPigeonsAt(x, y){
    const urls=['images/decorations/pigeon1.png','images/decorations/pigeon2.png'];
    for(let i=0;i<3;i++){
      const img=document.createElement('img');
      Object.assign(img,{src:urls[i%urls.length],alt:'pigeon'});
      Object.assign(img.style,{position:'fixed',left:(x-10)+'px',top:(y-10)+'px',width:'20px',height:'20px',pointerEvents:'none',zIndex:'9000',opacity:'0.95'});
      document.body.appendChild(img);
      const dx=(Math.random()*60+40)*(Math.random()<0.5?-1:1), dy=-(Math.random()*70+60), rot=(Math.random()*24-12);
      img.animate([
        {transform:'translate(0,0) rotate(0deg)',opacity:0.95},
        {transform:`translate(${dx*0.6}px,${dy*0.6}px) rotate(${rot/2}deg)`,opacity:0.9},
        {transform:`translate(${dx}px,${dy}px) rotate(${rot}deg)`,opacity:0}
      ],{duration:900+Math.random()*200,easing:'ease-out',fill:'forwards'});
      setTimeout(()=>img.remove(),1300);
    }
  }

  // کلیک روی کارت
  cards.forEach(card=>{
    card.addEventListener('click', e=>{
      e.stopPropagation();
      card.classList.add('flash');
      setTimeout(()=>card.classList.remove('flash'),360);
      spawnPigeonsAt(e.clientX, e.clientY);

      const data=card.getAttribute('data-menu');
      if(!data){
        const url=card.getAttribute('data-url');
        if(url) window.open(url,'_blank','noopener,noreferrer');
        return;
      }
      let items=[]; try{items=JSON.parse(data);}catch{items=[];}
      if(!items.length) return;
      openMenuAt(e, items);
    });
  });

  // بستن منو با کلیک بیرون
  document.addEventListener('click', ()=>document.querySelectorAll('.dropdown-menu').forEach(m=>m.remove()));

  // جمع‌شدن معکوس: 10 -> 1
  let expanded=true;
  headerTrigger.addEventListener('click', e=>{
    e.preventDefault();
    expanded=!expanded;
    if(!expanded){
      const reversed=[...wraps].reverse();
      // 1) محو نرگس
      reversed.forEach((w,i)=>{ setTimeout(()=>{ w.classList.remove('card-ready'); }, i*140); });
      // 2) اسلاید کارت
      reversed.forEach((w,i)=>{
        const c=w.querySelector('.card');
        setTimeout(()=>{
          c.style.transform='translateY(-60px)';
          c.style.opacity='0';
          c.style.pointerEvents='none';
        }, reversed.length*140 + i*100);
      });
    }else{
      revealSequentially();
    }
  });
});
