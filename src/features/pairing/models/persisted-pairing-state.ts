import type { PairingSession } from "./pairing-session";
import type { PairingSpecialist } from "./pairing-specialist";
import { parsePairingSpecialist } from "./pairing-specialist";

export const PAIRING_STORAGE_KEY = "meditv.persisted_pairing_state";
export const SCREEN_ID_STORAGE_KEY = "meditv.screen_id";

export type PersistedPairingState = {
  pairingCode: string;
  screenId: string;
  customToken: string | null;
  token: string | null;
  screenDocumentPath: string | null;
  sessionDocumentPath: string | null;
  clinicId: number;
  doctorIds: number[];
  clinicName: string;
  clinicAddress: string;
  videoUrl: string | null;
  specialists: PairingSpecialist[];
};

export function createPersistedPairingState(
  pairingCode: string,
  session: PairingSession,
): PersistedPairingState {
  return {
    pairingCode,
    screenId: session.screenId,
    customToken: session.customToken,
    token: session.token,
    screenDocumentPath: session.screenDocumentPath,
    sessionDocumentPath: session.sessionDocumentPath,
    clinicId: session.clinicId,
    doctorIds: session.doctorIds,
    clinicName: session.clinicName,
    clinicAddress: session.clinicAddress,
    videoUrl: session.videoUrl,
    specialists: session.specialists,
  };
}

export function parsePersistedPairingState(
  value: unknown,
): PersistedPairingState | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const pairingCode = `${record.pairingCode ?? ""}`.trim();
  if (pairingCode.length !== 6) return null;
  return {
    pairingCode,
    screenId: `${record.screenId ?? ""}`.trim(),
    customToken: `${record.customToken ?? ""}`.trim() || null,
    token: `${record.token ?? ""}`.trim() || null,
    screenDocumentPath: `${record.screenDocumentPath ?? ""}`.trim() || null,
    sessionDocumentPath: `${record.sessionDocumentPath ?? ""}`.trim() || null,
    clinicId: Number(record.clinicId ?? 0),
    doctorIds: Array.isArray(record.doctorIds)
      ? record.doctorIds.map((item) => Number(item)).filter((item) => item > 0)
      : [],
    clinicName: `${record.clinicName ?? "MediTV"}`.trim(),
    clinicAddress: `${record.clinicAddress ?? "-"}`.trim(),
    videoUrl: `${record.videoUrl ?? ""}`.trim() || null,
    specialists: Array.isArray(record.specialists)
      ? record.specialists
          .map(parsePairingSpecialist)
          .filter((item) => item.doctorId > 0)
      : [],
  };
}
