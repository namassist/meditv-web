import { describe, expect, it } from "vitest";
import { parsePersistedPairingState } from "./persisted-pairing-state";

describe("parsePersistedPairingState", () => {
  it("drops invalid payloads that do not have a six-digit pairing code", () => {
    expect(parsePersistedPairingState({ pairingCode: "123" })).toBeNull();
  });
});
