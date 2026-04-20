"use client";

import { ScreenRuntime } from "@/features/screen/components/screen-runtime";

export default function ScreenPage() {
  return (
    <ScreenRuntime
      session={{
        clinicId: 0,
        doctorIds: [],
        clinicName: "MediTV",
        clinicAddress: "-",
        screenDocumentPath: null,
        specialists: [],
      }}
    />
  );
}
