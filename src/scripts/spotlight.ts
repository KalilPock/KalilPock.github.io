import { hasFinePointer, prefersReducedMotion } from "./env";

export function initSpotlight(): void {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const targets = document.querySelectorAll<HTMLElement>("[data-spotlight]");
  if (targets.length === 0) return;

  targets.forEach((card) => {
    const onMove = (event: PointerEvent): void => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty("--spotlight-x", `${x}px`);
      card.style.setProperty("--spotlight-y", `${y}px`);
      card.style.setProperty("--spotlight-opacity", "1");
    };

    const onLeave = (): void => {
      card.style.setProperty("--spotlight-opacity", "0");
    };

    card.addEventListener("pointermove", onMove, { passive: true });
    card.addEventListener("pointerleave", onLeave);
  });
}
