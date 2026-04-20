import { describe, expect, it } from "vitest";
import {
  defaultVideoUrl,
  normalizeRealtimeScreenData,
} from "./normalize-realtime-screen-data";

describe("normalizeRealtimeScreenData", () => {
  it("maps queue docs into ordered queue cards using specialist metadata", () => {
    const result = normalizeRealtimeScreenData({
      session: {
        clinicId: 7,
        doctorIds: [11],
        clinicName: "Klinik Sehat",
        clinicAddress: "Jl. Sudirman",
        specialists: [
          { doctorId: 11, doctorName: "dr. A", specialistName: "Poli Umum" },
        ],
      },
      screenDoc: {},
      queueDocs: {
        11: {
          antrian: "A-12",
          nextantrian: "A-13",
          type: "QUEUE_CALLING",
          lastResetDate: new Date().toISOString().slice(0, 10),
        },
      },
      paymentDocs: {},
    });

    expect(result.queueCards[0]).toMatchObject({
      doctorId: "11",
      currentNumber: "A-12",
      nextNumber: "A-13",
      statusLabel: "MEMANGGIL",
    });
  });

  it("uses the fallback video URL when the screen document is empty", () => {
    const result = normalizeRealtimeScreenData({
      session: {
        clinicId: 7,
        doctorIds: [],
        clinicName: "Klinik Sehat",
        clinicAddress: "Jl. Sudirman",
        specialists: [],
      },
      screenDoc: {},
      queueDocs: {},
      paymentDocs: {},
    });

    expect(result.videoUrl).toBe(defaultVideoUrl);
  });
});
