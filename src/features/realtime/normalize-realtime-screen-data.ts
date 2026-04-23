import type { MeditvQueueCard } from "./models/meditv-queue-card";
import type { MeditvScreenData } from "./models/meditv-screen-data";

export const defaultVideoUrl =
  "https://pub-78a60da0218547c9a4f7c101e80b9234.r2.dev/Kehamilan%20Sehat%20Sejahtera%20I%20Klinik%20Kehamilan%20yang%20Pro-Normal%20-%20Kehamilan%20Sehat%20(720p%2C%20h264).mp4";

function sanitizeUrl(raw: unknown): string {
  const str = `${raw ?? ""}`.trim();
  if (!str) return defaultVideoUrl;
  try {
    const url = new URL(str);
    if (url.protocol !== "https:") return defaultVideoUrl;
    return url.href;
  } catch {
    return defaultVideoUrl;
  }
}

function sanitizeString(
  raw: unknown,
  fallback: string,
  maxLength = 200,
): string {
  const str = `${raw ?? ""}`.trim();
  return (str || fallback).slice(0, maxLength);
}

function hasCurrentDayPayload(queueDoc: Record<string, unknown>): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const resetDate =
    queueDoc.lastResetDate ?? queueDoc.resetDate ?? queueDoc.last_reset_date;
  if (typeof resetDate === "string") {
    return resetDate.startsWith(today);
  }
  const ts = queueDoc.timestamp ?? queueDoc.updatedAt ?? queueDoc.time;
  if (ts) {
    const date = new Date(ts as string | number);
    return date.toISOString().slice(0, 10) === today;
  }
  return true;
}

function parseEventDate(value: unknown): Date {
  if (!value) return new Date(0);
  if (typeof value === "object" && value !== null) {
    if ("toDate" in value) {
      return (value as { toDate: () => Date }).toDate();
    }
    if ("seconds" in value) {
      return new Date((value as { seconds: number }).seconds * 1000);
    }
  }
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function pickLatestPayment(
  paymentDocs: Record<number, Record<string, unknown>>,
  specialists: Array<{ doctorId: number; doctorName: string }>,
): {
  paymentQueueNumber: string;
  paymentDoctorName: string;
  paymentUpdatedAt: Date;
} {
  let latest = {
    paymentQueueNumber: "-",
    paymentDoctorName: "-",
    paymentUpdatedAt: new Date(0),
  };

  for (const doc of Object.values(paymentDocs)) {
    const ts = parseEventDate(
      doc.paymentUpdatedAt ?? doc.timestamp ?? doc.updatedAt,
    );
    if (ts > latest.paymentUpdatedAt) {
      const docDoctorId = doc.Doctor_ID ?? doc.doctorId ?? doc.doctor_id;
      const specialist = docDoctorId
        ? specialists.find((s) => String(s.doctorId) === String(docDoctorId))
        : undefined;
      latest = {
        paymentQueueNumber: sanitizeString(
          doc.antrian ?? doc.paymentQueueNumber ?? doc.queueNumber,
          "-",
          20,
        ),
        paymentDoctorName:
          specialist?.doctorName ??
          sanitizeString(doc.paymentDoctorName ?? doc.doctorName, "-", 100),
        paymentUpdatedAt: ts,
      };
    }
  }

  return latest;
}

export function normalizeRealtimeScreenData({
  session,
  screenDoc: _screenDoc,
  queueDocs,
  paymentDocs,
}: {
  session: {
    clinicId: number;
    doctorIds: number[];
    clinicName: string;
    clinicAddress: string;
    videoUrl: string | null;
    specialists: Array<{
      doctorId: number;
      doctorName: string;
      specialistName: string;
    }>;
  };
  screenDoc: Record<string, unknown>;
  queueDocs: Record<number, Record<string, unknown>>;
  paymentDocs: Record<number, Record<string, unknown>>;
}): MeditvScreenData {
  const cards = session.doctorIds.map((doctorId) => {
    const queueDoc = queueDocs[doctorId] ?? {};
    const specialist = session.specialists.find(
      (item) => item.doctorId === doctorId,
    );
    const isCurrentDay = hasCurrentDayPayload(queueDoc);
    const type = `${queueDoc.type ?? queueDoc.status ?? ""}`
      .trim()
      .toUpperCase();

    return {
      doctorId: String(doctorId),
      poliLabel: specialist?.specialistName ?? "Poli Umum",
      doctorName: specialist?.doctorName ?? "Dokter",
      currentNumber: isCurrentDay
        ? sanitizeString(queueDoc.antrian ?? queueDoc.currentNumber, "-", 20)
        : "-",
      nextNumber: isCurrentDay
        ? sanitizeString(queueDoc.nextantrian ?? queueDoc.nextNumber, "-", 20)
        : "-",
      roomName: "Ruang Pemeriksaan",
      status:
        type === "QUEUE_CALLING" ||
        type === "QUEUE_RECALL" ||
        type === "CALLING" ||
        type === "QUEUE_WARNING"
          ? ("calling" as const)
          : ("waiting" as const),
      statusLabel:
        type === "QUEUE_RECALL"
          ? "MEMANGGIL ULANG"
          : type === "QUEUE_CALLING" ||
              type === "CALLING" ||
              type === "QUEUE_WARNING"
            ? "MEMANGGIL"
            : "MENUNGGU",
      updatedAt: parseEventDate(
        queueDoc.timestamp ?? queueDoc.updatedAt ?? queueDoc.time,
      ),
    } satisfies MeditvQueueCard;
  });

  return {
    clinicName: session.clinicName,
    clinicAddress: session.clinicAddress,
    videoUrl: sanitizeUrl(session.videoUrl),
    ...pickLatestPayment(paymentDocs, session.specialists),
    pharmacyQueueNumber: "-",
    queueCards: cards,
  };
}
