"use client";

import { Button } from "@/components/ui/button";

type GateProps = {
  capabilities: Record<string, { label: string; status: string }>;
  onUnlock: () => Promise<void>;
  isBusy: boolean;
};

export function ReadinessGate({ capabilities, onUnlock, isBusy }: GateProps) {
  return (
    <section aria-label="Kiosk readiness gate" className="space-y-4">
      <h2 className="text-lg font-semibold">Mode Kiosk</h2>
      <p className="text-sm text-muted-foreground">
        Aktifkan capability browser yang dibutuhkan sebelum pairing.
      </p>
      <Button type="button" onClick={() => void onUnlock()} disabled={isBusy}>
        {isBusy ? "Mengaktifkan..." : "Aktifkan Mode Kiosk"}
      </Button>
      <ul className="space-y-1 text-sm">
        {Object.entries(capabilities).map(([key, value]) => (
          <li key={key}>
            <strong>{value.label}</strong>: {value.status}
          </li>
        ))}
      </ul>
    </section>
  );
}
