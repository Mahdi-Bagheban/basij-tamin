# تحلیل موشکافانه مخزن `Mahdi-Arts/Basij-Tamin` — دور هفتم (ANALYSIS v7)

> بسم الله الرحمن الرحیم
>
> دامنهٔ بررسی: شاخهٔ `arena/01a02d5e-basij-tamin` (منشعب از `7.0`)، نسخهٔ `7.0.0`، آخرین کامیت محلی `e0e0b8c`.
> این گزارش پس از اجرای کامل طرح‌های `A*`, `B*` و `C*` (دورهای ۱ تا ۶) تهیه شده و **فقط مشکلات تأییدشده و قابل بازتولید** را فهرست می‌کند.

---

## ۱. تحلیل معماری و ساختار (Web Architecture & Structure)

### ۱-۱. تصویر کلی

پروژه یک **سایت کاملاً ایستا (Static / Pre-rendered)** بدون بک‌اند است: سه صفحهٔ HTML اصلی (`index.html` اسپلش، `cards-form.html` انتخاب نیت، `payment-form.html` ثبت نیت) به‌همراه `404.html`، لایهٔ اشتراکی `src/js/*` و `src/css/fonts.css`، و یک خط لولهٔ ساخت بدون وابستگی (`scripts/prepare-site.mjs` + `scripts/validate-site.mjs`).

| محور | وضعیت | داوری |
|---|---|---|
| جداسازی Frontend/Backend | بک‌اندی وجود ندارد؛ فرم صرفاً «اعلام نیت» است و هیچ تراکنشی ارسال نمی‌شود | ✅ منطبق با دامنهٔ مسئله — **نیازی به تغییر نیست** |
| مدل رندرینگ | SSG خالص (HTML از پیش نوشته‌شده) + هیدراسیون سبک با JS معمولی | ✅ بهترین انتخاب برای LCP در این ابعاد — **نیازی به تغییر نیست** |
| مدیریت State | حالت‌های محلی داخل کلوژر هر صفحه + `safeStorage` برای دو ترجیح کاربر (`cardViewMode`, `dayNightMode`) | ✅ ساده و کافی؛ افزودن Store یا فریم‌ورک = اور-انجینیرینگ |
| منبع واحد داده | `src/js/data.js` تنها منبع نیات و استان/شهر است و `data-card` فقط اندیس می‌دهد | ✅ الگوی درست (Single Source of Truth) |
| توکن‌گذاری مبدأ | `__SITE_ORIGIN__` / `__BUILD_DATE__` در زمان ساخت جایگزین می‌شود و ساخت در صورت باقی‌ماندن توکن fail می‌کند | ✅ الگوی محکم |
| معماری API | ندارد | ✅ موضوعیت ندارد |

### ۱-۲. Anti-pattern های تأییدشده

**A‑1 — بارگذاری دادهٔ بی‌مصرف در صفحهٔ کارت‌ها (تنگنای واقعی).**
`cards-form.html` فایل `src/js/data.js` را به‌طور کامل بارگذاری می‌کند، در حالی که تنها به `window.NIAT_CARDS` نیاز دارد. اندازه‌گیری واقعی:

```
src/js/data.js            = 19,949 B  (gzip ≈ 6,531 B)
  └─ PROVINCES_CITIES_RAW = 13,797 B  (≈ ۶۹٪ فایل)  ← در صفحهٔ کارت‌ها هرگز استفاده نمی‌شود
  └─ NIAT_CARDS_RAW       =  2,571 B
```

بدتر از حجم، **هزینهٔ اجرا** است: بلوک `try` انتهایی فایل روی هر دو صفحه `buildProvinceCities()` را صدا می‌زند که یک `Intl.Collator` می‌سازد، ~۱۵۰۰ نام شهر را `toFaChars` و `uniq` و `sort` می‌کند و سپس `deepFreeze` بازگشتی روی کل ساختار اجرا می‌کند — همهٔ این‌ها در مسیر بحرانی صفحهٔ کارت‌ها و بدون هیچ مصرفی. این مستقیماً روی TBT/INP اثر دارد.

