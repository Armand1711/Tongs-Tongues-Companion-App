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
    <div className="flex flex-1 gap-2">
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
    <div className="flex-1 rounded-xl bg-white/10 px-1 py-2 text-center">
      <div
        className={`font-heading text-lg font-bold ${pulse ? "animate-tick-pulse" : ""}`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-weber-cream/85">
        {label}
      </div>
    </div>
  );
}
