import type { MeditvStatusType } from "./meditv-status-type";

export type MeditvQueueCard = {
  doctorId: string;
  poliLabel: string;
  doctorName: string;
  currentNumber: string;
  nextNumber: string;
  roomName: string;
  status: MeditvStatusType;
  statusLabel: string;
  updatedAt: Date;
};
