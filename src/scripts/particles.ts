import { clamp, prefersReducedMotion } from "./env";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export function initParticles(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext("2d");
  if (!context) return;
  const ctx: CanvasRenderingContext2D = context;

  const reduce = prefersReducedMotion();
  const styles = getComputedStyle(document.documentElement);
  const accent =
    styles.getPropertyValue("--color-accent").trim() || "#22d3ee";

  const LINK_DIST = 120;
  const MOUSE_DIST = 150;
  const BASE_SPEED = 0.22;
  const MAX_PARTICLES = 110;

  let particles: Particle[] = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let running = false;

  const mouse = { x: -9999, y: -9999 };
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  function spawn(): Particle {
    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.2, 0.2),
      vy: rand(-0.2, 0.2),
      r: rand(0.7, 1.8),
    };
  }

  function resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = clamp(Math.round((width * height) / 18_000), 26, MAX_PARTICLES);
    particles = Array.from({ length: count }, spawn);

    if (reduce) drawOnly();
    else if (!running) start();
  }

  function step(): void {
    for (const p of particles) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist2 = dx * dx + dy * dy;

      if (dist2 < MOUSE_DIST * MOUSE_DIST && dist2 > 0.01) {
        const dist = Math.sqrt(dist2);
        const force = (1 - dist / MOUSE_DIST) * 0.9;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      const speed = Math.hypot(p.vx, p.vy) || 0.0001;
      p.vx += ((p.vx / speed) * BASE_SPEED - p.vx) * 0.035;
      p.vy += ((p.vy / speed) * BASE_SPEED - p.vy) * 0.035;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -24) p.x = width + 24;
      else if (p.x > width + 24) p.x = -24;
      if (p.y < -24) p.y = height + 24;
      else if (p.y > height + 24) p.y = -24;
    }
  }

  function draw(): void {
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = accent;
    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      if (!a) continue;
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        if (!b) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > LINK_DIST * LINK_DIST) continue;

        ctx.globalAlpha = (1 - Math.sqrt(dist2) / LINK_DIST) * 0.16;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = accent;
    for (const p of particles) {
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawOnly(): void {
    draw();
  }

  function loop(): void {
    if (!running) return;
    step();
    draw();
    frame = requestAnimationFrame(loop);
  }

  function start(): void {
    if (reduce || running) return;
    running = true;
    frame = requestAnimationFrame(loop);
  }

  function stop(): void {
    running = false;
    cancelAnimationFrame(frame);
  }

  const onPointerMove = (event: PointerEvent): void => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  };

  const onPointerLeave = (): void => {
    mouse.x = -9999;
    mouse.y = -9999;
  };

  const onVisibility = (): void => {
    if (document.hidden) stop();
    else start();
  };

  let resizeFrame = 0;
  const onResize = (): void => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", onResize, { passive: true });

  resize();
}
