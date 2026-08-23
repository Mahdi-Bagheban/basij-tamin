# گزارش تحلیل موشکافانه — دور چهارم (Audit v4)

- تاریخ تحلیل: ۲۰۲۶-۰۸-۲۳ • شاخه: `arena/01a02d5e-basij-tamin` (از `7.0`, کامیت `d582435`)
- دامنه: ۷۷ فایل / ۳٫۳ مگابایت • روش: بازخوانی کامل سورس + اجرای واقعی `npm run build` و `npm run validate`
- وضعیت پایپ‌لاین در زمان تحلیل: **سبز** (`Prepared static site ...` + `Static-site reference validation passed.`)

> اصل حاکم بر این گزارش: هر چیزی که استاندارد است، فقط «تأیید» می‌شود و در طرح اجرایی نمی‌آید.

---

## ۱. تحلیل معماری و ساختار (Web Architecture & Structure)

**ماهیت پروژه:** یک MPA کاملاً استاتیک (بدون بک‌اند، بدون دیتابیس، Zero-Dependency) با سه صفحهٔ کاربردی
(`index.html` اسپلش ← `cards-form.html` انتخاب نیت ← `payment-form.html` فرم) و یک ۴۰۴ برندسازی‌شده.
خروجی از طریق `scripts/prepare-site.mjs` در پوشهٔ `site/` مرحله‌بندی و روی GitHub Pages منتشر می‌شود.

**مواردی که تأیید می‌شوند (نیاز به تغییر ندارند):**
- **جداسازی لایه‌ها درست است:** داده (`src/js/data.js`) / ابزار (`src/js/utils.js`) / تحلیل (`src/js/clarity.js`) / منطق صفحه (`cards-scripts.js`، `payment-scripts.js`) / استایل هر صفحه جداست. ترتیب بارگذاری `utils → data → page` در هر دو صفحه رعایت شده.
- **منبع واحد حقیقت (SSOT):** `NIAT_CARDS_RAW` + `normalizeMenuTree()` + `derivePaymentUrls()` همهٔ نشانی‌های `payment-form.html?cause=...` را اشتقاق می‌کنند؛ HTML فقط با `data-card="i"` به آن ایندکس می‌خورد. این الگو برای این مقیاس دقیقاً درست است.
- **مدیریت State:** سه سطح مشخص و بدون نشتی: URL (`?cause=`) برای انتقال بین صفحات، `localStorage` برای ترجیح نما/تم، و State درون‌حافظه‌ای برای فرم. برای سایت استاتیک، افزودن هر state-manager اور-انجینیرینگ خواهد بود.
- **تنگنای رندرینگ:** SSR/CSR/SSG مطرح نیست؛ HTML از پیش رندر شده و JS فقط progressive-enhancement است. **بدون تنگنا.**
- **معماری API:** وجود ندارد و لازم هم نیست (پروژه هیچ تراکنشی ارسال نمی‌کند).

**آنتی‌پترن‌های واقعی باقی‌مانده (کم‌تعداد ولی واقعی):**
1. **صفحهٔ اسپلش با ریدایرکت زمان‌دار** (`index.html`، `DURATION=2500` + `setTimeout(goNext)`): برای کاربر با دکمهٔ «ردشدن» و `noscript` مهار شده، اما صفحهٔ ریشه از دید خزنده تقریباً بدون محتوا و **بدون هیچ لینک `<a>` قابل‌پیمایش** است؛ تنها راه خروج یک `<button>` جاوااسکریپتی است. این هم آنتی‌پترن UX/SEO است و هم نقطهٔ شکست در صورت خطای JS.
2. **نشت شنوندهٔ سراسری در `payment-scripts.js`:** داخل `createIntentRow()` یک `document.addEventListener('keydown', ...)` ثبت می‌شود؛ با هر «افزودن نیت» یک شنوندهٔ سراسری جدید اضافه می‌شود که هرگز حذف نمی‌گردد. همچنین `ResizeObserver` هر ردیف هنگام `row.remove()` قطع (`disconnect`) نمی‌شود.
3. **کد مرده:** رویداد `CustomEvent('remove-intent')` منتشر می‌شود اما هیچ شنونده‌ای ندارد.
4. **مصرف‌کنندهٔ سنگین برای یک انیمیشن ۲٫۵ ثانیه‌ای:** `assets/vendor/` حدود **۱٫۹ مگابایت** است، در حالی که فقط یک رندرر در زمان اجرا بارگیری می‌شود؛ ۷ نسخهٔ رندرر lottie (`lottie_canvas`, `lottie_html`, `lottie_worker`, ...) به‌صورت مرده در مخزن و در ایمیج داکر حمل می‌شوند.

