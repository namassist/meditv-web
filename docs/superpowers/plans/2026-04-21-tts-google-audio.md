# TTS via Google Translate Audio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Web Speech API TTS with Google Translate TTS via `<audio>` element to support Android TV browsers (TV Bro).

**Architecture:** `AudioTtsSpeaker` replaces `BrowserSpeaker` with same interface. Text split into ≤200-char chunks, each played via `new Audio(googleTtsUrl)`. Sequential queue pattern preserved.

**Tech Stack:** Browser `Audio` API, Google Translate TTS endpoint, TypeScript, Vitest

---

### Task 1: Create `splitTextToChunks` utility

**Files:**
- Create: `src/features/announcer/split-text-to-chunks.ts`
- Create: `src/features/announcer/split-text-to-chunks.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from "vitest";
import { splitTextToChunks } from "./split-text-to-chunks";

describe("splitTextToChunks", () => {
  it("returns single chunk for short text", () => {
    expect(splitTextToChunks("Nomor antrian A001")).toEqual([
      "Nomor antrian A001",
    ]);
  });

  it("splits at sentence boundaries", () => {
    const text =
      "Antrian nomor A012, dr. Siti. Silakan menuju ke ruang pemeriksaan. Terima kasih.";
    const chunks = splitTextToChunks(text, 50);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(50);
    }
  });

  it("hard splits when single sentence exceeds maxLen", () => {
    const text = "A".repeat(250);
    const chunks = splitTextToChunks(text, 200);
    expect(chunks.length).toBe(2);
    expect(chunks[0].length).toBe(200);
    expect(chunks[1].length).toBe(50);
  });

  it("returns empty array for empty string", () => {
    expect(splitTextToChunks("")).toEqual([]);
  });

  it("handles comma-separated phrases", () => {
    const text = "Antrian nomor A012, dr. Siti, silakan menuju ke ruang pemeriksaan.";
    const chunks = splitTextToChunks(text, 40);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(40);
    }
    expect(chunks.join(" ").replace(/\s+/g, " ").trim()).toContain("Antrian");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/announcer/split-text-to-chunks.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```ts
// split-text-to-chunks.ts
// Purpose: Split TTS text into chunks within Google Translate TTS char limit
// Caller: audio-tts-speaker.ts
// Dependencies: none
// Main Functions: splitTextToChunks