**A‑2 — نشت شنونده رویداد در `payment-scripts.js` (باگ واقعی).**
در `openPanel()` (خط ۲۵۱) و `openAmount()` (خط ۲۹۶) هر بار که پنل باز می‌شود یک شنوندهٔ تازهٔ `keydown` روی **همان گره** ثبت می‌شود و هرگز حذف نمی‌گردد:

```js
panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { … } });
```

پس از n بار باز/بستن، n شنونده روی پنل انباشته می‌شود و یک `Escape` واحد n بار `preventDefault()` و `closePanel()` را اجرا می‌کند. شنوندهٔ `pointerdown` در همان توابع به‌درستی حذف می‌شود؛ فقط `keydown` جا مانده است.

### ۱-۳. مواردی که بررسی شد و **درست است**

- `cards-scripts.js` و `payment-scripts.js` هر دو در یک IIFE داخل `DOMContentLoaded` محصور شده‌اند؛ نشت به فضای سراسری ندارند.
- الگوی «مؤلفه‌ای بدون فریم‌ورک»: `LogoRain` و `PigeonGlide` کلاس‌های مستقل با چرخهٔ عمر `start/stop` و پاک‌سازی نود هستند. ✅
- `derivePaymentUrls` نشانی پرداخت را از درخت مشتق می‌کند؛ داده و مسیر هم‌گام می‌مانند (DRY). ✅
- `scripts/prepare-site.mjs` فهرست `requiredPaths` را قبل از کپی اعتبارسنجی می‌کند و خروجی را از صفر می‌سازد. ✅
- تقسیم‌بندی فایل‌ها (`src/js`, `src/css`, `scripts`, `docs/audits`, `assets/vendor`) شفاف و قابل‌پیش‌بینی است. ✅

---

## ۲. کیفیت کد و استانداردهای وب (Code Quality & Web Standards)

### ۲-۱. ارزیابی اصول

| اصل | مشاهده | داوری |
|---|---|---|
| **KISS** | بدون فریم‌ورک، بدون باندلر، بدون وابستگی npm؛ `package.json` سه اسکریپت دارد | ✅ نمونهٔ خوب |
| **DRY** | `utils.js` و `data.js` بین صفحات مشترک‌اند؛ `derivePaymentUrls` از تکرار URL جلوگیری می‌کند | ✅ با یک استثنا (زیر) |
| **DRY — نقض جزئی و واقعی** | `new Intl.Collator('fa', …)` سه بار ساخته می‌شود: یک‌بار در `buildProvinceCities` و **در هر فراخوانی** `getCitiesOf` (`src/js/data.js` خط ۱۴۹) | ⚠️ اصلاح کوچک لازم است |
| **SOLID / SRP** | `data.js` امروز دو دامنهٔ کاملاً مستقل (جغرافیا + نیات) را حمل می‌کند | ⚠️ نقض SRP، هم‌راستا با A‑1 |
| **Cognitive Complexity** | بلندترین تابع `createIntentRow` (~۱۳۰ خط) است اما به توابع تودرتوی کوچک و نام‌دار شکسته شده؛ بقیهٔ توابع زیر ۳۰ خط‌اند | ✅ قابل قبول |
| **نام‌گذاری** | `camelCase` برای توابع، `SCREAMING_SNAKE` برای ثابت‌های داده، `PascalCase` برای کلاس‌ها | ✅ یکدست |
| **مستندسازی** | داک‌استرینگ دوزبانه (فارسی، خط تیره، انگلیسی) روی ماژول‌ها و توابع کلیدی؛ کامنت‌های درون‌خطی کوتاه و انگلیسی | ✅ منطبق با قرارداد پروژه |

### ۲-۲. آنچه بررسی شد و **نیاز به تغییر ندارد**

