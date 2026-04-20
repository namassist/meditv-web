import type { PairingSpecialist } from "./pairing-specialist";
import { parsePairingSpecialist } from "./pairing-specialist";

export type PairingSession = {
  screenId: string;
  screenDocumentPath: string | null;
  sessionDocumentPath: string | null;
  customToken: string | null;
  clinicId: number;
  doctorIds: number[];
  specialists: PairingSpecialist[];
  clinicName: string;
  clinicAddress: string;
  rawResponse: Record<string, unknown>;
};

function readStringDeep(source: unknown, keys: string[]): string | null {
  if (!source || typeof source !== "object") {
    if (typeof source === "string") return source || null;
    return null;
  }
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function readIntDeep(source: unknown, keys: string[]): number | null {
  if (!source || typeof source !== "object") return null;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return null;
}

function readIntListDeep(source: unknown, keys: string[]): number[] {
  if (!source || typeof source !== "object") return [];
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.map((item) => Number(item)).filter((item) => item > 0);
    }
  }
  return [];
}

function readSpecialists(
  response: Record<string, unknown>,
): PairingSpecialist[] {
  const raw = response.specialists ?? response.specialist;
  if (!Array.isArray(raw)) return [];
  return raw
    .map(parsePairingSpecialist)
    .filter((item: PairingSpecialist) => item.doctorId > 0);
}

export function parsePairingSession(
  response: Record<string, unknown>,
  fallbackScreenId: string,
): PairingSession {
  return {
    screenId:
      readStringDeep(response, [
        "screenId",
        "screen_id",
        "tellyId",
        "telly_id",
      ]) ?? fallbackScreenId,
    screenDocumentPath: readStringDeep(response, [
      "screenDocPath",
      "screen_doc_path",
      "screenDocumentPath",
      "screen_document_path",
    ]),
    sessionDocumentPath: readStringDeep(response, [
      "sessionDocPath",
      "session_doc_path",
      "sessionDocumentPath",
      "session_document_path",
    ]),
    customToken: readStringDeep(response, ["customToken", "custom_token"]),
    clinicId:
      readIntDeep(response, ["clinicId", "clinic_id"]) ??
      readIntDeep(response.clinic, ["id", "clinicId"]) ??
      0,
    doctorIds: readIntListDeep(response, ["doctorIds", "doctor_ids"]),
    specialists: readSpecialists(response),
    clinicName:
      readStringDeep(response.clinic, ["name", "clinicName", "clinic_name"]) ??
      readStringDeep(response, ["clinicName", "clinic_name"]) ??
      "MediTV",
    clinicAddress:
      readStringDeep(response, ["clinicAddress", "clinic_address"]) ?? "-",
    rawResponse: response,
  };
}
