export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = (): boolean =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