- `payment-scripts.js`: تلهٔ فوکوس مودال (خطوط ۵۱۸–۵۳۲)، `rovingFocus` استاندارد WAI‑ARIA، بازگرداندن فوکوس با `lastFocusedElement`، و `ro.disconnect()` پیش از حذف ردیف — همگی صحیح‌اند.
- `cards-scripts.js`: قرارداد a11y منو (`role="menu"`/`menuitem`، `aria-haspopup`، `aria-expanded`، roving focus، مهار Tab، بازگشت فوکوس با `Escape`) در دور ششم پیاده و تست شد؛ حتی تلهٔ `resize → closeMenus(Event)` هم با wrapper پوشش داده شده است. ✅
- `safeStorage` تمام دسترسی‌های `localStorage` را در `try/catch` پیچیده است (حالت ناشناس / storage مسدود). ✅
- `normalizeMobile`, `toEnDigits`, `toFaChars`, `deepFreeze` توابع خالص و تست‌پذیرند. ✅
- استفاده از `innerHTML` در `payment-scripts.js` (خطوط ۳۴، ۲۱۳، ۲۱۶، ۲۶۷) فقط با **رشته‌های ثابت نویسنده‌نوشته** است؛ هیچ ورودی کاربر یا داده‌ای در آن‌ها درون‌یابی نمی‌شود. ✅ **آسیب‌پذیر نیست و نباید تغییر کند.**
- `src/js/dotlottie-fallback.js`: import محلی، سپس CDN سنجاق‌شده با `integrity` + `crossorigin`. ✅ الگوی درست زنجیرهٔ تأمین.

---

## ۳. امنیت وب و شبکه (Web Security & Network)

### ۳-۱. OWASP Top 10 — نگاشت بر سطح حملهٔ واقعی پروژه

| ریسک | وضعیت |
|---|---|
| **A03 – Injection / XSS** | تمام محتوای پویا با `textContent` یا `createElement` تزریق می‌شود؛ `innerHTML`ها ثابت‌اند؛ هیچ `eval`/`new Function`/`document.write` وجود ندارد. پارامتر `?cause=` تنها به‌عنوان متن نمایش داده می‌شود. ✅ **بدون یافته** |
| **SQL Injection** | پایگاه‌داده و بک‌اند وجود ندارد. ✅ موضوعیت ندارد |
| **A01 – Broken Access Control / IDOR** | نقطهٔ پایانی سمت سرور و شناسهٔ منبعی وجود ندارد. ✅ موضوعیت ندارد |
| **CSRF** | فرم `submit` را `preventDefault` می‌کند و هیچ درخواست تغییردهنده‌ای ارسال نمی‌شود؛ `form-action 'self'` هم اعمال شده. ✅ **بدون یافته** |
| **احراز هویت (JWT/Session)** | وجود ندارد؛ هیچ توکن یا کوکی‌ای صادر/ذخیره نمی‌شود. ✅ موضوعیت ندارد |
| **A02 – Cryptographic Failures** | داده‌ای منتقل یا ذخیره نمی‌شود؛ `localStorage` تنها دو ترجیح UI غیرحساس نگه می‌دارد. ✅ |
| **A08 – Software & Data Integrity** | تنها منبع شخص‌ثالث اجرایی، فالبک jsDelivr است که با نسخهٔ سنجاق‌شده + SRI بارگذاری می‌شود. ✅ |
| **A05 – Security Misconfiguration** | CSP روی هر چهار صفحه از طریق `<meta>` و در `nginx.conf` از طریق هدر واقعی اعمال شده؛ `validate-site.mjs` نبود متا-CSP، هندلر درون‌خطی و اسکریپت درون‌خطی را در CI مسدود می‌کند. ✅ سازوکار قوی |

### ۳-۲. یافته‌های واقعی

**S‑1 (کم‌خطر، پیکربندی سرور) — نبود `Strict-Transport-Security` در `nginx.conf`.**
مجموعهٔ هدرهای امنیتی کامل است (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, `CORP`, `CSP`) اما HSTS غایب است. چون TLS در پروکسی معکوس خاتمه می‌یابد، ارسال این هدر از خودِ nginx بی‌خطر است (مرورگر روی HTTP آن را نادیده می‌گیرد) و در معماری‌های رایج، تنظیم آن در همین لایه از فراموش‌شدن در پروکسی جلوگیری می‌کند.

