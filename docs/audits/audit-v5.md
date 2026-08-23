# گزارش تحلیل موشکافانه — دور پنجم (Audit v5)

- تاریخ: ۲۰۲۶-۰۸-۲۳ • شاخه: `arena/01a02d5e-basij-tamin` • HEAD محلی: `3a9747d` • HEAD ریموت: `d7b6e97`
- روش: بازخوانی کامل سورس + اجرای واقعی `npm run build && npm run validate` + سرویس محلی و بررسی هدرها + راستی‌آزمایی مستندات رسمی nginx و Microsoft Clarity
- وضعیت پایپ‌لاین: **سبز** — `Prepared static site ...` و `Static-site reference validation passed.`
- حجم منبع: ۱٫۹ مگابایت / ۷۳ فایل (پس از هرس وندور در دور قبل) • خروجی `site/`: ۲٫۱ مگابایت

---

## ۱. تحلیل معماری و ساختار (Web Architecture & Structure)

**تأیید می‌شود — بدون نیاز به تغییر:**
- معماری MPA استاتیک سه‌صفحه‌ای + ۴۰۴؛ بدون بک‌اند، بدون API، بدون دیتابیس. تنگنای رندرینگ SSR/CSR/SSG وجود ندارد چون HTML از پیش رندر شده و JS صرفاً لایهٔ بهبود تدریجی است.
- جداسازی لایه‌ها پس از دور قبل کامل‌تر شده: `src/js/` اکنون شامل `utils` (ابزار مشترک) ، `data` (SSOT)، `clarity` (تحلیل)، `splash` (منطق صفحهٔ ورودی) و `dotlottie-fallback` (زنجیرهٔ تأمین) است — هر فایل یک مسئولیت.
- مدیریت State سه‌سطحی (URL `?cause=` ، `safeStorage` ، حافظهٔ درون‌صفحه) منسجم و کافی است.
- **آنتی‌پترن‌های دورهای قبل رفع شده‌اند:** بن‌بست خزنده در صفحهٔ ریشه (لینک واقعی `<a>` جایگزین شد)، نشت شنوندهٔ سراسری، عدم آزادسازی `ResizeObserver` و کد مردهٔ `CustomEvent` — همگی راستی‌آزمایی شد و دیگر وجود ندارند.
- ارجاع همهٔ تصاویر بررسی شد: **هیچ دارایی بلااستفاده‌ای در `images/` باقی نمانده است.**

**نکتهٔ باقی‌مانده (طراحی، نه نقص):** `src/js/data.js` (۲۰KB خام / ۶٫۵KB gzip) شامل داده‌های استان/شهر است و در `cards-form.html` هم بارگذاری می‌شود در حالی که آن صفحه فقط `NIAT_CARDS` را لازم دارد. صرفه‌جویی واقعی ≈ ۴KB gzip در برابر شکستن SSOT و پیچیده‌کردن ترتیب بارگذاری → **توصیه: تغییر داده نشود (اور-انجینیرینگ).**

---

## ۲. بررسی کیفیت کد و استانداردهای وب (Code Quality & Web Standards)

**تأیید می‌شود — بدون نیاز به تغییر:**
- `node --check` روی هر ۹ فایل JS سبز است؛ `safeStorage` و `normalizeMobile` با تست واحد دستی راستی‌آزمایی شدند (خروجی `normalizeMobile` با پیاده‌سازی قبلی **دقیقاً یکسان** است → بدون Breaking Change).
- DRY: تکرار منطق موبایل حذف شد. KISS: بدون فریم‌ورک/باندلر/وابستگی. نام‌گذاری و کامنت دوزبانه یکدست.
- بررسی خودکار: **صفر** هندلر اینلاین `on*=`، **صفر** صفت `style="`، **صفر** بلوک `<script>` اینلاین در هر چهار صفحه. دستکاری استایل در JS از طریق CSSOM (`el.style`) انجام می‌شود که طبق مشخصات CSP مشمول `style-src` نیست و امن است.
- هم‌پوشانی دو شیت CSS بررسی شد: تنها ۴ بلوک بدیهی (`*`, `html,body`) مشترک است → **استخراج فایل مشترک ارزش ندارد.**
- حجم‌ها: بزرگ‌ترین فایل JS ۲۹KB خام / **۷٫۹KB با gzip**؛ CSSها ۴٫۲–۴٫۶KB با gzip → **افزودن مرحلهٔ Minify توجیه فنی ندارد** (gzip در nginx فعال و در Pages پیش‌فرض است).

