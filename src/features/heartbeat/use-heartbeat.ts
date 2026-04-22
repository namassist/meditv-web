import { useEffect, useRef } from "react";
import { sendHeartbeat } from "./heartbeat-screen";

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

type UseHeartbeatParams = {
  token: string | null;
  screenId: string;
  clinicId: number;
  doctorIds: number[];
};

export function useHeartbeat({
  token,
  screenId,
  clinicId,
  doctorIds,
}: UseHeartbeatParams) {
  const paramsRef = useRef({ token, screenId, clinicId, doctorIds });
  paramsRef.current = { token, screenId, clinicId, doctorIds };

  useEffect(() => {
    if (!token) return;

    const fire = () => {
      const p = paramsRef.current;
      if (
        !p.token ||
        !p.screenId ||
        p.clinicId <= 0 ||
        p.doctorIds.length === 0
      )
        return;
      sendHeartbeat({
        token: p.token,
        screenId: p.screenId,
        clinicId: p.clinicId,
        doctorIds: p.doctorIds,
      }).catch((error) => {
        console.warn("[heartbeat] failed:", error);
      });
    };

    // Send immediately on mount
    fire();

    const id = setInterval(fire, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token]);
}