### ۳-۳. محدودیت‌های پذیرفته‌شده (تأیید مجدد، بدون تغییر)

- **`frame-ancestors` در `<meta>` بی‌اثر است** (طبق CSP Level 3، دستورهای `frame-ancestors`، `sandbox` و `report-uri` هنگام تحویل از راه متا نادیده گرفته می‌شوند). روی GitHub Pages امکان ارسال هدر واقعی وجود ندارد، بنابراین محافظت clickjacking تنها در مسیر خود-میزبانی (nginx: `X-Frame-Options` + هدر CSP) فعال است. این محدودیت پلتفرم است، نه نقص کد. ✅ **بدون تغییر**
- `connect-src https://*.microsoft.com` و `frame-src https://*.clarity.ms` عمداً باز گذاشته شده‌اند تا Microsoft Clarity کار کند؛ دامنهٔ آن‌ها حداقلی و مستند است. ✅
- `style-src 'unsafe-inline'` تنها روی `index.html` و `404.html` (که بلوک `<style>` درون‌خطی دارند) و در هدر nginx وجود دارد؛ `cards-form.html` و `payment-form.html` سیاست سخت‌گیرانهٔ `style-src 'self'` دارند. تخصیص‌های `element.style.*` از سمت JS، CSSOM هستند و مشمول `style-src` نمی‌شوند. ✅ **بدون تغییر**
- `Dockerfile` روی ایمیج `nginx-unprivileged` و با `USER nginx` (UID 101) اجرا می‌شود و `server_tokens off` فعال است. ✅

---

## ۴. سئو، عملکرد و تجربه کاربری (SEO, Performance & UX)

### ۴-۱. Core Web Vitals

| شاخص | وضعیت فعلی | یافته |
|---|---|---|
| **LCP** | هر دو تصویر LCP (`title.webp` و `cards-page-title-*.webp`) دارای `width`/`height` ذاتی و `fetchpriority="high"` هستند؛ CSS رندر-مسدودکننده کوچک است | ⚠️ فونت `Vazirmatn-Regular.woff2` (۵۰ KB) با زنجیرهٔ سه‌مرحله‌ای کشف می‌شود: HTML → `fonts.css` → `@font-face`. `preload` نشده است |
| **CLS** | `.card img` با `width/height:100%` داخل قاب اندازه‌دار، `.png-icon` با `24×24` ثابت، لوگوهای اعتماد با ابعاد ذاتی | ✅ **امن است؛ نیازی به تغییر نیست** |
| **INP / TBT** | مسیر بحرانی سبک است، اما مقداردهی اولیهٔ دادهٔ استان/شهر روی صفحهٔ کارت‌ها کار بیهودهٔ CPU تولید می‌کند (A‑1) | ⚠️ اصلاح لازم |
| **Payload** | تصاویر همگی WebP و بهینه (بزرگ‌ترین: ۱۰۹ KB)؛ فونت‌ها woff2 با `font-display: swap`؛ کارت‌ها `loading="lazy"` | ✅ **بهینه است** |

> **دربارهٔ `assets/vendor/` (۶۱۶ KB):** پلیر dotLottie فقط در صفحهٔ اسپلش و به‌صورت `type="module"` (یعنی defer شده و غیرمسدودکننده) بارگذاری می‌شود و چانک‌های سنگین رندرر به‌صورت پویا import می‌گردند. حذف آن یعنی حذف انیمیشن — یک تصمیم محصولی، نه نقص فنی. **پیشنهاد تغییری داده نمی‌شود.**

### ۴-۲. سئوی تکنیکال

