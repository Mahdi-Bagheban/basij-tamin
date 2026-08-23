# گزارش تحلیل موشکافانه — دور ششم (Audit v6)

- تاریخ: ۲۰۲۶-۰۸-۲۳ • شاخه: `arena/01a02d5e-basij-tamin` • HEAD محلی: `d1dccf7` • HEAD ریموت: `f7b3698`
- روش: بازخوانی سورس + پارس ساختاری HTML + استخراج ابعاد ذاتی تصاویر + اجرای واقعی `npm run build`/`npm run validate` + بازبینی لاگ واقعی مرورگر روی سرویس محلی
- وضعیت پایپ‌لاین: **سبز** • حجم منبع: ۱٫۹MB / ۷۴ فایل

---

## ۱. تحلیل معماری و ساختار (Web Architecture & Structure)

**تأیید می‌شود — هیچ تغییری لازم نیست:**
- MPA استاتیک با تفکیک روشن: `src/js/{utils,data,clarity,splash,dotlottie-fallback}.js` + منطق هر صفحه + شیت اختصاصی هر صفحه. هیچ بک‌اند/API/دیتابیسی وجود ندارد، بنابراین معماری API و تنگنای SSR/CSR/SSG **موضوعیت ندارد**.
- منبع واحد داده (`data.js` → `derivePaymentUrls`) و مدیریت State سه‌سطحی (URL / `safeStorage` / حافظهٔ صفحه) منسجم است.
- **راستی‌آزمایی رفتاری:** لاگ سرویس محلی نشان می‌دهد یک مرورگر واقعی چرخهٔ کامل را طی کرده است: بارگذاری `index.html` → پلیر **محلی** `dotlottie-player.mjs` + چانک‌های `chunk-*` + `lottie_svg` (بدون هیچ درخواستی به CDN) → `splash.js` → گذار به `cards-form.html` → ۱۰ کارت + `data.js` + افکت کبوترها. یعنی هرس وندور و استخراج اسکریپت‌های اینلاین در عمل هم سالم است.
- پارس ساختاری هر چهار صفحه: **صفر تگ بسته‌نشده، صفر عدم‌تطابق، صفر شناسهٔ تکراری**.
- هیچ آنتی‌پترن معماری باقی نمانده است.

**تنها بدهی معماری (آگاهانه پذیرفته‌شده):** `payment-scripts.js` یک کلوژر ~۵۳۰ خطی است. ریفکتور آن همچنان **توصیه نمی‌شود** (ریسک رگرسیون در منطق فرم > سود).

---

## ۲. بررسی کیفیت کد و استانداردهای وب (Code Quality & Web Standards)

**تأیید می‌شود — بدون نیاز به تغییر:**
- Clean Code / DRY / KISS رعایت شده؛ ابزارهای مشترک (`safeStorage`, `normalizeMobile`, `debounce`, `toEnDigits`…) در یک ماژول متمرکز شده‌اند.
- صفر هندلر اینلاین، صفر صفت `style=`، صفر بلوک `<script>` اینلاین؛ گارد خودکار این وضعیت را در CI تثبیت می‌کند.
- نام‌گذاری یکدست، کامنت درون‌خطی انگلیسی، داک‌استرینگ دوزبانه در ماژول‌های جدید.
- حجم‌ها با gzip ناچیز است (بزرگ‌ترین JS ‏۷٫۹KB) → **Minify لازم نیست**.

**نقص واقعی (a11y، متوسط):** در `cards-scripts.js` تابع `openMenuAt()` منوی کشویی را به انتهای `<body>` تزریق می‌کند بدون هیچ مدیریت فوکوس، `role="menu"` یا حلقهٔ Tab. کاربر کیبورد که با Enter روی یک کارت منو را باز می‌کند، فوکوسش روی کارت می‌ماند و برای رسیدن به آیتم‌ها باید تا انتهای سند Tab بزند. الگوی درست آن **در همین مخزن** در `payment-scripts.js` (`rovingFocus`) پیاده‌سازی شده و فقط باید در سطح منوی کارت‌ها تکرار شود.

---

## ۳. بررسی امنیت وب و شبکه (Web Security & Network)

