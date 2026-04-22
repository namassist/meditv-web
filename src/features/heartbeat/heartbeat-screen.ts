import { getAppConfig } from "@/shared/config/app-config";

type HeartbeatParams = {
  token: string;
  screenId: string;
  clinicId: number;
  doctorIds: number[];
};

export async function sendHeartbeat({
  token,
  screenId,
  clinicId,
  doctorIds,
}: HeartbeatParams): Promise<{ success: boolean }> {
  const config = getAppConfig();
  const response = await fetch(
    `${config.nodeUrl}/fcm/heartbeat-screen?node=${config.node}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        node: config.node,
        screenId,
        Clinic_ID: clinicId,
        doctorIds: doctorIds.map(String),
      }),
    },
  );

  const data = (await response.json()) as { success: boolean; message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? `Heartbeat failed (${response.status})`);
  }

  return data;
}
