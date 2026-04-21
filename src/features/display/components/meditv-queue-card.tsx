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
      className={`flex h-full flex-col justify-between rounded-[min(1.5vh,12px)] bg-white p-[min(2.05vh,16px)] shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${isHighlighted ? "shadow-[0_0_0_5px_var(--meditv-status-calling),0_8px_32px_rgba(239,68,68,0.15)]" : ""}`}
      style={{
        borderTop: `${Math.max(5, Math.min(7, 1))}px solid ${accentColor}`,
      }}
    >
      <div className="flex flex-col items-start gap-[0.5vh]">
        <span
          className="inline-block rounded-full px-[1vh] py-[0.4vh] text-[clamp(0.6rem,1.15vh,0.95rem)] font-semibold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {card.poliLabel}
        </span>
        <span className="text-[clamp(1rem,1.8vh,1.6rem)] font-bold text-(--meditv-foreground)">
          {card.doctorName}
        </span>
      </div>
      <div className="py-[1.15vh] text-center">
        {card.currentNumber !== "-" && (
          <span className="mb-[0.25vh] block text-[clamp(0.6rem,1.15vh,0.95rem)] font-semibold uppercase tracking-wide text-(--meditv-muted-foreground)">
            SEDANG DIPANGGIL
          </span>
        )}
        <span className="block text-[clamp(2.05rem,9.1vh,8rem)] font-extrabold leading-none text-(--meditv-queue-number)">
          {card.currentNumber}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-[0.95vh]">
        <div className="rounded-[min(1.15vh,9.5px)] bg-(--meditv-muted) p-[0.95vh] text-center">
          <span className="mb-[0.2vh] block text-[clamp(0.6rem,1.15vh,0.95rem)] font-semibold uppercase tracking-wide text-(--meditv-muted-foreground)">
            Berikutnya
          </span>
          <span className="block text-[clamp(1rem,1.8vh,1.6rem)] font-bold text-(--meditv-foreground)">
            {card.nextNumber}
          </span>
        </div>
        <div className="rounded-[min(1.15vh,9.5px)] bg-(--meditv-muted) p-[0.95vh] text-center">
          <span className="mb-[0.2vh] block text-[clamp(0.6rem,1.15vh,0.95rem)] font-semibold uppercase tracking-wide text-(--meditv-muted-foreground)">
            Ruangan
          </span>
          <span className="block text-[clamp(1rem,1.8vh,1.6rem)] font-bold text-(--meditv-foreground)">
            {card.roomName}
          </span>
        </div>
      </div>
    </article>
  );
}
