/**
 * Tujuan: TTS speaker via backend API (mp3 response)
 * Caller: ScreenRuntime
 * Dependensi: app-config (nodeUrl)
 * Main Functions: AudioTtsSpeaker.speak()
 * Side Effects: HTTP POST to nodeUrl/fcm/queue-announcement-tts, audio playback
 */

import { getAppConfig } from "@/shared/config/app-config";

type Announcement = {
  text: string;
  doctorId?: string;
  isPayment?: boolean;
};

type SpeakerState = {
  isSpeaking: boolean;
  currentDoctorId?: string;
  isPayment?: boolean;
};

async function fetchTtsAudio(text: string): Promise<string> {
  const { nodeUrl } = getAppConfig();
  const response = await fetch(`${nodeUrl}/fcm/queue-announcement-tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purpose: text, lang: "id" }),
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}

function playAudioElement(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve) => {
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

export class AudioTtsSpeaker {
  private queue: Announcement[] = [];
  private speaking = false;
  private currentFlush: Promise<void> | null = null;

  constructor(
    private readonly onStateChange?: (state: SpeakerState) => void,
    private readonly onBeforePlay?: (announcement: Announcement) => void,
  ) {}

  async speak(announcement: Announcement) {
    if (!announcement.text.trim()) return;
    this.queue.push(announcement);
    if (!this.speaking) {
      this.currentFlush = this.flush();
    }
    await this.currentFlush;
  }

  private async flush() {
    this.speaking = true;
    while (this.queue.length > 0) {
      const next = this.queue.shift();
      if (!next) continue;

      this.onBeforePlay?.(next);

      this.onStateChange?.({
        isSpeaking: true,
        currentDoctorId: next.doctorId,
        isPayment: next.isPayment,
      });

      try {
        const blobUrl = await fetchTtsAudio(next.text);
        const audio = new Audio(blobUrl);
        await playAudioElement(audio);
        URL.revokeObjectURL(blobUrl);
      } catch {
        // TTS fetch failed — skip, continue queue
      }

      if (this.queue.length > 0) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    this.speaking = false;
    this.onStateChange?.({ isSpeaking: false });
  }
}
