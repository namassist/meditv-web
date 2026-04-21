"use client";

import { useEffect, useRef, useState } from "react";
import { AnnouncementEngine } from "@/features/announcer/announcement-engine";
import { AudioTtsSpeaker } from "@/features/announcer/audio-tts-speaker";
import { MeditvScreenView } from "@/features/display/components/meditv-screen-view";
import { normalizeRealtimeScreenData } from "@/features/realtime/normalize-realtime-screen-data";
import { watchMeditvScreen } from "@/features/realtime/watch-meditv-screen";

export function ScreenRuntime({
  session,
}: {
  session: {
    clinicId: number;
    doctorIds: number[];
    clinicName: string;
    clinicAddress: string;
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
  }>({ isSpeaking: false });
  const engineRef = useRef(new AnnouncementEngine());
  const speakerRef = useRef<AudioTtsSpeaker | null>(null);

  useEffect(() => {
    speakerRef.current = new AudioTtsSpeaker(setSpeakerState);

    return watchMeditvScreen(
      session,
      async ({ screenDoc, queueDocs, paymentDocs }) => {
        const next = normalizeRealtimeScreenData({
          session,
          screenDoc,
          queueDocs,
          paymentDocs,
        });
        setScreenData(next);
        setIsLoading(false);
        setError(null);

        for (const announcement of engineRef.current.update(next)) {
          await speakerRef.current?.speak(announcement);
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
      screenData={screenData}
    />
  );
}