| مورد | وضعیت |
|---|---|
| `robots.txt` + `sitemap.xml` با `lastmod` تولیدشده در زمان ساخت | ✅ |
| `canonical`, `og:*`, `theme-color`, `description`, `keywords` روی هر سه صفحهٔ ایندکس‌شونده | ✅ |
| `404.html` با `noindex` و خارج از sitemap | ✅ |
| HTML معنایی: `header`/`main`/`section`/`article`/`footer`، دقیقاً یک `h1` در هر صفحه (بصری‌پنهان در جایی که تیتر تصویری است)، `skip-link` | ✅ |
| فالبک بدون JS: `<noscript><meta refresh>` + دکمهٔ «ردشدن» به‌صورت `<a>` واقعی و قابل‌خزیدن | ✅ طراحی درجه‌یک |
| **دادهٔ ساخت‌یافته (JSON‑LD)** | ❌ **غایب** — هیچ `Organization`/`WebSite` تعریف نشده؛ برای یک نهاد خیریه، مهم‌ترین شکاف سئویی باقی‌مانده است |
| **کارت‌های توییتر / متادیتای تصویر OG** | ❌ `twitter:card`, `og:image:alt`, `og:site_name` (در دو صفحهٔ فرعی) غایب‌اند؛ پیش‌نمایش اشتراک‌گذاری در پیام‌رسان‌ها ناقص می‌ماند |
| **`preconnect` به Clarity** | فقط در `index.html` هست، در حالی که هر سه صفحه `clarity.js` را بارگذاری می‌کنند | ⚠️ ناهماهنگی جزئی |

### ۴-۳. دسترس‌پذیری (a11y)

**UX‑1 (واقعی) — اعلام تکراری در صفحه‌خوان.** در `cards-form.html` دکمه‌های سوییچر، هم `aria-label` دارند و هم تصویر داخلی‌شان `alt` معنادار دارد:

```html
<button aria-label="نمای کوچک" …><span class="png-icon"><img src="…/medium-cards.png" alt="کوچک" /></span></button>
```

صفحه‌خوان «نمای کوچک، کوچک» می‌خواند. این آیکن‌ها **تزئینی** هستند و باید `alt=""` بگیرند (۸ مورد).

**UX‑2 (واقعی) — `aria-busy` قفل‌شده.** در `index.html` عنصر `<section class="loader" aria-live="polite" aria-busy="true">` هرگز به `false` بازنمی‌گردد؛ `src/js/splash.js` فقط `aria-valuenow` را به‌روز می‌کند. صفحه‌خوان تا لحظهٔ هدایت، ناحیه را «در حال بارگذاری» گزارش می‌کند.

**مواردی که درست‌اند:** `lang="fa" dir="rtl"`، `prefers-reduced-motion` در هر دو CSS و در `LogoRain`، `:focus-visible` روی همهٔ کنترل‌های تعاملی، `role="alert"` + `aria-live` روی خطاهای فرم، تلهٔ فوکوس مودال، و پیمایش کیبوردی کامل منوها. ✅

---

## ۵. استقرار و اتوماسیون (Deployment & CI/CD Readiness)

| مورد | وضعیت |
|---|---|
| `Dockerfile` چندمرحله‌ای (`node:22-alpine` → `nginx-unprivileged:1.27-alpine`)، کاربر غیر‌روت، `HEALTHCHECK`، `EXPOSE 8080` | ✅ استاندارد |
| `docker-compose.yml` با `SITE_ORIGIN` اجباری (`:?`) و `restart: unless-stopped` | ✅ |
| `.dockerignore` / `.gitignore` / `.gitattributes` / `.env.example` | ✅ کامل |
| `nginx.conf`: `try_files`، `error_page 404`، سیاست کش تفکیک‌شده، رفع MIME برای `.mjs`، و توضیح صریح «هیچ `add_header` در سطح `location` نگذارید تا هدرهای امنیتی ارث‌بری شوند» | ✅ دقیق و درست |
| `gzip` | ⚠️ `gzip_types` شامل `application/xml` است، اما nginx فایل `.xml` را با `text/xml` سرو می‌کند (طبق `conf/mime.types` نسخهٔ ۱.۲۷) — یعنی **`sitemap.xml` فشرده نمی‌شود** |
| `.github/workflows/pages.yml`: build + validate روی push/PR، آپلود artifact فقط خارج از PR، `permissions` در سطح job، `concurrency` | ✅ ساختار درست |
| `timeout-minutes` روی jobها | ❌ غایب — یک job معلق می‌تواند تا سقف ۶ ساعت رانر را اشغال کند |
| به‌روزرسانی خودکار اکشن‌ها | ❌ `.github/dependabot.yml` وجود ندارد؛ اکشن‌ها به تگ major سنجاق شده‌اند و بدون Dependabot کهنه می‌شوند |
| اسکریپت‌های `build` / `validate` / `start` | ✅ بدون وابستگی، قابل اجرا روی هر ماشین با Node 22 و Python 3 |

