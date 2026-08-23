<div align="center">

# 💳 درگاه پرداخت گروه جهادی بسیج — نسخه 7.0.0

<img src="images/logo/cards-page-title-desktop.webp" alt="لوگوی پروژه" width="520" />

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-7.0.0-blue.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#مشارکت)

**پروژه وب استاتیک برای مدیریت نیات خیر و پرداخت‌های آنلاین**

[مشاهده دمو](https://mahdi-arts.github.io/Basij-Tamin/) • [گزارش باگ](https://github.com/Mahdi-Arts/Basij-Tamin/issues) • [درخواست ویژگی](https://github.com/Mahdi-Arts/Basij-Tamin/issues/new)

</div>

---

## 📖 فهرست مطالب

<details>
<summary>باز کردن فهرست</summary>

- [معرفی](#-معرفی)
- [ویژگی‌ها](#-ویژگیها)
- [اسکرین‌شات‌ها](#-اسکرینشاتها)
- [نصب و راه‌اندازی](#-نصب-و-راهاندازی)
- [ساختار پروژه](#-ساختار-پروژه)
- [مستندات استفاده](#-مستندات-استفاده)
- [پرسش‌های متداول](#-پرسشهای-متداول)
- [مشارکت](#-مشارکت)
- [مجوز](#-مجوز)
- [قدردانی](#-قدردانی)

</details>

---

## ✨ معرفی

پروژه **درگاه پرداخت بسیج** یک وب‌اپلیکیشن سبک و ایستا برای:

- 🎯 **هدایت کاربر** از انتخاب نیت تا ثبت پرداخت
- 📱 **سازگاری کامل** با موبایل و دسکتاپ
- 🌙 **حالت روز/شب** برای تجربه کاربری بهتر
- 🇮🇷 **طراحی راست‌به‌چپ** کاملاً فارسی
- 🛠️ **بدون وابستگی** (Zero Dependency) برای اجرای آسان

> **این پروژه به سفارش و همت هیأت اندیشه‌ورز بسیج سازمان تأمین اجتماعی توسعه یافته است.**

---

## 🚀 ویژگی‌ها

### 💎 طراحی بصری
| ویژگی | توضیح |
|-------|-------|
| **Glassmorphism** | افکت‌های شیشه‌ای مدرن |
| **انیمیشن‌های نرم** | بارش لوگو، پرواز کبوترها |
| **گرادیان پویا** | پس‌زمینه متحرک چشم‌نواز |
| **فونت Vazirmatn** | فونت اختصاصی فارسی |

### 🎮 تعامل کاربر
| ویژگی | توضیح |
|-------|-------|
| **منوهای چندسطحی** | با پشتیبانی کیبورد |
| **استان/شهر وابسته** | ۳۱ استان و بیش از ۱۰۰۰ شهر |
| **ثبت چند نیت** | همزمان با جمع کل لحظه‌ای |
| **مبلغ دلخواه** | با فرمت فارسی خودکار |

### ⚡ عملکرد
| ویژگی | توضیح |
|-------|-------|
| **تصاویر WebP** | حجم کمتر، کیفیت بالا |
| **Lazy Loading** | بارگذاری تنبل تصاویر |
| **فونت محلی** | بدون وابستگی خارجی |
| **Clarity فقط در HTTPS** | بدون خطا در محلی |

---

## 📸 اسکرین‌شات‌ها

<details>
<summary>مشاهده تصاویر</summary>

### صفحه لودینگ
نمایش انیمیشن بارگذاری با نوار پیشرفت شیشه‌ای

### صفحه کارت‌ها
گرید ۱۰ کارت نیت با افکت‌های بصری

### فرم پرداخت
فرم کامل با اعتبارسنجی و منوهای چندسطحی

</details>

---

## 🛠 نصب و راه‌اندازی

### پیش‌نیازها — Prerequisites
- مرورگر مدرن (Chrome, Firefox, Safari, Edge)
- Node.js 22+ و Python 3 (برای اسکریپت `npm start`)

### مراحل نصب

```bash
# 1. کلون کردن مخزن — Clone the repository
git clone https://github.com/Mahdi-Arts/Basij-Tamin.git

# 2. ورود به پوشه — Enter the folder
cd Basij-Tamin

# 3. ساخت و اجرای محلی — Build and serve locally
npm start
```

### اجرای محلی — Local run

پروژه از ماژول‌های ES و توکن `__SITE_ORIGIN__` استفاده می‌کند؛ بنابراین **باز کردن مستقیم فایل با `file://` کار نمی‌کند** و باید از یک وب‌سرور محلی استفاده شود. دستور زیر خروجی را می‌سازد و روی `http://localhost:8080` سرو می‌کند:

---

The project uses ES modules and the `__SITE_ORIGIN__` token, so **opening the files directly over `file://` does not work**; serve them over HTTP instead. The command below builds the output and serves it on `http://localhost:8080`:

```bash
npm start
# نشانی دلخواه: SITE_ORIGIN=https://example.org npm start
# custom origin: SITE_ORIGIN=https://example.org npm start
```

> **نکته:** در محیط محلی (پروتکل غیر HTTPS)، Microsoft Clarity بارگذاری نمی‌شود.
>
> ---
>
> **Note:** Microsoft Clarity is skipped on non-HTTPS local environments.

### تست محلی خروجی ساخته‌شده - Testing the built output

```bash
npm run validate                                # سنتکس، ارجاعات و گارد CSP — syntax, references, CSP guard
python3 -m http.server 8080 --directory site    # سرو خروجی نهایی — serve the built output
```

### استقرار - Deployment

#### تولید خروجی آمادهٔ انتشار — Prepare a deployable output

فایل `.env.example` را به `.env` کپی و نشانی عمومی نهایی سایت را وارد کنید. این نشانی برای `canonical`، Open Graph، `robots.txt` و `sitemap.xml` الزامی است.

---

Copy `.env.example` to `.env` and set the final public URL. This URL is required for canonical metadata, Open Graph, `robots.txt`, and `sitemap.xml`.

```bash
cp .env.example .env
# سپس مقدار SITE_ORIGIN را با نشانی واقعی سایت جایگزین کنید.
# Then replace SITE_ORIGIN with the real public site URL.
set -a && . ./.env && set +a
npm run validate
npm run build
python3 -m http.server 8080 --directory site
```

- **گیت‌هاب پیجز (خودکار) — GitHub Pages (automatic):** workflow مسیر `.github/workflows/pages.yml` در هر push به شاخهٔ `7.0` اعتبارسنجی، build و deploy را اجرا می‌کند. URL نهایی Pages در زمان build جایگزین می‌شود.
- **خود-میزبانی (اختیاری) — Self-hosting (optional):** پس از ساخت `.env`، دستور `docker compose up -d --build` سایت آماده را روی پورت `8080` اجرا می‌کند. `Dockerfile`، `docker-compose.yml` و `nginx.conf` برای این مسیر فراهم شده‌اند.
- **امنیت انتقال — Transport security:** TLS و HSTS باید در reverse proxy یا load balancer لایهٔ HTTPSِ نهایی پیکربندی شوند؛ Nginx این مخزن روی پورت داخلی `8080` سرویس می‌دهد.
- **وضعیت پرداخت — Payment status:** این نسخه به PSP متصل نیست و هیچ تراکنشی را ثبت یا ارسال نمی‌کند؛ پیش از ادعای پرداخت یا انتقال بانکی، اتصال سمت سرور و callback امن PSP لازم است.

#### محدودیت GitHub Pages پروژه‌ای — Project-Pages limitation

در انتشار «پروژه‌ای» (`https://<owner>.github.io/Basij-Tamin/`) خزنده‌ها فقط `robots.txt` ریشهٔ دامنه را می‌خوانند؛ بنابراین `Basij-Tamin/robots.txt` نادیده گرفته می‌شود و باید `sitemap.xml` را مستقیماً در Google Search Console ثبت کنید. در استقرار روی دامنهٔ اختصاصی (یا مسیر خود-میزبانی با Nginx) این محدودیت وجود ندارد و `robots.txt` معتبر است.

---

On project pages (`https://<owner>.github.io/Basij-Tamin/`), crawlers only read the domain-root `robots.txt`, so `Basij-Tamin/robots.txt` is ignored and `sitemap.xml` must be submitted directly in Google Search Console. A custom domain (or the self-hosted Nginx path) removes this limitation.

#### سیاست امنیت محتوا — Content Security Policy

`cards-form.html` و `payment-form.html` هیچ اسکریپت یا استایل اینلاینی ندارند و متا-CSP سخت‌گیرانه (`script-src 'self'`) دارند؛ اسکریپت `scripts/validate-site.mjs` این وضعیت را در CI تضمین می‌کند. `index.html` و `404.html` تنها یک بلوک `<style>` اینلاین دارند و از `style-src 'unsafe-inline'` استفاده می‌کنند.

---

`cards-form.html` and `payment-form.html` contain no inline script or style and ship a strict meta-CSP (`script-src 'self'`); `scripts/validate-site.mjs` enforces this in CI. `index.html` and `404.html` keep a single inline `<style>` block and therefore allow `style-src 'unsafe-inline'`.

> **محدودیت پذیرفته‌شده:** طبق CSP Level 3، دستور `frame-ancestors` هنگام تحویل از طریق `<meta>` نادیده گرفته می‌شود. چون GitHub Pages هدر سفارشی نمی‌پذیرد، محافظت Clickjacking تنها در مسیر خود-میزبانی (هدرهای `X-Frame-Options` و `frame-ancestors` در `nginx.conf`) فعال است.
>
> ---
>
> **Accepted limitation:** per CSP Level 3, `frame-ancestors` is ignored when delivered in a `<meta>` element. Because GitHub Pages cannot send custom headers, clickjacking protection is only active on the self-hosted path (`X-Frame-Options` and `frame-ancestors` in `nginx.conf`).

#### دارایی‌های dotLottie — dotLottie assets

فقط رندرر پیش‌فرض (`svg`) و چانک‌های موردنیاز آن در `assets/vendor/` نگهداری می‌شوند. اگر در آینده صفت `renderer="canvas"`، `renderer="html"`، `light` یا `worker` به `<dotlottie-player>` اضافه شد، باید چانک متناظر از بستهٔ رسمی `@dotlottie/player-component@2.7.12` دوباره کپی شود.

---

Only the default `svg` renderer and its chunks are kept in `assets/vendor/`. If a `renderer="canvas"`, `renderer="html"`, `light`, or `worker` attribute is later added to `<dotlottie-player>`, copy the matching chunk back from the official `@dotlottie/player-component@2.7.12` package.

---

## 📁 ساختار پروژه

```
Basij-Tamin/
├── 📄 index.html              # صفحه لودینگ — splash/loading page
├── 📄 cards-form.html         # صفحه کارت‌ها — niat cards page
├── 📄 payment-form.html       # فرم پرداخت — payment form
├── 📄 404.html                # صفحه خطا — branded 404 page
├── 📄 package.json            # تنظیمات پروژه — project metadata
│
├── 🔍 robots.txt              # سیاست خزیدن — crawling policy
├── 🗺️ sitemap.xml             # نقشهٔ سایت — site map
│
├── 🎨 cards-styles.css        # استایل کارت‌ها — cards styles
├── 🎨 payment-styles.css      # استایل فرم — form styles
│
├── 📜 cards-scripts.js        # منطق کارت‌ها — cards logic
├── 📜 payment-scripts.js      # منطق فرم — form logic
│
├── 🖼️ src/
│   ├── css/
│   │   └── fonts.css          # فونت‌های مشترک — shared fonts
│   └── js/
│       ├── clarity.js         # اسکریپت تحلیل (فقط روی HTTPS) — analytics (HTTPS only)
│       ├── utils.js           # توابع مشترک — shared utilities (safeStorage, normalizeMobile)
│       ├── splash.js          # منطق صفحهٔ اسپلش — splash-page logic
│       ├── dotlottie-fallback.js # فالبک پلیر با SRI — player fallback with SRI
│       ├── data.js            # داده‌های استان/شهر — province & city dataset
│       └── data-niat.js       # داده‌های نیات (منبع واحد نشانی‌های پرداخت)
│                              # niat data (single source of payment URLs)
│
├── 🖼️ images/
│   ├── cards/                 # تصاویر کارت‌ها — card images
│   ├── decorations/           # تزئینات — decorations
│   └── logo/                  # لوگوها و آیکون‌ها — logos & icons
│
├── 📂 fonts/                  # فونت Vazirmatn — Vazirmatn font
├── 📂 assets/vendor/          # کتابخانه‌های جانبی — vendor libraries
│
├── 🐳 Dockerfile              # ایمیج خود-میزبانی — self-hosting image
├── 🐳 docker-compose.yml      # ارکستراسیون — orchestration
├── 🌐 nginx.conf              # پیکربندی وب‌سرور + هدرهای امنیتی — server config
│
├── ⚙️ .github/workflows/      # تست و دیپلوی خودکار — CI/CD (test + Pages deploy)
├── 📚 docs/audits/            # گزارش‌های تحلیل دوره‌ای — periodic audit reports
└── 📜 LICENSE                 # مجوز MIT — MIT license
```

---

## 📘 مستندات استفاده

### پارامترهای URL

برای پیش‌انتخاب نیت از URL:

```html
<!-- مثال پیش‌انتخاب نذر درمانی -->
<a href="payment-form.html?cause=نذر_درمانی">پرداخت نذر درمانی</a>

<!-- مثال نیت چندسطحی -->
<a href="payment-form.html?cause=نذر_درمانی_تجهیزات_درمان_دستگاه_دیالیز">
  کمک به خرید دستگاه دیالیز
</a>
```

### سفارشی‌سازی

#### تغییر نیت‌ها
```javascript
// در src/js/data-niat.js
const NIAT_CARDS_RAW = [
  {"title":"نیت جدید"},
  {"title":"نیت با زیرمنو","menu":[
    {"title":"گزینه ۱"},
    {"title":"گزینه ۲"}
  ]}
];
```

#### تغییر رنگ‌ها
```css
/* در payment-styles.css */
:root {
  --green-main: #1E5939;
  --green-accent: #28744a;
}
```

#### تغییر موقعیت شمارنده
```html
<!-- کلاس‌های موجود: pos-tl, pos-tr, pos-bl, pos-br -->
<span class="notes-counter pos-tr">۰/۳۱۳</span>
```

---

## ❓ پرسش‌های متداول

<details>
<summary><b>چرا در localhost خطای Clarity می‌دهد؟</b></summary>

خطایی نمی‌دهد! اسکریپت Clarity فقط در HTTPS فعال می‌شود و در محیط محلی بی‌صدا غیرفعال است.
</details>

<details>
<summary><b>چگونه به درگاه بانکی واقعی متصل شوم؟</b></summary>

در `payment-scripts.js` بخش `form.addEventListener('submit')` را ویرایش کرده و به API درگاه خود متصل کنید.
</details>

<details>
<summary><b>آیا پروژه PWA است؟</b></summary>

فعلاً خیر، اما می‌توانید Service Worker اضافه کنید.
</details>

---

## 🤝 مشارکت

از مشارکت شما استقبال می‌کنیم! لطفاً:

1. 🍴 پروژه را Fork کنید
2. 🌿 شاخه جدید بسازید (`git checkout -b feature/amazing`)
3. 💾 تغییرات را Commit کنید (`git commit -m 'Add amazing feature'`)
4. 📤 Push کنید (`git push origin feature/amazing`)
5. 🔃 Pull Request باز کنید

### قوانین کد

- ✅ رعایت RTL و خوانایی
- ✅ کامنت به زبان فارسی
- ✅ استفاده از WebP برای تصاویر
- ✅ تست روی موبایل و دسکتاپ

---

## 🔄 تاریخچه نسخه‌ها

### نسخه 7.0.0 (جاری)
- 🔍 **سئوی تکنیکال:** افزودن `robots.txt`، `sitemap.xml`، `canonical` و `og:image/og:url` به همهٔ صفحات
- ⚡ **کاهش زمان اسپلش** از ۸ به ۲.۵ ثانیه + دکمهٔ «ردشدن» و فالبک `<noscript>`
- 🧩 **منبع واحد داده:** حذف دوگانگی منوهای کارت‌ها و اشتقاق خودکار نشانی‌های پرداخت در `data.js`
- 🔒 **آمادگی CSP:** حذف هندلرهای اینلاین `onerror` و انتقال فال‌بک تصاویر به جاوااسکریپت
- 📉 **کاهش ≈۳.۸ مگابایتی** دارایی‌های بلااستفاده (ونیل، فونت، سورس‌مپ)
- 🚀 **استقرار خودکار:** افزودن GitHub Actions برای دیپلوی روی GitHub Pages
- 🐳 **خود-میزبانی اختیاری:** `Dockerfile`، `docker-compose.yml` و `nginx.conf` با هدرهای امنیتی

### نسخه 6.7.8
- 🛠️ **بدون وابستگی (Zero Dependency):** اجرای مستقیم فایل‌های HTML بدون نیاز به سرور
- 🏥 **افزودن بخش نذر درمانی:** شامل ناباروری، بیماران صعب‌العلاج، تجهیزات درمان
- ♻️ **بازسازی ماژول‌ها:** بهینه‌سازی `utils.js` و `data.js` برای بارگذاری سریع‌تر
- 🐛 **رفع مشکل CORS:** حذف وابستگی به ES6 Modules برای اجرای file://

### نسخه 6.7.5
- ✨ افزودن بخش «توضیحات اختیاری» با شمارنده
- 🔧 بهبود اسکرول موبایل
- 🖼️ تبدیل تصاویر به WebP
- 🐛 رفع خطای Clarity در localhost

### نسخه 6.7.0
- 🎨 بازطراحی صفحه کارت‌ها
- 🌙 افزودن حالت شب

### نسخه 6.6.0
- 📱 بهبود ریسپانسیو
- ⚡ بهینه‌سازی عملکرد

---

## 📜 مجوز

این پروژه با مجوز **MIT** منتشر شده است.

```
MIT License

Copyright (c) 2025 گروه جهادی بسیج سازمان تأمین اجتماعی

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🙏 قدردانی

<div align="center">

**تقدیم به همت گروه جهادی بسیج سازمان تأمین اجتماعی**

*امید که موجب تسهیل امور خیر شود*

---

### منابع استفاده‌شده

| منبع | لینک |
|------|------|
| فونت Vazirmatn | [github.com/rastikerdar/vazirmatn](https://github.com/rastikerdar/vazirmatn) |
| dotLottie Player | [lottiefiles.com](https://lottiefiles.com) |
| Microsoft Clarity | [clarity.microsoft.com](https://clarity.microsoft.com) |

---

**ساخته شده با ❤️ توسط مهدی باغبانپور بروجنی**

</div>
