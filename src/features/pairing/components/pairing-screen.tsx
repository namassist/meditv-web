"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReadinessGate } from "@/features/kiosk/components/readiness-gate";

export function PairingScreen({
  onSubmit,
  onUnlock,
  capabilityState,
}: {
  onSubmit: (code: string) => Promise<void>;
  onUnlock: () => Promise<void>;
  capabilityState: Record<string, { label: string; status: string }>;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--meditv-pairing-bg)] p-8">
      <div className="w-full max-w-[420px] rounded-2xl bg-[var(--meditv-pairing-card)] p-8 text-white">
        <ReadinessGate
          capabilities={capabilityState}
          onUnlock={onUnlock}
          isBusy={isBusy}
        />
        <div className="mt-6 space-y-4">
          <label htmlFor="pair-code" className="text-sm">
            Pair code
          </label>
          <input
            id="pair-code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-white"
          />
          {error ? <p className="text-red-400">{error}</p> : null}
          <Button
            type="button"
            onClick={async () => {
              setIsBusy(true);
              setError(null);
              try {
                await onSubmit(code);
              } catch (nextError) {
                setError(
                  nextError instanceof Error
                    ? nextError.message
                    : String(nextError),
                );
              } finally {
                setIsBusy(false);
              }
            }}
            disabled={isBusy}
            className="w-full"
          >
            {isBusy ? "Loading..." : "Submit"}
          </Button>
        </div>
      </div>
    </main>
  );
}
