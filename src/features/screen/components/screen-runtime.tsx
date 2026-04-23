"use client";

import { useEffect, useRef, useState } from "react";
import { AnnouncementEngine } from "@/features/announcer/announcement-engine";
import { AudioTtsSpeaker } from "@/features/announcer/audio-tts-speaker";
import { MeditvScreenView } from "@/features/display/components/meditv-screen-view";
import type { MeditvQueueCard } from "@/features/realtime/models/meditv-queue-card";
import type { MeditvScreenData } from "@/features/realtime/models/meditv-screen-data";
import { normalizeRealtimeScreenData } from "@/features/realtime/normalize-realtime-screen-data";
// import { useHeartbeat } from "@/features/heartbeat/use-heartbeat";
import { watchMeditvScreen } from "@/features/realtime/watch-meditv-screen";

type PendingSnapshot = {
  doctorId?: string;
  isPayment?: boolean;
  queueCard?: MeditvQueueCard;
  paymentData?: { number: string; doctorName: string };
};

export function ScreenRuntime({
  session,
}: {
  session: {
    screenId: string;
    token: string | null;
    customToken: string | null;
    clinicId: number;
    doctorIds: number[];
    clinicName: string;
    clinicAddress: string;
    videoUrl: string | null;
    screenDocumentPath: string | null;
    specialists: Array<{
      doctorId: number;
      doctorName: string;
      specialistName: string;
    }>;
  };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screenData, setScreenData] = useState(() =>
    normalizeRealtimeScreenData({
      session,
      screenDoc: {},
      queueDocs: {},
      paymentDocs: {},
    }),
  );
  const [speakerState, setSpeakerState] = useState<{
    isSpeaking: boolean;
    currentDoctorId?: string;
    isPayment?: boolean;
  }>({ isSpeaking: false });
  const engineRef = useRef(new AnnouncementEngine());
  const speakerRef = useRef<AudioTtsSpeaker | null>(null);
  const latestDataRef = useRef<MeditvScreenData>(screenData);
  const pendingSnapshots = useRef<PendingSnapshot[]>([]);

  // useHeartbeat({
  //   token: session.customToken,
  //   screenId: session.screenId,
  //   clinicId: session.clinicId,
  //   doctorIds: session.doctorIds,
  // });

  // Sync display to latest when all TTS finishes
  useEffect(() => {
    if (!speakerState.isSpeaking) {
      setScreenData(latestDataRef.current);
    }
  }, [speakerState.isSpeaking]);

  useEffect(() => {
    speakerRef.current = new AudioTtsSpeaker(
      setSpeakerState,
      // onBeforePlay: update UI for this announcement before TTS plays
      (_announcement) => {
        const snapshot = pendingSnapshots.current.shift();
        if (!snapshot) return;

        if (snapshot.doctorId && snapshot.queueCard) {
          setScreenData((prev) => ({
            ...prev,
            queueCards: prev.queueCards.map((c) =>
              c.doctorId === snapshot.doctorId ? snapshot.queueCard! : c,
            ),
          }));
        } else if (snapshot.isPayment && snapshot.paymentData) {
          setScreenData((prev) => ({
            ...prev,
            paymentQueueNumber: snapshot.paymentData!.number,
            paymentDoctorName: snapshot.paymentData!.doctorName,
          }));
        }
      },
    );

    return watchMeditvScreen(
      session,
      ({ screenDoc, queueDocs, paymentDocs }) => {
        const next = normalizeRealtimeScreenData({
          session,
          screenDoc,
          queueDocs,
          paymentDocs,
        });
        latestDataRef.current = next;
        setIsLoading(false);
        setError(null);

        const announcements = engineRef.current.update(next);

        if (announcements.length === 0) {
          // No TTS needed — update UI immediately
          setScreenData(next);
          return;
        }

        // Store snapshots for each announcement (consumed by onBeforePlay)
        const deferredDoctorIds = new Set<string>();
        let deferPayment = false;

        for (const a of announcements) {
          if (a.doctorId) {
            const card = next.queueCards.find((c) => c.doctorId === a.doctorId);
            if (card) {
              pendingSnapshots.current.push({
                doctorId: a.doctorId,
                queueCard: card,
              });
              deferredDoctorIds.add(a.doctorId);
            }
          } else if (a.isPayment) {
            pendingSnapshots.current.push({
              isPayment: true,
              paymentData: {
                number: next.paymentQueueNumber,
                doctorName: next.paymentDoctorName,
              },
            });
            deferPayment = true;
          }
        }

        // Update UI for non-deferred parts immediately
        setScreenData((prev) => ({
          ...next,
          queueCards: next.queueCards.map((card) =>
            deferredDoctorIds.has(card.doctorId)
              ? (prev.queueCards.find((c) => c.doctorId === card.doctorId) ??
                card)
              : card,
          ),
          paymentQueueNumber: deferPayment
            ? prev.paymentQueueNumber
            : next.paymentQueueNumber,
          paymentDoctorName: deferPayment
            ? prev.paymentDoctorName
            : next.paymentDoctorName,
        }));

        // Queue TTS — AudioTtsSpeaker handles ordering internally
        for (const announcement of announcements) {
          speakerRef.current?.speak(announcement);
        }
      },
      (nextError) => {
        setIsLoading(false);
        setError(nextError.message);
      },
    );
  }, [session]);

  return (
    <MeditvScreenView
      isLoading={isLoading}
      error={error}
      isSpeaking={speakerState.isSpeaking}
      activeDoctorId={speakerState.currentDoctorId}
      isPaymentSpeaking={speakerState.isSpeaking && !!speakerState.isPayment}
      screenData={screenData}
    />
  );
}
