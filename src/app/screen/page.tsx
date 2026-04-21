"use client";

import { useEffect, useState } from "react";
import {
  PAIRING_STORAGE_KEY,
  parsePersistedPairingState,
  type PersistedPairingState,
} from "@/features/pairing/models/persisted-pairing-state";
import { ScreenRuntime } from "@/features/screen/components/screen-runtime";
import { readJson } from "@/shared/lib/browser-storage";

export default function ScreenPage() {
  const [saved, setSaved] = useState<PersistedPairingState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const parsed = parsePersistedPairingState(readJson(PAIRING_STORAGE_KEY));
    setSaved(parsed);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !saved) {
      window.location.assign("/pairing");
    }
  }, [mounted, saved]);

  if (!mounted || !saved) {
    return null;
  }

  return <ScreenRuntime session={saved} />;
}