---

## ۲. بررسی کیفیت کد و استانداردهای وب (Code Quality & Web Standards)

**تأیید می‌شود (بدون نیاز به تغییر):**
- **KISS/Vanilla:** بدون فریم‌ورک، بدون باندلر، بدون وابستگی npm — متناسب با دامنهٔ مسئله.
- **نام‌گذاری** انگلیسیِ معنادار و کامنت‌های دوزبانه یکدست؛ `'use strict'`/ماژول‌محوری در اسکریپت‌های بیلد رعایت شده.
- **DOM-safe by construction:** همهٔ متن‌های پویا با `textContent` نوشته می‌شوند؛ `CSS.escape()` در سلکتورهای پویا استفاده شده؛ هیچ `on*=` اینلاین، `eval`، یا `document.write` در پروژه نیست (بررسی خودکار شد).
- **دسترس‌پذیری در سطح خوب:** skip-link، `aria-expanded/pressed/live/haspopup`، roving focus در منوها، focus-trap کامل در مودال، احترام به `prefers-reduced-motion` در هر سه لایهٔ CSS/JS.
- **اسکریپت‌های بیلد** (`prepare-site.mjs`, `validate-site.mjs`) تمیز، تابع-محور، با خطاهای گویا و بدون وابستگی — نمونهٔ خوبی از Clean Code؛ **دست نخورند.**

**اشکالات واقعی:**
1. **DRY:** منطق نرمال‌سازی موبایل دو بار در همان فایل تکرار شده — `normalizeTo09()` (خط ۴۷) و `norm()` داخل هندلر `submit` (خط ~۴۵۷) در `payment-scripts.js`. باید یک‌بار در `src/js/utils.js` بنشیند.
2. **پیچیدگی شناختی:** `payment-scripts.js` یک کلوژر ۵۳۲ خطی است و `createIntentRow()` به‌تنهایی ~۱۷۰ خط با ۸ تابع تودرتو دارد. **توصیه: بازنویسی کامل انجام نشود** (ریسک رگرسیون بالا، ارزش کم)؛ فقط اصلاحات نقطه‌ای بند ۱ و رفع نشت‌ها.
3. **مقاوم‌نبودن در برابر `localStorage` مسدود:** `cards-scripts.js` خطوط ۲۰–۲۱ در همان ابتدای `DOMContentLoaded` مستقیماً `localStorage.getItem` را صدا می‌زند. در Safari private / مرورگر با ذخیره‌سازی مسدود، این فراخوانی `throw` می‌کند و **کل اسکریپت صفحهٔ کارت‌ها از کار می‌افتد** (کارت‌ها غیرقابل کلیک می‌شوند). این یک باگ واقعی درجه‌یک است.
4. **Component-based architecture:** DOM به‌صورت دستی و امری ساخته می‌شود. برای این اندازه قابل قبول است؛ مهاجرت به Web Components **پیشنهاد نمی‌شود** (اور-انجینیرینگ).
5. **HTML معنایی:** `index.html` و `cards-form.html` هیچ `<h1>` ندارند؛ در `cards-form.html` عنصر `<main>` با `role="region"` بازنویسی شده و landmark اصلی صفحه را از بین می‌برد.

---

## ۳. بررسی امنیت وب و شبکه (Web Security & Network)

**تأیید می‌شود (بدون نیاز به تغییر):**
- **SQLi / IDOR / احراز هویت (JWT/Session) / CSRF: موضوعیت ندارد** — بک‌اند، کوکی، توکن و ارسال داده وجود ندارد؛ فرم صرفاً `preventDefault` می‌شود. ساختن CSRF-token یا لایهٔ Auth در این وضعیت خطای مهندسی است.
- **XSS:** سطح حمله عملاً بسته است. تنها ورودی خارجی `?cause=` است که فقط با `textContent` روی یک `<button>` می‌نشیند (`payment-scripts.js:10,376`)؛ دو مورد `innerHTML` موجود (`add.png`/`remove.png` و لیست گزینه‌های مبلغ) **رشتهٔ ثابت و بدون ورودی کاربر** هستند و امن‌اند.
- **زنجیرهٔ تأمین:** فالبک CDN با نسخهٔ سنجاق‌شدهٔ `@dotlottie/player-component@2.7.12` + `integrity` (SHA-384) + `crossorigin="anonymous"` — استاندارد و درست.
- **`rel="noopener noreferrer"`** روی همهٔ `window.open`/`target="_blank"` رعایت شده.
- **`clarity.js`** روی `http`/localhost غیرفعال می‌شود و الگوی صف‌محور دارد — امن و کم‌ریسک.
- هدرهای `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` در `nginx.conf` موجود و درست‌اند.

