# تحلیل کامل مخزن Basij-Tamin

## ۱. تحلیل معماری و ساختار (Web Architecture & Structure):
- پروژه یک سایت استاتیک چندصفحه‌ای است (index.html, cards-form.html, payment-form.html, 404.html) که از طریق Dockerized nginx سرو می‌شود.
- فایل‌ها به صورت منظم سازماندهی شده‌اند: assets/ (font, تصویر، ویدیو)، fonts/ (فونت Vazirmatn)، images/ (تصاویر)، src/css/ (فونت‌ها)، src/js/ (اسکریپت‌های مشترک: utils, data, data-niat, clarity, splash, dotlottie-fallback)، scripts/ (build و validate).
- State management از طریق localStorage برای تنظیمات کاربر (حالت نمای کارت‌ها، روز/شب) انجام می‌شود.
- هیچ API backend یا منطق سرور-side وجود ندارد؛ تمام تعاملات در سمت کلاینت رخ می‌دهد.
- Anti-patternها مشاهد شده:
  1. آلودگی فضای سراسری (window globals) در utils.js که تمام توابع و ثابت‌ها را به window متصل می‌کند (مثل window.PigeonGlide, window.toEnDigits). این امکان أسماء‌سازی و.testability را کاهش می‌دهد و وابستگی به ترتیب بارگذاری اسکریپت‌ها را ایجاد می‌کند.
  2. وابستگی ضمنی به ترتیب بارگذاری اسکریپت‌ها: فایل‌های data.js و data-niat.js از توابع window (مثل window.toFaChars, window.deepFreeze) که در utils.js تعریف می‌شوند، استفاده می‌کنند؛ اگر ترتیب بارگذاری تغییر کند، خطا می‌شود.
  3. عدم استفاده از ماژول‌های ES (import/export) که سبب قطعگی و بهبود tree-shaking نمی‌شود.
- نقاط قوت: جداسازی واضح داده‌های جغرافیایی (data.js) و نیات (data-niat.js)، استفاده از توابعutils مشترک، الگوهای ARIA و دسترسی‌پذیری خوب.

## ۲. بررسی کیفیت کد و استانداردهای وب (Code Quality & Web Standards):
- Clean Code: کد خوب است؛ کامنت‌های دو زبانه (فارسی/انگلیسی)، توابع کوچک و متمرکز، نام‌گذاری beskconsistent (camelCase برای JS،ケбаб-case برای فایل‌ها)، استفاده از const/let.
- SOLID: کلاس‌های utils.js (PigeonGlide) یک مسئولیت واضح دارند؛ توابع در data.js و data-niat.js وظیفه singular دارند (دسترسی به داده‌های جغرافیایی و نیات).
- DRY: به خوبی رعایت شده؛ توابع کمکی در utils.js (toEnDigits, toFaDigits, debounce, safeStorage) در نقاط مختلف استفاده می‌شوند؛ فونت‌ها از فایل مشترک src/css/fonts.css بارگذاری می‌شوند.
- KISS: منطق ساده و مستقیم؛ هیچ metaframework یا abstraction غیرضروری وجود ندارد.
- Cognitive Complexity: متوسط تا بالا؛ تابع createIntentRow در payment-scripts.js (حدود 200 خط) multiple responsabilitites دارد (ایجاد ردیف، مدیریت منو، به‌روزرسانی مجموع، مدیریت دسته‌گل). این تابع می‌تواند به توابع کوچکتری Refactor شود.
- استناد به استانداردهای وب: 
  * HTML5 semantic elements به کار رفته (<header>, <main>, <section>, <footer>, <nav> به صورت ضمنی)
  * استفاده از نوع input مناسب (type="tel" برای موبایل، inputmode="numeric")
  * validation سمت کاربر با Constraint Validation API (setCustomValidity، checkValidity)
  * استفاده از aria-label، role، tabindex برای دسترسی‌پذیری
  * prefers-reduced-motion در CSS و JS محترم شده
- نقاط ضعف:
  * عدم وجود ماژول‌بندی (ES modules) که باعث coupling بالا و namespaces شوم می‌شود
  * توابع طولانی در payment-scripts.js و cards-scripts.js که بایدbroken down شوند
  * استفاده از logical OR assignment (||=) در payment-scripts.js که اگرچه در Node 22 و مرورگرهای现代 کار می‌کند، اما سازگاری با مرورگرهای古有 سوال می‌آورد (اگرچه پروژه هدف مرورگرهای مدرن است)
  * تکرار کمی در ساختار منوهای payment-scripts.js (openPanel/closePanel برای intent و amount)

