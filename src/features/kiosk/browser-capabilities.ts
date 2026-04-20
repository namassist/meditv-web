export type CapabilityStatus =
  | "ready"
  | "ready-to-request"
  | "unsupported"
  | "manual-action-required";

export function detectBrowserCapabilities(
  input = {
    hasSpeechSynthesis:
      typeof window !== "undefined" && "speechSynthesis" in window,
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
      status: (input.hasSpeechSynthesis || input.hasAudioContext
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
