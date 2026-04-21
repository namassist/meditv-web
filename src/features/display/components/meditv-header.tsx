"use client";

import { useEffect, useState } from "react";

export function MeditvHeader({
  clinicName,
  clinicAddress,
}: {
  clinicName: string;
  clinicAddress: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header
      className="flex items-center justify-between px-8 py-5 text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--meditv-header-from), var(--meditv-header-to))",
      }}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-[clamp(1.25rem,2vw,2rem)] font-bold">
          {clinicName}
        </h1>
        <p className="text-[clamp(0.75rem,1vw,1rem)] opacity-85">
          {clinicAddress}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-bold tabular-nums">
          {mounted ? timeStr : "\u2013"}
        </span>
        <span className="text-[clamp(0.7rem,0.9vw,0.95rem)] opacity-80">
          {mounted ? dateStr : "\u2013"}
        </span>
      </div>
    </header>
  );
}
