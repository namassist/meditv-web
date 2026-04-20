"use client";

import { signInWithFirebaseCustomToken } from "@/features/auth/sign-in-with-custom-token";
import { BootstrapRoute } from "@/features/bootstrap/components/bootstrap-route";
import { restoreSession } from "@/features/bootstrap/restore-session";
import {
  PAIRING_STORAGE_KEY,
  parsePersistedPairingState,
} from "@/features/pairing/models/persisted-pairing-state";
import { readJson, removeItem } from "@/shared/lib/browser-storage";

export default function HomePage() {
  return (
    <BootstrapRoute
      restore={async () => {
        const saved = parsePersistedPairingState(readJson(PAIRING_STORAGE_KEY));
        return restoreSession({
          savedState: saved,
          signIn: signInWithFirebaseCustomToken,
          clearSavedState: () => removeItem(PAIRING_STORAGE_KEY),
        });
      }}
    />
  );
}
