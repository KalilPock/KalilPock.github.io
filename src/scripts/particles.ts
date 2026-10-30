import { clamp, prefersReducedMotion } from "./env";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  depth: number;
}

export function initParticles(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext("2d");
  if (!context) return;
  const ctx: CanvasRenderingContext2D = context;

  const reduce = prefersReducedMotion();
  const styles = getComputedStyle(document.documentElement);
  const accent1 = styles.getPropertyValue("--color-accent").trim() || "#22d3ee";
  const accent2 = styles.getPropertyValue("--color-accent-2").trim() || "#a3e635";

  let linkDist = 135;
  let mouseLinkDist = 175;
  let mouseRadius = 185;
  let baseSpeed = 0.26;

  let particles: Particle[] = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let running = false;
  let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;

  const mouse = { x: -9999, y: -9999, active: false };
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  function spawn(): Particle {
    const isSpecial = Math.random() < 0.16;
    const depth = rand(0.6, 1.15);
    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.22, 0.22) * depth,
      vy: rand(-0.22, 0.22) * depth,
      r: (isSpecial ? rand(1.3, 2.1) : rand(0.7, 1.5)) * depth,
      color: isSpecial ? accent2 : accent1,
      depth,
    };
  }

  function resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Usa diretamente a viewport para garantir que cubra 100% da tela em qualquer monitor
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isDesktop = width >= 1024;
    const isTablet = width >= 640 && width < 1024;

    // Densidade equilibrada e suave:
    // Mobile (~30-38), Tablet (~55-75), Desktop (~95-145) distribuídos por toda a tela
    const divisor = isDesktop ? 14_000 : isTablet ? 15_000 : 16_000;
    const maxParticles = isDesktop ? 145 : isTablet ? 75 : 36;
    const minParticles = isDesktop ? 90 : isTablet ? 45 : 24;

    const count = clamp(Math.round((width * height) / divisor), minParticles, maxParticles);
    particles = Array.from({ length: count }, spawn);

    // Ajusta distâncias conforme o tamanho da viewport
    linkDist = isDesktop ? 140 : isTablet ? 125 : 110;
    mouseLinkDist = isDesktop ? 180 : 135;
    mouseRadius = isDesktop ? 190 : 145;
    baseSpeed = isDesktop ? 0.28 : 0.22;

    if (reduce) drawOnly();
    else if (!running) start();
  }

  function step(): void {
    const mouseRadius2 = mouseRadius * mouseRadius;

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i]!;

      // Interação suave com o cursor do mouse
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < mouseRadius2 && dist2 > 9) {
          const dist = Math.sqrt(dist2);
          const force = (1 - dist / mouseRadius) * 0.65;

          if (dist > 45) {
            p.vx -= (dx / dist) * force * 0.3;
            p.vy -= (dy / dist) * force * 0.3;
          } else {
            p.vx += (dx / dist) * force * 0.45;
            p.vy += (dy / dist) * force * 0.45;
          }
        }
      }

      // Estabilização de velocidade de cruzeiro
      const targetSpeed = baseSpeed * p.depth;
      const speed = Math.hypot(p.vx, p.vy) || 0.0001;
      p.vx += ((p.vx / speed) * targetSpeed - p.vx) * 0.025;
      p.vy += ((p.vy / speed) * targetSpeed - p.vy) * 0.025;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap suave das bordas em toda a largura e altura da tela
      const margin = 28;
      if (p.x < -margin) p.x = width + margin;
      else if (p.x > width + margin) p.x = -margin;
      if (p.y < -margin) p.y = height + margin;
      else if (p.y > height + margin) p.y = -margin;
    }
  }

  function draw(): void {
    ctx.clearRect(0, 0, width, height);

    const linkDist2 = linkDist * linkDist;
    const mouseLinkDist2 = mouseLinkDist * mouseLinkDist;

    // 1. Linhas suaves entre partículas na tela toda
    ctx.lineWidth = 0.85;
    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i]!;
      let connections = 0;

      for (let j = i + 1; j < particles.length; j += 1) {
        if (connections >= 4) break; // Limite de 4 conexões por nó para visual clean e ótima performance
        const b = particles[j]!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;

        if (dist2 > linkDist2) continue;

        const dist = Math.sqrt(dist2);
        // Alpha suave para compor o fundo sem ofuscar textos
        const alpha = (1 - dist / linkDist) * 0.16;
        ctx.strokeStyle = a.color === accent2 || b.color === accent2 ? accent2 : accent1;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        connections += 1;
      }

      // 2. Conexão elegante com o cursor do mouse
      if (mouse.active) {
        const dxMouse = a.x - mouse.x;
        const dyMouse = a.y - mouse.y;
        const mouseDist2 = dxMouse * dxMouse + dyMouse * dyMouse;

        if (mouseDist2 < mouseLinkDist2) {
          const distM = Math.sqrt(mouseDist2);
          const alphaM = (1 - distM / mouseLinkDist) * 0.32;

          ctx.strokeStyle = accent1;
          ctx.globalAlpha = alphaM;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // 3. Desenho dos pontos (partículas)
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i]!;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.color === accent2 ? 0.65 : 0.48;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Indicador sutil do cursor no canvas
    if (mouse.active) {
      ctx.fillStyle = accent1;
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
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
    mouse.active = true;
  };

  const onPointerLeave = (): void => {
    mouse.active = false;
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

  const onScroll = (): void => {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Pequeno paralaxe de rolagem suave
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i]!;
      p.y -= deltaY * 0.08 * p.depth;
    }
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  resize();
}
