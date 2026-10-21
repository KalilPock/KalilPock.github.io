import { animate, inView } from "motion";
import { prefersReducedMotion } from "./env";

const EASE = [0.16, 1, 0.3, 1] as const;

export function initReveal(): void {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal]"),
  );
  if (elements.length === 0) return;

  if (prefersReducedMotion()) {
    elements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const seen = new WeakSet<HTMLElement>();
  const groupIndex = new Map<Element, number>();

  elements.forEach((el) => {
    const parent = el.parentElement ?? document.body;
    const index = groupIndex.get(parent) ?? 0;
    groupIndex.set(parent, index + 1);

    const explicitDelay = Number(el.dataset.revealDelay);
    const delay = Number.isFinite(explicitDelay) && explicitDelay > 0
      ? explicitDelay
      : index * 0.07;

    const play = (): void => {
      if (seen.has(el)) return;
      seen.add(el);
      animate(
        el,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.6, delay, ease: EASE },
      );
    };

    inView(el, play, { amount: 0.2, margin: "0px 0px -8% 0px" });
  });
}
