export function MeditvPaymentCard({
  queueNumber,
  doctorName,
}: {
  queueNumber: string;
  doctorName: string;
}) {
  return (
    <article
      className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl bg-white p-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      style={{ borderTop: "5px solid var(--meditv-payment)" }}
    >
      <div className="text-[clamp(1.5rem,2vw,2.5rem)]">&#x1F4B3;</div>
      <p className="m-0 text-[clamp(0.7rem,0.85vw,0.95rem)] font-bold uppercase tracking-widest text-[var(--meditv-muted-foreground)]">
        PEMBAYARAN
      </p>
      <span className="text-[clamp(2rem,4vw,4.5rem)] font-extrabold leading-none text-[var(--meditv-queue-number)]">
        {queueNumber}
      </span>
      <p className="m-0 text-[clamp(0.7rem,0.85vw,0.95rem)] text-[var(--meditv-muted-foreground)]">
        {doctorName}
      </p>
    </article>
  );
}
