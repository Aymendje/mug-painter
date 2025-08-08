// mobile-support.js - Lightweight mobile enhancements (non-intrusive)

// === DETECTION ===
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isMobileViewport = () => window.innerWidth <= 768;
const isIOS = (() => {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const isAppleTouch = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || isAppleTouch;
})();

// === PUBLIC INIT ===
export function initMobileSupport() {
  if (!isTouchDevice && !isMobileViewport()) return;

  try {
    optimizeViewport();
    optimizeUI();
    optimizeScrolling();
  } catch (error) {
    console.warn('Skipping some mobile enhancements:', error);
  }
}

// === VIEWPORT ===
function optimizeViewport() {
  // Ensure a viewport meta exists; do not override if present
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(viewportMeta);
  }

  // Prevent zoom on input focus (iOS) by ensuring 16px font-size minimum
  if (isIOS) {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((el) => {
      el.addEventListener('focus', () => {
        const computed = window.getComputedStyle(el).fontSize;
        const numeric = parseFloat(computed || '16');
        if (Number.isFinite(numeric) && numeric < 16) {
          el.style.fontSize = '16px';
        }
      }, { passive: true });
    });
  }
}

// === UI TOUCH TARGETS ===
function optimizeUI() {
  if (!isTouchDevice && !isMobileViewport()) return;

  // Touch-friendly buttons
  const buttons = document.querySelectorAll('button, .btn');
  buttons.forEach((button) => {
    if (!button.style.minHeight) button.style.minHeight = '44px';
    if (!button.style.minWidth) button.style.minWidth = '44px';
  });

  // Comfortable form controls
  const controls = document.querySelectorAll('input, select, textarea');
  controls.forEach((control) => {
    if (!control.style.minHeight) control.style.minHeight = '40px';
  });
}

// === SCROLLING ===
function optimizeScrolling() {
  // Momentum scrolling on iOS for scrollable containers only (non-global)
  if (!isIOS) return;
  const scrollables = document.querySelectorAll(
    'body, .overflow-auto, [class*="overflow-auto"], .overflow-scroll, [class*="overflow-scroll"]'
  );
  scrollables.forEach((el) => {
    el.style.webkitOverflowScrolling = 'touch';
  });
}


