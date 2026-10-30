import { hasFinePointer, prefersReducedMotion } from "./env";

export function initTilt(): void {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const targets = document.querySelectorAll<HTMLElement>("[data-tilt]");

  targets.forEach((el) => {
    const max = Number(el.dataset.tiltMax) || 6;
    const glare = el.querySelector<HTMLElement>("[data-tilt-glare]");

    let rect: DOMRect | null = null;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let isHovered = false;
    let rafId = 0;

    const updateRect = () => {
      // Mede o elemento sem a distorção 3D ativa para coordenadas 100% estáveis
      const prevTransform = el.style.transform;
      el.style.transform = "none";
      rect = el.getBoundingClientRect();
      el.style.transform = prevTransform;
    };

    const loop = () => {
      // Interpolação suave (lerp) estável e contínua
      currentRotateX += (targetRotateX - currentRotateX) * 0.14;
      currentRotateY += (targetRotateY - currentRotateY) * 0.14;

      // Proteção absoluta contra NaN ou Infinity
      if (!Number.isFinite(currentRotateX)) currentRotateX = 0;
      if (!Number.isFinite(currentRotateY)) currentRotateY = 0;

      el.style.transform = `perspective(900px) rotateX(${currentRotateX.toFixed(3)}deg) rotateY(${currentRotateY.toFixed(3)}deg)`;

      const isSettled =
        !isHovered &&
        Math.abs(currentRotateX) < 0.05 &&
        Math.abs(currentRotateY) < 0.05;

      if (isSettled) {
        el.style.transform = "";
        el.style.willChange = "auto";
        if (glare) glare.style.opacity = "0";
        cancelAnimationFrame(rafId);
        rafId = 0;
        return;
      }

      rafId = requestAnimationFrame(loop);
    };

    const onEnter = (): void => {
      isHovered = true;
      el.style.willChange = "transform";
      updateRect();
      if (!rafId) rafId = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent): void => {
      if (!rect || rect.width === 0 || rect.height === 0) {
        updateRect();
      }
      if (!rect) return;

      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      if (!Number.isFinite(px) || !Number.isFinite(py)) return;

      // Clamping estrito para garantir limites [0, 1] e prevenir saltos bruscos nas bordas
      const clampedX = Math.max(0, Math.min(1, px));
      const clampedY = Math.max(0, Math.min(1, py));

      targetRotateY = (clampedX - 0.5) * 2 * max;
      targetRotateX = -(clampedY - 0.5) * 2 * max;

      if (glare) {
        glare.style.opacity = "1";
        glare.style.background = `radial-gradient(320px circle at ${clampedX * 100}% ${
          clampedY * 100
        }%, rgb(34 211 238 / 0.14), transparent 60%)`;
      }

      if (!rafId) rafId = requestAnimationFrame(loop);
    };

    const onLeave = (): void => {
      isHovered = false;
      targetRotateX = 0;
      targetRotateY = 0;
      if (glare) glare.style.opacity = "0";
      if (!rafId) rafId = requestAnimationFrame(loop);
    };

    el.addEventListener("pointerenter", onEnter, { passive: true });
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("blur", onLeave);
  });
}
