/* به نام خداوند بخشنده مهربان */
/**
 * تضمین موجودبودن مؤلفهٔ dotlottie-player: ابتدا دارایی محلی، سپس CDN سنجاق‌شده با SRI.
 * ---
 * Guarantees the dotlottie-player element exists: local asset first, then a pinned CDN copy with SRI.
 */

(async () => {
  try {
    if (!customElements.get('dotlottie-player')) {
      await import('./../../assets/vendor/dotlottie-player.mjs');
    }
  } catch {
    // Local asset unavailable; the CDN fallback below takes over.
  }

  if (customElements.get('dotlottie-player')) return;

  const script = document.createElement('script');
  script.type = 'module';
  // Pinned version + SRI to block upstream supply-chain tampering.
  script.src = 'https://cdn.jsdelivr.net/npm/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs';
  script.integrity = 'sha384-ypAFdIpmPhrhuVLN9fmIZaqZHGUVSzHiiplL/kPO2+gJ4Na4yRVbVt0YhyvWdbwn';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
})();

/* ساخته شده توسط مهدی باغبانپور بروجنی */
