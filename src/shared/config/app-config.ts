export type AppEnv = "staging" | "production";

export type AppConfig = {
  env: AppEnv;
  baseUrl: string;
  nodeUrl: string;
  node: "dev" | "live";
  version: string;
};

const APP_VERSION = "0.2.0";

const configs: Record<AppEnv, AppConfig> = {
  staging: {
    env: "staging",
    baseUrl: "https://devkss.idempiereonline.com/api/v1",
    nodeUrl: "https://medibook.medital.id/api",
    node: "dev",
    version: APP_VERSION,
  },
  production: {
    env: "production",
    baseUrl: "https://ksslive.idempiereonline.com/api/v1",
    nodeUrl: "https://medibook.medital.id/api",
    node: "live",
    version: APP_VERSION,
  },
};

export function getAppConfig(rawEnv = process.env.NEXT_PUBLIC_ENV): AppConfig {
  return rawEnv === "production" ? configs.production : configs.staging;
}

export function getFirebaseWebConfig() {
  return {
    apiKey: "AIzaSyAHlaSbwISWYMT-ylO7yPLwXl7I1HR5pAc",
    appId: "1:788477079049:web:8c559ed24d69debb59d2d8",
    messagingSenderId: "788477079049",
    projectId: "medibook-web-app",
    authDomain: "medibook-web-app.firebaseapp.com",
    storageBucket: "medibook-web-app.appspot.com",
    measurementId: "G-HL1KMPX7YL",
  };
}
