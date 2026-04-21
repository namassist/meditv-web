// browser-capabilities.ts
// Purpose: Detect browser capabilities for kiosk readiness
// Caller: pairing-screen.tsx
// Dependencies: browser APIs (Audio, AudioContext, Fullscreen, Notification, localStorage)
// Main Functions: detectBrowserCapabilities

export type CapabilityStatus =
  | "ready"
  | "ready-to-request"
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