**شکاف‌های واقعی:**
1. **CSP در مسیر GitHub Pages وجود ندارد** (Pages هدر سفارشی نمی‌پذیرد و هیچ `<meta http-equiv="Content-Security-Policy">` در صفحات نیست). نکتهٔ کلیدی: `cards-form.html` و `payment-form.html` **هیچ بلوک اینلاین `<script>`/`<style>` ندارند** (بررسی شد)، پس برای این دو صفحه یک متا-CSP سخت‌گیرانه بدون هیچ ریسکی قابل افزودن است.
2. **`script-src 'unsafe-inline'` در `nginx.conf`** فقط به‌خاطر دو بلوک اینلاین `index.html` باقی مانده است. با استخراج آن دو بلوک به `src/js/`، می‌توان `'unsafe-inline'` را از `script-src` حذف کرد (برای `style-src` می‌ماند و قابل قبول است).
3. **سخت‌سازی جزئی nginx:** `server_tokens off;` تنظیم نشده (نسخهٔ nginx افشا می‌شود)؛ `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` تعریف نشده‌اند.
4. **کانتینر با کاربر root:** ایمیج نهایی `nginx:1.27-alpine` مسترپروسس را با root اجرا می‌کند در حالی که پورت ۸۰۸۰ (>1024) است و اجرای بدون‌امتیاز کاملاً ممکن است. اولویت پایین ولی واقعی.

---

## ۴. ارزیابی سئو، عملکرد و تجربه کاربری (SEO, Performance & UX)

**تأیید می‌شود (بدون نیاز به تغییر):**
- تصاویر `WebP` + `loading="lazy"`، فونت محلی `woff2` با `font-display: swap`، `preconnect` به مبدأ تحلیل، اسکریپت تحلیل `defer` — همه استاندارد.
- **CLS:** ابعاد ثابت با `clamp()`، رزرو فضای فوتر، و مدیریت آگاهانهٔ اسکرول (`updateScrollMode`) — کنترل‌شده.
- **INP:** انیمیشن‌ها مبتنی بر `requestAnimationFrame` و `transform/opacity` با `will-change`، به‌همراه سقف تعداد نود (`maxNodes=60`) — مناسب.
- `robots.txt`, `sitemap.xml`, `canonical`, `og:*`, `theme-color`, favicon و ۴۰۴ با `noindex` — همگی موجود و صحیح، با توکن `__SITE_ORIGIN__` که در بیلد جایگزین و صحت‌سنجی می‌شود.

**شکاف‌های واقعی:**
1. **LCP صفحهٔ ورودی:** برای یک اسپلش ۲٫۵ ثانیه‌ای، `dotlottie-player.mjs` (۳۸KB) به‌علاوهٔ یک چانک رندرر (۱۷۰–۳۲۳KB) بارگیری می‌شود؛ ضمناً ۱٫۹MB دارایی وندور در مخزن/ایمیج حمل می‌شود که بخش عمدهٔ آن هرگز درخواست نمی‌شود.
2. **HTML معنایی:** نبود `<h1>` در `index.html` و `cards-form.html`؛ `role="region"` روی `<main>` در `cards-form.html`.
3. **صفحهٔ ریشه از نظر خزنده بن‌بست است:** هیچ `<a href="cards-form.html">` واقعی وجود ندارد و انتقال فقط با JS/`meta refresh` انجام می‌شود؛ جریان لینک‌دهی داخلی به صفحهٔ اصلی محتوا منتقل نمی‌شود.
4. **محدودیت ساختاری GitHub Pages (اطلاعاتی، نه باگ کد):** در انتشار «پروژه‌ای» آدرس `https://<owner>.github.io/Basij-Tamin/robots.txt` توسط خزنده‌ها به‌عنوان robots ریشه خوانده **نمی‌شود**؛ باید در README مستند و sitemap مستقیماً در Search Console ثبت شود.
5. `sitemap.xml` فاقد `<lastmod>` است (کم‌اثر ولی آسان).

