"use client";

import { useEffect, useRef } from "react";

type Orb = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  color: string;
};

/** Light: pastel, airy — no muddy mid-opacity orange */
const LIGHT = [
  "rgba(255, 196, 160, 0.55)",
  "rgba(255, 214, 186, 0.45)",
  "rgba(230, 242, 150, 0.5)",
  "rgba(255, 176, 140, 0.4)",
];

/** Dark: richer brand orange + lime */
const DARK = [
  "rgba(245, 59, 0, 0.4)",
  "rgba(255, 110, 60, 0.32)",
  "rgba(206, 247, 88, 0.22)",
  "rgba(255, 140, 90, 0.28)",
];

function isDark() {
  return document.documentElement.classList.contains("dark");
}

function palette() {
  return isDark() ? DARK : LIGHT;
}

export function AuthOrbs() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let orbs: Orb[] = [];

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) {
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function applyColors() {
      const colors = palette();
      orbs.forEach((orb, i) => {
        orb.color = colors[i % colors.length]!;
      });
    }

    function seed() {
      const colors = palette();
      orbs = colors.map((color, i) => {
        const r = Math.min(w, h) * (0.22 + i * 0.04);
        return {
          x: w * (0.2 + (i % 3) * 0.28),
          y: h * (0.25 + (i % 2) * 0.35),
          r,
          vx: (0.15 + i * 0.05) * (i % 2 === 0 ? 1 : -1),
          vy: (0.12 + i * 0.04) * (i % 2 === 0 ? -1 : 1),
          color,
        };
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const orb of orbs) {
        const g = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, orb.color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function tick() {
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r * 0.2 || orb.x > w + orb.r * 0.2) {
          orb.vx *= -1;
        }
        if (orb.y < -orb.r * 0.2 || orb.y > h + orb.r * 0.2) {
          orb.vy *= -1;
        }
      }
      draw();
      raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      const prevW = w;
      const prevH = h;
      resize();
      if (w === 0 || h === 0) {
        return;
      }
      if (w !== prevW || h !== prevH || !orbs.length) {
        seed();
      }
      draw();
    };

    onResize();
    if (!reduceMotion) {
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("resize", onResize);

    const parent = canvas.parentElement;
    const ro =
      parent && typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (parent && ro) {
      ro.observe(parent);
    }

    const themeWatch = new MutationObserver(() => {
      applyColors();
      draw();
    });
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      themeWatch.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="auth-orbs" aria-hidden />;
}