export function splitTextToChunks(text: string, maxLen = 200): string[] {
  if (!text.trim()) return [];

  const sentences = text.split(/(?<=[.,!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      for (let i = 0; i < sentence.length; i += maxLen) {
        chunks.push(sentence.slice(i, i + maxLen).trim());
      }
    } else if (current.length + sentence.length + 1 > maxLen) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/features/announcer/split-text-to-chunks.test.ts`
Expected: PASS (all tests green)

- [ ] **Step 5: Commit**

```bash
git add src/features/announcer/split-text-to-chunks.ts src/features/announcer/split-text-to-chunks.test.ts
git commit -m "feat(tts): add splitTextToChunks utility for Google TTS"
```

---

### Task 2: Create `AudioTtsSpeaker`

**Files:**
- Create: `src/features/announcer/audio-tts-speaker.ts`
- Create: `src/features/announcer/audio-tts-speaker.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AudioTtsSpeaker } from "./audio-tts-speaker";

function createMockAudio() {
  const listeners: Record<string, () => void> = {};
  return {
    play: vi.fn(() => {
      setTimeout(() => listeners.ended?.(), 0);
      return Promise.resolve();
    }),
    addEventListener: vi.fn((event: string, cb: () => void) => {
      listeners[event] = cb;
    }),
    removeEventListener: vi.fn(),
    set src(_v: string) {},
  };
}

describe("AudioTtsSpeaker", () => {
  beforeEach(() => {
    vi.stubGlobal("Audio", vi.fn(() => createMockAudio()));
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
    speaker.speak({ text: "Antrian pertama" });
    await speaker.speak({ text: "Antrian kedua" });
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

  it("splits long text into multiple audio plays", async () => {
    const onStateChange = vi.fn();
    const speaker = new AudioTtsSpeaker(onStateChange);
    const longText = "Antrian nomor. " .repeat(20);
    await speaker.speak({ text: longText });
    expect(Audio).toHaveBeenCalledTimes(expect.toBeGreaterThan(1) as unknown as number);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/announcer/audio-tts-speaker.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```ts
// audio-tts-speaker.ts
// Purpose: TTS via Google Translate endpoint using <audio> element
// Caller: screen-runtime.tsx
// Dependencies: split-text-to-chunks.ts, browser Audio API
// Main Functions: AudioTtsSpeaker.speak
// Side Effects: HTTP to translate.google.com, audio playback

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

  constructor(
    private readonly onStateChange?: (state: SpeakerState) => void,
  ) {}

  async speak(announcement: Announcement) {
    if (!announcement.text.trim()) return;
    this.queue.push(announcement);
    if (!this.speaking) {
      await this.flush();
    }
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/features/announcer/audio-tts-speaker.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/announcer/audio-tts-speaker.ts src/features/announcer/audio-tts-speaker.test.ts
git commit -m "feat(tts): add AudioTtsSpeaker using Google Translate endpoint"
```

---

### Task 3: Wire `AudioTtsSpeaker` into `ScreenRuntime`

**Files:**
- Modify: `src/features/screen/components/screen-runtime.tsx:4,44-46`
- Delete: `src/features/announcer/browser-speaker.ts`

- [ ] **Step 1: Update import in screen-runtime.tsx**

Change line 4 from:
```ts
import { BrowserSpeaker } from "@/features/announcer/browser-speaker";
```
to:
```ts
import { AudioTtsSpeaker } from "@/features/announcer/audio-tts-speaker";
```

- [ ] **Step 2: Update constructor call in screen-runtime.tsx**

Change the `useEffect` body (lines 44-46) from:
```ts
    speakerRef.current = new BrowserSpeaker(
      window.speechSynthesis,
      setSpeakerState,
    );
```
to:
```ts
    speakerRef.current = new AudioTtsSpeaker(setSpeakerState);
```

- [ ] **Step 3: Delete old browser-speaker.ts**

Delete: `src/features/announcer/browser-speaker.ts`

- [ ] **Step 4: Run build to verify no errors**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 5: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 6: Run biome check**

Run: `pnpm biome check`
Expected: 0 errors, 0 warnings

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(tts): replace BrowserSpeaker with AudioTtsSpeaker in ScreenRuntime"
```

---

### Task 4: Update `detectBrowserCapabilities` to reflect Audio-based TTS

**Files:**
- Modify: `src/features/kiosk/browser-capabilities.ts`

- [ ] **Step 1: Update capability detection**

The `audio` capability should now check for `Audio` constructor instead of `speechSynthesis`:

```ts
export function detectBrowserCapabilities(
  input = {
    hasAudioElement:
      typeof window !== "undefined" && "Audio" in window,
    hasAudioContext:
      typeof window !== "undefined" &&
      ("AudioContext" in window || "webkitAudioContext" in window),
    hasFullscreenApi:
      typeof document !== "undefined" &&
      !!document.documentElement.requestFullscreen,
    hasNotificationApi:
      typeof window !== "undefined" && "Notification" in window,
    hasLocalStorage: typeof window !== "undefined" && "localStorage" in window,
  },
) {
  return {
    audio: {
      label: "Audio",
      status: (input.hasAudioElement || input.hasAudioContext
        ? "ready-to-request"
        : "unsupported") as CapabilityStatus,
    },
    fullscreen: {
      label: "Fullscreen",
      status: (input.hasFullscreenApi
        ? "ready-to-request"
        : "unsupported") as CapabilityStatus,
    },
    notifications: {
      label: "Notifications",
      status: (input.hasNotificationApi
        ? "ready-to-request"
        : "unsupported") as CapabilityStatus,
    },
    storage: {
      label: "Storage",
      status: (input.hasLocalStorage
        ? "ready"
        : "unsupported") as CapabilityStatus,
    },
  };
}
```

- [ ] **Step 2: Run biome check + build**

Run: `pnpm biome check && pnpm build`
Expected: Both pass clean

- [ ] **Step 3: Commit**

```bash
git add src/features/kiosk/browser-capabilities.ts
git commit -m "refactor(kiosk): update capability check to use Audio element instead of SpeechSynthesis"
```

---

### Task 5: Update SYSTEM_MAP.md

**Files:**
- Modify: `SYSTEM_MAP.md`

- [ ] **Step 1: Update Module Map entry**

Change the row for `browser-speaker.ts`:
```
| `src/features/announcer/browser-speaker.ts` | `BrowserSpeaker` | Queue + play TTS via SpeechSynthesis |
```
to:
```
| `src/features/announcer/audio-tts-speaker.ts` | `AudioTtsSpeaker` | Queue + play TTS via Google Translate `<audio>` |
```

- [ ] **Step 2: Update External Integrations table**

Add row:
```
| Google Translate TTS | `translate.google.com/translate_tts` (HTTP) | `src/features/announcer/audio-tts-speaker.ts` |
```

- [ ] **Step 3: Update Clean Tree section**

Replace `browser-speaker.ts` with `audio-tts-speaker.ts` + add `split-text-to-chunks.ts`:
```
│   ├── announcer/
│   │   ├── announcement-engine.ts      # Logic kapan announce
│   │   ├── audio-tts-speaker.ts        # TTS via Google Translate <audio>
│   │   └── split-text-to-chunks.ts     # Split text for TTS char limit
```

- [ ] **Step 4: Commit**

```bash
git add SYSTEM_MAP.md
git commit -m "docs: update SYSTEM_MAP for AudioTtsSpeaker"
```
