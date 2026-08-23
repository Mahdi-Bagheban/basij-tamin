/* به نام خداوند بخشنده مهربان */

// ==========================================
// ابزارهای مشترک (Utils)
// ==========================================

class PigeonGlide {
    constructor(opts = {}) {
        this.urls = opts.urls || ['images/decorations/pigeon1.webp', 'images/decorations/pigeon2.webp'];
        this.count = 14;
        this.size = opts.size ?? 28;
        this.duration = opts.duration ?? 3000;
        this.rise = opts.rise ?? 240;
        this.spreadUp = opts.spreadUp ?? 1.05;
        this.drift = opts.drift ?? 150;
        this.wobbleAmp = opts.wobbleAmp ?? 10;
        this.wobbleHz = opts.wobbleHz ?? 1.1;
        this.maxTilt = opts.maxTilt ?? 16;
    }
    angleForIndex(i) {
        const u = (i / (this.count - 1) - 0.5) * 2;
        const base = (Math.PI / 2) + u * this.spreadUp;
        const jitter = (Math.random() - 0.5) * 0.12;
        return base + jitter;
    }
    easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    burstAt(x, y) {
        for (let i = 0; i < this.count; i++) {
            const img = new Image();
            img.src = this.urls[i % this.urls.length];
            img.alt = '';
            img.style.cssText = `position:fixed;left:0;top:0;width:${this.size}px;height:${this.size}px;pointer-events:none;z-index:2147483647;will-change:transform,opacity;`;
            document.body.appendChild(img);

            const ang = this.angleForIndex(i);
            const phase = Math.random() * Math.PI * 2;
            const drift = Math.cos(ang) * this.drift * (0.8 + Math.random() * 0.4);
            const sx = x - this.size / 2, sy = y - this.size / 2;
            const dur = this.duration * (0.92 + Math.random() * 0.2);
            const delay = i * 50 + Math.random() * 80;

            setTimeout(() => {
                const start = performance.now();
                const step = (now) => {
                    const t = Math.min(1, (now - start) / dur);
                    const e = this.easeOutCubic(t);
                    const up = -this.rise * e;
                    const side = drift * e + Math.sin((t * this.wobbleHz * 2 * Math.PI) + phase) * this.wobbleAmp * (1 - t);
                    const rot = (this.maxTilt * Math.sin((t * 2 * Math.PI * 0.8) + phase)).toFixed(1);
                    img.style.transform = `translate(${sx + side}px, ${sy + up}px) rotate(${rot}deg)`;
                    img.style.opacity = String(1 - t);
                    if (t < 1) requestAnimationFrame(step); else img.remove();
                };
                requestAnimationFrame(step);
            }, delay);
        }
    }
    burstAtElement(el) { const b = el.getBoundingClientRect(); this.burstAt(b.left + b.width / 2, b.top + b.height / 2); }
}

const toEnDigits = s => (s || '').replace(/[٠-٩۰-۹]/g, ch => String(ch.charCodeAt(0) & 15));
const toFaDigits = s => (s || '').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const debounce = (fn, d = 300) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d) } };
const toFaChars = s => (s || '')
    .replace(/\u064A/g, '\u06CC') /* ي → ی */
    .replace(/\u0643/g, '\u06A9') /* ك → ک */
    .replace(/\s+/g, ' ')
    .replace(/\u200c{2,}/g, '\u200c')
    .trim();
const uniq = arr => { const seen = new Set(), out = []; for (const x of arr) { if (!seen.has(x)) { seen.add(x); out.push(x); } } return out; };
const deepFreeze = obj => {
    if (!obj || typeof obj !== 'object') return obj;
    Object.freeze(obj);
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (v && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v);
    }
    return obj;
};

/**
 * دسترسی امن به حافظهٔ محلی؛ در مرورگرهای با ذخیره‌سازی مسدود استثنا پرتاب نمی‌کند.
 * ---
 * Safe localStorage access; never throws when storage is blocked or unavailable.
 */
const safeStorage = {
    get(key, fallback = null) {
        try {
            // Access can throw in private mode or when storage is disabled.
            const value = window.localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            window.localStorage.setItem(key, value);
            return true;
        } catch {
            // Quota or policy errors must never break page logic.
            return false;
        }
    },
};

/**
 * یکسان‌سازی شمارهٔ موبایل ایران به قالب 09XXXXXXXXX.
 * ---
 * Normalizes an Iranian mobile number to the 09XXXXXXXXX format.
 * @param {string} raw - ارقام ورودی (لاتین یا فارسی) / input digits (latin or persian)
 * @returns {string} شمارهٔ یکسان‌شده / normalized number
 */
const normalizeMobile = raw => {
    let value = toEnDigits(String(raw ?? '')).replace(/\D/g, '');
    if (!value) return '';
    if (value.startsWith('0098')) value = value.slice(4);
    else if (value.startsWith('98')) value = value.slice(2);
    if (!value.startsWith('0')) value = '0' + value;
    return value;
};

// Export for use in other modules
export { PigeonGlide, toEnDigits, toFaDigits, debounce, toFaChars, uniq, deepFreeze, safeStorage, normalizeMobile };