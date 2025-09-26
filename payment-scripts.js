/* به نام خداوند بخشنده مهربان */
document.addEventListener('DOMContentLoaded', () => {
  // عناصر
  const params       = new URLSearchParams(location.search);
  const initialCause = params.get('cause') ? params.get('cause').replace(/_/g, ' ') : '';
  const pageTitle    = document.getElementById('page-title');
  const provinceSel  = document.getElementById('province');
  const citySel      = document.getElementById('city');
  const intentsWrap  = document.getElementById('intents-wrapper');
  const form         = document.getElementById('payment-form');
  const grandTotal   = document.getElementById('grand-total');
  const payBtn       = document.getElementById('pay-btn');
  const bouquet      = document.getElementById('bouquet');
  const totalLine    = document.querySelector('.total-line');
  const summary      = document.querySelector('.summary');
  const payActions   = document.querySelector('.pay-actions');

  // ابزار
  const debounce = (fn, d=300)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),d)}};
  const faNF = new Intl.NumberFormat('fa-IR');
  const listFa = new Intl.ListFormat('fa',{type:'conjunction',style:'long'});
  const toEnDigits = s => (s||'').replace(/[٠-٩۰-۹]/g, ch => String(ch.charCodeAt(0) & 15));
  const toFaDigits = s => (s||'').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