**تأیید می‌شود — بدون نیاز به تغییر:**
- **SQLi / IDOR / CSRF / JWT / Session / CORS: موضوعیت ندارد** (بدون بک‌اند، بدون کوکی، بدون توکن، بدون درخواست حالت‌تغییردهنده).
- **XSS:** تنها ورودی خارجی `?cause=` با `textContent` نوشته می‌شود؛ دو `innerHTML` باقی‌مانده رشتهٔ ثابت‌اند → سطح حمله بسته.
- **زنجیرهٔ تأمین:** نسخهٔ سنجاق‌شده + SRI + `crossorigin` برای فالبک CDN.
- **CSP:** روی هر چهار صفحه با `frame-src` صحیح؛ دو صفحهٔ اصلی بدون هیچ `unsafe-*`؛ در سمت سرور نیز هم‌راستا شده.
- **باگ بحرانی دور قبل بسته شد:** پس از حذف `add_header`های زائد از بلوک‌های `location`، هدرهای امنیتی سطح `server` دوباره به همهٔ پاسخ‌ها به ارث می‌رسند (با پارس ساختاری تأیید شد: **صفر** `add_header` داخل `location`).
- `server_tokens off`, COOP, CORP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` همگی موجودند.
- کانتینر با کاربر بدون‌امتیاز اجرا می‌شود.

**هیچ آسیب‌پذیری فعال جدیدی در این دور یافت نشد.** تنها محدودیت باقی‌مانده، بی‌اثر بودن `frame-ancestors` در متا-CSP روی GitHub Pages است که در README به‌عنوان محدودیت پذیرفته‌شده مستند شده و راه‌حل جایگزین (frame-busting) اور-انجینیرینگ است.

---

## ۴. ارزیابی سئو، عملکرد و تجربه کاربری (SEO, Performance & UX)

**تأیید می‌شود — بدون نیاز به تغییر:**
- سئوی تکنیکال کامل: `robots.txt`، `sitemap.xml` با `<lastmod>` تزریقی، canonical/OG/theme-color در همهٔ صفحات، ۴۰۴ با `noindex`، `<h1>` در هر سه صفحهٔ اصلی، landmarkهای صحیح، لینک واقعی برای خروج از اسپلش.
- WebP + `loading="lazy"` روی هر ۱۰ کارت، فونت محلی با `swap`، انیمیشن‌های rAF روی `transform/opacity`، احترام به `prefers-reduced-motion` → **INP سالم**.

**شکاف واقعی و قابل‌اندازه‌گیری (CLS/LCP):** هیچ تصویری صفت `width`/`height` ندارد و سه تصویر کلیدی، ابعادشان از CSS قابل استنتاج نیست، پس مرورگر تا لحظهٔ دانلود فضایی رزرو نمی‌کند:
| تصویر | ابعاد ذاتی | قاعدهٔ CSS | ریسک |
|---|---|---|---|
| `images/logo/title.webp` (اسپلش، عنصر LCP) | 800×685 | `width:clamp(...); height:auto` | پرش عمودی در بالای صفحهٔ ورودی |
| `images/logo/cards-page-title-*.webp` (سربرگ کارت‌ها، عنصر LCP) | دسکتاپ 2000×280 / موبایل 2000×500 | `width:100%; height:auto` | پرش سربرگ؛ دو نسبت‌تصویر متفاوت در `<picture>` |
| `images/logo/{enamad,samandehi,shaparak}.webp` | 500×425 / 500×444 / 500×340 | `height:46px` (عرض auto) | پرش افقی ردیف نمادهای اعتماد |
سایر تصاویر (کارت‌ها با `object-fit:cover` در قاب ثابت، آیکون‌های ۲۴×۲۴) **مشکلی ندارند و نباید تغییر کنند**. همچنین دو تصویر LCP فاقد `fetchpriority="high"` هستند.

---

## ۵. ارزیابی استقرار و اتوماسیون (Deployment & CI/CD Readiness)

**تأیید می‌شود — بدون نیاز به تغییر:**
- `Dockerfile` (چندمرحله‌ای، unprivileged، HEALTHCHECK)، `docker-compose.yml`، `.dockerignore`، `.env.example` و `nginx.conf` (MIME صحیح `.mjs`، سیاست کش ریشه، هدرهای موروثی) کامل‌اند.
- ورک‌فلو: اعتبارسنجی روی PR، دیپلوی روی push به `7.0`، مجوز per-job، `concurrency` صحیح.
- `npm start` اکنون یک مسیر اجرای محلی واقعی است (build + serve با پیش‌فرض localhost).

**شکاف‌ها:**
1. **[مستندات — واقعی] راهنمای «اجرای محلی» در README غلط است:** خط ۱۲۰ می‌گوید «فایل `index.html` را در مرورگر باز کنید». با `file://` ماژول‌های ES (به‌دلیل CORS) و توکن‌های `__SITE_ORIGIN__` جایگزین‌نشده، صفحه درست کار نمی‌کند. باید به `npm start` ارجاع دهد.
2. **[عملیاتی] کامیت `d1dccf7`** (مجوزهای per-job ورک‌فلو) همچنان پوش‌نشده است؛ گیت‌هاب بدون دسترسی `workflows` آن را رد می‌کند. تاریخچه طوری چیده شده که با یک `git push` پس از اتصال مجدد منتشر شود.
3. **[عملیاتی] نسخهٔ منتشرشده روی Pages هنوز `6.7.8` است** (بازبینی زندهٔ سایت) در حالی که مخزن روی `7.0.0` است؛ هیچ‌یک از بهبودهای چهار دور اخیر روی سایت عمومی دیده نمی‌شود.
4. **[بهداشت مخزن — جزئی]** پنج فایل `ANALYSIS*.md` (~۷۵KB) در ریشه انباشته شده‌اند و ریشه را شلوغ می‌کنند.

---

## ۶. امتیازدهی کمی (Scoring)