> **یادآوری وضعیت (اقدام کاربر، نه کد):** کامیت محلی `e0e0b8c` که `pages.yml` را تغییر می‌دهد هنوز push نشده است؛ GitHub آن را با خطای `refusing to allow a GitHub App to … workflow … without workflows permission` رد می‌کند. تا رفع این دسترسی، هر آیتم مربوط به `.github/workflows/` قابل ارسال نیست.

---

## ۶. امتیازدهی کمی (Scoring)

| شاخص | امتیاز | دلیل |
|---|---|---|
| کیفیت کد و معماری وب | **8.5**/10 | معماری تمیز و مستند؛ کسر بابت نقض SRP در `data.js` و نشت شنوندهٔ `keydown` |
| امنیت وب و API | **9.0**/10 | سطح حمله حداقلی، CSP دولایه، SRI، کانتینر غیر‌روت؛ کسر بابت نبود HSTS و محدودیت ذاتی `frame-ancestors` روی Pages |
| سئو و عملکرد | **8.5**/10 | CWV در وضعیت خوب؛ کسر بابت نبود JSON‑LD، نبود `preload` فونت و بار CPU/بایت اضافی صفحهٔ کارت‌ها |
| مستندات | **9.0**/10 | README دوزبانه و کامل (نصب، اجرای محلی، تست، درخت پروژه)، داک‌استرینگ‌های دوزبانه، آرشیو `docs/audits/` |
| قابلیت توسعه (Scalability) | **7.5**/10 | برای دامنهٔ فعلی عالی است، اما بدون باندلر/تست خودکار، افزودن صفحهٔ چهارم نیازمند کار دستی است |
| آمادگی استقرار (Deployment/CI‑CD) | **8.5**/10 | Docker + nginx + Pages هر سه آماده؛ کسر بابت نبود `timeout-minutes`، Dependabot و فشرده‌نشدن `text/xml` |
| **میانگین کل** | **🎯 8.5 / 10** | روند: 5.9 → 7.8 → 8.4 → 8.0 → 8.25 → 8.4 → **8.5** |

---

## ۷. طرح اجرایی (Action Plan for Prompt 2)

> قالب ماشین‌خوان. هر آیتم: `ID | ACTION | PATH | TARGET | REASON | CHANGE`.
> فایل‌هایی که نیاز به تغییر ندارند در این بخش **نیامده‌اند**.

