import { describe, expect, it } from "vitest";
import { getAppConfig, getFirebaseWebConfig } from "./app-config";

describe("getAppConfig", () => {
  it("returns staging values by default", () => {
    expect(getAppConfig()).toMatchObject({
      env: "staging",
      baseUrl: "https://devkss.idempiereonline.com/api/v1",
      nodeUrl: "https://medibook.medital.id/api",
      node: "dev",
    });
  });

  it("returns production values when requested", () => {
    expect(getAppConfig("production")).toMatchObject({
      env: "production",
      baseUrl: "https://ksslive.idempiereonline.com/api/v1",
      nodeUrl: "https://medibook.medital.id/api",
      node: "live",
    });
  });
});

describe("getFirebaseWebConfig", () => {
  it("returns the existing Flutter web Firebase project", () => {
    expect(getFirebaseWebConfig()).toMatchObject({
      apiKey: "AIzaSyAHlaSbwISWYMT-ylO7yPLwXl7I1HR5pAc",
      projectId: "medibook-web-app",
      authDomain: "medibook-web-app.firebaseapp.com",
    });
  });
});
