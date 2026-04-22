// browser-capabilities.ts
// Purpose: Detect browser capabilities for kiosk readiness
// Caller: pairing-screen.tsx
// Dependencies: browser APIs (Audio, AudioContext, Fullscreen, Notification, localStorage)
// Main Functions: detectBrowserCapabilities

export type CapabilityStatus =
  | "ready"
  | "ready-to-request"
  | "denied"
  | "unsupported"
  | "manual-action-required";

export function detectBrowserCapabilities(
  input = {
    hasAudioElement: typeof window !== "undefined" && "Audio" in window,
    hasAudioContext:
      typeof window !== "undefined" &&
      ("AudioContext" in window || "webkitAudioContext" in window),
    hasFullscreenApi:
      typeof document !== "undefined" &&
      !!document.documentElement.requestFullscreen,
    hasNotificationApi:
      typeof window !== "undefined" && "Notification" in window,
    hasLocalStorage: typeof window !== "undefined" && "localStorage" in window,
    isFullscreenActive:
      typeof document !== "undefined" && !!document.fullscreenElement,
    notificationPermission:
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : ("unsupported" as string),
    audioContextState: undefined as string | undefined,
  },
) {
  function audioStatus(): CapabilityStatus {
    if (!input.hasAudioElement && !input.hasAudioContext) return "unsupported";
    if (input.audioContextState === "running") return "ready";
    return "ready-to-request";
  }

  function fullscreenStatus(): CapabilityStatus {
    if (!input.hasFullscreenApi) return "unsupported";
    if (input.isFullscreenActive) return "ready";
    return "ready-to-request";
  }

  function notificationStatus(): CapabilityStatus {
    if (!input.hasNotificationApi) return "unsupported";
    if (input.notificationPermission === "granted") return "ready";
    if (input.notificationPermission === "denied") return "denied";
    return "ready-to-request";
  }

  return {
    audio: { label: "Audio", status: audioStatus() },
    fullscreen: { label: "Fullscreen", status: fullscreenStatus() },
    notifications: { label: "Notifications", status: notificationStatus() },
    storage: {
      label: "Storage",
      status: (input.hasLocalStorage
        ? "ready"
        : "unsupported") as CapabilityStatus,
    },
  };
}
