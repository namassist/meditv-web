"use client";

import { useState, type FormEvent } from "react";
import { Tv, KeyRound, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ReadinessGate } from "@/features/kiosk/components/readiness-gate";

const PAIR_LENGTH = 6;

export function PairingScreen({
  onSubmit,
  onUnlock,
  capabilityState,
}: {
  onSubmit: (code: string) => Promise<void>;
  onUnlock: () => Promise<void>;
  capabilityState: Record<string, { label: string; status: string }>;
}) {
  const [code, setCode] = useState<string[]>(Array(PAIR_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (index: number, value: string) => {
    const sanitized = value
      .replace(/[^0-9a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = sanitized;
      return next;
    });
    if (sanitized) {
      const nextEl = document.getElementById(`pair-${index + 1}`);
      nextEl?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevEl = document.getElementById(`pair-${index - 1}`);
      prevEl?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, PAIR_LENGTH);
    if (!pasted) return;
    const next = Array(PAIR_LENGTH).fill("");
    pasted.split("").forEach((c, i) => (next[i] = c));
    setCode(next);
    const focusIndex = Math.min(pasted.length, PAIR_LENGTH - 1);
    document.getElementById(`pair-${focusIndex}`)?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = code.join("");
    if (value.length !== PAIR_LENGTH) {
      toast.error("Kode belum lengkap", {
        description: `Masukkan ${PAIR_LENGTH} digit kode pairing dari MediBook.`,
      });
      return;
    }

    setSubmitting(true);
    toast("Pairing dikirim", {
      description: `Kode ${value} sedang diverifikasi…`,
    });

    try {
      await onSubmit(value);
    } catch (nextError) {
      toast.error("Gagal memverifikasi", {
        description:
          nextError instanceof Error ? nextError.message : String(nextError),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isComplete = code.every((c) => c !== "");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-meditv-bg px-4 py-12 text-meditv-foreground">

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--meditv-accent) / 0.55), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--meditv-accent-glow) / 0.45), transparent 65%)",
        }}
      />

      <section
        className="relative z-10 w-full max-w-md rounded-3xl border border-meditv-border p-8 sm:p-10"
        style={{
          background: "var(--gradient-meditv-card)",
          boxShadow: "var(--shadow-meditv)",
        }}
      >
        <header className="flex flex-col items-center text-center">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{
              background: "var(--gradient-meditv)",
              boxShadow: "var(--shadow-meditv-icon)",
            }}
            aria-hidden
          >
            <Tv
              className="h-10 w-10 text-meditv-accent-foreground"
              strokeWidth={2.25}
            />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-meditv-foreground sm:text-[2rem]">
            Welcome to{" "}
            <span className="bg-linear-to-r from-meditv-accent to-meditv-accent-glow bg-clip-text text-transparent">
              MediTV
            </span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-meditv-muted sm:text-base">
            Masukkan{" "}
            <span className="font-medium text-meditv-foreground">
              6 digit pair code
            </span>{" "}
            yang Anda dapatkan dari{" "}
            <span className="font-medium text-meditv-foreground">
              MediBook
            </span>{" "}
            untuk menyambungkan perangkat ini.
          </p>
        </header>

        <div className="mt-8">
          <ReadinessGate
            capabilities={capabilityState}
            onUnlock={onUnlock}
            isBusy={submitting}
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label
              htmlFor="pair-0"
              className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-meditv-muted"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Pair code
            </label>

            <div className="flex justify-between gap-2 sm:gap-3">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`pair-${i}`}
                  type="text"
                  inputMode="text"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${i + 1} pair code`}
                  className="aspect-square w-full rounded-xl border border-meditv-border bg-meditv-input text-center text-2xl font-semibold text-meditv-foreground caret-meditv-accent outline-none transition-all duration-200 placeholder:text-meditv-muted/40 hover:border-meditv-accent/40 focus:border-meditv-accent focus:bg-meditv-card focus:ring-2 focus:ring-meditv-accent/40 sm:text-3xl"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isComplete || submitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-sm font-semibold text-meditv-accent-foreground transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:scale-[1.01] enabled:active:scale-[0.99]"
            style={{
              background: "var(--gradient-meditv)",
              boxShadow: isComplete ? "var(--shadow-meditv-icon)" : "none",
            }}
          >
            <span>{submitting ? "Memverifikasi…" : "Pair Device"}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-enabled:group-hover:translate-x-0.5" />
          </button>

          <div className="rounded-xl border border-meditv-border bg-meditv-input/60 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-meditv-muted">
              Cara mendapatkan pair code
            </p>
            <ol className="space-y-2 text-sm text-meditv-foreground/90">
              {[
                <span key="1">
                  Login ke{" "}
                  <a
                    href="https://medibook.medital.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-meditv-accent-glow underline-offset-2 hover:underline"
                  >
                    medibook.medital.id
                  </a>
                </span>,
                <span key="2">
                  Buka menu <span className="font-medium">MediTV</span>
                </span>,
                <span key="3">Pilih dokter (bisa lebih dari satu)</span>,
                <span key="4">
                  Klik <span className="font-medium">Generate Pair Code</span>
                </span>,
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-meditv-accent/20 text-[11px] font-semibold text-meditv-accent-glow">
                    {i + 1}
                  </span>
                  <span className="leading-5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </form>
      </section>
    </main>
  );
}
