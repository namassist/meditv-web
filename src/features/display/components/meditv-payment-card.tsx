import { CreditCard } from "lucide-react";

export function MeditvPaymentCard({
  queueNumber,
  doctorName,
}: {
  queueNumber: string;
  doctorName: string;
}) {
  return (
    <article
      className="flex h-full flex-col rounded-[min(1.5vh,12px)] bg-white text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden"
      style={{ borderTop: "5px solid var(--meditv-payment)" }}
    >
      <div className="flex items-center justify-start gap-[1vh] px-[min(1.5vh,12px)] py-[1vh]">
        <CreditCard className="h-[clamp(1rem,2.5vh,2.5rem)] w-[clamp(1rem,2.5vh,2.5rem)] text-(--meditv-muted-foreground)" />
        <p className="m-0 text-[clamp(0.5rem,1.1vh,0.95rem)] font-bold uppercase tracking-widest text-(--meditv-muted-foreground)">
          PEMBAYARAN
        </p>
      </div>

      <hr className="w-full border-t-[0.2vh] border-(--meditv-border)" />

      <div className="flex flex-1 flex-col items-center justify-center gap-[0.5vh] px-[min(1.5vh,12px)] pb-[min(1.5vh,12px)] pt-[1vh]">
        <p className="m-0 text-[clamp(0.6rem,1.15vh,0.95rem)] font-semibold uppercase tracking-wide text-(--meditv-muted-foreground)">
          NOMOR ANTRIAN
        </p>
        <span className="text-[clamp(2.05rem,9.1vh,8rem)] font-extrabold leading-none text-(--meditv-queue-number)">
          {queueNumber}
        </span>
        {doctorName !== "-" && (
          <p className="m-0 text-[clamp(1rem,1.8vh,1.6rem)] font-semibold text-(--meditv-muted-foreground)">
            {doctorName}
          </p>
        )}
      </div>
    </article>
  );
}
