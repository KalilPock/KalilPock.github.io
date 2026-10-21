import { animate } from "motion";
import { hasFinePointer, prefersReducedMotion } from "./env";

export function initTilt(): void {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const targets = document.querySelectorAll<HTMLElement>("[data-tilt]");

  targets.forEach((el) => {
    const max = Number(el.dataset.tiltMax) || 7;
    const glare = el.querySelector<HTMLElement>("[data-tilt-glare]");

    const onMove = (event: PointerEvent): void => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 2 * max;
      const rotateX = -(py - 0.5) * 2 * max;

      animate(
        el,
        { rotateX, rotateY, transformPerspective: 900 },
        { duration: 0.2, ease: "easeOut" },
      );

      if (glare) {
        glare.style.opacity = "1";
        glare.style.background = `radial-gradient(300px circle at ${px * 100}% ${
          py * 100
        }%, rgb(34 211 238 / 0.14), transparent 60%)`;
      }
    };

    const reset = (): void => {
      animate(
        el,
        { rotateX: 0, rotateY: 0, transformPerspective: 900 },
        { type: "spring", stiffness: 200, damping: 20 },
      );
      if (glare) glare.style.opacity = "0";
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", reset);
    el.addEventListener("blur", reset);
  });
}
