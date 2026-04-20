"use client";

import { PairingScreen } from "@/features/pairing/components/pairing-screen";

export default function PairingPage() {
  return (
    <PairingScreen
      onSubmit={async () => undefined}
      onUnlock={async () => undefined}
      capabilityState={{}}
    />
  );
}
