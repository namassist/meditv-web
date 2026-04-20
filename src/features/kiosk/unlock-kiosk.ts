export async function unlockKioskMode() {
  const audioContextCtor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (audioContextCtor) {
    const context = new audioContextCtor();
    await context.resume();
  }

  if (document.documentElement.requestFullscreen) {
    await document.documentElement.requestFullscreen();
  }

  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}