**بدهی‌های واقعی ولی کم‌اهمیت:**
1. `payment-scripts.js` همچنان یک کلوژر ~۵۳۰ خطی با پیچیدگی شناختی بالا در `createIntentRow()` است. **توصیهٔ ثابت: ریفکتور کلی انجام نشود** (ریسک رگرسیون بالا، سود کم).
2. `payment-form.html:96` یک `<label for="donation-notes"></label>` **خالی** دارد (متن برچسب صفر است؛ فیلد از طریق `aria-label` نام‌گذاری شده). HTML نامعتبر نیست ولی برچسب پوچ باید حذف یا پر شود.
3. ترتیب عناوین در `payment-form.html`: از `h1` مستقیم به `h3` (عنوان مودال) پرش می‌کند.

---

## ۳. بررسی امنیت وب و شبکه (Web Security & Network)

**تأیید می‌شود — بدون نیاز به تغییر:**
- **SQLi / IDOR / CSRF / احراز هویت (JWT/Session) / CORS: موضوعیت ندارد** — نه بک‌اندی هست، نه کوکی، نه توکن، نه درخواست حالت‌تغییردهنده. افزودن هر لایهٔ Auth یا CSRF-token خطای مهندسی است.
- **XSS:** تنها ورودی خارجی `?cause=` است و صرفاً با `textContent` نوشته می‌شود؛ دو `innerHTML` باقی‌مانده رشتهٔ ثابت‌اند. سطح حمله بسته است.
- زنجیرهٔ تأمین: فالبک CDN با نسخهٔ سنجاق‌شده `2.7.12` + SRI (`sha384`) + `crossorigin` — استاندارد.
- متا-CSP روی هر ۴ صفحه اعمال شده؛ `cards-form.html` و `payment-form.html` بدون هیچ `unsafe-*` هستند و `scripts/validate-site.mjs` این وضعیت را در CI **گارد** می‌کند (با تست منفی اثبات شد).

**آسیب‌پذیری‌های واقعی کشف‌شده در این دور:**

1. **[بحرانی برای مسیر خود-میزبانی] بلعیده‌شدن هدرهای امنیتی در `nginx.conf`.**
   مستندات رسمی nginx: «`add_header` تنها و تنها زمانی از سطح بالاتر به ارث می‌رسد که در سطح جاری **هیچ** `add_header` تعریف نشده باشد». در پیکربندی فعلی، هر سه بلوک `location` یک `add_header Cache-Control` دارند؛ در نتیجه پاسخ‌های `\.(html|xml|txt)$` و همهٔ دارایی‌های ایستا **هیچ‌کدام** از هدرهای `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, `CORP` را دریافت نمی‌کنند. عملاً همهٔ سخت‌سازی سطح `server` برای صفحات HTML **بی‌اثر** است.
   نکتهٔ ظریف: چون `expires 30d;` و `expires -1;` خودشان `Cache-Control` صحیح تولید می‌کنند، سه خط `add_header Cache-Control` **زائد** هستند و حذفشان هم باگ را رفع می‌کند و هم رفتار کش را حفظ می‌کند.

2. **[مهم] نبود `frame-src`/`child-src` برای Clarity در CSP.** طبق مستند رسمی مایکروسافت، Clarity علاوه بر `script-src` و `connect-src` به **`child-src https://www.clarity.ms`** نیاز دارد. در CSP فعلی `frame-src` تعریف نشده و به `default-src 'self'` سقوط می‌کند → فریم همگام‌سازی Clarity مسدود می‌شود. (اثر: افت داده‌های تحلیلی، نه شکست کارکرد سایت.)

3. **[محدودیت مستندشدنی، نه باگ کد] `frame-ancestors` در متا-CSP بی‌اثر است.** طبق CSP Level 3، دستورهای `frame-ancestors`, `sandbox` و `report-uri` هنگام تحویل از طریق `<meta>` نادیده گرفته می‌شوند. چون GitHub Pages هدر سفارشی نمی‌پذیرد، **در مسیر Pages محافظت Clickjacking وجود ندارد**؛ در مسیر Nginx با `X-Frame-Options`/`frame-ancestors` تأمین می‌شود (مشروط به رفع بند ۱). باید در README به‌عنوان محدودیت پذیرفته‌شده ثبت شود؛ راه‌حل جایگزین (frame-busting با JS) اور-انجینیرینگ است.

---

## ۴. ارزیابی سئو، عملکرد و تجربه کاربری (SEO, Performance & UX)

**تأیید می‌شود — بدون نیاز به تغییر:**
- `robots.txt`، `sitemap.xml` با `<lastmod>` تزریق‌شده در بیلد، `canonical`/`og:*`/`theme-color` در همهٔ صفحات، ۴۰۴ با `noindex`، favicon، `preconnect` — چرخهٔ سئوی تکنیکال کامل است.
- `<h1>` اکنون در هر سه صفحهٔ اصلی وجود دارد و landmark `<main>` در صفحهٔ کارت‌ها اصلاح شده.
- WebP + `loading="lazy"`، فونت محلی با `font-display: swap`، انیمیشن‌های `transform/opacity` روی rAF، سقف نود، احترام به `prefers-reduced-motion` → **CLS و INP کنترل‌شده‌اند.**
- LCP: پس از هرس ۱٫۳ مگابایتی وندور، مسیر بحرانی صفحهٔ ورودی به پلیر (۳۸KB) + رندرر svg (۲۴۵KB) محدود شده و این حداقلِ لازم برای انیمیشن فعلی است.
- بارگذاری هر سه فایل JS صفحهٔ فرم در انتهای `body` و تحلیل با `defer` → بدون بلوک رندر.

