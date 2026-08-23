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

### پیش‌نیازها
- مرورگر مدرن (Chrome, Firefox, Safari, Edge)
- وب‌سرور ساده یا Live Server

### مراحل نصب

```bash
# 1. کلون کردن مخزن — Clone the repository
git clone https://github.com/Mahdi-Arts/Basij-Tamin.git

# 2. ورود به پوشه — Enter the folder
cd Basij-Tamin

# 3. اجرا با Live Server (VS Code)
# یا باز کردن index.html در مرورگر
```

### اجرای محلی

1. فایل `index.html` را در مرورگر باز کنید
2. یا از افزونه **Live Server** در VS Code استفاده کنید

> **نکته:** در محیط محلی، Microsoft Clarity بارگذاری نمی‌شود.

### تست محلی با سرور - Local Testing with a Static Server

```bash
python3 -m http.server 8080
# سپس باز کنید: http://localhost:8080 — then open http://localhost:8080
```

### استقرار - Deployment

- **گیت‌هاب پیجز (خودکار):** هر پوش به شاخهٔ اصلی، با ورک‌فلوی `.github/workflows/deploy.yml` به Pages دیپلوی می‌شود؛ توکن `__SITE_ORIGIN__` در فایل‌های HTML و `sitemap.xml` به‌صورت خودکار با نشانی واقعی جایگزین می‌گردد.
- **خود-میزبانی (اختیاری):** با `docker compose up -d` سرویس `nginx` روی پورت ۸۰۸۰ بالا می‌آید — `Dockerfile`, `docker-compose.yml` and `nginx.conf` are provided for self-hosting with security headers.

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
│       ├── utils.js           # توابع مشترک — shared utilities
│       └── data.js            # داده‌های استان/نیت (منبع واحد نشانی‌های پرداخت)
│                              # provinces & niat data (single source of payment URLs)
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
// در src/js/data.js
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