## ۳. بررسی امنیت وب و شبکه (Web Security & Network):
- CSP (Content Security Policy):
  * index.html: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://*.clarity.ms; style-src 'self' 'unsafe-inline'; (ضروری برای استایل اینلاین اسplashe)
  * cards-form.html و payment-form.html:default-src 'self'; script-src 'self' https://*.clarity.ms; style-src 'self'; (هیچ استایل یا اسکریپت اینلاینی نیست، CSP سخت‌گیرانه)
  * 404.html:default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; (فقط استایل اینلاین)
  * تمام políticas شامل محدودیت‌های قوی برای object-src, base-uri, frame-ancestors, form-action, img-src, font-src, connect-src, worker-src هستند.
- Security Headers (nginx.conf):
  * X-Content-Type-Options: nosniff
  * X-Frame-Options: SAMEORIGIN
  * Referrer-Policy: strict-origin-when-cross-origin
  * Permissions-Policy: camera=(), microphone=(), geolocation=()
  * Cross-Origin-Opener-Policy: same-origin
  * Cross-Origin-Resource-Policy: same-origin
  * Strict-Transport-Security: max-age=31536000; includeSubDomains (HSTS)
- SRI (Subresource Integrity): 
  * dotlottie-fallback.js از CDN با integrity='sha384-ypAFdIpmPhrhuVLN9fmIZaqZHGUVSzHiiplL/kPO2+gJ4Na4yRVbVt0YhyvWdbwn' استفاده می‌کند
- لا وجود نقطه ضعف XSS واضح:
  * تمام واردات کاربر در DOM از طریق textContent یا setAttribute (نه innerHTML) قرار می‌گیرد
  * مثال: payment-scripts.py خط 476: document.getElementById('thank-message').textContent = ...
  * مثال: cards-scripts.js خط 250: a.textContent = item.title
- CSRF Protection: 
  * فرم payment-form.html از متد POST استفاده می‌کند اما هیچ CSRF توکنی ندارد؛ با این حال، زیرا backend موجود نیست (اتصال به درگاه بانکی در این نسخه فعال نیست)، خطری ایجاد نمی‌کند
  * 게다가، form-action 'self' در CSP مخربین را از ارسال فرم به دامنه‌های دیگر جلوگیری می‌کند
- احراز هویت و جلسه: 
  * هیچ مکانیزم احراز هویت وجود ندارد؛ سایت volledig آزاد است
  * localStorage تنها برای ذخیره‌سازی ترجیحات کاربر (نما، حالت روز/شب) استفاده می‌شود که حاوی اطلاعات حساس نیست
- تنظیمات CORS: 
  * لازمه نیست (سایت استاتیک)؛ nginx CORSヘッダー را تنظیم نمی‌کند که مناسب است
- نقاط ضعف احتمالی:
  1. كشف اطلاعات Clarity: ID پیگیری Clarity (ta5vnt8v6q) در clarity.js کدگذاری شده است؛ اگرچه این شناسه عمومی است و برای aggregated analytics استفاده می‌شود، اما در محیط altamente حساس ممکن است problematize باشد
  2. عدم وجود معدل limiting یا CAPTCHA در فرم payment-form.html که اگر backend فعال شود، rischio ایجاد می‌شود
  3. استفاده از window.localStorage بدون رمزنگاری برای تنظیمات غیرحساس (مجاز)
- insgesamt: امنیت بسیار خوب است؛ OWASP Top 10 اصلی vulnérabilità (XSS, CSRF, SQL Injection, IDOR و غیره) در محیط استاتیک وجود ندارد یا کاهش یافته است.

