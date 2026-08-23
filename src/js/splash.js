/* به نام خداوند بخشنده مهربان */
/**
 * منطق صفحهٔ اسپلش: تناوب کپی‌رایت، انیمیشن نوار پیشرفت و هدایت یک‌بارهٔ کاربر.
 * ---
 * Splash-page logic: credit rotation, progress-bar animation, and one-shot navigation.
 */
"use strict";

(() => {
  // Credit rotation: EN -> FA after 4 seconds.
  const creditEN = document.getElementById("credit-en");
  const creditFA = document.getElementById("credit-fa");
  if (creditEN && creditFA) {
    creditEN.classList.add("show");
    setTimeout(() => { creditEN.classList.remove("show"); creditFA.classList.add("show"); }, 4000);
  }

  // Navigation guard: run once, whether triggered by the timer or the user.
  const NEXT_PAGE = "cards-form.html";
  let navigated = false;
  function goNext() {
    if (navigated) return;
    navigated = true;
    window.location.href = NEXT_PAGE;
  }

  // The skip control is a real link, so a plain click must keep its native behaviour.
  const skipLink = document.getElementById("skip-loader");
  skipLink?.addEventListener("click", () => { navigated = true; });

  const bar = document.querySelector(".glass-bar");
  const start = performance.now();
  const DURATION = 2500; // ms — shortened splash for faster access to content

  const easeInOutCubic = (x) => (x < 0.5) ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  function raf(now) {
    const t = Math.min(1, (now - start) / DURATION);
    const te = easeInOutCubic(t);
    const pct = Math.round(te * 100);

    // Keep ARIA state and the shared CSS variable in sync.
    bar?.setAttribute("aria-valuenow", pct);
    bar?.style.setProperty("--p", (te * 100).toFixed(2) + "%");

    if (t < 1) requestAnimationFrame(raf);
  }
  if (bar) requestAnimationFrame(raf);

  // Auto-advance to the intent-selection page once the splash completes.
  setTimeout(goNext, DURATION);
})();

/* ساخته شده توسط مهدی باغبانپور بروجنی */
