/* به نام خداوند بخشنده‌ی مهربان */
const trigger = document.getElementById('gateway-trigger');
const panel = document.getElementById('gateway-panel');
let panelOpen = true;

trigger.addEventListener('click', e => {
    e.preventDefault();
    panelOpen = !panelOpen;
    panel.style.display = panelOpen ? 'block' : 'none';
    if (panelOpen) setTimeout(() => panel.scrollIntoView({behavior:'smooth', block:'start'}), 180);
});

function buildMenu(items){
    const ul = document.createElement('ul');
    items.forEach(item=>{
        const li = document.createElement('li');
        if(item.submenu){
            const span = document.createElement('span');
            span.innerHTML = `${item.title} ›`;
            span.addEventListener('click', ev=>{
                ev.stopPropagation();
                li.classList.toggle('expanded');
            });
            li.appendChild(span);
            li.appendChild(buildMenu(item.submenu));
        } else {
            const a = document.createElement('a');
            a.href = item.url;
            a.target = '_blank';
            a.textContent = item.title;
            li.appendChild(a);
        }
        ul.appendChild(li);
    });
    return ul;
}

document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click', ev=>{
        ev.stopPropagation();
        document.querySelectorAll('.dropdown-menu').forEach(m=>m.remove());
        const has = card.getAttribute('data-has-submenu')==='true';
        if(!has){
            const u = card.getAttribute('data-url');
            if(u) window.open(u,'_blank');
            return;
        }
        const data = JSON.parse(card.getAttribute('data-menu')||'[]');
        if(!data.length) return;
        const rect = card.getBoundingClientRect();
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        menu.appendChild(buildMenu(data));
        document.body.appendChild(menu);
        let top = rect.bottom+window.scrollY+5;
        let left = rect.left+rect.width/2-menu.offsetWidth/2+window.scrollX;
        if(left+menu.offsetWidth>window.innerWidth-10) left=window.innerWidth-menu.offsetWidth-8;
        if(left<8) left=8;
        if(top+menu.offsetHeight>window.innerHeight+window.scrollY) top=rect.top+window.scrollY-menu.offsetHeight-8;
        menu.style.top=top+'px'; menu.style.left=left+'px';
    });
});

document.addEventListener('click', ()=>document.querySelectorAll('.dropdown-menu').forEach(m=>m.remove()));

document.addEventListener('DOMContentLoaded', ()=>panel.style.display='block');
/* ساخته شده توسط مهدی باغبانپور بروجنی */