## ۴. ارزیابی سئو، عملکرد و تجربه کاربری (SEO, Performance & UX):
- Core Web Vitals:
  * LCP (Largest Contentful Paint): بهینه شده است
    - فونت Vazirmatn-Regular.woff2 با <link rel="preload"> بارگذاری می‌شود
    - تصویر عنوان در index.html با fetchpriority="high" و عرض/ارتفاع مشخص لود می‌شود
    - CSS Kritik درlined است و غیرمسدودکننده
  * FID/INP (First Input Delay / Interaction to Next Paint): خوب
    - تمام اسکریپت‌ها defer دارند (utils.js, data.js، data-niat.js، cards-scripts.js، payment-scripts.js، clarity.js، splash.js، dotlottie-fallback.js)
    - هیچ tác vụ سنگین طولانی در main thread؛ تعاملات سبک (کلیک، منو باز/بسته)
  * CLS (Cumulative Layout Shift): بهینه
    - تمام تصاویر عرض و ارتفاع صریح دارند (width/height attributes)
    - prefers-reduced-motion: reduce محترم می‌شود (انیمیشن‌ها متوقف می‌شوند)
    - فونت‌ها با font-display: swap (به صورت ضمنی در @font-face در fonts.css) LCP را تحت تأثیر قرار نمی‌دهند
- بهینه‌سازی منابع:
  * تصاویر: فرمت WebP استفاده می‌شود (فشارによる و کیفیت خوب)
    - card-*.webp در cards-form.html loading="lazy" دارند
    - لوگو و آیکن‌ها نیز WebP هستند
  - فونت‌ها woff2 (بهترین فرمت) با preload لود می‌شوند
  - ❌ عدم minification (CSS/JS) – فایل‌های خام ارسال می‌شوند
  - ❌ عدم srcset برای تصاویر پاسخگو (مثلاً card-01.webp 400w, 800w, 1200w)
  - ❌ عدم brotli compression در nginx (فقط gzip فعال است)
- سئوی تکنیکال:
  * HTML Semantic: به کار رفته (<header>, <main>, <section>, <footer>, <h1>, <nav> ضمنی)
  * Meta Tags: کامل
    - charset, viewport, theme-color
    - description, author, keywords
    - og:title, og:description, og:type, og:locale, og:site_name, og:image, og:image:alt, og:url
    - twitter:card
    - canonical (با توکن __SITE_ORIGN__ که در دیپلوی جایگزین می‌شود)
  * Structured Data: JSON-LD در index.html (Organization + WebSite)
  * Sitemap.xml: موجود، با توکن __SITE_ORIGN__ و __BUILD_DATE__ 
  * Robots.txt: موجود، اجازه کلی، Sitemap مشخص شده
  * lang="fa" dir="rtl": به درستی تنظیم شده
  * Visual Hierarchy: واضح (عنوان -> لودینگ -> فرم/کارت‌ها -> فوتر)
- تجربه کاربری (UX):
  * دسترسی‌پذیری: عالی
    - skip-linkهای متمرکز (.skip-link) برای پرش به محتوا
    - تمام کنترل‌های کاربردی از طریق keyboard navigable (Enter, Space, Arrow keys)
    - ARIA labels و roles به کار رفته (role="button", aria-expanded, aria-controls)
    - focus management مناسب (مثال: پس از باز کردن منو، focus روی اولین آیتم منو منتقل می‌شود)
    - خطاهای فرم با role="alert" و aria-live="polite" اطلاع داده می‌شوند
  * روانه: انیمیشن‌های smooth (حالت شिफت، کارت reveal، pigeon glide)
  * حالت شب/روز: با متغیرهای CSS و کلاس night-mode روی body
  - ذخیره‌سازی حالت: localStorage برای view mode و day/night mode
  * معتبرسازی فرم: طرفه‌ای (required، minlength، pattern برای موبایل) و پیام‌های خطای inline
  - گل previamente (نارگیس) و کبوترها برای بازخورد بصری
- نکات بهبود:
  1. تصاویر پاسخگو با srcset و sizes (به-art-direction برای نمایش‌های مختلف)
  2. Minification از CSS/JS (Terser، clean-css) برای کاهش حجم انتقال
  3. Brotli sıkıştırma در nginx (بالای gzip)
  4. Lazy loading برای اسکریپت‌های غیر必須 (مثل clarity.js با IntersectionObserver)
  5. Placeholder برای تصاویر در حال بارگذاری (بدون این، Layout Shift ممکن است)
  6. Critical CSS درlined (مثلاً برای cards-form.html) تا render-blocking CSS را کاهش دهد

