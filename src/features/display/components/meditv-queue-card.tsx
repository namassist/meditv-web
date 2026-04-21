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
      className={`flex h-full flex-col justify-between rounded-[min(1.5vh,12px)] bg-white p-[min(1.8vh,14px)] shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${isHighlighted ? "shadow-[0_0_0_3px_var(--meditv-status-calling),0_8px_32px_rgba(239,68,68,0.15)]" : ""}`}
      style={{
        borderTop: `${Math.max(3, Math.min(5, 0.7))}px solid ${accentColor}`,
      }}
    >
      <div className="flex items-center gap-[0.8vh]">
        <span
          className="inline-block rounded-full px-[1vh] py-[0.4vh] text-[clamp(0.55rem,1.2vh,0.9rem)] font-semibold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {card.poliLabel}
        </span>
        <span className="text-[clamp(0.6rem,1.4vh,1.1rem)] text-[var(--meditv-muted-foreground)]">
          {card.doctorName}
        </span>
      </div>
      <div className="py-[1vh] text-center">
        <span className="mb-[0.3vh] block text-[clamp(0.5rem,1.1vh,1rem)] font-semibold uppercase tracking-wide text-[var(--meditv-status-calling)]">
          SEDANG DIPANGGIL
        </span>
        <span className="block text-[clamp(1.8rem,8vh,7rem)] font-extrabold leading-none text-[var(--meditv-queue-number)]">
          {card.currentNumber}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-[0.8vh]">
        <div className="rounded-[min(1vh,8px)] bg-[var(--meditv-muted)] p-[0.8vh] text-center">
          <span className="mb-[0.2vh] block text-[clamp(0.45rem,0.9vh,0.8rem)] text-[var(--meditv-muted-foreground)]">
            Berikutnya
          </span>
          <span className="block text-[clamp(0.65rem,1.6vh,1.4rem)] font-bold text-[var(--meditv-foreground)]">
            {card.nextNumber}
          </span>
        </div>
        <div className="rounded-[min(1vh,8px)] bg-[var(--meditv-muted)] p-[0.8vh] text-center">
          <span className="mb-[0.2vh] block text-[clamp(0.45rem,0.9vh,0.8rem)] text-[var(--meditv-muted-foreground)]">
            Ruangan
          </span>
          <span className="block text-[clamp(0.65rem,1.6vh,1.4rem)] font-bold text-[var(--meditv-foreground)]">
            {card.roomName}
          </span>
        </div>
      </div>
    </article>
  );
}
