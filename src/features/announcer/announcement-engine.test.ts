import { describe, expect, it } from "vitest";
import { AnnouncementEngine } from "./announcement-engine";

describe("AnnouncementEngine", () => {
  it("does not announce during the initial seed snapshot", () => {
    const engine = new AnnouncementEngine();
    expect(
      engine.update({
        paymentQueueNumber: "-",
        paymentDoctorName: "-",
        paymentUpdatedAt: new Date("2026-04-17T10:00:00Z"),
        queueCards: [
          {
            doctorId: "11",
            doctorName: "dr. A",
            currentNumber: "A-12",
            nextNumber: "A-13",
            statusLabel: "MEMANGGIL",
            status: "calling",
            roomName: "Ruang Pemeriksaan",
            poliLabel: "Poli Umum",
            updatedAt: new Date("2026-04-17T10:00:00Z"),
          },
        ],
      } as never),
    ).toEqual([]);
  });

  it("announces a new doctor queue number and caps recalls at three total calls", () => {
    const engine = new AnnouncementEngine();
    engine.update({
      paymentQueueNumber: "-",
      paymentDoctorName: "-",
      paymentUpdatedAt: new Date("2026-04-17T10:00:00Z"),
      queueCards: [],
    } as never);

    const first = engine.update({
      paymentQueueNumber: "-",
      paymentDoctorName: "-",
      paymentUpdatedAt: new Date("2026-04-17T10:00:00Z"),
      queueCards: [
        {
          doctorId: "11",
          doctorName: "dr. A",
          currentNumber: "A-12",
          nextNumber: "A-13",
          statusLabel: "MEMANGGIL",
          status: "calling",
          roomName: "Ruang Pemeriksaan",
          poliLabel: "Poli Umum",
          updatedAt: new Date("2026-04-17T10:01:00Z"),
        },
      ],
    } as never);
    const second = engine.update({
      paymentQueueNumber: "-",
      paymentDoctorName: "-",
      paymentUpdatedAt: new Date("2026-04-17T10:00:00Z"),
      queueCards: [
        {
          doctorId: "11",
          doctorName: "dr. A",
          currentNumber: "A-12",
          nextNumber: "A-13",
          statusLabel: "MEMANGGIL ULANG",
          status: "calling",
          roomName: "Ruang Pemeriksaan",
          poliLabel: "Poli Umum",
          updatedAt: new Date("2026-04-17T10:02:00Z"),
        },
      ],
    } as never);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
  });
});