## ۵. ارزیابی استقرار و اتوماسیون (Deployment & CI/CD Readiness):
- Dockerization:
  * Dockerfile موجود و منظم
  * Multi-stage build: 
    - Stage 1 (builder): node:22-alpine، نصب dependencies، اجرای npm run build (prepare-site.mjs)
    - Stage 2: nginxinc/nginx-unprivileged:1.27-alpine (کاربر بدون special権/nginx)
    - COPY --from=builder /app/site/ /usr/share/nginx/html/
    - HEALTHCHECK با wget به localhost:8080
    - USER nginx (اجرای سرویس به عنوان کاربر غیر特权)
  * docker-compose.yml موجود: سرویس web با پورت 8080:8080، restart: unless-stopped
- تنظیمات nginx (nginx.conf):
  * شنوایی از پورت 8080 (Docker-дружелюбно)
  * gzip فعال شده است (text/css, text/xml, application/javascript, application/json, image/svg+xml)
  - کش دارایی‌های استاتیک (woff2, webp, png, svg) به مدت 30 روز
  - صفحات HTML/XML/TXT با expires -1 (no-cache) برای همیشه تازه
  - Security headers به‌طور کامل تنظیم شده (مطابق بالا)
  - CSP هدر تنظیم شده (با این حال، متا تگ HTML اولویت دارد)
- GitHub Actions (.github/workflows/pages.yml):
  * نام: Deploy GitHub Pages
  * trigger: push/pull_request رویbranch "7.0" + workflow_dispatch
  * jobs:
    - build:
        - runs-on: ubuntu-latest
        - steps:
          - checkout@v4
          - setup-node@v4 (node-version: 22)
          - env: SITE_ORIGIN: https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}
          - run: npm run build && npm run validate
          - configure-pages@v5 (if: github.event_name != 'pull_request')
          - upload-pages-artifact@v3 (path: site)
    - deploy:
        - needs: build
        - runs-on: ubuntu-latest
        - steps: deploy-pages@v4
- اسکریپت‌های Build:
  * package.json:
    - "start": "SITE_ORIGIN=${SITE_ORIGIN:-http://localhost:8080} node scripts/prepare-site.mjs && python3 -m http.server 8080 --directory site"
    - "validate": node --check برای تمام فایل‌های JS + اجرای scripts/validate-site.mjs
    - "build": node scripts/prepare-site.mjs
  * scripts/prepare-site.mjs:
    - توکن __SITE_ORIGIN__ و __BUILD_DATE__ را در فایل‌های HTML/XML/TXT جایگزین می‌کند
    - اعتبارسنجی مسیرهای لازم و عدم وجود توکن‌های باقی‌مانده
  * scripts/validate-site.mjs:
    - بررسی عدم وجود هندلرهای اینلاین، اسکریپت اینلاینی در صفحات CSP‑سطrict، وجود متا‑CSP
    - بررسی ارجاعات محلية (src/href، url() در CSS)
- نقاط قوت:
  * استقرار کامل با Docker و docker-compose
  * CI/CD خودکار برای GitHub Pages
  - توکن‌گذاری داینامیک برای SITE_ORIGIN و BUILD_DATE
  * اعتبارسنجی قبل از استقرار (npm run validate)
  * استفاده از nginx unprivileged برای امنیت
  * HEALTHCHECK در Dockerfile
- نقاط ضعف / بهبودها:
  1. عدم وجود minification در اسکریپت build (prepare-site.mjs فقط کپی می‌کند، فایل‌ها را minify نمی‌کند)
  2. عدم وجود hash-based asset versioning (برای cache-busting بهتر است؛ در حال حاضر expires 30d دارایی‌های استاتیک استفاده می‌شود که محتوای ثابت فرض می‌کند)
  3. عدم وجود linting یا unit test در CI (فقط syntax check با node --check)
  4. docker-compose.yml متغیر SITE_ORIGIN را از .env می‌خواند؛ .env.example وجود دارد اما .env خود در repository نیست (منطقی)
  5. عدم وجود multi-stage برای node_modules (در Stage 1، node_modules در تصویر نهایی کپی نمی‌شود که خوب است)
  6. عدم وجود بهینه‌سازی لایه‌ها در Dockerfile (حالت حاضر قابل قبول است)
- آمادگی برای استقرار بر روی سرورهای لینوکس/ ابر: بسیار خوب (Docker و nginx تنظیم شده‌اند)

