import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioTtsSpeaker } from "./audio-tts-speaker";

let audioCallCount = 0;

function MockAudio(this: {
  play: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
}) {
  audioCallCount++;
  const listeners: Record<string, () => void> = {};
  this.play = vi.fn(() => {
    setTimeout(() => {
      if (this.onended) this.onended();
      listeners.ended?.();
    }, 0);
    return Promise.resolve();
  });
  this.addEventListener = vi.fn((event: string, cb: () => void) => {
    listeners[event] = cb;
  });
  this.removeEventListener = vi.fn();
  this.onended = null;
  this.onerror = null;
  this.src = "";
}

describe("AudioTtsSpeaker", () => {
  beforeEach(() => {
    audioCallCount = 0;
    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        }),
      ),
    );
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  });

  it("calls onStateChange with isSpeaking true then false", async () => {
    const onStateChange = vi.fn();
    const speaker = new AudioTtsSpeaker(onStateChange);
    await speaker.speak({ text: "Nomor antrian A001" });
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ isSpeaking: true }),
    );
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ isSpeaking: false }),
    );
  });

  it("queues multiple announcements sequentially", async () => {
    const onStateChange = vi.fn();
    const speaker = new AudioTtsSpeaker(onStateChange);
    const p1 = speaker.speak({ text: "Antrian pertama" });
    const p2 = speaker.speak({ text: "Antrian kedua" });
    await Promise.all([p1, p2]);
    const speakingCount = onStateChange.mock.calls.filter(
      (c: Array<{ isSpeaking: boolean }>) => c[0].isSpeaking === true,
    ).length;
    expect(speakingCount).toBeGreaterThanOrEqual(2);
  });

  it("skips empty text", async () => {
    const onStateChange = vi.fn();
    const speaker = new AudioTtsSpeaker(onStateChange);
    await speaker.speak({ text: "   " });
    expect(onStateChange).not.toHaveBeenCalled();
  });

  it("plays long text as single audio (backend handles full text)", async () => {
    const onStateChange = vi.fn();
    const speaker = new AudioTtsSpeaker(onStateChange);
    const longText = "Antrian nomor. ".repeat(20);
    await speaker.speak({ text: longText });
    expect(audioCallCount).toBe(1);
  });
});
