import { animate } from "motion";
import { hasFinePointer, prefersReducedMotion } from "./env";

const EASE = [0.16, 1, 0.3, 1] as const;

export function initMagnetic(): void {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const targets = document.querySelectorAll<HTMLElement>("[data-magnetic]");

  targets.forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.25;
    const radius = Number(el.dataset.magneticRadius) || 80;

    const onMove = (event: PointerEvent): void => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const reach = Math.max(rect.width, rect.height) / 2 + radius;

      if (Math.hypot(dx, dy) > reach) return;

      animate(
        el,
        { x: dx * strength, y: dy * strength },
        { duration: 0.35, ease: EASE },
      );
    };

    const reset = (): void => {
      animate(el, { x: 0, y: 0 }, { type: "spring", stiffness: 260, damping: 18 });
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", reset);
  });
}
