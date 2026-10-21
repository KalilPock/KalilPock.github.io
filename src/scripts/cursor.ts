import { hasFinePointer, prefersReducedMotion } from "./env";

export function initCursor(dot: HTMLElement, ring: HTMLElement): void {
  if (!hasFinePointer() || prefersReducedMotion()) {
    dot.remove();
    ring.remove();
    return;
  }

  const html = document.documentElement;
  html.classList.add("has-cursor");

  const HOVER_SELECTOR =
    'a, button, summary, label, [role="button"], [data-cursor="link"]';
  const TEXT_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let shown = false;

  const setShown = (value: boolean): void => {
    shown = value;
    dot.style.opacity = value ? "1" : "0";
    ring.style.opacity = value ? "1" : "0";
  };

  const onMove = (event: PointerEvent): void => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!shown) setShown(true);
  };

  const onLeave = (): void => setShown(false);

  const onOver = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    html.classList.remove("cursor-link", "cursor-text");

    if (target.closest(TEXT_SELECTOR)) {
      html.classList.add("cursor-text");
      return;
    }
    if (target.closest(HOVER_SELECTOR)) {
      html.classList.add("cursor-link");
    }
  };

  const tick = (): void => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

    requestAnimationFrame(tick);
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  document.addEventListener("pointerover", onOver, { passive: true });
  window.addEventListener("blur", onLeave);

  setShown(false);
  requestAnimationFrame(tick);
}
