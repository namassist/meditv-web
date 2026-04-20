"use client";

import { useEffect } from "react";
import {
  PAIRING_STORAGE_KEY,
  parsePersistedPairingState,
} from "@/features/pairing/models/persisted-pairing-state";
import { ScreenRuntime } from "@/features/screen/components/screen-runtime";
import { readJson } from "@/shared/lib/browser-storage";

export default function ScreenPage() {
  const saved = parsePersistedPairingState(readJson(PAIRING_STORAGE_KEY));
  useEffect(() => {
    if (!saved) {
      window.location.assign("/pairing");
    }
  }, [saved]);

  if (!saved) {
    return null;
  }

  return <ScreenRuntime session={saved} />;
}
