import { createPersistedPairingState } from "@/features/pairing/models/persisted-pairing-state";
import { parsePairingSession } from "@/features/pairing/models/pairing-session";

type SubmitPairingCodeDeps = {
  code: string;
  screenId: string;
  registerTelly: (
    payload: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
  signIn: (customToken: string | null) => Promise<void>;
  saveState: (
    state: ReturnType<typeof createPersistedPairingState>,
  ) => void | Promise<void>;
  deviceContext: {
    deviceName: string;
    platform: string;
    browserInfo: string;
    appVersion: string;
  };
};

export async function submitPairingCode({
  code,
  screenId,
  registerTelly,
  signIn,
  saveState,
  deviceContext,
}: SubmitPairingCodeDeps) {
  if (code.length !== 6) {
    throw new Error("Code must be exactly 6 digits.");
  }

  const response = await registerTelly({
    code,
    screenId,
    deviceName: deviceContext.deviceName,
    screenName: `MediTV ${deviceContext.deviceName}`,
    platform: deviceContext.platform,
    browserInfo: deviceContext.browserInfo,
    appVersion: deviceContext.appVersion,
  });

  if (response.success !== true) {
    throw new Error(String(response.message ?? "Pairing failed"));
  }

  const session = parsePairingSession(response, screenId);
  await signIn(session.customToken);
  await saveState(createPersistedPairingState(code, session));
  return session;
}
