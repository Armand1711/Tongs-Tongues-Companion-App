"use client";

import { useEffect, useRef } from "react";

const BURST_EVENT = "tt:ember-burst";

export function emberBurst(n: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<{ n: number }>(BURST_EVENT, { detail: { n } }));
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  decay: number;
  wobble: number;
  wobbleSpeed: number;
  wobbleAmp: number;
}

// Embers only ever appear as a celebration burst (coaster collect, set
// complete, winner reveal) — no idle/ambient haze over the cream campaign
// background.
export function EmberField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const burstBudgetRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function spawnBurst(): Particle {
      const w = canvas!.width;
      const h = canvas!.height;
      return {
        x: w / 2 + (Math.random() - 0.5) * 100,
        y: h * 0.55 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(2 + Math.random() * 3.5),
        size: 1.8 + Math.random() * 3.2,
        life: 1,
        decay: 0.007 + Math.random() * 0.011,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.08 + Math.random() * 0.1,
        wobbleAmp: 0.6 + Math.random() * 1,
      };
    }

    function handleBurst(event: Event) {
      const detail = (event as CustomEvent<{ n: number }>).detail;
      burstBudgetRef.current += detail?.n ?? 0;
    }
    window.addEventListener(BURST_EVENT, handleBurst);

    function tick() {
      const ctx = canvas!.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      while (burstBudgetRef.current > 0) {
        particlesRef.current.push(spawnBurst());
        burstBudgetRef.current -= 1;
      }

      for (const p of particlesRef.current) {
        p.vy *= 0.992;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleAmp * 0.06;
        p.y += p.vy;
        p.life -= p.decay;

        const alpha = Math.max(0, p.life * 0.9);
        const heat = Math.max(0, p.life);
        const hue = 14 + heat * 20;
        const light = 42 + heat * 14;
        const size = p.size * (0.6 + heat * 0.6);

        ctx.beginPath();
        ctx.shadowBlur = 6;
        ctx.shadowColor = `hsla(${hue}, 80%, ${light}%, ${alpha * 0.6})`;
        ctx.fillStyle = `hsla(${hue}, 80%, ${light}%, ${alpha})`;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      particlesRef.current = particlesRef.current.filter(
        (p) => p.life > 0 && p.y > -20
      );

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener(BURST_EVENT, handleBurst);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
