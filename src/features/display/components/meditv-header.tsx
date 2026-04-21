"use client";

import { Hospital } from "lucide-react";
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
      className="flex h-full items-center justify-between px-[2vh] text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--meditv-header-from), var(--meditv-header-to))",
      }}
    >
      <div className="flex items-center gap-[1.5vh]">
        <Hospital className="h-[4vh] w-[4vh] shrink-0 text-white opacity-90" />
        <div className="flex flex-col gap-[0.3vh]">
          <h1 className="text-[clamp(1rem,2.75vh,2.25rem)] font-bold">
            {clinicName}
          </h1>
          <p className="text-[clamp(0.5rem,1.1vh,0.9rem)] opacity-85">
            {clinicAddress}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-[0.2vh]">
        <span className="text-[clamp(1rem,2.8vh,2.2rem)] font-bold tabular-nums">
          {mounted ? timeStr : "\u2013"}
        </span>
        <span className="text-[clamp(0.75rem,1.6vh,1.35rem)] opacity-80">
          {mounted ? dateStr : "\u2013"}
        </span>
      </div>
    </header>
  );
}
