/* به نام خداوند بخشنده مهربان */
/**
 * دادهٔ نیات خیر و اشتقاق نشانی پرداخت؛ جدا از دادهٔ جغرافیایی تا صفحهٔ کارت‌ها
 * فهرست استان/شهر را دریافت و پردازش نکند.
 * ---
 * Niat (charitable intent) data and payment-URL derivation, split from the geographic
 * dataset so the cards page never downloads or processes the province/city list.
 */

// ==========================================
// داده‌ها — نیات خیر (Niat Data)
// ==========================================

/* ——— نیت‌های خیر (منوی چندسطحی) ——— */
const NIAT_CARDS_RAW = [
    { "title": "قلک بیمه" },
    {
        "title": "نذر درمانی", "menu": [
            { "title": "داروهای بیماران سرطانی و صعب العلاج" },
            { "title": "کمک هزینه ناباروری" },
            { "title": "هزینه درمان بیماران ناتوان مالی" },
            {
                "title": "تجهیزات درمان", "submenu": [
                    { "title": "دستگاه دیالیز" }, { "title": "جراحی چشم" }, { "title": "اکو قلب" },
                    { "title": "سونوگرافی" }, { "title": "سونوگرافی تخصصی" }, { "title": "ماموگرافی" },
                    { "title": "تجهیزات آزمایشگاه بیوشیمی" }, { "title": "شمارشگر خون" }, { "title": "دستگاه گاز خون" },
                    { "title": "لنز و تجهیزات چشم" }, { "title": "پروتزهای مفصل" }, { "title": "پروتز ستون فقرات" }
                ]
            }
        ]
    },
    {
        "title": "نذر سازندگی", "menu": [
            { "title": "ساخت مراکز درمانی" }, { "title": "ساخت مراکز بیمه‌ای" }, { "title": "ساخت همراه‌سرا" }
        ]
    },
    { "title": "نذر نان" },
    {
        "title": "مواکب شهدای بسیج", "menu": [
            { "title": "موکب کربلا" }, { "title": "مواکب سراسر کشور" }, { "title": "چایخانه حضرت رضا (ع)" }
        ]
    },
    { "title": "نذر قربانی" },
    {
        "title": "کمک معیشتی و نذر مؤمنانه", "menu": [
            { "title": "نذر فرهنگی" }, { "title": "کمک به خرید جهیزیه" }, { "title": "کمک هزینه ازدواج" }, { "title": "کمک به جبهه مقاومت" }
        ]
    },
    {
        "title": "وجوهات شرعی", "menu": [
            { "title": "خمس", "submenu": [{ "title": "خمس عام" }, { "title": "خمس سادات" }] },
            { "title": "کفاره", "submenu": [{ "title": "کفاره عام" }, { "title": "کفاره سادات" }] },
            { "title": "فطریه", "submenu": [{ "title": "فطریه عام" }, { "title": "فطریه سادات" }] },
            { "title": "خیرات اموات" }, { "title": "ثلث مال" }, { "title": "رد مظالم" }, { "title": "صدقه" }
        ]
    },
    { "title": "آزادی زندانیان غیرعمد" },
    { "title": "نذر عام" }
];

/**
 * یکسان‌سازی نویسه‌های فارسی در کل درخت نیات (بازگشتی روی menu و submenu).
 * ---
 * Normalizes Persian characters across the whole niat tree (recursive over menu/submenu).
 * @param {Array} nodes - درخت خام نیات / raw niat tree
 * @returns {Array} درخت یکسان‌شده / normalized tree
 */
function normalizeMenuTree(nodes = []) {
    const walk = (arr = []) => arr.map(n => {
        const title = window.toFaChars(n.title);
        const node = { title };
        if (Array.isArray(n.menu) && n.menu.length) node.menu = walk(n.menu);
        if (Array.isArray(n.submenu) && n.submenu.length) node.submenu = walk(n.submenu);
        return node;
    });
    return walk(nodes);
}

/**
 * اشتقاق خودکار نشانی پرداخت برای برگ‌ها — عنوان‌های مسیر با زیرخط به هم می‌چسبند -
 * Auto-derive payment URLs on leaf nodes; ancestor titles are joined with underscores.
 * @param {Array} nodes - درخت نیات / niat tree
 * @param {string[]} trail - عناوین مسیر تا این گره / ancestor title trail
 * @returns {Array} همان درخت با افزودن `url` به برگ‌ها / same tree, leaves gain `url`
 */
function derivePaymentUrls(nodes = [], trail = []) {
    return nodes.map(n => {
        const path = trail.concat(n.title);
        const children = n.menu || n.submenu;
        if (Array.isArray(children) && children.length) {
            const node = { title: n.title };
            if (n.menu) node.menu = derivePaymentUrls(n.menu, path);
            else node.submenu = derivePaymentUrls(n.submenu, path);
            return node;
        }
        return { title: n.title, url: 'payment-form.html?cause=' + path.map(t => t.replace(/\s+/g, '_')).join('_') };
    });
}

// Expose globals
window.NIAT_CARDS_RAW = NIAT_CARDS_RAW;
window.normalizeMenuTree = normalizeMenuTree;

// Initialize
// نکته: چون این فایل بعد از utils.js لود می‌شود، توابع window.toFaChars موجود هستند
try {
    window.NIAT_CARDS = window.deepFreeze(derivePaymentUrls(normalizeMenuTree(NIAT_CARDS_RAW)));
} catch (e) {
    console.warn("Niat data initialization deferred (utils might not be ready)", e);
}
