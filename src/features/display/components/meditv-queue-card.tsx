"use client";

import { getPoliColor } from "../constants/design-tokens";

type QueueCardProps = {
  card: {
    poliLabel: string;
    currentNumber: string;
    nextNumber: string;
    doctorName: string;
    roomName: string;
    statusLabel: string;
    status: string;
  };
  isHighlighted: boolean;
};

export function MeditvQueueCard({ card, isHighlighted }: QueueCardProps) {
  const accentColor = getPoliColor(card.poliLabel);

  return (
    <article
      data-highlighted={isHighlighted}
      className={`flex flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${isHighlighted ? "shadow-[0_0_0_3px_var(--meditv-status-calling),0_8px_32px_rgba(239,68,68,0.15)]" : ""}`}
      style={{ borderTop: `5px solid ${accentColor}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-block rounded-full px-3.5 py-1 text-[clamp(0.7rem,0.85vw,0.9rem)] font-semibold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {card.poliLabel}
        </span>
        <span className="text-[clamp(0.85rem,1vw,1.1rem)] text-[var(--meditv-muted-foreground)]">
          {card.doctorName}
        </span>
      </div>
      <div className="py-4 text-center">
        <span className="mb-1 block text-[clamp(0.75rem,0.9vw,1rem)] font-semibold uppercase tracking-wide text-[var(--meditv-status-calling)]">
          SEDANG DIPANGGIL
        </span>
        <span className="block text-[clamp(3rem,6vw,7rem)] font-extrabold leading-none text-[var(--meditv-queue-number)]">
          {card.currentNumber}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[10px] bg-[var(--meditv-muted)] p-2.5 text-center">
          <span className="mb-0.5 block text-[clamp(0.6rem,0.7vw,0.8rem)] text-[var(--meditv-muted-foreground)]">
            Berikutnya
          </span>
          <span className="block text-[clamp(0.9rem,1.2vw,1.4rem)] font-bold text-[var(--meditv-foreground)]">
            {card.nextNumber}
          </span>
        </div>
        <div className="rounded-[10px] bg-[var(--meditv-muted)] p-2.5 text-center">
          <span className="mb-0.5 block text-[clamp(0.6rem,0.7vw,0.8rem)] text-[var(--meditv-muted-foreground)]">
            Ruangan
          </span>
          <span className="block text-[clamp(0.9rem,1.2vw,1.4rem)] font-bold text-[var(--meditv-foreground)]">
            {card.roomName}
          </span>
        </div>
      </div>
    </article>
  );
}
