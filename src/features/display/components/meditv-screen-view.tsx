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
      <main className="grid min-h-screen place-items-center bg-(--meditv-background) text-[clamp(1rem,1.5vw,1.5rem)] text-(--meditv-muted-foreground)">
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
      <main className="grid min-h-screen place-items-center bg-(--meditv-background) text-[clamp(1rem,1.5vw,1.5rem)] text-(--meditv-muted-foreground)">
        Realtime Belum Terhubung: {error}
      </main>
    );
  }

  const visibleCards = screenData.queueCards.slice(
    slideIndex * 2,
    slideIndex * 2 + 2,
  );

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-(--meditv-background) text-(--meditv-foreground)">
      <div className="h-[8vh] shrink-0">
        <MeditvHeader
          clinicName={screenData.clinicName}
          clinicAddress={screenData.clinicAddress}
        />
      </div>

      {allQueuesEmpty ? (
        <section className="flex h-[92vh] gap-[1vh] p-[1vh]">
          <MeditvVideoCard
            videoUrl={screenData.videoUrl}
            isMuted={isSpeaking}
          />
          <div className="grid place-items-center rounded-2xl bg-white p-[2vh] text-[clamp(0.8rem,1.5vh,1.5rem)] text-(--meditv-muted-foreground) shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            Belum Ada Antrian
          </div>
        </section>
      ) : (
        <>
          <section className="flex h-[46vh] shrink-0 flex-col justify-center gap-[1vh] px-[1.5vh] py-[1vh]">
            <div className="grid flex-1 grid-cols-2 gap-[1.5vh]">
              {visibleCards.map((card) => (
                <MeditvQueueCard
                  key={card.doctorId}
                  card={card}
                  isHighlighted={card.doctorId === activeDoctorId}
                />
              ))}
            </div>
            {totalSlides > 1 && (
              <div className="flex justify-center gap-[0.8vh]">
                {Array.from({ length: totalSlides }, (_, i) => (
                  <span
                    key={i}
                    className={`h-[min(2.5vh,10px)] w-[min(2.5vh,10px)] rounded-full transition-colors ${i === slideIndex ? "bg-(--meditv-header-from)" : "bg-(--meditv-border)"}`}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="grid h-[46vh] shrink-0 grid-cols-[6fr_2fr_2fr] gap-[1.5vh] px-[1.5vh] pb-[1.5vh] pt-[0.5vh]">
            <div className="min-h-0">
              <MeditvVideoCard
                videoUrl={screenData.videoUrl}
                isMuted={isSpeaking}
              />
            </div>
            <div className="min-h-0">
              <MeditvPaymentCard
                queueNumber={screenData.paymentQueueNumber}
                doctorName={screenData.paymentDoctorName}
              />
            </div>
            <div className="min-h-0">
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
