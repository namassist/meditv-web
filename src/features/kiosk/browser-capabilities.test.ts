import { describe, expect, it } from "vitest";
import { detectBrowserCapabilities } from "./browser-capabilities";

const BASE_INPUT = {
  hasAudioElement: true,
  hasAudioContext: true,
  hasFullscreenApi: true,
  hasNotificationApi: true,
  hasLocalStorage: true,
  isFullscreenActive: false,
  notificationPermission: "default" as string,
  audioContextState: undefined as string | undefined,
};

describe("detectBrowserCapabilities", () => {
  it("marks supported APIs as ready-to-request before activation", () => {
    const result = detectBrowserCapabilities(BASE_INPUT);

    expect(result.audio.status).toBe("ready-to-request");
    expect(result.fullscreen.status).toBe("ready-to-request");
    expect(result.notifications.status).toBe("ready-to-request");
    expect(result.storage.status).toBe("ready");
  });

  it("marks unsupported APIs correctly", () => {
    const result = detectBrowserCapabilities({
      ...BASE_INPUT,
      hasAudioElement: false,
      hasAudioContext: false,
      hasNotificationApi: false,
      hasFullscreenApi: false,
      hasLocalStorage: false,
    });

    expect(result.audio.status).toBe("unsupported");
    expect(result.fullscreen.status).toBe("unsupported");
    expect(result.notifications.status).toBe("unsupported");
    expect(result.storage.status).toBe("unsupported");
  });

  it("marks capabilities as ready after activation", () => {
    const result = detectBrowserCapabilities({
      ...BASE_INPUT,
      audioContextState: "running",
      isFullscreenActive: true,
      notificationPermission: "granted",
    });

    expect(result.audio.status).toBe("ready");
    expect(result.fullscreen.status).toBe("ready");
    expect(result.notifications.status).toBe("ready");
  });

  it("marks notification as denied when user rejects", () => {
    const result = detectBrowserCapabilities({
      ...BASE_INPUT,
      notificationPermission: "denied",
    });

    expect(result.notifications.status).toBe("denied");
  });
});