**نکتهٔ عملیاتی واقعی:** نسخهٔ منتشرشده روی `https://mahdi-arts.github.io/Basij-Tamin/` هنوز **۶٫۷٫۸** است؛ یعنی شاخهٔ `7.0` تاکنون از طریق ورک‌فلو منتشر نشده. این یک شکاف *استقرار* است (بند ۵)، نه نقص کد.

---

## ۵. ارزیابی استقرار و اتوماسیون (Deployment & CI/CD Readiness)

**تأیید می‌شود — بدون نیاز به تغییر:**
- `Dockerfile` چندمرحله‌ای با ایمیج **بدون‌امتیاز** `nginxinc/nginx-unprivileged:1.27-alpine` و `HEALTHCHECK`؛ `docker-compose.yml` با اجبار `SITE_ORIGIN`؛ `.dockerignore` و `.env.example` دقیق.
- ورک‌فلو: اعتبارسنجی روی PR، دیپلوی فقط روی push به `7.0`، مجوزها per-job با اصل کمینهٔ دسترسی، `concurrency` صحیح.
- `npm run build` در نبود `SITE_ORIGIN` به‌درستی fail می‌شود و `npm run validate` هم ارجاعات و هم گارد CSP را می‌سنجد.

**شکاف‌های واقعی:**
1. **[بحرانی برای خود-میزبانی] نبود نوع MIME برای `.mjs` در nginx.** فایل رسمی `conf/mime.types` نسخهٔ 1.27 هیچ ورودی‌ای برای `mjs` ندارد (راستی‌آزمایی شد) → پاسخ با `application/octet-stream` ارسال می‌شود و مرورگر به‌دلیل بررسی سخت‌گیرانهٔ MIME برای ماژول‌ها، `assets/vendor/dotlottie-player.mjs` را **اجرا نمی‌کند**. نتیجه: در ایمیج داکر، پلیر محلی همیشه شکست می‌خورد و به‌صورت خاموش از CDN بارگذاری می‌شود (یعنی خود-میزبانی عملاً به اینترنت وابسته می‌شود). سرور محلی پایتون این مشکل را ندارد (`text/javascript`) و به همین دلیل در تست‌های قبلی دیده نشده بود.
2. **[عملیاتی] کامیت `3a9747d` (اصلاح مجوزهای ورک‌فلو) روی ریموت نیست.** پوش آن با خطای `refusing to allow a GitHub App to create or update workflow ... without workflows permission` رد شد. تا زمان اتصال مجدد GitHub با دسترسی `workflows`، ریموت نسخهٔ قدیمی ورک‌فلو را دارد.
3. **[جزئی] آدرس ریشه (`/`) از قاعدهٔ کش HTML جا می‌ماند:** الگوی `location ~* \.(html|xml|txt)$` با URI برابر `/` مطابقت نمی‌کند، بنابراین سند اصلی بدون `Cache-Control` سرو می‌شود.
4. **[جزئی/DX] `npm start` فقط یک پیام چاپ می‌کند** و دستور اجرای محلی واقعی ندارد.

---

## ۶. امتیازدهی کمی (Scoring)

| شاخص | امتیاز | روند |
|---|---|---|
| کیفیت کد و معماری وب | **8.5/10** | ↑ از 8.0 |
| امنیت وب و API | **8.0/10** | ↑ از 7.5 (متا-CSP و گارد CI افزوده شد، ولی باگ ارث‌بری هدر در nginx کشف شد) |
| سئو و عملکرد (Performance) | **8.5/10** | ↑ از 7.5 |
| مستندات | **9.0/10** | = |
| قابلیت توسعه (Scalability) | **7.5/10** | = |
| آمادگی استقرار (Deployment/CI-CD) | **8.0/10** | ↓ از 8.5 (MIME ماژول + ورک‌فلوی پوش‌نشده) |
| **میانگین کل** | **8.25/10** | ↑ از 8.0 |

---

## ۷. طرح اجرایی (Action Plan for Prompt 2)

قالب ماشین‌خوان: `[ID] <ACTION> <PATH> :: <CHANGE> :: <REASON> :: <PRIORITY>`
اقدام‌ها: `MODIFY` | `CREATE` | `OPS` — اولویت: `P1` (ضروری) | `P2` (مهم) | `P3` (اختیاری)

