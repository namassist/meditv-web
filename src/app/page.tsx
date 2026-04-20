"use client";

import { BootstrapRoute } from "@/features/bootstrap/components/bootstrap-route";

export default function HomePage() {
  return <BootstrapRoute restore={async () => ({ status: "missing" })} />;
}
