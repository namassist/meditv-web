import { render, screen } from "@testing-library/react";
import { MeditvScreenView } from "./meditv-screen-view";

it("shows the empty queue state when every queue card is empty", () => {
  render(
    <MeditvScreenView
      isLoading={false}
      error={null}
      isSpeaking={false}
      activeDoctorId={undefined}
      isPaymentSpeaking={false}
      screenData={{
        clinicName: "Klinik Sehat",
        clinicAddress: "Jl. Sudirman",
        videoUrl: "https://example.com/video.mp4",
        paymentQueueNumber: "-",
        paymentDoctorName: "-",
        paymentUpdatedAt: new Date("2026-04-17T10:00:00Z"),
        pharmacyQueueNumber: "-",
        queueCards: [
          {
            doctorId: "11",
            poliLabel: "Poli Umum",
            doctorName: "dr. A",
            currentNumber: "-",
            nextNumber: "-",
            roomName: "Ruang Pemeriksaan",
            status: "waiting",
            statusLabel: "MENUNGGU",
          },
        ],
      }}
    />,
  );

  expect(screen.getByText(/belum ada antrian/i)).toBeInTheDocument();
});
