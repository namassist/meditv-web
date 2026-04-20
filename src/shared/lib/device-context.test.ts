import { describe, expect, it } from "vitest";
import { buildDeviceContext, parseBrowserName } from "./device-context";

describe("device context", () => {
  it("reports a web platform and browser-derived device name", () => {
    const userAgent = "Mozilla/5.0 Chrome/123.0.0.0 Safari/537.36";
    expect(parseBrowserName(userAgent)).toBe("Chrome");
    expect(buildDeviceContext(userAgent)).toMatchObject({
      platform: "web",
      deviceName: "Chrome",
      browserInfo: userAgent,
    });
  });
});
