"use client";

import { useEffect, useState } from "react";

function fmt2(n: number) {
  return String(n).padStart(2, "0");
}

function partsUntil(endsAt: number) {
  const remain = Math.max(0, endsAt - Date.now());
  return {
    days: Math.floor(remain / 86_400_000),
    hours: fmt2(Math.floor((remain % 86_400_000) / 3_600_000)),
    mins: fmt2(Math.floor((remain % 3_600_000) / 60_000)),
  };
}

export function ChallengeCountdown({ endsAt }: { endsAt: string }) {
  const endsAtMs = new Date(endsAt).getTime();
  const [parts, setParts] = useState(() => partsUntil(endsAtMs));

  useEffect(() => {
    const id = setInterval(() => setParts(partsUntil(endsAtMs)), 1000);
    return () => clearInterval(id);
  }, [endsAtMs]);

  return (
    <div className="flex gap-2">
      <CountdownUnit value={parts.days} label="days" pulse />
      <CountdownUnit value={parts.hours} label="hrs" />
      <CountdownUnit value={parts.mins} label="min" />
    </div>
  );
}

function CountdownUnit({
  value,
  label,
  pulse,
}: {
  value: string | number;
  label: string;
  pulse?: boolean;
}) {
  return (
    <div className="min-w-[52px] rounded-[10px] bg-white/10 px-2.5 py-2 text-center">
      <div
        className={`font-heading text-lg font-bold ${pulse ? "animate-tick-pulse" : ""}`}
      >
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wide text-white/50">
        {label}
      </div>
    </div>
  );
}