/* ——— استان/شهر (منوی شهر وابسته به استان) ——— */
const PROVINCES_CITIES_RAW = {
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

/* ——— نیت‌های خیر (منوی چندسطحی) ——— */
const NIAT_CARDS_RAW = [
  {"title":"قلک بیمه"},
  {"title":"نذر درمانی","menu":[
    {"title":"تجهیزات درمان","submenu":[
      {"title":"دستگاه دیالیز"},{"title":"جراحی چشم"},{"title":"اکو قلب"},
      {"title":"سونوگرافی"},{"title":"سونوگرافی تخصصی"},{"title":"ماموگرافی"},
      {"title":"تجهیزات آزمایشگاه بیوشیمی"},{"title":"شمارشگر خون"},{"title":"دستگاه گاز خون"},
      {"title":"لنز و تجهیزات چشم"},{"title":"پروتزهای مفصل"},{"title":"پروتز ستون فقرات"}
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
    {"title":"نذر فرهنگی"},{"title":"کمک به خرید جهیزیه"},{"title":"کمک هزینه ازدواج"},{"title":"آزادی زندانیان غیرعمد"}
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

  // نرمال‌سازی عمومی
  const COLL_FA = new Intl.Collator('fa', { sensitivity:'base', numeric:true });
  const toFaChars = s => (s||'')
    .replace(/\u064A/g,'\u06CC') /* ي → ی */
    .replace(/\u0643/g,'\u06A9') /* ك → ک */
    .replace(/\s+/g,' ')
    .replace(/\u200c{2,}/g,'\u200c')
    .trim();
  const uniq = arr => { const seen=new Set(), out=[]; for(const x of arr){ if(!seen.has(x)){ seen.add(x); out.push(x);} } return out; };
  const deepFreeze = obj => { if(!obj||typeof obj!=='object') return obj; Object.freeze(obj); for(const k of Object.keys(obj)){ const v=obj[k]; if(v&&typeof v==='object'&&!Object.isFrozen(v)) deepFreeze(v);} return obj; };

  // استان/شهر: تولید ساختار نهایی از RAW
  const PROVINCES_CITIES = (() => {
    if (typeof PROVINCES_CITIES_RAW === 'undefined') return {};
    const out = {};
    for (const [p, list] of Object.entries(PROVINCES_CITIES_RAW)) {
      const P = toFaChars(p);
      const normCities = uniq(list.map(toFaChars)).sort(COLL_FA.compare);
      out[P] = Object.freeze(normCities);
    }
    const ordered = {};
    Object.keys(out).sort(COLL_FA.compare).forEach(k => ordered[k]=out[k]);
    return deepFreeze(ordered);
  })();
  const PROVINCE_LIST = Object.freeze(Object.keys(PROVINCES_CITIES));
  const CITY_MAP = PROVINCE_LIST.reduce((acc,p)=>(acc[p]=PROVINCES_CITIES[p],acc), Object.create(null));
  const getCitiesOf = (provinceName) => {
    const key = PROVINCE_LIST.find(p => COLL_FA.compare(p, toFaChars(provinceName))===0);
    return key ? CITY_MAP[key] : [];
  };

  // نیت‌ها: نرمال‌سازی درخت
  const normalizeMenuTree = (nodes=[]) => {
    const walk = (arr=[]) => arr.map(n=>{
      const title = toFaChars(n.title);
      const node = { title };
      if (Array.isArray(n.menu) && n.menu.length) node.menu = walk(n.menu);
      if (Array.isArray(n.submenu) && n.submenu.length) node.submenu = walk(n.submenu);
      return node;
    });
    return walk(nodes);
  };
  const NIAT_CARDS = (typeof NIAT_CARDS_RAW!=='undefined') ? deepFreeze(normalizeMenuTree(NIAT_CARDS_RAW)) : [];

  // استان/شهر (پیوند وابسته)
  provinceSel.disabled = false;
  provinceSel.innerHTML = '<option value="" selected>استان را انتخاب کنید</option>';
  PROVINCE_LIST.forEach(p=>{ const o=document.createElement('option'); o.value=p; o.textContent=p; provinceSel.appendChild(o); });
  provinceSel.addEventListener('change', ()=>{
    const p=provinceSel.value;
    citySel.disabled = !p;
    citySel.innerHTML='';
    const ph=document.createElement('option');ph.value='';ph.selected=true;
    ph.textContent = p ? 'شهر را انتخاب کنید' : 'ابتدا استان را انتخاب کنید';
    citySel.appendChild(ph);
    getCitiesOf(p).forEach(c=>{ const o=document.createElement('option');o.value=c;o.textContent=c;citySel.appendChild(o); });
  });

  // موبایل
  const mobileInput = document.getElementById('mobile');
  const normalizeTo09 = raw => { let v=raw||''; if(v.startsWith('0098')) v=v.slice(4); else if(v.startsWith('98')) v=v.slice(2); if(!v.startsWith('0')) v='0'+v; return v; };
  mobileInput.addEventListener('input', ()=>{ const raw = toEnDigits(mobileInput.value).replace(/[^\d]/g,''); mobileInput.value = raw; });
  mobileInput.addEventListener('blur',  ()=>{ const raw = toEnDigits(mobileInput.value).replace(/[^\d]/g,''); if(!raw) return; const val = normalizeTo09(raw); if(/^09\d{9}$/.test(val)) mobileInput.value = toFaDigits(val); });
  mobileInput.addEventListener('focus', ()=>{ const raw = toEnDigits(mobileInput.value).replace(/[^\d]/g,''); mobileInput.value = raw; });

  // کمک‌ها
  const formatIRR = n => faNF.format(n||0) + ' تومان';
  const stripMoney = v => toEnDigits(v).replace(/[^\d]/g,'');
  const uniqueInOrder = arr => { const seen=new Set(), out=[]; arr.forEach(v=>{ if(v && v!=='نیت را انتخاب کنید' && !seen.has(v)){ seen.add(v); out.push(v); }}); return out; };

  // دسته‌گل: چیدمان و هم‌پوشانی تطبیقی
  const overlapRatioByCount = n => (n<=2?0 : n===3?0.20 : n===4?0.25 : n<=7?0.30 : 0.40);
  function layoutBouquet(){
    const flowers=[...bouquet.querySelectorAll('.flower')];
    const n=flowers.length;
    const h=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--flower-h'))||40;
    bouquet.style.height=h+'px';
    if(n===0){ bouquet.style.width='0px'; return; }
    const r=overlapRatioByCount(n);
    const spacing=Math.round(h*(1-r));
    const totalW=h+(n-1)*spacing;
    bouquet.style.width=totalW+'px';
    flowers.forEach((el,i)=>{ el.style.left=(i*spacing)+'px'; });
  }
  const getIntentKeyFromRow = row => (row.querySelector('.intent-trigger')?.textContent||'').trim();
  function highlightFlower(key){
    const el = bouquet.querySelector(`.flower[data-key="${CSS.escape(key)}"]`);
    if(!el) return; el.classList.remove('bloom-pulse'); void el.offsetWidth; el.classList.add('bloom-pulse');
  }
  function removeFlowerByKey(key){
    const el = bouquet.querySelector(`.flower[data-key="${CSS.escape(key)}"]`);
    if(!el) return; el.classList.add('fade-out'); setTimeout(()=>{ el.remove(); layoutBouquet(); }, 420);
  }
  function ensureFlower(key){
    let el=bouquet.querySelector(`.flower[data-key="${CSS.escape(key)}"]`);
    if(el) return el;
    el=document.createElement('img'); el.className='flower'; el.setAttribute('data-key',key);
    el.src='images/decorations/narges3.png'; el.alt='';
    bouquet.insertBefore(el, bouquet.firstChild);
    return el;
  }
  function flyFlowerFromRowToBouquet(row,onDone){
    const fly=document.createElement('img'); fly.src='images/decorations/narges3.png'; fly.alt='';
    fly.style.cssText='position:fixed;width:42px;height:42px;pointer-events:none;z-index:2147483646;opacity:0;';
    const r=row.getBoundingClientRect(); const startX=r.left+r.width*0.18, startY=r.top+r.height*0.12;
    fly.style.left=startX+'px'; fly.style.top=startY+'px'; document.body.appendChild(fly);
    const bq=bouquet.getBoundingClientRect(); const endX=bq.left+4, endY=bq.top + (bq.height/2);
    const midX=(startX+endX)/2 + (Math.random()*60-30); const midY=Math.min(startY,endY) - (70+Math.random()*50);
    const dur=760+Math.random()*420; const start=performance.now();
    requestAnimationFrame(function anim(t){
      const k=Math.min(1,(t-start)/dur); const ease=k<.5?2*k*k:-1+(4-2*k)*k;
      const x=(1-ease)*(1-ease)*startX + 2*(1-ease)*ease*midX + ease*ease*endX;
      const y=(1-ease)*(1-ease)*startY + 2*(1-ease)*ease*midY + ease*ease*endY;
      fly.style.opacity=String(Math.min(1,k*1.2));
      fly.style.transform=`translate3d(${x-startX}px, ${y-startY}px, 0) scale(${.92+.08*k}) rotate(${(k*20-10).toFixed(1)}deg)`;
      if(k<1) requestAnimationFrame(anim); else { fly.remove(); onDone?.(); }
    });
  }
  function upsertFlowerForRow(row){
    const key=getIntentKeyFromRow(row);
    if(!key || key==='نیت را انتخاب کنید') return;
    const existed=!!bouquet.querySelector(`.flower[data-key="${CSS.escape(key)}"]`);
    if(existed){ highlightFlower(key); layoutBouquet(); return; }
    layoutBouquet();
    flyFlowerFromRowToBouquet(row, ()=>{ ensureFlower(key); layoutBouquet(); highlightFlower(key); });
  }

  // جای‌گذاری دسته‌گل میان «جمع مبلغ» و دکمه
  function positionBouquet(){
    const h=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--flower-h'))||40;
    const sumRect=summary.getBoundingClientRect();
    const totalRect=totalLine.getBoundingClientRect();
    const btnRect=payBtn.getBoundingClientRect();
    const minGap=Math.ceil(h*0.70);
    const currentGap=btnRect.top-totalRect.bottom;
    const base=6;
    const extra=Math.max(0, minGap-currentGap);
    payActions.style.marginTop=(base+extra)+'px';
    const gapMid=((totalRect.bottom+btnRect.top)/2) - sumRect.top;
    bouquet.style.top=(gapMid - (h/2))+'px';
    bouquet.style.left='50%';
    bouquet.style.transform='translateX(-50%)';
  }

  // کنترل اسکرول بدون CLS
  function updateScrollMode(){
    const needScroll = document.documentElement.scrollHeight > window.innerHeight + 2;
    document.body.classList.toggle('scroll-allowed', needScroll);
  }

  // ساخت منوی چندسطحی با زیرمنوی بسته پیش‌فرض
  function buildMenuList(tree=[], onPick){
    const ul=document.createElement('ul');
    (tree||[]).forEach(node=>{
      const li=document.createElement('li');
      if(node.menu || node.submenu){
        const btn=document.createElement('button');
        btn.type='button'; btn.className='menu-item parent'; btn.textContent=node.title;
        btn.setAttribute('role','menuitem'); btn.setAttribute('aria-haspopup','menu'); btn.setAttribute('aria-expanded','false');

        const subWrap=document.createElement('div');
        subWrap.className='submenu'; subWrap.setAttribute('role','menu'); subWrap.setAttribute('aria-hidden','true');
        subWrap.appendChild(buildMenuList(node.menu||node.submenu, onPick));

        function openSub(){
          // بستن سایر زیرمنوهای باز در همین سطح
          li.parentElement?.querySelectorAll(':scope > li > .submenu.open').forEach(s=>{
            if(s!==subWrap){ s.classList.remove('open'); s.setAttribute('aria-hidden','true'); s.previousElementSibling?.setAttribute('aria-expanded','false'); }
          });
          btn.setAttribute('aria-expanded','true');
          subWrap.classList.add('open'); subWrap.setAttribute('aria-hidden','false');
          setTimeout(()=>rovingFocus(subWrap),0);
        }
        function closeSub(){
          btn.setAttribute('aria-expanded','false');
          subWrap.classList.remove('open'); subWrap.setAttribute('aria-hidden','true');
        }

        btn.addEventListener('click', (e)=>{ e.stopPropagation(); (btn.getAttribute('aria-expanded')==='true') ? closeSub() : openSub(); });
        btn.addEventListener('keydown', (e)=>{
          if(e.key==='Enter'||e.key===' '||e.key==='ArrowRight'){ e.preventDefault(); openSub(); }
          else if(e.key==='ArrowLeft'){ e.preventDefault(); closeSub(); btn.focus(); }
        });

        li.append(btn, subWrap);
      } else {
        const leaf=document.createElement('button');
        leaf.type='button'; leaf.className='menu-item'; leaf.textContent=node.title;
        leaf.setAttribute('role','menuitem');
        leaf.addEventListener('click', (e)=>{ e.stopPropagation(); onPick(node.title); });
        li.append(leaf);
      }
      ul.appendChild(li);
    });
    return ul;
  }
  function rovingFocus(panel){
    const items=[...panel.querySelectorAll('.menu-item')];
    if(!items.length) return;
    let idx=0;
    items.forEach((it,i)=>{ it.tabIndex = i===0 ? 0 : -1; });
    const setActive = i => { items[idx].tabIndex=-1; idx=(i+items.length)%items.length; items[idx].tabIndex=0; items[idx].focus(); };
    panel.addEventListener('keydown', (e)=>{
      if(e.key==='ArrowDown'){ e.preventDefault(); setActive(idx+1); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); setActive(idx-1); }
      else if(e.key==='Home'){ e.preventDefault(); setActive(0); }
      else if(e.key==='End'){ e.preventDefault(); setActive(items.length-1); }
      else if(e.key==='Escape'){ e.preventDefault(); const parentBtn=panel.previousElementSibling; panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); parentBtn?.setAttribute('aria-expanded','false'); parentBtn?.focus(); }
    });
    items[0].focus();
  }
  function smartPlace(panel, trigger){
    const r=trigger.getBoundingClientRect();
    panel.style.minWidth=Math.max(r.width,260)+'px';
    panel.classList.remove('drop-up');
    const probe=panel.getBoundingClientRect();
    const below=r.bottom+8+Math.max(probe.height,160);
    const canBelow=below < innerHeight - 8;
    if(!canBelow) panel.classList.add('drop-up');
  }

  // ردیف نیت (منوها + دسته‌گل)
  function createIntentRow(defaultIntent=''){
    const row=document.createElement('div'); row.className='intent-row';

    // افزودن/حذف
    const addBtn=document.createElement('button'); addBtn.type='button'; addBtn.className='icon-btn add-intent'; addBtn.innerHTML='<img src="images/logo/add.png" alt="+"/>';
    addBtn.addEventListener('click', ()=>{ intentsWrap.appendChild(createIntentRow()); updateRemoveState(); updateTotalAndTitle(); updateScrollMode(); });

    const removeBtn=document.createElement('button'); removeBtn.type='button'; removeBtn.className='icon-btn remove-intent'; removeBtn.innerHTML='<img src="images/logo/remove.png" alt="-"/>';
    removeBtn.addEventListener('click', ()=>{
      if(removeBtn.hasAttribute('disabled')) return;
      const key=getIntentKeyFromRow(row);
      row.dispatchEvent(new CustomEvent('remove-intent',{bubbles:true, detail:{key}}));
      if(key) removeFlowerByKey(key);
      row.remove();
      updateRemoveState(); updateTotalAndTitle(); updateScrollMode();
    });

    // نیت
    const intentBox=document.createElement('div'); intentBox.className='intent-select';
    const intentTrigger=document.createElement('button');
    intentTrigger.type='button'; intentTrigger.className='intent-trigger'; intentTrigger.textContent= defaultIntent || 'نیت را انتخاب کنید';
    intentTrigger.setAttribute('aria-haspopup','menu'); intentTrigger.setAttribute('aria-expanded','false');

    const intentPanel=document.createElement('div'); intentPanel.className='intent-panel'; intentPanel.setAttribute('role','menu'); intentPanel.setAttribute('aria-hidden','true');
    if (Array.isArray(NIAT_CARDS) && NIAT_CARDS.length){
      intentPanel.appendChild(buildMenuList(NIAT_CARDS, (picked)=>{
        intentTrigger.textContent=picked;
        closePanel(intentTrigger,intentPanel,true);
        setAmountsEnabled(true);
        updateTotalAndTitle();
      }));
    }

    function openPanel(trigger,panel){
      // بستن سایر پنل‌ها
      document.querySelectorAll('.intent-panel.open, .amount-panel.open').forEach(p=>{
        p.classList.remove('open'); p.setAttribute('aria-hidden','true'); p.previousElementSibling?.setAttribute('aria-expanded','false');
      });
      panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); trigger.setAttribute('aria-expanded','true');
      smartPlace(panel, trigger); setTimeout(()=>rovingFocus(panel),0);
      const closer=(ev)=>{ if(!panel.contains(ev.target) && ev.target!==trigger){ closePanel(trigger,panel,true); document.removeEventListener('pointerdown', closer, true);} };
      document.addEventListener('pointerdown', closer, true);
      panel.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ e.preventDefault(); closePanel(trigger,panel,true); } });
    }
    function closePanel(trigger,panel,returnFocus){
      panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); trigger.setAttribute('aria-expanded','false');
      if(returnFocus) trigger.focus();
    }

    intentTrigger.addEventListener('click', (e)=>{ e.stopPropagation(); intentPanel.classList.contains('open') ? closePanel(intentTrigger,intentPanel,true) : openPanel(intentTrigger,intentPanel); });
    intentTrigger.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){ e.preventDefault(); openPanel(intentTrigger,intentPanel); } });
    intentBox.append(intentTrigger, intentPanel);

    // مبلغ
    const amountHolder=document.createElement('div'); amountHolder.className='amount-holder';
    const amountWrap=document.createElement('div'); amountWrap.className='field-wrapper';
    const amountSel=document.createElement('select'); amountSel.className='amount-select visually-hidden'; amountSel.setAttribute('tabindex','-1');
    amountSel.innerHTML = `
      <option value="">مبلغ را انتخاب کنید</option>
      <option value="50000">۵۰,۰۰۰</option>
      <option value="100000">۱۰۰,۰۰۰</option>
      <option value="200000">۲۰۰,۰۰۰</option>
      <option value="500000">۵۰۰,۰۰۰</option>
      <option value="custom">مبلغ دلخواه...</option>
    `;
    const amountTrigger=document.createElement('button'); amountTrigger.type='button'; amountTrigger.className='amount-trigger'; amountTrigger.textContent='مبلغ را انتخاب کنید';
    amountTrigger.setAttribute('aria-haspopup','menu'); amountTrigger.setAttribute('aria-expanded','false');

    const amountPanel=document.createElement('div'); amountPanel.className='amount-panel'; amountPanel.setAttribute('role','menu'); amountPanel.setAttribute('aria-hidden','true');
    const amountUL=document.createElement('ul');
    [...amountSel.options].forEach(opt=>{
      if(!opt.value) return;
      const li=document.createElement('li');
      const btn=document.createElement('button'); btn.type='button'; btn.className='menu-item'; btn.setAttribute('role','menuitem');
      btn.dataset.value=opt.value; btn.textContent=opt.textContent;
      btn.addEventListener('click', ()=>{ amountSel.value=btn.dataset.value; amountTrigger.textContent=opt.textContent; handleAmountChange(); closePanel(amountTrigger,amountPanel,true); });
      li.appendChild(btn); amountUL.appendChild(li);
    });
    amountPanel.appendChild(amountUL);

    function openAmount(){
      document.querySelectorAll('.intent-panel.open, .amount-panel.open').forEach(p => p.classList.remove('open'));
      amountPanel.classList.add('open'); amountPanel.setAttribute('aria-hidden','false'); amountTrigger.setAttribute('aria-expanded','true');
      smartPlace(amountPanel, amountTrigger); setTimeout(()=>rovingFocus(amountPanel),0);
      const closer=(ev)=>{ if(!amountPanel.contains(ev.target) && ev.target!==amountTrigger){ closePanel(amountTrigger,amountPanel,true); document.removeEventListener('pointerdown', closer, true);} };
      document.addEventListener('pointerdown', closer, true);
      amountPanel.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ e.preventDefault(); closePanel(amountTrigger,amountPanel,true); } });
    }
    amountTrigger.addEventListener('click', (e)=>{ e.stopPropagation(); amountPanel.classList.contains('open') ? closePanel(amountTrigger,amountPanel,true) : openAmount(); });
    amountTrigger.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){ e.preventDefault(); openAmount(); } });

    amountWrap.append(amountTrigger, amountSel, amountPanel); amountHolder.appendChild(amountWrap);

    // مبلغ دلخواه
    const customHolder=document.createElement('div'); customHolder.className='custom-holder';
    const customWrap=document.createElement('div'); customWrap.className='field-wrapper';
    const custom=document.createElement('input'); custom.type='text'; custom.inputMode='numeric'; custom.className='custom-amount'; custom.placeholder='مبلغ دلخواه (تومان)';
    customWrap.appendChild(custom); customHolder.appendChild(customWrap);

    function setAmountsEnabled(enabled){
      amountSel.disabled=!enabled; custom.disabled=!enabled;
      if(!enabled){ amountSel.value=''; custom.value=''; row.classList.remove('custom-visible'); amountTrigger.textContent='مبلغ را انتخاب کنید'; }
    }
    setAmountsEnabled(!!defaultIntent && defaultIntent!=='نیت را انتخاب کنید');

    function handleAmountChange(){
      const isCustom = amountSel.value==='custom';
      row.classList.toggle('custom-visible', isCustom);
      if(isCustom){ custom.value=''; custom.focus(); } else if(amountSel.value){ upsertFlowerForRow(row); }
      updateTotalAndTitle(); updateScrollMode();
    }
    function maybeFromCustom(){
      const raw=stripMoney(custom.value);
      custom.value = raw ? (faNF.format(parseInt(raw,10)) + ' تومان') : '';
      updateTotalAndTitle();
      if(raw) upsertFlowerForRow(row);
      updateScrollMode();
    }
    custom.addEventListener('focus', ()=>{ custom.value = stripMoney(custom.value); });
    custom.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); maybeFromCustom(); custom.blur(); } });
    custom.addEventListener('blur', ()=>{ maybeFromCustom(); });

    // نصب اجزا
    row.append(addBtn,intentBox,amountHolder,customHolder,removeBtn);

    // بستن سراسری با Escape
    function closeAllPanels(){ document.querySelectorAll('.intent-panel.open, .amount-panel.open').forEach(p => p.classList.remove('open')); }
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeAllPanels(); } });

    return row;
  }

  function updateRemoveState(){
    const rows=[...intentsWrap.querySelectorAll('.intent-row')];
    rows.forEach(r=>{ const rm=r.querySelector('.remove-intent'); if(rows.length<=1) rm.setAttribute('disabled',''); else rm.removeAttribute('disabled'); });
  }

  // جمع کل و عنوان
  function parseAmount(sel,custom){
    if(sel.value && sel.value!=='custom') return parseInt(sel.value)||0;
    if(sel.value==='custom' && custom.value) return parseInt(toEnDigits(custom.value).replace(/[^\d]/g,''))||0;
    return 0;
  }
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

  // شروع
  intentsWrap.appendChild(createIntentRow(initialCause || ''));
  updateRemoveState();
  updateTotalAndTitle();
  positionBouquet();
  layoutBouquet();
  updateScrollMode();
  window.addEventListener('resize', debounce(()=>{ positionBouquet(); layoutBouquet(); updateScrollMode(); },150));

  // ارسال
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

    // افکت پرواز کبوترها
    const b=(e.submitter||payBtn).getBoundingClientRect();
    pigeons.burstAt(b.left+b.width/2, b.top+b.height/2);

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

  // دکمه مودال (نمونه مسیر)
  document.getElementById('redirect-btn').addEventListener('click', ()=>{
    // location.href = 'https://GATEWAY-LINK';
    location.href = 'cards-form.html';
  });

  // کلاس پرواز آرام کبوترها
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
        img.style.cssText = `position:fixed;left:0;top:0;width:${this.size}px;height:${this.size}px;pointer-events:none;z-index:2147483647;will-change:transform,opacity;`;
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