---

## ۵. ارزیابی استقرار و اتوماسیون (Deployment & CI/CD Readiness)

**تأیید می‌شود (بدون نیاز به تغییر):**
- `Dockerfile` چندمرحله‌ای (builder ← nginx) با `HEALTHCHECK`، `docker-compose.yml` با اجبار `SITE_ORIGIN`، `.dockerignore` تمیز، `.env.example` موجود و دقیق، `.gitattributes` با نرمال‌سازی LF، `site/` در `.gitignore`.
- `.github/workflows/pages.yml`: روی PR فقط **بیلد + اعتبارسنجی** و روی push به `7.0` دیپلوی؛ `concurrency` تنظیم شده؛ اکشن‌ها به نسخه‌های major رسمی پین شده‌اند. ساختار درست است.
- اسکریپت‌های `build`/`validate` واقعاً کار می‌کنند (اجرا و تأیید شد) و بیلد در نبود `SITE_ORIGIN` **به‌درستی fail می‌شود**.

**شکاف واقعی:**
1. **دامنهٔ مجوزها:** `permissions: pages: write, id-token: write` در سطح workflow برای **همهٔ** jobها اعمال شده، در حالی که job `build` فقط به `contents: read` نیاز دارد (اصل کمینهٔ دسترسی).
2. مسیر خود-میزبانی از نظر امنیتی یک درجه قابل سخت‌سازی است (بند ۳-۳ و ۳-۴).

---

## ۶. امتیازدهی کمی (Scoring)

| شاخص | امتیاز |
|---|---|
| کیفیت کد و معماری وب | **8.0/10** |
| امنیت وب و API | **7.5/10** |
| سئو و عملکرد (Performance) | **7.5/10** |
| مستندات | **9.0/10** |
| قابلیت توسعه (Scalability) | **7.5/10** |
| آمادگی استقرار (Deployment/CI-CD) | **8.5/10** |
| **میانگین کل** | **8.0/10** |

---

## ۷. طرح اجرایی (Action Plan for Prompt 2)

قالب ماشین‌خوان: `[ID] <ACTION> <PATH> :: <CHANGE> :: <REASON> :: <PRIORITY>`
اقدام‌ها: `MODIFY` | `CREATE` | `DELETE` — اولویت: `P1` (ضروری) | `P2` (مهم) | `P3` (اختیاری، فقط پس از راستی‌آزمایی)