```yaml
plan: ANALYSIS-v7
branch: arena/01a02d5e-basij-tamin
rules:
  - minimal-diff: true          # فقط خطوط/توابع نام‌برده تغییر کنند
  - no-breaking-changes: true   # نام گلوبال‌ها و ساختار داده ثابت بماند
  - bilingual-docstrings: true  # فارسی، خط تیره، انگلیسی
items:

  - id: D1
    action: CREATE
    path: src/js/data-niat.js
    target: whole-file
    reason: "SRP + payload — صفحهٔ کارت‌ها فقط به NIAT_CARDS نیاز دارد ولی ۱۳.۸KB دادهٔ استان/شهر را می‌گیرد و پردازش می‌کند."
    change: "انتقال NIAT_CARDS_RAW، normalizeMenuTree، derivePaymentUrls و مقداردهی window.NIAT_CARDS از data.js به این فایل، با همان نام‌های گلوبال و همان داک‌استرینگ دوزبانه."
    depends_on: []

  - id: D2
    action: EDIT
    path: src/js/data.js
    target: ["NIAT_CARDS_RAW", "normalizeMenuTree", "derivePaymentUrls", "getCitiesOf", "init-try-block"]
    reason: "حذف بخش منتقل‌شده به D1 + ساخت مکرر Intl.Collator در هر فراخوانی getCitiesOf (نقض DRY و هزینهٔ CPU)."
    change: "حذف بلوک نیات؛ تعریف یک ثابت COLLATOR_FA در دامنهٔ ماژول و استفادهٔ مشترک از آن در buildProvinceCities و getCitiesOf؛ نگه‌داشتن window.PROVINCES_CITIES / PROVINCE_LIST / getCitiesOf بدون تغییر امضا."
    depends_on: [D1]

  - id: D3
    action: EDIT
    path: cards-form.html
    target: ["<head> link tags", "script tags at end of body", ".png-icon img[alt]"]
    reason: "بارگذاری دادهٔ بی‌مصرف؛ کشف دیرهنگام فونت LCP؛ اعلام تکراری صفحه‌خوان؛ نبود متادیتای اشتراک‌گذاری."
    change: "۱) جایگزینی src/js/data.js با src/js/data-niat.js؛ ۲) افزودن <link rel=preload as=font type=font/woff2 href=fonts/Vazirmatn-Regular.woff2 crossorigin> و <link rel=preconnect href=https://www.clarity.ms crossorigin>؛ ۳) alt=\"\" روی هر ۸ تصویر .png-icon؛ ۴) افزودن og:site_name، og:image:alt و twitter:card=summary_large_image."
    depends_on: [D1]

  - id: D4
    action: EDIT
    path: payment-form.html
    target: ["<head> link tags", "script tags at end of body"]
    reason: "این صفحه هم NIAT_CARDS و هم PROVINCES را لازم دارد؛ فونت LCP preload نشده؛ متادیتای اشتراک‌گذاری ناقص است."
    change: "۱) افزودن <script src=\"src/js/data-niat.js\"></script> بعد از data.js و قبل از payment-scripts.js؛ ۲) preload فونت Vazirmatn-Regular + preconnect به clarity؛ ۳) افزودن og:site_name، og:image:alt و twitter:card."
    depends_on: [D1]

  - id: D5
    action: EDIT
    path: payment-scripts.js
    target: ["openPanel", "openAmount"]
    reason: "نشت شنونده — شنوندهٔ keydown/Escape در هر بار باز شدن پنل دوباره ثبت می‌شود و هرگز حذف نمی‌گردد."
    change: "انتقال دو ثبت addEventListener('keydown', …) از داخل openPanel/openAmount به محل ساخت intentPanel و amountPanel (ثبت یک‌باره)؛ رفتار Escape بدون تغییر بماند."
    depends_on: []

  - id: D6
    action: EDIT
    path: index.html
    target: ["<head> link/meta tags"]
    reason: "نبود دادهٔ ساخت‌یافته (مهم‌ترین شکاف سئو) و کشف دیرهنگام فونت LCP."
    change: "۱) افزودن preload فونت Vazirmatn-Regular؛ ۲) افزودن twitter:card و og:image:alt؛ ۳) افزودن یک بلوک <script type=\"application/ld+json\"> با شِمای Organization + WebSite (نام، url با توکن __SITE_ORIGIN__، logo، inLanguage: fa-IR). توجه: ld+json اجرا نمی‌شود و مشمول script-src نیست؛ index.html جزو cspStrictPages نیست پس validator آن را رد نمی‌کند."
    depends_on: []

  - id: D7
    action: EDIT
    path: src/js/splash.js
    target: ["raf"]
    reason: "a11y — ناحیهٔ لودینگ برای همیشه aria-busy=\"true\" می‌ماند."
    change: "در تابع raf، هنگام رسیدن t به ۱، روی نزدیک‌ترین section.loader مقدار aria-busy را به \"false\" تغییر بده."
    depends_on: []

  - id: D8
    action: EDIT
    path: nginx.conf
    target: ["gzip_types", "security headers block"]
    reason: "sitemap.xml با text/xml سرو می‌شود و در gzip_types نیست؛ هدر HSTS غایب است."
    change: "۱) افزودن text/xml به gzip_types؛ ۲) افزودن add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always; در همان بلوک هدرهای امنیتی سطح server (با کامنت دوزبانه دربارهٔ خاتمهٔ TLS در پروکسی)."
    depends_on: []

  - id: D9
    action: CREATE
    path: .github/dependabot.yml
    target: whole-file
    reason: "اکشن‌های GitHub به تگ major سنجاق شده‌اند و بدون سازوکار به‌روزرسانی، وصله‌های امنیتی زنجیرهٔ تأمین CI دریافت نمی‌شوند."
    change: "پیکربندی version: 2 با اکوسیستم github-actions روی دایرکتوری \"/\" و زمان‌بندی هفتگی."
    depends_on: []
    note: "این مسیر زیر .github/ است اما فایل workflow نیست؛ معمولاً بدون دسترسی workflows قابل push است."

  - id: D10
    action: EDIT
    path: .github/workflows/pages.yml
    target: ["jobs.build", "jobs.deploy"]
    reason: "نبود timeout-minutes — یک job معلق تا سقف پیش‌فرض ۶ ساعت رانر را اشغال می‌کند."
    change: "افزودن timeout-minutes: 10 به job build و timeout-minutes: 10 به job deploy."
    depends_on: []
    blocked_by: "workflows-scope"   # تا رفع دسترسی GitHub App قابل push نیست

  - id: D11
    action: MANUAL
    path: "-"
    target: "git push / GitHub settings"
    reason: "کامیت e0e0b8c و آیتم D10 به دسترسی workflows نیاز دارند؛ سایت زندهٔ Pages هنوز نسخهٔ 6.7.8 را سرو می‌کند."
    change: "اعطای دسترسی workflows به اتصال GitHub، سپس push شاخه و merge به 7.0 (یا اجرای دستی workflow_dispatch) برای انتشار نسخهٔ 7.0.0."
    depends_on: [D10]

no_change_required:
  - 404.html
  - cards-scripts.js
  - cards-styles.css
  - payment-styles.css
  - src/js/utils.js
  - src/js/clarity.js
  - src/js/dotlottie-fallback.js
  - src/css/fonts.css
  - scripts/prepare-site.mjs
  - scripts/validate-site.mjs
  - Dockerfile
  - docker-compose.yml
  - .dockerignore
  - .gitignore
  - .gitattributes
  - .env.example
  - package.json
  - robots.txt
  - sitemap.xml
  - README.md
  - LICENSE
  - assets/vendor/**
```

