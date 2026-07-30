import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { rand, randInt } from "../../utils/random";

/**
 * The living night sky, drawn on a single full-screen canvas for performance.
 * Renders three layers: twinkling stars, drifting bokeh orbs, and the
 * occasional shooting star. Honours prefers-reduced-motion by painting a
 * calm, static field once instead of running the animation loop.
 */

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

interface Bokeh {
  x: number;
  y: number;
  r: number;
  hue: string;
  vx: number;
  vy: number;
  alpha: number;
}

interface Shooting {
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  life: number;
  maxLife: number;
}

const BOKEH_COLORS = ["#ff9fc4", "#c9b6ff", "#f6c667", "#ff5f9e", "#a78bfa"];

export function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let small = window.innerWidth < 640;
    // Phones: cap the backing store at 1.5× instead of 2× — a quarter fewer
    // pixels to fill every frame, invisible to the eye on a star field.
    let dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);

    let stars: Star[] = [];
    let bokeh: Bokeh[] = [];
    let shooting: Shooting[] = [];
    let raf = 0;

    const build = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      small = width < 640;
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Star density scales with screen area, capped (lower on phones for fps).
      const cap = small ? 120 : 460;
      const divisor = small ? 9000 : 4000;
      const count = Math.min(cap, Math.round((width * height) / divisor));
      stars = Array.from({ length: count }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        r: small ? rand(0.8, 2.4) : rand(0.5, 2.1),
        baseAlpha: rand(0.42, 1),
        twinkleSpeed: rand(0.6, 2.4),
        phase: rand(0, Math.PI * 2),
      }));

      // Each bokeh orb rebuilds a radial gradient every frame — keep few on phones.
      const bokehCount = Math.min(small ? 5 : 13, Math.round((width * height) / 150000));
      bokeh = Array.from({ length: bokehCount }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(40, 130),
        hue: BOKEH_COLORS[randInt(0, BOKEH_COLORS.length - 1)],
        vx: rand(-0.12, 0.12),
        vy: rand(-0.1, 0.1),
        alpha: rand(0.05, 0.16),
      }));
    };

    const drawStar = (s: Star, t: number) => {
      const twinkle =
        s.baseAlpha * (0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.phase));
      ctx.globalAlpha = Math.max(0, twinkle);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      // A canvas shadowBlur is re-rasterised per star, per frame — far too
      // costly on phones. Desktops keep the halo, phones get a slightly larger
      // crisp dot, which reads the same at arm's length.
      if (!small) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(255,240,250,0.9)";
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawBokeh = (b: Bokeh) => {
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, b.hue);
      grad.addColorStop(1, "transparent");
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    };

    const spawnShooting = () => {
      const fromLeft = Math.random() > 0.5;
      shooting.push({
        x: fromLeft ? rand(0, width * 0.4) : rand(width * 0.6, width),
        y: rand(0, height * 0.4),
        len: rand(120, 240),
        speed: rand(6, 11),
        angle: fromLeft ? rand(0.3, 0.6) : rand(2.55, 2.85),
        life: 0,
        maxLife: rand(40, 70),
      });
    };

    const drawShooting = (sh: Shooting) => {
      const tailX = sh.x - Math.cos(sh.angle) * sh.len;
      const tailY = sh.y - Math.sin(sh.angle) * sh.len;
      const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
      const fade = 1 - sh.life / sh.maxLife;
      grad.addColorStop(0, `rgba(255,255,255,${fade})`);
      grad.addColorStop(1, "transparent");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    };

    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      bokeh.forEach(drawBokeh);
      stars.forEach((s) => {
        ctx.globalAlpha = s.baseAlpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    let last = performance.now();
    const loop = (now: number) => {
      const t = now / 1000;
      last = now;
      ctx.clearRect(0, 0, width, height);

      // Bokeh drift
      bokeh.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.y > height + b.r) b.y = -b.r;
        drawBokeh(b);
      });

      // Stars twinkle
      stars.forEach((s) => drawStar(s, t));

      // Shooting stars — a little more often, up to 3 at a time
      if (Math.random() < 0.02 && shooting.length < 4) spawnShooting();
      shooting = shooting.filter((sh) => sh.life < sh.maxLife);
      shooting.forEach((sh) => {
        sh.x += Math.cos(sh.angle) * sh.speed;
        sh.y += Math.sin(sh.angle) * sh.speed;
        sh.life += 1;
        drawShooting(sh);
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };

    build();
    if (reduced) {
      renderStatic();
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      build();
      if (reduced) renderStatic();
    };
    window.addEventListener("resize", onResize);

    // Stop burning frames (and battery) while the page is in the background.
    const onVisibility = () => {
      if (reduced) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      void last;
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
