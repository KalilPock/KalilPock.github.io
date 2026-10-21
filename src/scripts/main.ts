import { initCursor } from "./cursor";
import { initMagnetic } from "./magnetic";
import { initParticles } from "./particles";
import { initReveal } from "./reveal";
import { initTilt } from "./tilt";

let booted = false;

function boot(): void {
  if (booted) return;
  booted = true;

  const root = document.documentElement;

  try {
    const canvas = document.querySelector<HTMLCanvasElement>("#fx-canvas");
    if (canvas) initParticles(canvas);

    const dot = document.querySelector<HTMLElement>("[data-cursor-dot]");
    const ring = document.querySelector<HTMLElement>("[data-cursor-ring]");
    if (dot && ring) initCursor(dot, ring);

    initMagnetic();
    initTilt();
    initReveal();
  } catch (error) {
    console.error("[fx] falha ao inicializar efeitos", error);
    root.classList.remove("js");
  } finally {
    root.setAttribute("data-fx-ready", "");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

document.addEventListener("astro:page-load", boot);
