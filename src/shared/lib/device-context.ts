export function parseBrowserName(userAgent: string): string {
  if (userAgent.includes("Edg/")) return "Edge";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Firefox/")) return "Firefox";
  if (userAgent.includes("Safari/")) return "Safari";
  return "Browser";
}

export function buildDeviceContext(userAgent = navigator.userAgent) {
  return {
    deviceName: parseBrowserName(userAgent),
    platform: "web",
    browserInfo: userAgent,
    appVersion: "1.0.0-web",
  };
}
