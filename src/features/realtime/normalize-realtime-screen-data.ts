import type { MeditvQueueCard } from "./models/meditv-queue-card";
import type { MeditvScreenData } from "./models/meditv-screen-data";

export const defaultVideoUrl =
  "https://pub-78a60da0218547c9a4f7c101e80b9234.r2.dev/Kehamilan%20Sehat%20Sejahtera%20I%20Klinik%20Kehamilan%20yang%20Pro-Normal%20-%20Kehamilan%20Sehat%20(720p%2C%20h264).mp4";

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
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function pickLatestPayment(
  paymentDocs: Record<number, Record<string, unknown>>,
): { queueNumber: string; doctorName: string; updatedAt: Date } {
  let latest: { queueNumber: string; doctorName: string; updatedAt: Date } = {
    queueNumber: "-",
    doctorName: "-",
    updatedAt: new Date(0),
  };

  for (const doc of Object.values(paymentDocs)) {
    const ts = parseEventDate(doc.paymentUpdatedAt ?? doc.updatedAt);
    if (ts > latest.updatedAt) {
      latest = {
        queueNumber: `${doc.paymentQueueNumber ?? doc.queueNumber ?? "-"}`,
        doctorName: `${doc.paymentDoctorName ?? doc.doctorName ?? "-"}`,
        updatedAt: ts,
      };
    }
  }

  return latest;
}

export function normalizeRealtimeScreenData({
  session,
  screenDoc,
  queueDocs,
  paymentDocs,
}: {
  session: {
    clinicId: number;
    doctorIds: number[];
    clinicName: string;
    clinicAddress: string;
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
        ? `${queueDoc.antrian ?? queueDoc.currentNumber ?? "-"}`
        : "-",
      nextNumber: isCurrentDay
        ? `${queueDoc.nextantrian ?? queueDoc.nextNumber ?? "-"}`
        : "-",
      roomName: "Ruang Pemeriksaan",
      status:
        type === "QUEUE_CALLING" ||
        type === "QUEUE_RECALL" ||
        type === "CALLING"
          ? ("calling" as const)
          : ("waiting" as const),
      statusLabel:
        type === "QUEUE_RECALL"
          ? "MEMANGGIL ULANG"
          : type === "QUEUE_CALLING" || type === "CALLING"
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
    videoUrl: `${screenDoc.url ?? screenDoc.videoUrl ?? defaultVideoUrl}`,
    paymentQueueNumber: pickLatestPayment(paymentDocs).queueNumber,
    paymentDoctorName: pickLatestPayment(paymentDocs).doctorName,
    paymentUpdatedAt: pickLatestPayment(paymentDocs).updatedAt,
    pharmacyQueueNumber: "-",
    queueCards: cards,
  };
}
