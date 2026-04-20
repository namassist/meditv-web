import type { MeditvQueueCard } from "./meditv-queue-card";

export type MeditvScreenData = {
  clinicName: string;
  clinicAddress: string;
  videoUrl: string;
  paymentQueueNumber: string;
  paymentDoctorName: string;
  paymentUpdatedAt: Date;
  pharmacyQueueNumber: string;
  queueCards: MeditvQueueCard[];
};
