/* به نام خداوند بخشنده مهربان */
document.addEventListener('DOMContentLoaded', () => {
  // عناصر
  const params = new URLSearchParams(location.search);
  const initialCause = params.get('cause') ? params.get('cause').replace(/_/g, ' ') : '';
  const pageTitle   = document.getElementById('page-title');
  const provinceSel = document.getElementById('province');
  const citySel     = document.getElementById('city');
  const intentsWrap = document.getElementById('intents-wrapper');
  const form        = document.getElementById('payment-form');
  const grandTotal  = document.getElementById('grand-total');
  const payBtn      = document.getElementById('pay-btn');
  const bouquet     = document.getElementById('bouquet');
  const totalLine   = document.querySelector('.total-line');
  const summary     = document.querySelector('.summary');
  const payActions  = document.querySelector('.pay-actions');

  // ابزار
  const debounce = (fn, d=300)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),d)}};
  const faNF = new Intl.NumberFormat('fa-IR'); // نمایش اعداد فارسی [5]
  const listFa = new Intl.ListFormat('fa',{type:'conjunction',style:'long'});
  const toEnDigits = s => (s||'').replace(/[٠-٩۰-۹]/g, ch => String(ch.charCodeAt(0) & 15));
  const toFaDigits = s => (s||'').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);


  // ——— استان/شهر (از JSON داده‌شده، بدون لایه provinces) ———
  const PROVINCES_CITIES = {
    "آذربایجان شرقی":["تبریز","مراغه","مرند","میانه","اهر","بناب","سراب","آذرشهر","عجب‌شیر","شبستر","ملکان","هوراند","کلوانق","ترک","آبش احمد","هشترود","زرنق","ترکمانچای","ورزقان","تسوج","زنوز","ایلخچی","شرفخانه","مهربان","مبارک شهر","تیکمه داش","باسمنج","سیه رود","خمارلو","خواجه","قره آغاج","وایقان","ممقان","خامنه","خسروشاه","لیلان","نظرکهریزی","بخشایش","آقکند","جوان قلعه","کلیبر","اسکو","شندآباد","شربیان","گوگان","بستان آباد","جلفا","اچاچی","هریس","یامچی","خاروانا","کوزه کنان","خداجو","کشکسرای","سهند","سیس","دوزدوزان","تیمورلو","صوفیان","سردرود","هادیشهر"],
    "آذربایجان غربی":["ارومیه","خوی","میاندوآب","مهاباد","بوکان","سلماس","پیرانشهر","نقده","تکاب","شاهین‌دژ","سردشت","اشنویه","ماکو","پلدشت","چالدران","قوشچی","شوط","تازه شهر","نالوس","ایواوغلی","گردکشانه","باروق","سیلوانه","بازرگان","نازک علیا","ربط","دیزج دیز","سیمینه","نوشین","مرگنلر","آواجیق","قطور","محمودآباد","سرو","خلیفان","میرآباد","زرآباد","چهاربرج","سیه چشمه","کشاورز","فیرورق","محمدیار","قره ضیاءالدین"],
    "اردبیل":["اردبیل","پارس‌آباد","مشگین‌شهر","خلخال","گرمی","بیله‌سوار","نمین","نیر","کوثر","سرعین","فخراباد","کلور","اسلام‌آباد","تازه کندانگوت","جعفرآباد","اصلاندوز","مرادلو","کوراییم","هیر","گیوی","لاهرود","هشتجین","عنبران","تازه کند","قصابه","رضی","آبی بیگلو"],
    "اصفهان":["اصفهان","کاشان","خمینی‌شهر","نجف‌آباد","شاهین‌شهر","شهرضا","فولادشهر","مبارکه","آران و بیدگل","گلپایگان","خوانسار","سمیرم","فریدن","فریدونشهر","فلاورجان","لنجان","نایین","نطنز","اردستان","برخوار","بوئین و میاندشت","تیران و کرون","چادگان","خور و بیابانک","دهاقان","ابریشم","ابوزیدآباد","اژیه","افوس","انارک","ایمانشهر","بادرود","باغ بهادران","بافران","برفانبار","بهارانشهر","بهارستان","پیربکران","تودشک","تیران","جندق","جوزدان","چرمهین","چمگردان","حبیبآباد","حسنآباد","حنا","خالدآباد","خوراسگان","خورزوق","داران","دامنه","درچهپیاز","دستگرد","دهق","دولت آباد","دیزیچه","رزوه","رضوانشهر","زایندهرود","زرین شهر","زواره","زیار","زیباشهر","سده لنجان","سفیدشهر","سگزی","شاپورآباد","طالخونچه","عسگران","علویجه","فرخی","قهدریجان","کرکوند","کلیشاد و سودرجان","کمشجه","کمه","کهریزسنگ","کوشک","کوهپایه","گز","گلدشت","گلشهر","گلشن","گوگد","محمدآباد","محسن آباد","مشکات","منظریه","مهاباد","میمه","نوش آباد","نصرآباد","نیک‌آباد","ورزنه","ورنامخواست","ونک","هرند","وزوان"],
    "البرز":["کرج","هشتگرد","نظرآباد","محمدشهر","فردیس","کمال‌شهر","ماهدشت","مشکین‌دشت","چهارباغ","ساوجبلاغ","اشتهارد","طالقان"],
    "ایلام":["ایلام","ایوان","دهلران","آبدانان","دره‌شهر","مهران","سرابله","بدره","ملکشاهی","سیروان","شیروان و چرداول"],
    "بوشهر":["بوشهر","برازجان","بندر گناوه","خورموج","جم","کنگان","عسلویه","دیر","دیلم","تنگستان","دشتستان","دشتی"],
    "تهران":["تهران","شهریار","اسلامشهر","قدس","ملارد","صالحیه","پاکدشت","قرچک","ورامین","نسیم‌شهر","آبسرد","آبعلی","ارجمند","اندیشه","باغستان","باقرشهر","بومهن","پردیس","پرند","پیشوا","جوادآباد","چهاردانگه","حسن‌آباد","دماوند","رباطکریم","رودهن","شاهدشهر","شریف‌آباد","شمشک","شهر ری","صباشهر","صفادشت","فردوسیه","فشم","فیروزکوه","کهریزک","کیلان","گلستان","لواسان","نصیرشهر","وحیدیه","بهارستان","شمیرانات"],
    "چهارمحال و بختیاری":["شهرکرد","بروجن","فرخ‌شهر","فارسان","لردگان","هفشجان","جونقان","سامان","کیان","آلونی","اردل","باباحیدر","بلداجی","بن","بیرگان","پرندجان","جعفرآباد","چالشتر","چلگرد","چلیچه","دستنا","دشتک","سرخون","سفیددشت","سودجان","سورشجان","شلمزار","طاقانک","فرادنبه","کاج","گندمان","گهرو","گوجان","مالخلیفه","منج","ناغان","نافچ","نقنه","وردنجان","کوهرنگ","کیار"],
    "خراسان جنوبی":["بیرجند","قائن","طبس","فردوس","نهبندان","سربیشه","بشرویه","سرایان","آرینشهر","ارسک","اسدیه","اسفدن","اسلامیه","آیسک","حاجی‌آباد","خضری دشت بیاض","خوسف","دیهوک","زهان","سهقلعه","شوسف","طبس مسینا","عشق‌آباد","قهستان","گزیک","محمدشهر","مود","نیمبلوک","درمیان","زیرکوه"],
    "خراسان رضوی":["مشهد","سبزوار","نیشابور","تربت حیدریه","کاشمر","قوچان","تربت جام","تایباد","چناران","سرخس","فریمان","گناباد","جوین","خلیل‌آباد","خواف","درگز","رشتخوار","کلات","فیروزه","مهولات","بردسکن","بجستان","جغتای","خوشاب","داورزن","زاوه","طرقبه شاندیز","باخرز"],
    "خراسان شمالی":["بجنورد","شیروان","اسفراین","گرمه جاجرم","آشخانه","فاروج"],
    "خوزستان":["اهواز","دزفول","آبادان","خرمشهر","اندیمشک","ایذه","بندر ماهشهر","بهبهان","شوشتر","مسجدسلیمان","رامهرمز","باغ‌ملک","حمیدیه","هویزه","بندر امام خمینی","گتوند","لالی","شادگان","رامشیر","هندیجان","چم گلک","حر","شمس آباد","آبژدان","چویبده","مقاومت","ترکالکی","دارخوین","سردشت","کوت سیدنعیم","دهدز","قلعه تل","میانرود","رفیع","الوان","سالند","صالح شهر","اروندکنار","سرداران","تشان","جایزان","سوسنگرد","شوش","دشت آزادگان","کارون","امیدیه"],
    "زنجان":["زنجان","ابهر","خرمدره","قیدار","هیدج","صائین‌قلعه","آب‌بر","ماه نشان","زرین آباد","خدابنده","طارم","ایجرود"],
    "سمنان":["سمنان","شاهرود","دامغان","گرمسار","مهدی‌شهر","ایوانکی","شهمیرزاد","مجن","سرخه","کهن آباد","کلاته خیج","دیباج","درجزین","رودیان","بسطام","امیریه","میامی","بیارجمند","کلاته","آرادان"],
    "سیستان و بلوچستان":["زاهدان","زابل","ایرانشهر","چابهار","سراوان","خاش","کنارک","جالق","نیک‌شهر","محمدی","شهرک علی اکبر","بنجار","گلمورتی","نگور","راسک","زهک","سرباز","دلگان","سیب و سوران","هیرمند","فنوج","نهبندان","بمپور","مهرستان","قصرقند","هامون","میرجاوه","پیشین","کوهستان"],
    "فارس":["شیراز","کازرون","جهرم","مرودشت","فسا","داراب","لار","آباده","نورآباد","نی‌ریز","ارد","اردکان","ارسنجان","استهبان","اسیر","اشکنان","افزر","اقلید","اهل","اوز","ایج","ایزدخواست","باب انار","بالاده","بنارویه","بهمن","بیرم","بیضا","جنت‌شهر","جویم","حاجی‌آباد","خانمین","خاوران","خرامه","خشت","خنج","خور","خومه‌زار","داریان","دوزه","دهرم","رامجرد","رونیز","زاهدشهر","زرقان","سده","سروستان","سعادت‌شهر","سورمق","سوریان","سیدان","ششده","شهرپیر","صغاد","صفاشهر","علامرودشت","فراشبند","فیروزآباد","قائمیه","قادرآباد","قطب‌آباد","قیر","کارزین","کامفیروز","کرهای","کنارتخته","کوار","گراش","گله‌دار","لامرد","لپوئی","لطیفی","مشکان","مصیری","مهر","میمند","نوجین","نودان","وراوی","هماشهر","سلطان‌شهر","بوانات","پاسارگاد","خرمبید","رستم","زریندشت","سپیدان","ممسنی"],
    "قزوین":["قزوین","تاکستان","الوند","اقبالیه","محمدیه","آبیک","بوئین‌زهرا"],
    "قم":["قم","قنوات","جعفریه","کهک","سلفچگان","دستجرد"],
    "کردستان":["سنندج","سقز","مریوان","بانه","کامیاران","قروه","دیواندره","بیجار","دهگلان"],
    "کرمان":["کرمان","سیرجان","رفسنجان","جیرفت","بم","زرند","کهنوج","شهربابک","بافت","راور","کوهبنان","فهرج","قلعه گنج","عنبرآباد","فاریاب","ریگان","رودبار جنوب","مردهک"],
    "کرمانشاه":["کرمانشاه","اسلام‌آباد غرب","هرسین","کنگاور","جوانرود","سنقر","پاوه","صحنه","گیلانغرب","قصر شیرین","روانسر","ثلاث باباجانی"],
    "کهگیلویه و بویراحمد":["یاسوج","دوگنبدان","دهدشت","لیکک","چرام","لنده","باشت"],
    "گلستان":["گرگان","گنبد کاووس","علی‌آباد کتول","بندر ترکمن","آق‌قلا","کردکوی","بندر گز","مینودشت","کلاله","مراوه تپه","رامیان","آزادشهر","فاضل آباد","گالیکش","سیمین شهر"],
    "گیلان":["رشت","بندر انزلی","لاهیجان","لنگرود","آستارا","تالش","صومعه‌سرا","رودسر","فومن","ماسال","رودبار","شفت","سیاهکل","املش","هشتپر","رحیم آباد","کوچصفهان","لیسار","احمدسرگوراب","منجیل","خمام","خشکبیجار","چابکسر","بندر کیاشهر","حویق","کلاچای","جیرنده","کیاشهر"],
    "لرستان":["خرم‌آباد","بروجرد","دورود","کوهدشت","الیگودرز","نورآباد","ازنا","پلدختر","الشتر","سپیددشت","معمولان","چقابل","سراب دوره","ویسیان","فیروزآباد"],
    "مازندران":["ساری","بابل","آمل","قائم‌شهر","بهشهر","چالوس","نکا","بابلسر","نوشهر","تنکابن","رامسر","گلوگاه","میاندورود","کیاسر","سوادکوه","جویبار","محمودآباد","فریدونکنار","عباس آباد","کلاردشت","پل سفید","رویان","سلمان شهر","مرزن آباد","کجور","بلده","زیرآب","گزنک","خرم آباد","پایین هولار","گتاب","سرخرود","کوهی خیل","بهنمیر","امیرکلا","سورک"],
    "مرکزی":["اراک","ساوه","خمین","محلات","دلیجان","تفرش","آشتیان","شازند"],
    "هرمزگان":["بندرعباس","میناب","دهبارز","بندر لنگه","کیش","قشم","حاجی‌آباد","رودان","پارسیان","بستک","جاسک","سیریک","خمیر"],
    "همدان":["همدان","ملایر","نهاوند","تویسرکان","اسدآباد","کبودرآهنگ","بهار","رزن","لالجین","فامنین","صالح آباد"],
    "یزد":["یزد","میبد","اردکان","بافق","مهریز","ابرکوه","تفت","زارچ","اشکذر","شاهدیه","مروست","خضرآباد","حمیدیا","ندوشن","هرات"]
  };

  // ——— نیت‌های خیر (title/menu/submenu) ———
  const NIAT_CARDS = [
    {"title":"قلک بیمه"},
    {"title":"نذر درمانی","menu":[
      {"title":"تجهیزات","submenu":[
        {"title":"همودیالیز"},{"title":"فیکو ویترکتومی"},{"title":"اکوکاردیگرافی"},
        {"title":"سونوگرافی"},{"title":"اکوسونوگرافی"},{"title":"ماموگرافی"},
        {"title":"اتوآنالیزر بیوشیمی"},{"title":"سل کانتر"},{"title":"بلادگاز"},
        {"title":"لنزهای چشم"},{"title":"پروتزهای مفصل"},{"title":"پروتزهای ستون فقرات"}
      ]},
      {"title":"دارو"}
    ]},
    {"title":"نذر سازندگی","menu":[
      {"title":"ساخت مراکز درمانی"},{"title":"ساخت مراکز بیمه‌ای"},{"title":"ساخت همراه‌سرا"}
    ]},
    {"title":"نذر نان"},
    {"title":"مواکب شهدای بسیج","menu":[
      {"title":"موکب کربلا"},{"title":"مواکب سراسر کشور"},{"title":"چایخانه حضرت رضا (ع)"}
    ]},
    {"title":"نذر قربانی"},
    {"title":"کمک معیشتی و نذر مؤمنانه","menu":[
      {"title":"نذر فرهنگی"},{"title":"کمک به خرید جهیزیه"},{"title":"کمک هزینه ازدواج"},
      {"title":"آزادسازی زندانی جرائم غیر عمد"}
    ]},
    {"title":"وجوهات شرعی","menu":[
      {"title":"خمس","submenu":[{"title":"خمس عام"},{"title":"خمس سادات"}]},
      {"title":"کفاره","submenu":[{"title":"کفاره عام"},{"title":"کفاره سادات"}]},
      {"title":"فطریه","submenu":[{"title":"فطریه عام"},{"title":"فطریه سادات"}]},
      {"title":"خیرات اموات"},{"title":"ثلث مال"},{"title":"رد مظالم"},{"title":"صدقه"}
    ]},
    {"title":"کمک به جبهه مقاومت"},
    {"title":"نذر عام"}
  ];

  // ——— استان/شهر ———
  provinceSel.disabled = false;
  provinceSel.innerHTML = '<option value="" selected>استان را انتخاب کنید</option>';
  Object.keys(PROVINCES_CITIES).forEach(p=>{
    const o=document.createElement('option'); o.value=p; o.textContent=p; provinceSel.appendChild(o);
  });
  provinceSel.addEventListener('change', ()=>{
    const p=provinceSel.value;
    citySel.disabled = !p;
    citySel.innerHTML='';
    const ph=document.createElement('option');ph.value='';ph.selected=true;
    ph.textContent = p ? 'شهر را انتخاب کنید' : 'ابتدا استان را انتخاب کنید';
    citySel.appendChild(ph);
    if(p){ (PROVINCES_CITIES[p]||[]).forEach(c=>{ const o=document.createElement('option');o.value=c;o.textContent=c;citySel.appendChild(o); }); }
  });

  // ——— موبایل ———
  const mobileInput = document.getElementById('mobile');
  const normalizeTo09 = raw => { let v=raw||''; if(v.startsWith('0098')) v=v.slice(4); else if(v.startsWith('98')) v=v.slice(2); if(!v.startsWith('0')) v='0'+v; return v; };
  mobileInput.addEventListener('input', ()=>{ const raw = toEnDigits(mobileInput.value).replace(/[^\d]/g,''); mobileInput.value = raw; });
  mobileInput.addEventListener('blur',  ()=>{ const raw = toEnDigits(mobileInput.value).replace(/[^\d]/g,''); if(!raw) return; const val = normalizeTo09(raw); if(/^09\d{9}$/.test(val)) mobileInput.value = toFaDigits(val); });
  mobileInput.addEventListener('focus', ()=>{ const raw = toEnDigits(mobileInput.value).replace(/[^\d]/g,''); mobileInput.value = raw; });

  // ——— ساخت منوی نیت ———
  function buildIntentMenu(tree, container, onPick){
    const ul=document.createElement('ul');
    (tree||[]).forEach(node=>{
      const li=document.createElement('li');
      if (node.menu || node.submenu){
        const btn=document.createElement('button'); btn.type='button'; btn.className='menu-item'; btn.textContent=node.title;
        const subWrap=document.createElement('div'); subWrap.style.display='none';
        btn.addEventListener('click', e=>{ e.stopPropagation(); subWrap.style.display = subWrap.style.display==='none' ? 'block' : 'none'; }); // تعامل پایدار [10]
        subWrap.appendChild(buildIntentMenu(node.menu||node.submenu, document.createElement('div'), onPick));
        li.append(btn,subWrap);
      } else {
        const btn=document.createElement('button'); btn.type='button'; btn.className='menu-item'; btn.textContent=node.title;
        btn.addEventListener('click', e=>{ e.stopPropagation(); onPick(node.title); });
        li.append(btn);
      }
      ul.appendChild(li);
    });
    container.appendChild(ul);
    return container;
  }

  // ——— ردیف نیت ———
  function createIntentRow(defaultIntent=''){
    const row=document.createElement('div'); row.className='intent-row';

    const addBtn=document.createElement('button'); addBtn.type='button'; addBtn.className='icon-btn add-intent'; addBtn.innerHTML='<img src="images/logo/add.png" alt="+"/>';
    addBtn.addEventListener('click', ()=>{ intentsWrap.appendChild(createIntentRow()); updateRemoveState(); updateTotalAndTitle(); });
    const removeBtn=document.createElement('button'); removeBtn.type='button'; removeBtn.className='icon-btn remove-intent'; removeBtn.innerHTML='<img src="images/logo/remove.png" alt="-"/>';
    removeBtn.addEventListener('click', ()=>{ if(removeBtn.hasAttribute('disabled')) return; row.remove(); updateRemoveState(); updateTotalAndTitle(); });

    const intentBox=document.createElement('div'); intentBox.className='intent-select';
    const trigger=document.createElement('button'); trigger.type='button'; trigger.className='intent-trigger'; trigger.textContent= defaultIntent || 'نیت را انتخاب کنید';
    const panel=document.createElement('div'); panel.className='intent-panel';
    const onPick = (picked)=>{ trigger.textContent=picked; panel.classList.remove('open'); setAmountsEnabled(true); updateTotalAndTitle(); };
    panel.appendChild(buildIntentMenu(NIAT_CARDS, document.createElement('div'), onPick));
    trigger.addEventListener('click',(e)=>{ e.stopPropagation(); document.querySelectorAll('.intent-panel.open').forEach(p=>p.classList.remove('open')); panel.classList.toggle('open'); });
    const closeOutside=(ev)=>{ if(!panel.contains(ev.target) && ev.target!==trigger){ panel.classList.remove('open'); document.removeEventListener('pointerdown', closeOutside, true);} };
    trigger.addEventListener('click',()=>{ document.addEventListener('pointerdown', closeOutside, true); });
    intentBox.append(trigger,panel);

    const amountHolder = document.createElement('div'); amountHolder.className='amount-holder';
    const amountWrap = document.createElement('div'); amountWrap.className='field-wrapper';
    const amountSel=document.createElement('select'); amountSel.className='amount-select';
    amountSel.innerHTML=`
      <option value="">مبلغ را انتخاب کنید</option>
      <option value="50000">۵۰,۰۰۰</option>
      <option value="100000">۱۰۰,۰۰۰</option>
      <option value="200000">۲۰۰,۰۰۰</option>
      <option value="500000">۵۰۰,۰۰۰</option>
      <option value="custom">مبلغ دلخواه...</option>
    `;
    amountWrap.appendChild(amountSel); amountHolder.appendChild(amountWrap);

    const customHolder = document.createElement('div'); customHolder.className='custom-holder';
    const customWrap = document.createElement('div'); customWrap.className='field-wrapper';
    const custom=document.createElement('input'); custom.type='text'; custom.inputMode='numeric'; custom.className='custom-amount'; custom.placeholder='مبلغ دلخواه (تومان)';
    customWrap.appendChild(custom); customHolder.appendChild(customWrap);

    function setAmountsEnabled(enabled){
      amountSel.disabled = !enabled; custom.disabled = !enabled;
      if(!enabled){ amountSel.value=''; custom.value=''; row.classList.remove('custom-visible'); }
    }
    setAmountsEnabled(!!defaultIntent && defaultIntent!=='נیت را انتخاب کنید');

    const stripMoney = v => toEnDigits(v).replace(/[^\d]/g,'');
    const formatMoneyFa = v => v ? (faNF.format(parseInt(v,10)) + ' تومان') : '';
    function maybeDropFlower(){
      const amount = parseInt(toEnDigits(custom.value||amountSel.value).replace(/[^\d]/g,''))||0;
      if(amount>=1000) dropNarges(row);
    }
    amountSel.addEventListener('change', ()=>{
      const isCustom = amountSel.value==='custom';
      row.classList.toggle('custom-visible', isCustom);
      if (isCustom){ custom.value=''; custom.focus(); } else if(amountSel.value){ maybeDropFlower(); }
      updateTotalAndTitle();
    });
    custom.addEventListener('focus', ()=>{ custom.value = stripMoney(custom.value); });
    custom.addEventListener('blur',  ()=>{ const raw = stripMoney(custom.value); custom.value = formatMoneyFa(raw); updateTotalAndTitle(); if(raw) maybeDropFlower(); });

    row.append(addBtn,intentBox,amountHolder,customHolder,removeBtn);
    return row;
  }

  function updateRemoveState(){
    const rows=[...intentsWrap.querySelectorAll('.intent-row')];
    rows.forEach(r=>{ const rm=r.querySelector('.remove-intent'); if(rows.length<=1) rm.setAttribute('disabled',''); else rm.removeAttribute('disabled'); });
  }

  // ——— جمع کل و عنوان ———
  const formatIRR = n => faNF.format(n||0) + ' تومان';
  function parseAmount(sel,custom){
    if(sel.value && sel.value!=='custom') return parseInt(sel.value)||0;
    if(sel.value==='custom' && custom.value) return parseInt(toEnDigits(custom.value).replace(/[^\d]/g,''))||0;
    return 0;
  }
  function uniqueInOrder(arr){ const seen=new Set(), out=[]; arr.forEach(v=>{ if(v && v!=='نیت را انتخاب کنید' && !seen.has(v)){ seen.add(v); out.push(v); }}); return out; }
  function updateTotalAndTitle(){
    let sum=0;
    const rows=[...intentsWrap.querySelectorAll('.intent-row')];
    const intents=uniqueInOrder(rows.map(r=>r.querySelector('.intent-trigger')?.textContent || ''));
    rows.forEach(r=>{ sum+=parseAmount(r.querySelector('.amount-select'), r.querySelector('.custom-amount')); });
    grandTotal.textContent = formatIRR(sum);
    if(intents.length===0) pageTitle.textContent='برای انجام ثبت خیرت، اطلاعات را تکمیل کن';
    else if(intents.length===1) pageTitle.textContent = `ثبت نیت خیر: ${intents}`;
    else pageTitle.textContent = `ثبت همزمان ${intents.length} نیت ارزشمند: ${listFa.format(intents)}`;
  }

  // ——— جای‌گذاری دقیق دسته‌گل بین «جمع مبلغ» و دکمه (۱۵٪ هم‌پوشانی دوطرفه) ———
  function positionBouquet(){
    const flowerH = bouquet.querySelector('img')?.getBoundingClientRect().height || 40;
    const sumRect  = summary.getBoundingClientRect();
    const totalRect= totalLine.getBoundingClientRect();
    const btnRect  = payBtn.getBoundingClientRect();

    // حداقل فاصله قابل‌مشاهده بین دو کادر (۷۰٪ ارتفاع گل)
    const minGap = Math.ceil(flowerH * 0.70);

    // فاصله فعلی
    const currentGap = btnRect.top - totalRect.bottom;

    // پایه فاصله اندک؛ فقط اگر لازم باشد افزایش می‌دهیم
    const base = 6;
    const extra = Math.max(0, minGap - currentGap);
    payActions.style.marginTop = (base + extra) + 'px';

    // نقطه میانی شکاف برای قرارگیری مرکز سبد گل
    const gapMidFromSummaryTop = ((totalRect.bottom + btnRect.top)/2) - sumRect.top;
    bouquet.style.top = (gapMidFromSummaryTop - (flowerH/2)) + 'px';
    bouquet.style.left = '50%';
    bouquet.style.transform = 'translateX(-50%)';
  }

  // ——— کبوترها (نسخه جهت‌دار) ———
  function launchPigeons(cx, cy){
    const imgs = [
      ...Array(6).fill('images/decorations/pigeon1.png'),
      ...Array(6).fill('images/decorations/pigeon2.png')
    ];
    imgs.forEach((src, i)=>{
      setTimeout(()=>{
        const img = document.createElement('img');
        img.className='pigeon'; img.src=src; img.alt='';
        const dur = 3.0 + Math.random()*1.0;
        img.style.setProperty('--dur', `${dur}s`);
        img.style.setProperty('--fade', `${dur*0.9}s`);
        document.body.appendChild(img);

        const startX=cx, startY=cy;
        img.style.left = (startX-14)+'px';
        img.style.top  = (startY-14)+'px';

        const deg = src.includes('pigeon1') ? -(20 + Math.random()*60) : -(100 + Math.random()*60);
        const rad = deg * Math.PI / 180;
        const dist = 120 + Math.random()*160;
        const dx = Math.cos(rad)*dist;
        const dy = Math.sin(rad)*dist;
        const rot = (Math.random()*34-17);

        requestAnimationFrame(()=>{
          img.style.opacity='1';
          img.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.06) rotate(${rot}deg)`;
          setTimeout(()=>{ img.style.opacity='0.6'; }, dur*1000*0.35);
          setTimeout(()=>{ img.style.opacity='0.0'; },  dur*1000*0.82);
        });
        setTimeout(()=>img.remove(), Math.ceil(dur*1000) + 500);
      }, i*110);
    });
  }

  // ——— پرتاب گل: مقصد = مرکز ظرف سبد گل (نه زیر دکمه) ———
  function dropNarges(fromRow){
    const fly = document.createElement('img');
    fly.src = 'images/decorations/narges3.png';
    fly.alt = '';
    fly.style.position='fixed'; fly.style.width='42px'; fly.style.height='42px';
    fly.style.pointerEvents='none'; fly.style.zIndex='2147483646'; fly.style.transform='translate3d(0,0,0) scale(.92)';

    const r = fromRow.getBoundingClientRect();
    const bq = bouquet.getBoundingClientRect();

    const startX = r.left + r.width*0.18, startY = r.top + r.height*0.12;
    const endX = bq.left + bq.width*0.5 + (Math.random()*24-12);
    const endY = bq.top  + bq.height*0.5 + (Math.random()*10-5);

    fly.style.left = startX+'px'; fly.style.top = startY+'px'; fly.style.opacity='0';
    document.body.appendChild(fly);

    const midX = (startX+endX)/2 + (Math.random()*60-30);
    const midY = Math.min(startY, endY) - (70 + Math.random()*50);
    const dur = 760 + Math.random()*420;
    const start = performance.now();

    requestAnimationFrame(function anim(t){
      const k = Math.min(1, (t-start)/dur);
      const ease = k<.5 ? 2*k*k : -1+(4-2*k)*k;
      const x = (1-ease)*(1-ease)*startX + 2*(1-ease)*ease*midX + ease*ease*endX;
      const y = (1-ease)*(1-ease)*startY + 2*(1-ease)*ease*midY + ease*ease*endY;
      fly.style.opacity = String(Math.min(1, k*1.2));
      fly.style.transform = `translate3d(${x-startX}px, ${y-startY}px, 0) scale(${.92 + .08*k}) rotate(${(k*20-10).toFixed(1)}deg)`;
      if(k<1) requestAnimationFrame(anim); else {
        const small = document.createElement('img');
        small.src='images/decorations/narges3.png'; small.alt='';
        small.style.height='40px';
        small.style.setProperty('--rot', (Math.random()*22-11).toFixed(1)+'deg');
        small.style.setProperty('--y', (Math.random()*6-3).toFixed(0)+'px');
        bouquet.appendChild(small);
        positionBouquet(); // جای‌گذاری نهایی بعد از اضافه‌شدن
        fly.remove();
      }
    });
  }

  // ——— شروع ———
  intentsWrap.appendChild(createIntentRow(initialCause || ''));
  updateRemoveState();
  updateTotalAndTitle();
  positionBouquet();
  window.addEventListener('resize', debounce(positionBouquet,150));

  // ——— ارسال ———
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const fullname=document.getElementById('fullname'), mobile=document.getElementById('mobile');
    const err=(el,msg)=>{const s=el.closest('.input-group').querySelector('.error'); s.textContent=msg||'';}
    let ok=true;
    const mobileRaw = toEnDigits(mobile.value).replace(/[^\d]/g,'');
    const norm = (v)=>{let x=v; if(x.startsWith('0098')) x=x.slice(4); else if(x.startsWith('98')) x=x.slice(2); if(!x.startsWith('0')) x='0'+x; return x;};
    if(fullname.value.trim().length<3){err(fullname,'نام کامل را وارد کنید');ok=false;}
    if(!/^09\d{9}$/.test(norm(mobileRaw))){err(mobile,'شماره موبایل صحیح نیست');ok=false;}
    if(!provinceSel.value){err(provinceSel,'استان را انتخاب کنید');ok=false;}
    if(!citySel.value){err(citySel,'شهر را انتخاب کنید');ok=false;}
    if(!ok) return;

    const b = (e.submitter||payBtn).getBoundingClientRect();
    launchPigeons(b.left+b.width/2, b.top+b.height/2);

    const rows=[...intentsWrap.querySelectorAll('.intent-row')];
    const intents=uniqueInOrder(rows.map(r=>r.querySelector('.intent-trigger')?.textContent || ''));
    const name=fullname.value.trim();
    const joined = intents.length ? listFa.format(intents) : 'نیت خیر';
    document.getElementById('thank-message').textContent =
      intents.length<=1
      ? `${name} عزیز، از انتخاب نیت «${joined}» صمیمانه سپاسگزاریم؛ امید که به قبولی و برکت ختم شود.`
      : `${name} نیک‌اندیش، از ثبت همزمان ${intents.length} نیت (${joined}) سپاسگزاریم؛ ان‌شاءالله مأجور باشید.`;
    document.getElementById('thank-modal').classList.add('show');
  });

  // ——— دکمه مودال (جایگزینی درگاه) ———
  document.getElementById('redirect-btn').addEventListener('click', ()=>{
    // TODO: پس از آماده‌شدن، آدرس مستقیم درگاه بانکی را جایگزین خط زیر کنید:
    // location.href = 'https://GATEWAY-LINK';
    location.href = 'cards-form.html';
  });
});
/* ساخته شده توسط مهدی باغبانپور بروجنی */
