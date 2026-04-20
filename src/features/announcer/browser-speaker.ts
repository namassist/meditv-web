export class BrowserSpeaker {
  private queue: Array<{
    text: string;
    doctorId?: string;
    isPayment?: boolean;
  }> = [];
  private speaking = false;

  constructor(
    private readonly synth: SpeechSynthesis = window.speechSynthesis,
    private readonly onStateChange?: (state: {
      isSpeaking: boolean;
      currentDoctorId?: string;
      isPayment?: boolean;
    }) => void,
  ) {}

  async speak(announcement: {
    text: string;
    doctorId?: string;
    isPayment?: boolean;
  }) {
    if (!announcement.text.trim()) return;
    this.queue.push(announcement);
    if (!this.speaking) {
      await this.flush();
    }
  }

  private async flush() {
    this.speaking = true;
    while (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.onStateChange?.({
        isSpeaking: true,
        currentDoctorId: next.doctorId,
        isPayment: next.isPayment,
      });
      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(next.text);
        utterance.lang = "id-ID";
        utterance.rate = 0.9;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        this.synth.speak(utterance);
      });
    }
    this.speaking = false;
    this.onStateChange?.({ isSpeaking: false });
  }
}
