type Announcement = {
  text: string;
  doctorId?: string;
  isPayment?: boolean;
};

export class AnnouncementEngine {
  private initialized = false;
  private doctorCallTracker = new Map<
    string,
    { number: string; count: number }
  >();
  private lastDoctorAnnounceTime = new Map<string, number>();
  private lastPaymentAnnounceTime = 0;

  update(screenData: {
    paymentQueueNumber: string;
    paymentDoctorName: string;
    paymentUpdatedAt: Date;
    queueCards: Array<{
      doctorId: string;
      doctorName: string;
      currentNumber: string;
      statusLabel: string;
      updatedAt: Date;
    }>;
  }): Announcement[] {
    if (!this.initialized) {
      this.initialized = true;
      this.seed(screenData);
      return [];
    }

    const announcements: Announcement[] = [];

    for (const card of screenData.queueCards) {
      const isCalling =
        card.statusLabel === "MEMANGGIL" ||
        card.statusLabel === "MEMANGGIL ULANG";
      if (!isCalling || card.currentNumber === "-") continue;

      const previousTime = this.lastDoctorAnnounceTime.get(card.doctorId) ?? 0;
      const updatedAt = card.updatedAt.getTime();
      if (updatedAt <= previousTime) continue;

      const tracker = this.doctorCallTracker.get(card.doctorId);
      const isNewNumber = tracker?.number !== card.currentNumber;
      const nextCount = isNewNumber ? 1 : (tracker?.count ?? 0) + 1;

      this.lastDoctorAnnounceTime.set(card.doctorId, updatedAt);
      if (nextCount <= 3) {
        this.doctorCallTracker.set(card.doctorId, {
          number: card.currentNumber,
          count: nextCount,
        });
        announcements.push({
          doctorId: card.doctorId,
          text: `Antrian nomor ${card.currentNumber}, ${card.doctorName}, silakan menuju ke ruang pemeriksaan.`,
        });
      }
    }

    const paymentTime = screenData.paymentUpdatedAt.getTime();
    if (
      screenData.paymentQueueNumber !== "-" &&
      paymentTime > this.lastPaymentAnnounceTime
    ) {
      this.lastPaymentAnnounceTime = paymentTime;
      announcements.push({
        isPayment: true,
        text: `Antrian nomor ${screenData.paymentQueueNumber}, ${screenData.paymentDoctorName}, silakan menuju ke meja registrasi.`,
      });
    }

    return announcements;
  }

  private seed(screenData: {
    paymentQueueNumber: string;
    paymentUpdatedAt: Date;
    queueCards: Array<{
      doctorId: string;
      currentNumber: string;
      statusLabel: string;
      updatedAt: Date;
    }>;
  }) {
    for (const card of screenData.queueCards) {
      if (
        card.currentNumber !== "-" &&
        (card.statusLabel === "MEMANGGIL" ||
          card.statusLabel === "MEMANGGIL ULANG")
      ) {
        this.doctorCallTracker.set(card.doctorId, {
          number: card.currentNumber,
          count: 3,
        });
        this.lastDoctorAnnounceTime.set(
          card.doctorId,
          card.updatedAt.getTime(),
        );
      }
    }

    if (screenData.paymentQueueNumber !== "-") {
      this.lastPaymentAnnounceTime = screenData.paymentUpdatedAt.getTime();
    }
  }
}
