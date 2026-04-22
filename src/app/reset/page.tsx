/**
 * Tujuan: Halaman reset device — hapus session pairing dari storage lalu redirect ke /pairing
 * Caller: User/Admin membuka URL /reset langsung di browser kiosk
 * Dependensi: persisted-pairing-state (storage keys), browser-storage (removeItem)
 * Main Functions: ResetPage (default export)
 * Side Effects: localStorage read/write (clear pairing + screen_id), window.location.assign
 */

"use client";

import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  PAIRING_STORAGE_KEY,
  SCREEN_ID_STORAGE_KEY,
} from "@/features/pairing/models/persisted-pairing-state";
import { removeItem } from "@/shared/lib/browser-storage";

export default function ResetPage() {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    removeItem(PAIRING_STORAGE_KEY);
    removeItem(SCREEN_ID_STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.location.assign("/pairing");
    }
    return null;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-meditv-bg px-4 py-4 text-meditv-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--meditv-accent-glow) / 0.3), transparent 70%)",
        }}
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-meditv-border p-5 sm:p-6"
        style={{
          background: "var(--gradient-meditv-card)",
          boxShadow: "var(--shadow-meditv)",
        }}
      >
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/15">
          <AlertTriangle className="h-7 w-7 text-red-400" strokeWidth={2.25} />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-meditv-foreground">
          Reset Perangkat
        </h1>

        <p className="mt-1.5 text-sm leading-snug text-meditv-muted">
          Tindakan ini akan menghapus semua data pairing pada perangkat ini.
          Anda perlu memasukkan pair code baru untuk menghubungkan ulang.
        </p>

        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
          <p className="text-xs leading-snug text-red-300/90">
            Data antrian yang sedang ditampilkan akan hilang dan perangkat akan
            kembali ke halaman pairing.
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-meditv-border bg-meditv-card px-4 py-2.5 text-sm font-semibold text-meditv-foreground transition-colors hover:border-meditv-accent-glow hover:bg-meditv-accent/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Batal
          </button>
          <button
            type="button"
            onClick={() => setConfirmed(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
          >
            <Trash2 className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </main>
  );
}
