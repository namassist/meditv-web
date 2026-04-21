"use client";

import { useEffect, useState } from "react";
import { signInWithFirebaseCustomToken } from "@/features/auth/sign-in-with-custom-token";
import { detectBrowserCapabilities } from "@/features/kiosk/browser-capabilities";
import { unlockKioskMode } from "@/features/kiosk/unlock-kiosk";
import { registerTelly } from "@/features/pairing/api/register-telly";
import { PairingScreen } from "@/features/pairing/components/pairing-screen";
import {
  PAIRING_STORAGE_KEY,
  SCREEN_ID_STORAGE_KEY,
} from "@/features/pairing/models/persisted-pairing-state";
import { submitPairingCode } from "@/features/pairing/submit-pairing-code";
import { readJson, writeJson } from "@/shared/lib/browser-storage";
import { buildDeviceContext } from "@/shared/lib/device-context";

function getOrCreateScreenId() {
  const existing = readJson<string>(SCREEN_ID_STORAGE_KEY);
  if (typeof existing === "string" && existing.trim()) return existing;
  const generated = `meditv_${Date.now().toString(36)}${crypto.randomUUID().replace(/-/g, "").slice(0, 6)}`;
  writeJson(SCREEN_ID_STORAGE_KEY, generated);
  return generated;
}

export default function PairingPage() {
  const [capabilityState, setCapabilityState] = useState<Record<
    string,
    { label: string; status: string }
  > | null>(null);

  useEffect(() => {
    setCapabilityState(detectBrowserCapabilities());
  }, []);

  if (!capabilityState) {
    return null;
  }

  return (
    <PairingScreen
      capabilityState={capabilityState}
      onUnlock={unlockKioskMode}
      onSubmit={(code) =>
        submitPairingCode({
          code,
          screenId: getOrCreateScreenId(),
          registerTelly,
          signIn: signInWithFirebaseCustomToken,
          saveState: (state) => writeJson(PAIRING_STORAGE_KEY, state),
          deviceContext: buildDeviceContext(),
        }).then(() => {
          window.location.assign("/screen");
        })
      }
    />
  );
}
