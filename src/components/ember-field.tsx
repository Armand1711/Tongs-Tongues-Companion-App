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

const AMBIENT_MAX = 42;

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

    function spawnAmbient(): Particle {
      const w = canvas!.width;
      const h = canvas!.height;
      return {
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.9,
        y: h + 6 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -(0.6 + Math.random() * 1.1),
        size: 0.9 + Math.random() * 2,
        life: 1,
        decay: 0.0035 + Math.random() * 0.006,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.04 + Math.random() * 0.06,
        wobbleAmp: 0.4 + Math.random() * 0.9,
      };
    }

    function spawnBurst(): Particle {
      const w = canvas!.width;
      const h = canvas!.height;
      return {
        x: w / 2 + (Math.random() - 0.5) * 100,
        y: h * 0.55 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(2 + Math.random() * 3.5),
        size: 1.4 + Math.random() * 2.8,
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
      while (particlesRef.current.length < AMBIENT_MAX) {
        particlesRef.current.push(spawnAmbient());
      }

      ctx.globalCompositeOperation = "lighter";
      for (const p of particlesRef.current) {
        p.vy *= 0.992;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleAmp * 0.06;
        p.y += p.vy;
        p.life -= p.decay;

        const alpha = Math.max(0, p.life * 0.85);
        const heat = Math.max(0, p.life);
        const hue = 12 + heat * 40;
        const light = 45 + heat * 25;
        const size = p.size * (0.6 + heat * 0.6);

        ctx.beginPath();
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${hue}, 95%, ${light}%, ${alpha})`;
        ctx.fillStyle = `hsla(${hue}, 95%, ${light}%, ${alpha})`;
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
      <div
        className="animate-flame-flicker absolute -inset-x-[20%] -bottom-[10%] h-[46%] blur-[6px]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, oklch(0.55 0.2 45 / 65%) 0%, oklch(0.45 0.2 30 / 40%) 35%, transparent 70%)",
        }}
      />
      <div
        className="animate-flame-flicker absolute inset-x-[10%] -bottom-[10%] h-[30%] blur-[4px]"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 100%, oklch(0.8 0.17 70 / 55%) 0%, transparent 70%)",
          animationDirection: "reverse",
          animationDuration: "1.7s",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-95" />
    </div>
  );
}
