import { describe, expect, it, vi } from "vitest";
import { restoreSession } from "./restore-session";

const savedState = {
  pairingCode: "123456",
  screenId: "meditv_saved",
  customToken: "token-123",
  token: null,
  screenDocumentPath: null,
  sessionDocumentPath: null,
  clinicId: 7,
  doctorIds: [11],
  clinicName: "Klinik Sehat",
  clinicAddress: "Jl. Sudirman",
  specialists: [],
};

describe("restoreSession", () => {
  it("returns a restored session when sign-in succeeds", async () => {
    const result = await restoreSession({
      savedState,
      signIn: vi.fn().mockResolvedValue(undefined),
      clearSavedState: vi.fn(),
    });
    expect(result.status).toBe("restored");
  });

  it("clears persisted state when the token is invalid", async () => {
    const clearSavedState = vi.fn();
    const result = await restoreSession({
      savedState,
      signIn: vi
        .fn()
        .mockRejectedValue(
          new Error("customToken tidak tersedia untuk autentikasi Firebase."),
        ),
      clearSavedState,
    });
    expect(result.status).toBe("invalid-session");
    expect(clearSavedState).toHaveBeenCalledTimes(1);
  });

  it("keeps saved state on network errors", async () => {
    const clearSavedState = vi.fn();
    const result = await restoreSession({
      savedState,
      signIn: vi
        .fn()
        .mockRejectedValue(new Error("network timeout while signing in")),
      clearSavedState,
    });
    expect(result.status).toBe("retryable-error");
    expect(clearSavedState).not.toHaveBeenCalled();
  });
});