### ۷-۱. ترتیب پیشنهادی اجرا

`D1 → D2 → D3 → D4` (یک واحد منطقی: تفکیک داده) ← `D5 → D6 → D7` (باگ و سئو/a11y) ← `D8 → D9` (استقرار) ← `D10 → D11` (منوط به دسترسی).

### ۷-۲. معیار پذیرش

```
npm run build && npm run validate       # باید بدون خطا پاس شود
node --check src/js/data-niat.js        # فایل جدید باید به validate اضافه شود؟ خیر — از طریق HTML مرجع‌دهی می‌شود
```
- روی `cards-form.html`: منوهای چندسطحی، لینک‌های مستقیم و ماندگاری ترجیح روز/شب و کوچک/بزرگ بدون تغییر کار کنند.
- روی `payment-form.html`: فهرست استان → شهر پر شود، انتخاب نیت و مبلغ کار کند، و `Escape` روی پنل **دقیقاً یک بار** آن را ببندد.
- در DevTools، صفحهٔ کارت‌ها دیگر `data.js` را درخواست نکند.

---

> **جمع‌بندی:** پروژه در وضعیت بالغ و پایدار است. یافته‌های این دور عمداً کم‌تعداد و همگی «تأییدشده با اندازه‌گیری یا بازتولید» هستند: یک باگ نشت شنونده، یک بار اضافی داده/CPU، یک شکاف واقعی سئو (JSON‑LD)، دو نکتهٔ a11y و سه سخت‌سازی استقرار. هیچ بازنویسی معماری‌ای توصیه نمی‌شود.
>
> یا علی مدد.
