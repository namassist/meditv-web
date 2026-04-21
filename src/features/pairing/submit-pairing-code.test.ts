import { describe, expect, it, vi } from "vitest";
import { submitPairingCode } from "./submit-pairing-code";

describe("submitPairingCode", () => {
  it("rejects non-six-digit codes before hitting the API", async () => {
    await expect(
      submitPairingCode({
        code: "123",
        screenId: "meditv_test",
        registerTelly: vi.fn(),
        signIn: vi.fn(),
        saveState: vi.fn(),
        deviceContext: {
          deviceName: "Chrome",
          platform: "web",
          browserInfo: "ua",
          appVersion: "1.0.0-web",
        },
      }),
    ).rejects.toThrow("Code must be exactly 6 digits.");
  });

  it("parses the response, signs in, and persists the pairing state", async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    const saveState = vi.fn();

    const session = await submitPairingCode({
      code: "123456",
      screenId: "meditv_test",
      registerTelly: vi.fn().mockResolvedValue({
        success: true,
        customToken: "token-123",
        clinicId: 7,
        doctorIds: [11],
      }),
      signIn,
      saveState,
      deviceContext: {
        deviceName: "Chrome",
        platform: "web",
        browserInfo: "ua",
        appVersion: "1.0.0-web",
      },
    });

    expect(signIn).toHaveBeenCalledWith("token-123");
    expect(saveState).toHaveBeenCalledTimes(1);
    expect(session.clinicId).toBe(7);
  });
});
