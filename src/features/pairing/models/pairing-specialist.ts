export type PairingSpecialist = {
  doctorId: number;
  doctorName: string;
  specialistName: string;
};

export function parsePairingSpecialist(raw: unknown): PairingSpecialist {
  const record = (raw ?? {}) as Record<string, unknown>;
  return {
    doctorId: Number(record.doctor_id ?? record.doctorId ?? 0),
    doctorName: String(record.doctor_name ?? record.doctorName ?? "Dokter"),
    specialistName: String(
      record.specialist_name ?? record.specialistName ?? "Poli Umum",
    ),
  };
}
