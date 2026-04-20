"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function BootstrapRoute({
  restore,
  replace,
}: {
  restore: () => Promise<
    | { status: "restored" }
    | { status: "missing" }
    | { status: "invalid-session" }
    | { status: "retryable-error" }
  >;
  replace?: (path: string) => void;
}) {
  const router = useRouter();
  const replaceRef = useRef(replace);
  replaceRef.current = replace;
  const routerReplace = router.replace;
  const navigateRef = useRef((path: string) => {
    if (replaceRef.current) {
      replaceRef.current(path);
    } else {
      routerReplace(path);
    }
  });
  const [message, setMessage] = useState("Memeriksa sesi perangkat...");

  useEffect(() => {
    void restore().then((result) => {
      if (result.status === "restored") {
        navigateRef.current("/screen");
        return;
      }

      if (result.status === "retryable-error") {
        setMessage("Koneksi bermasalah. Silakan coba lagi.");
        return;
      }

      navigateRef.current("/pairing");
    });
  }, [restore]);

  return <main>{message}</main>;
}
