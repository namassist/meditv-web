import { describe, expect, it } from "vitest";
import { parsePairingSession } from "./pairing-session";

describe("parsePairingSession", () => {
  it("reads flexible backend keys and clinic metadata", () => {
    const session = parsePairingSession(
      {
        telly_id: "meditv_123",
        custom_token: "token-123",
        clinic: { id: 7, name: "Klinik Sehat" },
        clinic_address: "Jl. Sudirman",
        doctor_ids: [11, 12],
        specialists: [
          { doctor_id: 11, doctor_name: "dr. A", specialist_name: "Poli Umum" },
        ],
      },
      "fallback-screen-id",
    );

    expect(session.screenId).toBe("meditv_123");
    expect(session.customToken).toBe("token-123");
    expect(session.clinicId).toBe(7);
    expect(session.doctorIds).toEqual([11, 12]);
    expect(session.clinicName).toBe("Klinik Sehat");
  });
});