| شاخص | امتیاز | روند |
|---|---|---|
| کیفیت کد و معماری وب | **8.5/10** | = |
| امنیت وب و API | **9.0/10** | ↑ از 8.0 (باگ ارث‌بری هدر و MIME ماژول بسته شد) |
| سئو و عملکرد (Performance) | **8.5/10** | = (سئو کامل؛ CLS تصاویر باز است) |
| مستندات | **8.5/10** | ↓ از 9.0 (راهنمای اجرای محلی نادرست) |
| قابلیت توسعه (Scalability) | **7.5/10** | = |
| آمادگی استقرار (Deployment/CI-CD) | **8.5/10** | ↑ از 8.0 |
| **میانگین کل** | **8.4/10** | ↑ از 8.25 |

---

## ۷. طرح اجرایی (Action Plan for Prompt 2)

قالب ماشین‌خوان: `[ID] <ACTION> <PATH> :: <CHANGE> :: <REASON> :: <PRIORITY>`
اقدام‌ها: `MODIFY` | `CREATE` | `MOVE` | `OPS` — اولویت: `P1` | `P2` | `P3`

```
[C1] MODIFY index.html :: افزودن width="800" height="685" و fetchpriority="high" به <img class="title-banner"> :: تصویر LCP بدون ابعاد ذاتی است و تا پایان دانلود فضایی رزرو نمی‌شود (CLS) :: P1
[C2] MODIFY cards-form.html :: افزودن width="2000" height="500" به <source> موبایل و width="2000" height="280" + fetchpriority="high" به <img> دسکتاپ در .title-picture :: دو نسبت‌تصویر متفاوت در <picture> بدون ابعاد، سربرگ LCP را جابه‌جا می‌کند :: P1
[C3] MODIFY payment-form.html :: افزودن ابعاد ذاتی به سه نماد اعتماد — enamad width="500" height="425"، samandehi width="500" height="444"، shaparak width="500" height="340" :: قاعدهٔ height:46px با عرض auto تا لحظهٔ دانلود، ردیف را افقی می‌پراند :: P2
[C4] MODIFY cards-scripts.js :: در openMenuAt پس از نمایش منو: افزودن role="menu" به ظرف، انتقال فوکوس به اولین آیتم، پیمایش با ArrowUp/ArrowDown/Home/End و حلقهٔ Tab داخل منو، و بازگرداندن فوکوس به کارت هنگام بستن (بازاستفاده از الگوی rovingFocus موجود در payment-scripts.js) :: منوی کارت‌ها به انتهای body تزریق می‌شود و کاربر کیبورد پس از Enter هیچ مسیر معقولی به آیتم‌ها ندارد :: P2
[C5] MODIFY README.md :: جایگزینی بند «اجرای محلی» (خطوط ~۱۱۸-۱۲۳) با دستور npm start و حذف توصیهٔ باز کردن مستقیم index.html :: با file:// ماژول‌های ES و جایگزینی __SITE_ORIGIN__ کار نمی‌کنند و راهنما گمراه‌کننده است :: P1
[C6] MODIFY scripts/validate-site.mjs :: افزودن گارد «هر فایل HTML باید یک <meta http-equiv="Content-Security-Policy"> داشته باشد» به assertCspSafety :: جلوگیری از افزودن صفحهٔ جدید بدون CSP در آینده :: P3
[C7] MOVE ANALYSIS.md, ANALYSIS-v2.md, ANALYSIS-v3.md, ANALYSIS-v4.md, ANALYSIS-v5.md -> docs/audits/ :: انتقال گزارش‌های تحلیل به یک پوشهٔ اختصاصی و افزودن لینک از README :: ریشهٔ مخزن با ۷۵KB گزارش انباشته شده است :: P3
[C8] OPS git push origin arena/01a02d5e-basij-tamin :: پوش کامیت d1dccf7 پس از اتصال مجدد GitHub با دسترسی workflows :: اصلاح مجوزهای ورک‌فلو هنوز روی ریموت نیست :: P1 (نیازمند اقدام کاربر)
[C9] OPS merge arena/01a02d5e-basij-tamin -> 7.0 (یا workflow_dispatch) :: انتشار نسخهٔ 7.0.0 روی GitHub Pages :: سایت عمومی هنوز 6.7.8 را سرو می‌کند و هیچ‌یک از بهبودها به کاربر نرسیده است :: P1 (نیازمند اقدام کاربر)
```

### فایل‌هایی که تأیید شده‌اند و **نباید** تغییر کنند
`payment-scripts.js` • `src/js/utils.js` • `src/js/data.js` • `src/js/clarity.js` • `src/js/splash.js` • `src/js/dotlottie-fallback.js` • `src/css/fonts.css` • `cards-styles.css` • `payment-styles.css` • `404.html` • `nginx.conf` • `Dockerfile` • `docker-compose.yml` • `.dockerignore` • `.gitignore` • `.gitattributes` • `.env.example` • `package.json` • `scripts/prepare-site.mjs` • `robots.txt` • `sitemap.xml` • `LICENSE` • `.github/workflows/pages.yml`