## ۶. امتیازدهی کمی (Scoring):
- کیفیت کد و معماری وب: [8/10]
- امنیت وب و API: [9/10]
- سئو و عملکرد (Performance): [7/10]
- مستندات: [7/10]
- قابلیت توسعه (Scalability): [6/10]
- آمادگی استقرار (Deployment/CI-CD): [9/10]
- میانگین کل: [7.7/10]

## ۷. طرح اجرایی (Action Plan for Prompt 2) - بخش بسیار مهم:
یک چک‌لیست شماره‌گذاری شده، دقیق و ماشین‌خوان (Machine-readable) از "تنها" بهینه‌سازی‌های ضروری تهیه کنید.

### فایل‌هایی که نیاز به ویرایش دارند:
1. package.json - افزونه اسکریپت minification برای کاهش حجم CSS/JS و بهبود زمان لود
2. cards-form.html - افزودن srcset به تصاویر کارت‌ها برای سرویس پاسخگو و بهینه‌سازی باندWidth
3. src/js/utils.js - تبدیل از آلودگی window.globals به ماژول‌های ES با export تا وابستگی‌های ضمنی را حذف کنیم
4. src/js/data.js - جایگزین دسترسی به window.globals با import ماژول‌های ES برای صاف‌سازی وابستگی‌ها
5. src/js/data-niat.js - جایگزین دسترسی به window.globals با import ماژول‌های ES برای صاف‌سازی وابستگی‌ها
6. cards-scripts.js - جایگزین دسترسی به window.globals با import ماژول‌های ES (utils, data-niat) برای ماژولار بودن
7. payment-scripts.js - جایگزین دسترسی به window.globals با import ماژول‌های ES (utils, data, data-niat) برای ماژولار بودن
8. scripts/prepare-site.mjs - ادغام minification فایل‌های JS و CSS در حین کپی تا فایل نهایی بهینه شود

### فایل‌هایی که باید از صفر ساخته شوند:
1. .eslintrc.json - پیکربندی ESLint برای حفظ کیفیت کد و evitare regression
2. .github/workflows/lint.yml - workflow GitHub Actions برای اجرای linter در pull requests و تضمین استاندارد کد

### توضیح یک‌خطی از تغییر مورد نیاز برای هر فایل:
1. package.json: اضافه کردن dependenciess terser و clean-css و اسکریپت "minify" که پس از prepare-site.mjs اجرا شود
2. cards-form.html: افزودن صفت srcset به تگ‌های <img> داخل .card-wrap با مقادیرمثل "images/cards/card-01-400.webp 400w, images/cards/card-01-800.webp 800w, images/cards/card-01.webp 1200w" و sizes="(max-width: 600px) 100vw, 50vw"
3. src/js/utils.js: حذف تمام assegnamenti window.* و افزودن export statement برای تمام توابع و ثابت‌ها (مثل export { PigeonGlide, toEnDigits, ... })
4. src/js/data.js: جایگزین خط‌های window.toFaChars، window.uniq و غیره با import از './utils.js' (به‌صورت ماژولی)
5. src/js/data-niat.js: جایگزین خط‌های window.toFaChars، window.deepFreeze و غیره با import از './utils.js'
6. cards-scripts.js: جایگزین دسترسی به window.PigeonGlide، window.toEnDigits، window.safeStorage و غیره با import از './utils.js' و window.NIAT_CARDS با import از './data-niat.js'
7. payment-scripts.js: جایگزین دسترسی به window.PigeonGlite، window.toEnDigits، window.safeStorage، window.PROVINCES_CITIES، window.getCitiesOf، window.NIAT_CARDS و غیره با import‌های ماژولی مناسب
8. scripts/prepare-site.mjs: در حین کپی فایل‌های .js و .css، اضافه کردن minification با terser (برای JS) و clean-css (برای CSS) قبل از نوشتن در دایرکتوری مقصد
9. .eslintrc.json: ایجاد فایل پیکربندی ESLint با قوانین پیشنهادی (مثلاً eslint:recommended،Node.js،browser) و تنظیمات برای-ignore/node_modules
10. .github/workflows/lint.yml: ایجاد workflow که در push/pull_request اجرا می‌شود، node_setup می-conduct و eslint را روی فایل‌های src/js/ اجرا می‌نماید