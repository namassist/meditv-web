import { splitTextToChunks } from "./split-text-to-chunks";

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

const TTS_BASE_URL = "https://translate.google.com/translate_tts";
const TTS_LANG = "id";

function buildTtsUrl(text: string): string {
  const params = new URLSearchParams({
    ie: "UTF-8",
    q: text,
    tl: TTS_LANG,
    client: "tw-ob",
  });
  return `${TTS_BASE_URL}?${params.toString()}`;
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

  constructor(private readonly onStateChange?: (state: SpeakerState) => void) {}

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

      this.onStateChange?.({
        isSpeaking: true,
        currentDoctorId: next.doctorId,
        isPayment: next.isPayment,
      });

      const chunks = splitTextToChunks(next.text);
      for (const chunk of chunks) {
        const audio = new Audio(buildTtsUrl(chunk));
        await playAudioElement(audio);
      }
    }
    this.speaking = false;
    this.onStateChange?.({ isSpeaking: false });
  }
}