```
[A1] MODIFY src/js/utils.js :: افزودن دو کمکی مشترک safeStorage.get/set (با try/catch) و normalizeMobile(raw) و expose روی window :: پشتیبانی از رفع باگ localStorage و حذف تکرار منطق موبایل :: P1
[A2] MODIFY cards-scripts.js :: جایگزینی مستقیم localStorage.getItem/setItem در خطوط ۲۰،۲۱،۳۰۶،۳۱۷ با safeStorage :: در مرورگر با ذخیره‌سازی مسدود، استثنا کل اسکریپت صفحهٔ کارت‌ها را از کار می‌اندازد :: P1
[A3] MODIFY payment-scripts.js :: انتقال شنوندهٔ document keydown/Escape از داخل createIntentRow به سطح ماژول (یک‌بار)، فراخوانی ro.disconnect() هنگام حذف ردیف، حذف CustomEvent بی‌مصرف 'remove-intent'، و جایگزینی normalizeTo09/norm با window.normalizeMobile :: رفع نشت شنونده و ResizeObserver، حذف کد مرده و نقض DRY :: P1
[A4] CREATE src/js/splash.js :: انتقال بلوک اسکریپت اینلاین انتهای body در index.html (کپی‌رایت، نوار پیشرفت، goNext) بدون تغییر منطق، با بارگذاری از طریق <script src defer> :: پیش‌نیاز حذف 'unsafe-inline' از script-src :: P2
[A5] CREATE src/js/dotlottie-fallback.js :: انتقال بلوک ماژول اینلاین فالبک dotlottie در head به فایل مستقل با <script type="module" src> و حفظ نسخهٔ سنجاق‌شده و SRI :: پیش‌نیاز CSP بدون unsafe-inline :: P2
[A6] MODIFY index.html :: (۱) تبدیل <button id="skip-loader"> به <a href="cards-form.html" role="button"> برای خزیدن‌پذیری، (۲) افزودن <h1> بصری‌پنهان با عنوان صفحه، (۳) حذف دو بلوک اسکریپت اینلاین و ارجاع به A4/A5 :: رفع بن‌بست خزنده، نبود h1، و آماده‌سازی CSP :: P1
[A7] MODIFY cards-form.html :: افزودن <h1> بصری‌پنهان «انتخاب نیت خیر» و حذف role="region" از <main> (نگه‌داشتن aria-label) :: بازگرداندن landmark اصلی و ساختار عنوان معنایی :: P1
[A8] MODIFY cards-styles.css :: افزودن کلاس ابزاری .visually-hidden (در صورت نبود) برای عناوین جدید :: پشتیبانی از A7 بدون تغییر ظاهر :: P2
[A9] MODIFY cards-form.html, payment-form.html :: افزودن <meta http-equiv="Content-Security-Policy"> سخت‌گیرانه (default-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self' https://*.clarity.ms) :: این دو صفحه هیچ اینلاینی ندارند؛ پوشش امنیتی در GitHub Pages که هدر سفارشی نمی‌پذیرد :: P2
[A10] MODIFY index.html, 404.html :: افزودن متا-CSP با style-src 'self' 'unsafe-inline' (به‌دلیل بلوک <style> باقی‌مانده) و script-src 'self' https://cdn.jsdelivr.net :: تکمیل پوشش CSP پس از اجرای A4/A5 :: P2
[A11] MODIFY nginx.conf :: افزودن server_tokens off; و هدرهای Cross-Origin-Opener-Policy: same-origin و Cross-Origin-Resource-Policy: same-origin؛ افزودن text/plain و application/xml به gzip_types؛ حذف 'unsafe-inline' از script-src پس از A4/A5 :: سخت‌سازی سرور و همسویی با CSP جدید :: P2
[A12] MODIFY .github/workflows/pages.yml :: انتقال permissions از سطح workflow به سطح job (build: contents: read؛ deploy: pages: write + id-token: write + contents: read) :: اصل کمینهٔ دسترسی در CI :: P2
[A13] MODIFY sitemap.xml :: افزودن <lastmod> برای هر سه URL (تاریخ ISO ثابت یا تزریق در prepare-site.mjs) :: سیگنال تازگی برای خزنده :: P3
[A14] MODIFY README.md :: افزودن بخش کوتاه «محدودیت GitHub Pages پروژه‌ای»: robots.txt در زیرمسیر معتبر نیست و sitemap باید در Search Console ثبت شود؛ به‌همراه دستور اجرای محلی :: مستندسازی محدودیت واقعی استقرار :: P3
[A15] MODIFY Dockerfile :: اجرای مرحلهٔ نهایی با کاربر بدون‌امتیاز (USER nginx به‌همراه تنظیم pid/temp path یا استفاده از nginxinc/nginx-unprivileged:1.27-alpine) :: حذف اجرای سرویس با root :: P3
[A16] DELETE assets/vendor/lottie_canvas-*.mjs, assets/vendor/lottie_html-*.mjs, assets/vendor/lottie_worker-*.mjs, assets/vendor/lottie_light_canvas-*.mjs, assets/vendor/lottie_light_html-*.mjs, assets/vendor/dotlottie-audio-*.mjs :: حذف رندررهای بارگیری‌نشده پس از راستی‌آزمایی رفتار پلیر در مرورگر (تنها رندرر پیش‌فرض حفظ شود) :: حذف ~۱٫۵MB وزن مرده از مخزن و ایمیج :: P3
[A17] MODIFY scripts/validate-site.mjs :: افزودن بررسی «نبود هندلر اینلاین on*= و نبود بلوک <script> اینلاین بدون nonce» به‌عنوان گارد رگرسیون CSP :: تثبیت دستاورد A4/A5 در CI :: P3
```

### فایل‌هایی که تأیید شده‌اند و **نباید** تغییر کنند
`package.json` • `scripts/prepare-site.mjs` • `docker-compose.yml` • `.dockerignore` • `.gitignore` • `.gitattributes` • `.env.example` • `src/js/data.js` • `src/js/clarity.js` • `src/css/fonts.css` • `payment-styles.css` • `404.html` (به‌جز A10) • `LICENSE` • `robots.txt`