```
[B1] MODIFY nginx.conf :: حذف هر سه خط «add_header Cache-Control ...» از داخل بلوک‌های location (دستور expires همان مقدار را تولید می‌کند) :: طبق مستند رسمی nginx وجود add_header در سطح location، ارث‌بری تمام هدرهای امنیتی سطح server را قطع می‌کند و CSP/XFO/nosniff روی صفحات HTML اعمال نمی‌شود :: P1
[B2] MODIFY nginx.conf :: افزودن بلوک «types { application/javascript mjs; }» در سطح server :: mime.types نسخهٔ 1.27 فاقد ورودی mjs است و ماژول dotlottie-player.mjs با application/octet-stream توسط مرورگر رد می‌شود و خود-میزبانی خاموشانه به CDN وابسته می‌گردد :: P1
[B3] MODIFY nginx.conf :: افزودن «location = / { expires -1; try_files /index.html =404; }» پیش از location / :: آدرس ریشه با الگوی \.(html|xml|txt)$ مطابقت نمی‌کند و بدون سیاست کش سرو می‌شود :: P2
[B4] MODIFY index.html, cards-form.html, payment-form.html, 404.html :: افزودن «frame-src https://*.clarity.ms» (و در 404 صرفاً frame-src 'none') به متا-CSP :: مستند رسمی مایکروسافت child-src/frame-src را برای Clarity لازم می‌داند؛ اکنون به default-src 'self' سقوط کرده و فریم Clarity مسدود می‌شود :: P2
[B5] MODIFY nginx.conf :: افزودن «frame-src https://*.clarity.ms» به هدر Content-Security-Policy برای هم‌راستایی با متا-CSP صفحات :: جلوگیری از واگرایی سیاست بین مسیر Pages و مسیر خود-میزبانی :: P2
[B6] MODIFY payment-form.html :: حذف عنصر خالی <label for="donation-notes"></label> (نام‌گذاری فیلد از طریق aria-label حفظ می‌شود) یا جایگزینی آن با برچسب بصری‌پنهان «توضیحات اختیاری» :: برچسب پوچ، نویز برای صفحه‌خوان و ابزارهای اعتبارسنجی است :: P3
[B7] MODIFY payment-form.html :: تبدیل <h3 id="thank-title"> به <h2 id="thank-title"> (بدون تغییر CSS اگر سلکتور آیدی است؛ در غیر این صورت افزودن سلکتور معادل در payment-styles.css) :: رفع پرش سطح عنوان از h1 به h3 :: P3
[B8] MODIFY package.json :: جایگزینی اسکریپت start با «node --run build && python3 -m http.server 8080 --directory site» یا معادل بدون وابستگی :: اسکریپت فعلی فقط یک پیام چاپ می‌کند و مسیر اجرای محلی را خودکار نمی‌کند :: P3
[B9] MODIFY README.md :: افزودن یک بند به بخش CSP: «frame-ancestors در متا-CSP طبق CSP L3 نادیده گرفته می‌شود؛ محافظت Clickjacking فقط در مسیر Nginx فعال است» :: ثبت شفاف محدودیت پذیرفته‌شدهٔ GitHub Pages :: P3
[B10] OPS git push origin arena/01a02d5e-basij-tamin :: پوش کامیت محلی 3a9747d پس از اتصال مجدد GitHub با دسترسی workflows :: اصلاح مجوزهای per-job ورک‌فلو هنوز روی ریموت اعمال نشده است :: P1 (نیازمند اقدام کاربر)
[B11] OPS GitHub → Pages :: اجرای دستی workflow_dispatch روی شاخهٔ 7.0 (یا merge شاخهٔ کاری به 7.0) :: نسخهٔ منتشرشدهٔ فعلی روی Pages هنوز 6.7.8 است در حالی که مخزن روی 7.0.0 قرار دارد :: P2 (نیازمند اقدام کاربر)
```

### فایل‌هایی که تأیید شده‌اند و **نباید** تغییر کنند
`index.html` (به‌جز B4) • `cards-form.html` (به‌جز B4) • `cards-scripts.js` • `payment-scripts.js` • `src/js/utils.js` • `src/js/data.js` • `src/js/clarity.js` • `src/js/splash.js` • `src/js/dotlottie-fallback.js` • `src/css/fonts.css` • `cards-styles.css` • `payment-styles.css` • `scripts/prepare-site.mjs` • `scripts/validate-site.mjs` • `Dockerfile` • `docker-compose.yml` • `.dockerignore` • `.gitignore` • `.gitattributes` • `.env.example` • `robots.txt` • `sitemap.xml` • `LICENSE` • `.github/workflows/pages.yml` (محتوای محلی صحیح است؛ فقط پوش لازم دارد)
