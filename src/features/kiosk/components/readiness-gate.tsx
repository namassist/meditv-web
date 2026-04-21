"use client";

import { ShieldCheck, Loader2, Volume2, Maximize, Bell, HardDrive } from "lucide-react";

type GateProps = {
  capabilities: Record<string, { label: string; status: string }>;
  onUnlock: () => Promise<void>;
  isBusy: boolean;
};

const ICONS: Record<string, any> = {
  audio: Volume2,
  fullscreen: Maximize,
  notifications: Bell,
  storage: HardDrive,
};

const STATUS_STYLES: Record<string, string> = {
  "ready-to-request": "bg-meditv-muted/15 text-meditv-muted",
  ready: "bg-emerald-500/15 text-emerald-500",
  granted: "bg-emerald-500/15 text-emerald-500",
  denied: "bg-red-500/15 text-red-500",
  unsupported: "bg-amber-500/15 text-amber-500",
};

export function ReadinessGate({ capabilities, onUnlock, isBusy }: GateProps) {
  return (
    <div className="rounded-xl border border-meditv-border bg-meditv-input/60 p-4">
      <div className="mb-3 flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-meditv-accent-glow" />
        <p className="text-xs leading-relaxed text-meditv-muted">
          Aktifkan capability browser yang dibutuhkan sebelum pairing.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void onUnlock()}
        disabled={isBusy}
        className="mb-4 inline-flex items-center gap-2 rounded-lg border border-meditv-border bg-meditv-card px-3 py-2 text-xs font-semibold text-meditv-foreground transition-colors hover:border-meditv-accent-glow hover:bg-meditv-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Memeriksa…
          </>
        ) : (
          <>
            <ShieldCheck className="h-3.5 w-3.5" />
            Aktifkan Capability
          </>
        )}
      </button>

      <ul className="space-y-1.5">
        {Object.entries(capabilities).map(([key, value]) => {
          const Icon = ICONS[key] || ShieldCheck;
          return (
            <li
              key={key}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2 text-meditv-foreground/90">
                <Icon className="h-3.5 w-3.5 text-meditv-muted" />
                <span className="font-medium">{value.label}</span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[value.status] || STATUS_STYLES["ready-to-request"]}`}
              >
                {value.status}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
