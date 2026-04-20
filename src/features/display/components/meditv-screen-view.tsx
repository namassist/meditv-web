"use client";

import { useEffect, useState } from "react";
import { getNextSlideIndex, getTargetSlideIndex } from "../use-slide-state";
import { MeditvHeader } from "./meditv-header";
import { MeditvPaymentCard } from "./meditv-payment-card";
import { MeditvPharmacyCard } from "./meditv-pharmacy-card";
import { MeditvQueueCard } from "./meditv-queue-card";
import { MeditvVideoCard } from "./meditv-video-card";

export function MeditvScreenView({
  isLoading,
  error,
  isSpeaking,
  activeDoctorId,
  screenData,
}: {
  isLoading: boolean;
  error: string | null;
  isSpeaking: boolean;
  activeDoctorId?: string;
  screenData: {
    clinicName: string;
    clinicAddress: string;
    videoUrl: string;
    paymentQueueNumber: string;
    paymentDoctorName: string;
    paymentUpdatedAt: Date;
    pharmacyQueueNumber: string;
    queueCards: Array<{
      doctorId: string;
      poliLabel: string;
      doctorName: string;
      currentNumber: string;
      nextNumber: string;
      roomName: string;
      status: string;
      statusLabel: string;
    }>;
  };
}) {
  const allQueuesEmpty = screenData.queueCards.every(
    (card) => card.currentNumber === "-",
  );
  const doctorIds = screenData.queueCards.map((c) => c.doctorId);
  const totalSlides = Math.ceil(screenData.queueCards.length / 2);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) =>
        getNextSlideIndex({ currentIndex: prev, totalSlides, isSpeaking }),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides, isSpeaking]);

  useEffect(() => {
    if (activeDoctorId) {
      setSlideIndex(getTargetSlideIndex(doctorIds, activeDoctorId));
    }
  }, [activeDoctorId, doctorIds]);

  if (
    isLoading &&
    screenData.queueCards.length === 0 &&
    screenData.paymentQueueNumber === "-"
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--meditv-background)] text-[clamp(1rem,1.5vw,1.5rem)] text-[var(--meditv-muted-foreground)]">
        Menghubungkan Screen
      </main>
    );
  }

  if (
    error &&
    screenData.queueCards.length === 0 &&
    screenData.paymentQueueNumber === "-"
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--meditv-background)] text-[clamp(1rem,1.5vw,1.5rem)] text-[var(--meditv-muted-foreground)]">
        Realtime Belum Terhubung: {error}
      </main>
    );
  }

  const visibleCards = screenData.queueCards.slice(
    slideIndex * 2,
    slideIndex * 2 + 2,
  );

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-[var(--meditv-background)] text-[var(--meditv-foreground)]">
      <MeditvHeader
        clinicName={screenData.clinicName}
        clinicAddress={screenData.clinicAddress}
      />

      {allQueuesEmpty ? (
        <section className="flex flex-1 gap-4 p-4">
          <MeditvVideoCard
            videoUrl={screenData.videoUrl}
            isMuted={isSpeaking}
          />
          <div className="grid place-items-center rounded-2xl bg-white p-6 text-[clamp(1rem,1.5vw,1.5rem)] text-[var(--meditv-muted-foreground)] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            Belum Ada Antrian
          </div>
        </section>
      ) : (
        <>
          <section className="flex flex-[5] flex-col justify-center gap-3 px-4 pb-2 pt-4">
            <div className="grid flex-1 grid-cols-2 gap-4">
              {visibleCards.map((card) => (
                <MeditvQueueCard
                  key={card.doctorId}
                  card={card}
                  isHighlighted={card.doctorId === activeDoctorId}
                />
              ))}
            </div>
            {totalSlides > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalSlides }, (_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${i === slideIndex ? "bg-[var(--meditv-header-from)]" : "bg-[var(--meditv-border)]"}`}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="grid flex-[3] grid-cols-[6fr_2fr_2fr] gap-4 px-4 pb-4 pt-2">
            <div>
              <MeditvVideoCard
                videoUrl={screenData.videoUrl}
                isMuted={isSpeaking}
              />
            </div>
            <div>
              <MeditvPaymentCard
                queueNumber={screenData.paymentQueueNumber}
                doctorName={screenData.paymentDoctorName}
              />
            </div>
            <div>
              <MeditvPharmacyCard
                queueNumber={screenData.pharmacyQueueNumber}
              />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
