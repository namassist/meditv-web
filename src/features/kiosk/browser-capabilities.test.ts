import { describe, expect, it } from "vitest";
import { detectBrowserCapabilities } from "./browser-capabilities";

describe("detectBrowserCapabilities", () => {
  it("marks audio, fullscreen, and notifications separately", () => {
    const result = detectBrowserCapabilities({
      hasSpeechSynthesis: true,
      hasAudioContext: true,
      hasFullscreenApi: true,
      hasNotificationApi: false,
      hasLocalStorage: true,
    });

    expect(result.audio.status).toBe("ready-to-request");
    expect(result.fullscreen.status).toBe("ready-to-request");
    expect(result.notifications.status).toBe("unsupported");
  });
});
