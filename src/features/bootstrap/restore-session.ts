import type { PersistedPairingState } from "@/features/pairing/models/persisted-pairing-state";

type RestoreSessionDeps = {
  savedState: PersistedPairingState | null;
  signIn: (customToken: string | null) => Promise<void>;
  clearSavedState: () => void | Promise<void>;
};

export async function restoreSession({
  savedState,
  signIn,
  clearSavedState,
}: RestoreSessionDeps) {
  if (!savedState) {
    return { status: "missing" } as const;
  }

  try {
    await signIn(savedState.customToken);
    return { status: "restored", session: savedState } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const normalized = message.toLowerCase();
    const isRetryable =
      normalized.includes("internet") ||
      normalized.includes("timeout") ||
      normalized.includes("connection") ||
      normalized.includes("network");

    if (isRetryable) {
      return { status: "retryable-error", message } as const;
    }

    await clearSavedState();
    return { status: "invalid-session", message } as const;
  }
}
