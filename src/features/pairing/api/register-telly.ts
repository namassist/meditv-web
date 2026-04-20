import { getAppConfig } from "@/shared/config/app-config";

type RegisterTellyPayload = {
  code: string;
  screenId: string;
  deviceName: string;
  screenName: string;
  platform: string;
  browserInfo: string;
  appVersion: string;
};

export async function registerTelly(payload: RegisterTellyPayload) {
  const config = getAppConfig();
  const response = await fetch(`${config.nodeUrl}/fcm/register-telly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      node: config.node,
      ...payload,
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(data.message ?? "Pairing failed"));
  }

  return data;
}
