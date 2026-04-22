export type UnlockResult = {
  audioContextState: string | undefined;
};

export async function unlockKioskMode(): Promise<UnlockResult> {
  let audioContextState: string | undefined;

  const audioContextCtor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (audioContextCtor) {
    const context = new audioContextCtor();
    await context.resume();
    audioContextState = context.state;
  }

  if (document.documentElement.requestFullscreen) {
    await document.documentElement.requestFullscreen();
  }

  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }

  return { audioContextState };
}
