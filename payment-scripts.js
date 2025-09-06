/* به نام خداوند بخشنده‌ی مهربان */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const initialCause = params.get('cause') ? params.get('cause').replace(/_/g, ' ') : '';

  const pageTitle = document.getElementById('page-title');
  const provinceSelect = document.getElementById('province');
  const citySelect = document.getElementById('city');
  const intentsWrapper = document.getElementById('intents-wrapper');
  const form = document.getElementById('payment-form');
  const grandTotalEl = document.getElementById('grand-total');

  const debounce = (fn, d=300)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),d)}};
  const formatIRR = n => (n||0).toLocaleString('fa-IR') + ' تومان';


  // استان + شهرها (کامل)
  const provinces_cities = {
    "آذربایجان شرقی":["تبریز","مراغه","مرند","میانه","اهر","بناب","سراب","آذرشهر","عجب‌شیر","شبستر","ملکان","هوراند","کلوانق","ترک","آبش احمد","هشترود","زرنق","ترکمانچای","ورزقان","تسوج","زنوز","ایلخچی","شرفخانه","مهربان","مبارک شهر","تیکمه داش","باسمنج","سیه رود","خمارلو","خواجه","قره آغاج","وایقان","ممقان","خامنه","خسروشاه","لیلان","نظرکهریزی","بخشایش","آقکند","جوان قلعه","کلیبر","اسکو","شندآباد","شربیان","گوگان","بستان آباد","جلفا","اچاچی","هریس","یامچی","خاروانا","کوزه کنان","خداجو","کشکسرای","سهند","سیس","دوزدوزان","تیمورلو","صوفیان","سردرود","هادیشهر"],
    "آذربایجان غربی":["ارومیه","خوی","میاندوآب","مهاباد","بوکان","سلماس","پیرانشهر","نقده","تکاب","شاهین‌دژ","سردشت","اشنویه","ماکو","پلدشت","چالدران","قوشچی","شوط","تازه شهر","نالوس","ایواوغلی","گردکشانه","باروق","سیلوانه","بازرگان","نازک علیا","ربط","دیزج دیز","سیمینه","نوشین","مرگنلر","آواجیق","قطور","محمودآباد","سرو","خلیفان","میرآباد","زرآباد","چهاربرج","سیه چشمه","کشاورز","فیرورق","محمدیار","قره ضیاءالدین"],
    "اردبیل":["اردبیل","پارس‌آباد","مشگین‌شهر","خلخال","گرمی","بیله‌سوار","نمین","نیر","کوثر","سرعین","فخراباد","کلور","اسلام‌آباد","تازه کندانگوت","جعفرآباد","اصلاندوز","مرادلو","کوراییم","هیر","گیوی","لاهرود","هشتجین","عنبران","تازه کند","قصابه","رضی","آبی بیگلو"],
    "اصفهان":["اصفهان","کاشان","خمینی‌شهر","نجف‌آباد","شاهین‌شهر","شهرضا","فولادشهر","مبارکه","آران و بیدگل","گلپایگان","خوانسار","سمیرم","فریدن","فریدونشهر","فلاورجان","لنجان","نایین","نطنز","اردستان","برخوار","بوئین و میاندشت","تیران و کرون","چادگان","خور و بیابانک","دهاقان","ابریشم","ابوزیدآباد","اژیه","افوس","انارک","ایمانشهر","بادرود","باغ بهادران","بافران","برفانبار","بهارانشهر","بهارستان","پیربکران","تودشک","تیران","جندق","جوزدان","چرمهین","چمگردان","حبیب‌آباد","حسن‌آباد","حنا","خالدآباد","خوراسگان","خورزوق","داران","دامنه","درچه‌پیاز","دستگرد","دهق","دولت آباد","دیزیچه","رزوه","رضوانشهر","زایندهرود","زرین شهر","زواره","زیار","زیباشهر","سده لنجان","سفیدشهر","سگزی","شاپورآباد","طالخونچه","عسگران","علویجه","فرخی","قهدریجان","کرکوند","کلیشاد و سودرجان","کمشجه","کمه","کهریزسنگ","کوشک","کوهپایه","گز","گلدشت","گلشهر","گلشن","گوگد","محمدآباد","محسن آباد","مشکات","منظریه","مهاباد","میمه","نوش آباد","نصرآباد","نیک‌آباد","ورزنه","ورنامخواست","ونک","هرند","وزوان"],
    "البرز":["کرج","هشتگرد","نظرآباد","محمدشهر","فردیس","کمال‌شهر","ماهدشت","مشکین‌دشت","چهارباغ","ساوجبلاغ","اشتهارد","طالقان"],
    "ایلام":["ایلام","ایوان","دهلران","آبدانان","دره‌شهر","مهران","سرابله","بدره","ملکشاهی","سیروان","شیروان و چرداول"],
    "بوشهر":["بوشهر","برازجان","بندر گناوه","خورموج","جم","کنگان","عسلویه","دیر","دیلم","تنگستان","دشتستان","دشتی"],
    "تهران":["تهران","شهریار","اسلامشهر","قدس","ملارد","صالحیه","پاکدشت","قرچک","ورامین","نسیم‌شهر","آبسرد","آبعلی","ارجمند","اندیشه","باغستان","باقرشهر","بومهن","پردیس","پرند","پیشوا","جوادآباد","چهاردانگه","حسن‌آباد","دماوند","رباط‌کریم","رودهن","شاهدشهر","شریف‌آباد","شمشک","شهر ری","صباشهر","صفادشت","فردوسیه","فشم","فیروزکوه","کهریزک","کیلان","گلستان","لواسان","نصیرشهر","وحیدیه","بهارستان","شمیرانات"],
    "چهارمحال و بختیاری":["شهرکرد","بروجن","فرخ‌شهر","فارسان","لردگان","هفشجان","جونقان","سامان","کیان","آلونی","اردل","باباحیدر","بلداجی","بن","بیرگان","پرندجان","جعفرآباد","چالشتر","چلگرد","چلیچه","دستنا","دشتک","سرخون","سفیددشت","سودجان","سورشجان","شلمزار","طاقانک","فرادنبه","کاج","گندمان","گهرو","گوجان","مالخلیفه","منج","ناغان","نافچ","نقنه","وردنجان","کوهرنگ","کیار"],
    "خراسان جنوبی":["بیرجند","قائن","طبس","فردوس","نهبندان","سربیشه","بشرویه","سرایان","آرین‌شهر","ارسک","اسدیه","اسفدن","اسلامیه","آیسک","حاجی‌آباد","خضری دشت‌بیاض","خوسف","دیهوک","زهان","سه‌قلعه","شوسف","طبس مسینا","عشق‌آباد","قهستان","گزیک","محمدشهر","مود","نیمبلوک","درمیان","زیرکوه"],
    "خراسان رضوی":["مشهد","سبزوار","نیشابور","تربت حیدریه","کاشمر","قوچان","تربت جام","تایباد","چناران","سرخس","فریمان","گناباد","جوین","خلیل‌آباد","خواف","درگز","رشتخوار","کلات","فیروزه","مه‌ولات","بردسکن","بجستان","جغتای","خوشاب","داورزن","زاوه","طرقبه شاندیز","باخرز"],
    "خراسان شمالی":["بجنورد","شیروان","اسفراین","گرمه جاجرم","آشخانه","فاروج"],
    "خوزستان":["اهواز","دزفول","آبادان","خرمشهر","اندیمشک","ایذه","بندر ماهشهر","بهبهان","شوشتر","مسجدسلیمان","رامهرمز","باغ‌ملک","حمیدیه","هویزه","بندر امام خمینی","گتوند","لالی","شادگان","رامشیر","هندیجان","چم گلک","حر","شمس‌آباد","آبژدان","چویبده","مقاومت","ترکالکی","دارخوین","سردشت","کوت سیدنعیم","دهدز","قلعه تل","میانرود","رفیع","الوان","سالند","صالح‌شهر","اروندکنار","سرداران","تشان","جایزان","سوسنگرد","شوش","دشت آزادگان","کارون","امیدیه"],
    "زنجان":["زنجان","ابهر","خرمدره","قیدار","هیدج","صائین‌قلعه","آب‌بر","ماه‌نشان","زرین‌آباد","خدابنده","طارم","ایجرود"],
    "سمنان":["سمنان","شاهرود","دامغان","گرمسار","مهدی‌شهر","ایوانکی","شهمیرزاد","مجن","سرخه","کهن‌آباد","کلاته‌خیج","دیباج","درجزین","رودیان","بسطام","امیریه","میامی","بیارجمند","کلاته","آرادان"],
    "سیستان و بلوچستان":["زاهدان","زابل","ایرانشهر","چابهار","سراوان","خاش","کنارک","جالق","نیک‌شهر","محمدی","شهرک علی‌اکبر","بنجار","گلمورتی","نگور","راسک","زهک","سرباز","دلگان","سیب و سوران","هیرمند","فنوج","نهبندان","بمپور","مهرستان","قصرقند","هامون","میرجاوه","پیشین","کوهستان"],
    "فارس":["شیراز","کازرون","جهرم","مرودشت","فسا","داراب","لار","آباده","نورآباد","نی‌ریز","ارد","اردکان","ارسنجان","استهبان","اسیر","اشکنان","افزر","اقلید","اهل","اوز","ایج","ایزدخواست","باب انار","بالاده","بنارویه","بهمن","بیرم","بیضا","جنت‌شهر","جویم","حاجی‌آباد","خانمین","خاوران","خرامه","خشت","خنج","خور","خومه‌زار","داریان","دوزه","دهرم","رامجرد","رونیز","زاهدشهر","زرقان","سده","سروستان","سعادت‌شهر","سورمق","سوریان","سیدان","ششده","شهرپیر","صغاد","صفاشهر","علامرودشت","فراشبند","فیروزآباد","قائمیه","قادرآباد","قطب‌آباد","قیر","کارزین","کامفیروز","کرهای","کنارتخته","کوار","گراش","گله‌دار","لامرد","لپوئی","لطیفی","مشکان","مصیری","مهر","میمند","نوجین","نودان","وراوی","هماشهر","سلطان‌شهر","بوانات","پاسارگاد","خرمبید","رستم","زریندشت","سپیدان","ممسنی"],
    "قزوین":["قزوین","تاکستان","الوند","اقبالیه","محمدیه","آبیک","بوئین‌زهرا"],
    "قم":["قم","قنوات","جعفریه","کهک","سلفچگان","دستجرد"],
    "کردستان":["سنندج","سقز","مریوان","بانه","کامیاران","قروه","دیواندره","بیجار","دهگلان"],
    "کرمان":["کرمان","سیرجان","رفسنجان","جیرفت","بم","زرند","کهنوج","شهربابک","بافت","راور","کوهبنان","فهرج","قلعه‌گنج","عنبرآباد","فاریاب","ریگان","رودبار جنوب","مردهک"],
    "کرمانشاه":["کرمانشاه","اسلام‌آباد غرب","هرسین","کنگاور","جوانرود","سنقر","پاوه","صحنه","گیلانغرب","قصر شیرین","روانسر","ثلاث باباجانی"],
    "کهگیلویه و بویراحمد":["یاسوج","دوگنبدان","دهدشت","لیکک","چرام","لنده","باشت"],
    "گلستان":["گرگان","گنبد کاووس","علی‌آباد کتول","بندر ترکمن","آق‌قلا","کردکوی","بندر گز","مینودشت","کلاله","مراوه‌تپه","رامیان","آزادشهر","فاضل‌آباد","گالیکش","سیمین‌شهر"],
    "گیلان":["رشت","بندر انزلی","لاهیجان","لنگرود","آستارا","تالش","صومعه‌سرا","رودسر","فومن","ماسال","رودبار","شفت","سیاهکل","املش","هشتپر","رحیم‌آباد","کوچصفهان","لیسار","احمدسرگوراب","منجیل","خمام","خشکبیجار","چابکسر","بندر کیاشهر","حویق","کلاچای","جیرنده","کیاشهر"],
    "لرستان":["خرم‌آباد","بروجرد","دورود","کوهدشت","الیگودرز","نورآباد","ازنا","پلدختر","الشتر","سپیددشت","معمولان","چقابل","سراب دوره","ویسیان","فیروزآباد"],
    "مازندران":["ساری","بابل","آمل","قائم‌شهر","بهشهر","چالوس","نکا","بابلسر","نوشهر","تنکابن","رامسر","گلوگاه","میاندورود","کیاسر","سوادکوه","جویبار","محمودآباد","فریدونکنار","عباس‌آباد","کلاردشت","پل‌سفید","رویان","سلمان‌شهر","مرزن‌آباد","کجور","بلده","زیرآب","گزنک","خرم‌آباد","پایین هولار","گتاب","سرخرود","کوهی‌خیل","بهنمیر","امیرکلا","سورک"],
    "مرکزی":["اراک","ساوه","خمین","محلات","دلیجان","تفرش","آشتیان","شازند"],
    "هرمزگان":["بندرعباس","میناب","دهبارز","بندر لنگه","کیش","قشم","حاجی‌آباد","رودان","پارسیان","بستک","جاسک","سیریک","خمیر"],
    "همدان":["همدان","ملایر","نهاوند","تویسرکان","اسدآباد","کبودرآهنگ","بهار","رزن","لالجین","فامنین","صالح‌آباد"],
    "یزد":["یزد","میبد","اردکان","بافق","مهریز","ابرکوه","تفت","زارچ","اشکذر","شاهدیه","مروست","خضرآباد","حمیدیا","ندوشن","هرات"]
  }; //

  Object.keys(provinces_cities).forEach(p=>{
    const o=document.createElement('option');o.value=p;o.textContent=p;provinceSelect.appendChild(o);
  });
  provinceSelect.addEventListener('change', ()=>{
    const p=provinceSelect.value;
    citySelect.disabled=!p;
    citySelect.innerHTML=p?'<option value="">شهر را انتخاب کنید</option>':'<option value="">ابتدا استان را انتخاب کنید</option>';
    if(p){ provinces_cities[p].forEach(c=>{ const o=document.createElement('option');o.value=c;o.textContent=c;citySelect.appendChild(o); }); }
  });

  // درخت نیت‌ها
  const intentsTree = [
    { title:"قلک بیمه" },
    { title:"نذر درمانی", submenu:[
      { title:"تجهیزات", submenu:[
        { title:"همودیالیز" },{ title:"فیکو ویترکتومی" },{ title:"اکوکاردیگرافی" },
        { title:"سونوگرافی" },{ title:"اکوسونوگرافی" },{ title:"ماموگرافی" },
        { title:"اتوآنالیزر بیوشیمی" },{ title:"سل کانتر" },{ title:"بلادگاز" }
      ]},
      { title:"دارو" }
    ]},
    { title:"نذر سازندگی", submenu:[
      { title:"ساخت مراکز درمانی" },{ title:"ساخت مراکز بیمه‌ای" },{ title:"ساخت همراه‌سرا" }
    ]},
    { title:"نذر نان" },
    { title:"مواکب شهدای بسیج" },
    { title:"نذر قربانی" },
    { title:"کمک معیشتی و نذر مؤمنانه" },
    { title:"وجوهات شرعی", submenu:[
      { title:"خمس", submenu:[{title:"عام"},{title:"سادات"}] },
      { title:"کفاره", submenu:[{title:"عام"},{title:"سادات"}] },
      { title:"فطریه", submenu:[{title:"عام"},{title:"سادات"}] },
      { title:"خیرات اموات" },{ title:"ثلث مال" },{ title:"رد مظالم" },{ title:"صدقه" }
    ]},
    { title:"کمک به جبهه مقاومت" },
    { title:"نذر عام" }
  ];

  function createIntentRow(defaultIntent=''){
    const row=document.createElement('div'); row.className='intent-row';

    // دکمه افزودن (راست سطر)
    const addBtn=document.createElement('button');
    addBtn.type='button'; addBtn.className='icon-btn add-intent';
    addBtn.innerHTML='<img src="images/logo/add.png" alt=""/>';
    addBtn.addEventListener('click', ()=>{ intentsWrapper.appendChild(createIntentRow()); updateRemoveState(); });

    // کادر انتخاب نیت
    const intentBox=document.createElement('div'); intentBox.className='intent-select';
    const trigger=document.createElement('button'); trigger.type='button'; trigger.className='intent-trigger'; trigger.textContent= defaultIntent || 'نیت را انتخاب کنید';
    const panel=document.createElement('div'); panel.className='intent-panel';
    buildIntentMenu(intentsTree, panel, (picked)=>{ trigger.textContent=picked; panel.classList.remove('open'); refreshTotalsAndTitles(); });
    trigger.addEventListener('click',(e)=>{ e.stopPropagation(); document.querySelectorAll('.intent-panel.open').forEach(p=>p.classList.remove('open')); panel.classList.toggle('open'); });
    document.addEventListener('click', ()=>panel.classList.remove('open'));
    intentBox.append(trigger,panel);

    // مبلغ پیش‌فرض
    const amountSel=document.createElement('select');
    amountSel.className='amount-select';
    amountSel.innerHTML=`
      <option value="">مبلغ را انتخاب کنید</option>
      <option value="50000">۵۰,۰۰۰ تومان</option>
      <option value="100000">۱۰۰,۰۰۰ تومان</option>
      <option value="200000">۲۰۰,۰۰۰ تومان</option>
      <option value="500000">۵۰۰,۰۰۰ تومان</option>
      <option value="custom">مبلغ دلخواه</option>
    `;

    // مبلغ دلخواه
    const custom=document.createElement('input');
    custom.type='text'; custom.inputMode='numeric'; custom.className='custom-amount'; custom.placeholder='مبلغ دلخواه (تومان)';

    amountSel.addEventListener('change', ()=>{
      if(amountSel.value==='custom'){ custom.classList.add('show'); custom.focus(); }
      else { custom.classList.remove('show'); custom.value=''; }
      refreshTotalsAndTitles();
    });
    custom.addEventListener('input', debounce(()=>{
      const digits=custom.value.replace(/[^\d۰-۹]/g,'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
      custom.value=digits.replace(/\B(?=(\d{3})+(?!\d))/g,',');
      refreshTotalsAndTitles();
    },300));

    // دکمه حذف (چپ سطر)
    const removeBtn=document.createElement('button');
    removeBtn.type='button'; removeBtn.className='icon-btn remove-intent';
    removeBtn.innerHTML='<img src="images/logo/remove.png" alt=""/>';
    removeBtn.addEventListener('click', ()=>{ if(removeBtn.hasAttribute('disabled')) return; row.remove(); updateRemoveState(); refreshTotalsAndTitles(); });

    row.append(addBtn,intentBox,amountSel,custom,removeBtn);
    return row;
  }

  function buildIntentMenu(tree, container, onPick){
    const ul=document.createElement('ul');
    tree.forEach(node=>{
      const li=document.createElement('li');
      const btn=document.createElement('button');
      btn.type='button'; btn.className='menu-item'; btn.textContent=node.title;
      if(node.submenu){
        li.classList.add('has-sub');
        const sub=buildIntentMenu(node.submenu, document.createElement('div'), onPick);
        btn.addEventListener('click',(e)=>{ e.stopPropagation(); li.classList.toggle('open'); });
        li.append(btn,sub);
      }else{
        btn.addEventListener('click',(e)=>{ e.stopPropagation(); onPick(node.title); });
        li.append(btn);
      }
      ul.appendChild(li);
    });
    container.appendChild(ul);
    container.classList.add('menu-container');
    return container;
  }

  // شروع
  intentsWrapper.appendChild(createIntentRow(initialCause || '')); updateRemoveState(); refreshTotalsAndTitles();

  function updateRemoveState(){
    const rows=[...intentsWrapper.querySelectorAll('.intent-row')];
    rows.forEach(r=>{
      const rm=r.querySelector('.remove-intent');
      if(rows.length<=1) rm.setAttribute('disabled',''); else rm.removeAttribute('disabled');
    });
  }

  function uniqueInOrder(arr){ const seen=new Set(), out=[]; arr.forEach(v=>{ if(v && v!=='نیت را انتخاب کنید' && !seen.has(v)){ seen.add(v); out.push(v); }}); return out; }
  const listFa = new Intl.ListFormat('fa', { type:'conjunction', style:'long' });

  function parseAmount(sel,custom){
    if(sel.value && sel.value!=='custom') return parseInt(sel.value)||0;
    if(sel.value==='custom' && custom.value) return parseInt(custom.value.replace(/[,\s]/g,''))||0;
    return 0;
  }

  function refreshTotalsAndTitles(){
    let sum=0;
    const rows=[...intentsWrapper.querySelectorAll('.intent-row')];
    const intents=uniqueInOrder(rows.map(r=>r.querySelector('.intent-trigger')?.textContent || ''));
    rows.forEach(r=>{ sum+=parseAmount(r.querySelector('.amount-select'), r.querySelector('.custom-amount')); });
    grandTotalEl.textContent = formatIRR(sum);

    if(intents.length===0) pageTitle.textContent='برای انجام ثبت خیرت، اطلاعات را تکمیل کن';
    else if(intents.length===1) pageTitle.textContent = `ثبت نیت خیر: ${intents[0]}`;
    else pageTitle.textContent = `ثبت همزمان ${intents.length} نیت ارزشمند: ${listFa.format(intents)}`;
  }

  // افکت کبوترها
  function pigeons(x,y){
    const urls=['images/decorations/pigeon1.png','images/decorations/pigeon2.png'];
    const count = 10 + Math.floor(Math.random()*5);
    for(let i=0;i<count;i++){
      const img=document.createElement('img');
      const size= 18 + Math.random()*22;
      Object.assign(img,{src:urls[i%urls.length],alt:'pigeon'});
      Object.assign(img.style,{position:'fixed',left:(x-10)+'px',top:(y-10)+'px',width:size+'px',height:size+'px',pointerEvents:'none',zIndex:'9999',opacity:'0.96'});
      document.body.appendChild(img);
      const dx=(Math.random()*140+100)*(Math.random()<0.5?-1:1),dy=-(Math.random()*180+120),rot=(Math.random()*40-20);
      img.animate([{transform:'translate(0,0) rotate(0deg)',opacity:.96},{transform:`translate(${dx*.55}px,${dy*.55}px) rotate(${rot/2}deg)`,opacity:.9},{transform:`translate(${dx}px,${dy}px) rotate(${rot}deg)`,opacity:0}],{duration:2200+Math.random()*700,easing:'ease-out',fill:'forwards'});
      setTimeout(()=>img.remove(),3000);
    }
  }

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const fullname=document.getElementById('fullname'), mobile=document.getElementById('mobile');
    const err=(el,msg)=>{const s=el.closest('.input-group').querySelector('.error'); s.textContent=msg||'';}
    let ok=true;
    if(fullname.value.trim().length<3){err(fullname,'نام کامل را وارد کنید');ok=false;}
    if(!/^0?9\d{9}$/.test(mobile.value.replace(/\D/g,''))){err(mobile,'شماره موبایل صحیح نیست');ok=false;}
    if(!provinceSelect.value){err(provinceSelect,'استان را انتخاب کنید');ok=false;}
    if(!citySelect.value){err(citySelect,'شهر را انتخاب کنید');ok=false;}

    const rows=[...intentsWrapper.querySelectorAll('.intent-row')];
    const intents=uniqueInOrder(rows.map(r=>r.querySelector('.intent-trigger')?.textContent || ''));
    let valid=false;
    rows.forEach(r=>{
      const amount=parseAmount(r.querySelector('.amount-select'), r.querySelector('.custom-amount'));
      if((r.querySelector('.intent-trigger').textContent!=='نیت را انتخاب کنید') && amount>=1000) valid=true;
    });
    if(!valid){ alert('لطفاً حداقل یک نیت خیر با مبلغ معتبر ثبت شود.'); return; }

    const btn=e.submitter||document.getElementById('pay-btn');
    const b=btn.getBoundingClientRect(); pigeons(b.left+b.width/2, b.top+b.height/2);

    const name=fullname.value.trim();
    const joined = intents.length ? listFa.format(intents) : 'نیت خیر';
    document.getElementById('thank-message').textContent =
      intents.length<=1
        ? `${name} عزیز، از انتخاب نیت «${joined}» صمیمانه سپاسگزاریم؛ امید که به قبولی و برکت ختم شود.`
        : `${name} نیک‌اندیش، از ثبت همزمان ${intents.length} نیت خیر (${joined}) سپاسگزاریم؛ ان‌شاءالله مأجور باشید.`;
    document.getElementById('thank-modal').classList.add('show');
  });

  document.getElementById('redirect-btn').addEventListener('click', ()=>{ location.href='cards-form.html'; });
});
/* ساخته شده توسط مهدی باغبانپور بروجنی */
