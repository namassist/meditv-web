# MediTV Web Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js kiosk web app that matches the current Flutter MediTV pairing, realtime queue, video, slide, and announcement behaviour on Android TV browsers.

**Architecture:** The project is a client-first Next.js 16 App Router app using Tailwind CSS v4 and shadcn/ui (base-nova style with `@base-ui/react`). Pure logic for parsing, bootstrap, realtime normalization, slide selection, and announcement decisions stays in small testable modules, while route components stay thin and compose those modules into `/`, `/pairing`, and `/screen`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (base-nova), `@base-ui/react`, Firebase Web SDK, Vitest, Testing Library, Biome v2 (linter + formatter + assist), Web Speech API, Fullscreen API

---

## Current Setup Baseline

The workspace already contains:
- Next.js 16.2.4 with App Router and `src/` directory
- Tailwind CSS v4 with `@tailwindcss/postcss`
- shadcn/ui initialized with `base-nova` style, `@base-ui/react`, `lucide-react` icons
- `components.json` configured with `@/` aliases
- `cn()` utility at `src/lib/utils.ts` (`clsx` + `tailwind-merge`)
- `Button` component at `src/components/ui/button.tsx`
- Biome v2.2.0 at `biome.json` with `next` and `react` lint domains
- `src/app/globals.css` with Tailwind v4 `@theme` + shadcn CSS custom properties (oklch)
- `postcss.config.mjs` with `@tailwindcss/postcss`

## Scope Check

This spec describes one cohesive subsystem: a standalone web replacement for the existing Flutter kiosk screen. One plan is appropriate because pairing, bootstrap restore, realtime subscriptions, kiosk readiness, display rendering, and announcements all ship together to produce a usable kiosk product.

## File Structure

All paths relative to project root.

- Create: `.env.example` - public runtime environment selection
- Modify: `package.json` - add firebase, test deps, and scripts
- Modify: `biome.json` - add coverage ignore pattern
- Create: `vitest.config.ts` - Vitest + jsdom config
- Create: `src/test/setup.ts` - Testing Library and DOM mocks
- Create: `src/shared/config/app-config.ts` - staging/production API config and Firebase web config
- Create: `src/shared/config/app-config.test.ts` - config selection tests
- Create: `src/shared/lib/browser-storage.ts` - stable localStorage wrapper
- Create: `src/shared/lib/device-context.ts` - browser device metadata builder
- Create: `src/shared/lib/device-context.test.ts` - device metadata tests
- Create: `src/features/pairing/models/pairing-specialist.ts` - specialist parsing
- Create: `src/features/pairing/models/pairing-session.ts` - flexible pairing response parser
- Create: `src/features/pairing/models/persisted-pairing-state.ts` - storage serializer/deserializer
- Create: `src/features/pairing/models/pairing-session.test.ts` - response parsing tests
- Create: `src/features/pairing/models/persisted-pairing-state.test.ts` - persisted-state tests
- Create: `src/features/auth/firebase-client.ts` - Firebase app/auth singleton
- Create: `src/features/auth/sign-in-with-custom-token.ts` - auth helper
- Create: `src/features/bootstrap/restore-session.ts` - auto-restore controller
- Create: `src/features/bootstrap/restore-session.test.ts` - restore outcome tests
- Create: `src/features/pairing/api/register-telly.ts` - `/fcm/register-telly` client
- Create: `src/features/pairing/submit-pairing-code.ts` - pairing submit use case
- Create: `src/features/pairing/submit-pairing-code.test.ts` - pairing submit tests
- Create: `src/features/kiosk/browser-capabilities.ts` - support detection and readiness model
- Create: `src/features/kiosk/unlock-kiosk.ts` - one-click fullscreen/audio/notification runner
- Create: `src/features/kiosk/browser-capabilities.test.ts` - readiness tests
- Create: `src/features/kiosk/components/readiness-gate.tsx` - pairing-page capability gate
- Create: `src/features/kiosk/components/readiness-gate.test.tsx` - gate interaction tests
- Create: `src/features/realtime/models/meditv-status-type.ts` - status enums
- Create: `src/features/realtime/models/meditv-queue-card.ts` - queue card model
- Create: `src/features/realtime/models/meditv-screen-data.ts` - normalized screen model
- Create: `src/features/realtime/normalize-realtime-screen-data.ts` - Firestore merge and fallback logic
- Create: `src/features/realtime/normalize-realtime-screen-data.test.ts` - normalization tests
- Create: `src/features/realtime/watch-meditv-screen.ts` - Firestore watcher composer
- Create: `src/features/announcer/announcement-engine.ts` - doctor/payment event diffing
- Create: `src/features/announcer/browser-speaker.ts` - queued browser TTS playback
- Create: `src/features/announcer/announcement-engine.test.ts` - recall/seed/payment tests
- Create: `src/features/display/use-slide-state.ts` - 2-card slide and auto-focus logic
- Create: `src/features/display/use-slide-state.test.ts` - slide selection and pause tests
- Create: `src/features/display/constants/design-tokens.ts` - Tailwind color palette and poli color mapping
- Create: `src/features/display/components/meditv-header.tsx` - clinic header with clock
- Create: `src/features/display/components/meditv-queue-card.tsx` - queue card UI
- Create: `src/features/display/components/meditv-payment-card.tsx` - payment card UI (blue accent)
- Create: `src/features/display/components/meditv-pharmacy-card.tsx` - pharmacy card UI (green accent, static placeholder)
- Create: `src/features/display/components/meditv-video-card.tsx` - video renderer
- Create: `src/features/display/components/meditv-screen-view.tsx` - loading/error/empty/populated shell
- Create: `src/features/display/components/meditv-screen-view.test.tsx` - display-state rendering tests
- Create: `src/features/pairing/components/pairing-screen.tsx` - readiness gate + code form route component
- Create: `src/features/pairing/components/pairing-screen.test.tsx` - pairing route interaction tests
- Create: `src/features/screen/components/screen-runtime.tsx` - realtime and announcer composition
- Create: `src/features/bootstrap/components/bootstrap-route.tsx` - startup redirect route
- Create: `src/features/bootstrap/components/bootstrap-route.test.tsx` - redirect tests
- Modify: `src/app/globals.css` - add custom design tokens for MediTV theme
- Modify: `src/app/layout.tsx` - root HTML shell for kiosk
- Modify: `src/app/page.tsx` - bootstrap entry route
- Create: `src/app/pairing/page.tsx` - pairing route
- Create: `src/app/screen/page.tsx` - screen route
- Modify: `README.md` - setup, run, and kiosk validation guide

### Task 1: Add Test Harness and Install Missing Dependencies

The Next.js project, Tailwind v4, shadcn/ui, and Biome are already set up. This task adds the missing test tooling and Firebase SDK.

**Files:**
- Modify: `package.json`
- Modify: `biome.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Install the minimum runtime and test dependencies**

Run: `pnpm add firebase && pnpm add -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
Expected: `package.json` contains `firebase`, `vitest`, `jsdom`, and the Testing Library packages.

- [ ] **Step 2: Add test and lint-fix scripts to package.json**

Add to the `"scripts"` block in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check",
    "lint:fix": "biome check --write",
    "format": "biome format --write",
    "test": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Update biome.json to ignore test coverage output**

Add `"coverage"` to the `files.includes` ignore pattern. The full `biome.json` becomes:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": ["**", "!node_modules", "!.next", "!dist", "!build", "!coverage"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noUnknownAtRules": "off"
      }
    },
    "domains": {
      "next": "recommended",
      "react": "recommended"
    }
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

- [ ] **Step 4: Add a Vitest config that can run DOM component tests**

Create `vitest.config.ts`:

```ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 5: Add shared test setup for DOM matchers and browser mocks**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});
```

- [ ] **Step 6: Verify the test harness runs**

Run: `pnpm test`
Expected: Vitest runs with `0 tests collected` (no tests yet), exits without error.

Run: `pnpm lint`
Expected: Biome exits with code `0`.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml biome.json vitest.config.ts src/test/setup.ts
git commit -m "chore: add test harness with vitest and firebase sdk"
```

### Task 2: Add Runtime Config and Firebase Web Configuration

**Files:**
- Create: `.env.example`
- Create: `src/shared/config/app-config.ts`
- Create: `src/shared/config/app-config.test.ts`

- [ ] **Step 1: Write the failing config tests for environment selection and Firebase web config**

Create `src/shared/config/app-config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAppConfig, getFirebaseWebConfig } from './app-config';

describe('getAppConfig', () => {
  it('returns staging values by default', () => {
    expect(getAppConfig()).toMatchObject({
      env: 'staging',
      baseUrl: 'https://devkss.idempiereonline.com/api/v1',
      nodeUrl: 'https://medibook.medital.id/api',
      node: 'dev',
    });
  });

  it('returns production values when requested', () => {
    expect(getAppConfig('production')).toMatchObject({
      env: 'production',
      baseUrl: 'https://ksslive.idempiereonline.com/api/v1',
      nodeUrl: 'https://medibook.medital.id/api',
      node: 'live',
    });
  });
});

describe('getFirebaseWebConfig', () => {
  it('returns the existing Flutter web Firebase project', () => {
    expect(getFirebaseWebConfig()).toMatchObject({
      apiKey: 'AIzaSyAHlaSbwISWYMT-ylO7yPLwXl7I1HR5pAc',
      projectId: 'medibook-web-app',
      authDomain: 'medibook-web-app.firebaseapp.com',
    });
  });
});
```

- [ ] **Step 2: Run the config tests to confirm the module does not exist yet**

Run: `pnpm test -- src/shared/config/app-config.test.ts`
Expected: FAIL with a module resolution error for `./app-config`.

- [ ] **Step 3: Implement the web runtime config with the current Flutter endpoints and Firebase values**

Create `src/shared/config/app-config.ts`:

```ts
export type AppEnv = 'staging' | 'production';

export type AppConfig = {
  env: AppEnv;
  baseUrl: string;
  nodeUrl: string;
  node: 'dev' | 'live';
};

const configs: Record<AppEnv, AppConfig> = {
  staging: {
    env: 'staging',
    baseUrl: 'https://devkss.idempiereonline.com/api/v1',
    nodeUrl: 'https://medibook.medital.id/api',
    node: 'dev',
  },
  production: {
    env: 'production',
    baseUrl: 'https://ksslive.idempiereonline.com/api/v1',
    nodeUrl: 'https://medibook.medital.id/api',
    node: 'live',
  },
};

export function getAppConfig(rawEnv = process.env.NEXT_PUBLIC_ENV): AppConfig {
  return rawEnv === 'production' ? configs.production : configs.staging;
}

export function getFirebaseWebConfig() {
  return {
    apiKey: 'AIzaSyAHlaSbwISWYMT-ylO7yPLwXl7I1HR5pAc',
    appId: '1:788477079049:web:8c559ed24d69debb59d2d8',
    messagingSenderId: '788477079049',
    projectId: 'medibook-web-app',
    authDomain: 'medibook-web-app.firebaseapp.com',
    storageBucket: 'medibook-web-app.appspot.com',
    measurementId: 'G-HL1KMPX7YL',
  };
}
```

- [ ] **Step 4: Add the public environment example file**

Create `.env.example`:

```dotenv
NEXT_PUBLIC_ENV=staging
```

- [ ] **Step 5: Run the config tests again**

Run: `pnpm test -- src/shared/config/app-config.test.ts`
Expected: PASS with `3 passed`.

- [ ] **Step 6: Commit**

```bash
git add .env.example src/shared/config/app-config.ts src/shared/config/app-config.test.ts
git commit -m "feat: add web runtime config"
```

### Task 3: Port Pairing Models, Persisted State, and Browser Device Metadata

**Files:**
- Create: `src/shared/lib/browser-storage.ts`
- Create: `src/shared/lib/device-context.ts`
- Create: `src/shared/lib/device-context.test.ts`
- Create: `src/features/pairing/models/pairing-specialist.ts`
- Create: `src/features/pairing/models/pairing-session.ts`
- Create: `src/features/pairing/models/persisted-pairing-state.ts`
- Create: `src/features/pairing/models/pairing-session.test.ts`
- Create: `src/features/pairing/models/persisted-pairing-state.test.ts`

- [ ] **Step 1: Write failing tests for response parsing, persisted state validity, and browser metadata**

Create `src/features/pairing/models/pairing-session.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parsePairingSession } from './pairing-session';

describe('parsePairingSession', () => {
  it('reads flexible backend keys and clinic metadata', () => {
    const session = parsePairingSession(
      {
        telly_id: 'meditv_123',
        custom_token: 'token-123',
        clinic: { id: 7, name: 'Klinik Sehat' },
        clinic_address: 'Jl. Sudirman',
        doctor_ids: [11, 12],
        specialists: [{ doctor_id: 11, doctor_name: 'dr. A', specialist_name: 'Poli Umum' }],
      },
      'fallback-screen-id',
    );

    expect(session.screenId).toBe('meditv_123');
    expect(session.customToken).toBe('token-123');
    expect(session.clinicId).toBe(7);
    expect(session.doctorIds).toEqual([11, 12]);
    expect(session.clinicName).toBe('Klinik Sehat');
  });
});
```

Create `src/features/pairing/models/persisted-pairing-state.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parsePersistedPairingState } from './persisted-pairing-state';

describe('parsePersistedPairingState', () => {
  it('drops invalid payloads that do not have a six-digit pairing code', () => {
    expect(parsePersistedPairingState({ pairingCode: '123' })).toBeNull();
  });
});
```

Create `src/shared/lib/device-context.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildDeviceContext, parseBrowserName } from './device-context';

describe('device context', () => {
  it('reports a web platform and browser-derived device name', () => {
    const userAgent = 'Mozilla/5.0 Chrome/123.0.0.0 Safari/537.36';
    expect(parseBrowserName(userAgent)).toBe('Chrome');
    expect(buildDeviceContext(userAgent)).toMatchObject({
      platform: 'web',
      deviceName: 'Chrome',
      browserInfo: userAgent,
    });
  });
});
```

- [ ] **Step 2: Run the model tests to confirm the parser files are missing**

Run: `pnpm test -- src/features/pairing/models/pairing-session.test.ts src/features/pairing/models/persisted-pairing-state.test.ts src/shared/lib/device-context.test.ts`
Expected: FAIL with module resolution errors for the new model files.

- [ ] **Step 3: Implement a tiny localStorage wrapper**

Create `src/shared/lib/browser-storage.ts`:

```ts
const storage = typeof window === 'undefined' ? null : window.localStorage;

export function readJson<T>(key: string): T | null {
  if (!storage) return null;
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function writeJson(key: string, value: unknown) {
  storage?.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string) {
  storage?.removeItem(key);
}
```

- [ ] **Step 4: Implement the browser metadata helper**

Create `src/shared/lib/device-context.ts`:

```ts
export function parseBrowserName(userAgent: string): string {
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('Chrome/')) return 'Chrome';
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('Safari/')) return 'Safari';
  return 'Browser';
}

export function buildDeviceContext(userAgent = navigator.userAgent) {
  return {
    deviceName: parseBrowserName(userAgent),
    platform: 'web',
    browserInfo: userAgent,
    appVersion: '1.0.0-web',
  };
}
```

- [ ] **Step 5: Implement the pairing specialist type**

Create `src/features/pairing/models/pairing-specialist.ts`:

```ts
export type PairingSpecialist = {
  doctorId: number;
  doctorName: string;
  specialistName: string;
};

export function parsePairingSpecialist(raw: unknown): PairingSpecialist {
  const record = (raw ?? {}) as Record<string, unknown>;
  return {
    doctorId: Number(record.doctor_id ?? record.doctorId ?? 0),
    doctorName: String(record.doctor_name ?? record.doctorName ?? 'Dokter'),
    specialistName: String(record.specialist_name ?? record.specialistName ?? 'Poli Umum'),
  };
}
```

- [ ] **Step 6: Implement the pairing session parser with flexible key reading**

Create `src/features/pairing/models/pairing-session.ts`:

```ts
import type { PairingSpecialist } from './pairing-specialist';
import { parsePairingSpecialist } from './pairing-specialist';

export type PairingSession = {
  screenId: string;
  screenDocumentPath: string | null;
  sessionDocumentPath: string | null;
  customToken: string | null;
  clinicId: number;
  doctorIds: number[];
  specialists: PairingSpecialist[];
  clinicName: string;
  clinicAddress: string;
  rawResponse: Record<string, unknown>;
};

function readStringDeep(source: unknown, keys: string[]): string | null {
  if (!source || typeof source !== 'object') {
    if (typeof source === 'string') return source || null;
    return null;
  }
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function readIntDeep(source: unknown, keys: string[]): number | null {
  if (!source || typeof source !== 'object') return null;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return null;
}

function readIntListDeep(source: unknown, keys: string[]): number[] {
  if (!source || typeof source !== 'object') return [];
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.map((item) => Number(item)).filter((item) => item > 0);
    }
  }
  return [];
}

function readSpecialists(response: Record<string, unknown>): PairingSpecialist[] {
  const raw = response.specialists ?? response.specialist;
  if (!Array.isArray(raw)) return [];
  return raw.map(parsePairingSpecialist).filter((item: PairingSpecialist) => item.doctorId > 0);
}

export function parsePairingSession(response: Record<string, unknown>, fallbackScreenId: string): PairingSession {
  return {
    screenId: readStringDeep(response, ['screenId', 'screen_id', 'tellyId', 'telly_id']) ?? fallbackScreenId,
    screenDocumentPath: readStringDeep(response, ['screenDocPath', 'screen_doc_path', 'screenDocumentPath', 'screen_document_path']),
    sessionDocumentPath: readStringDeep(response, ['sessionDocPath', 'session_doc_path', 'sessionDocumentPath', 'session_document_path']),
    customToken: readStringDeep(response, ['customToken', 'custom_token']),
    clinicId: readIntDeep(response, ['clinicId', 'clinic_id']) ?? readIntDeep(response.clinic, ['id', 'clinicId']) ?? 0,
    doctorIds: readIntListDeep(response, ['doctorIds', 'doctor_ids']),
    specialists: readSpecialists(response),
    clinicName: readStringDeep(response.clinic, ['name', 'clinicName', 'clinic_name']) ?? readStringDeep(response, ['clinicName', 'clinic_name']) ?? 'MediTV',
    clinicAddress: readStringDeep(response, ['clinicAddress', 'clinic_address']) ?? '-',
    rawResponse: response,
  };
}
```

- [ ] **Step 7: Implement the persisted state serializer/deserializer**

Create `src/features/pairing/models/persisted-pairing-state.ts`:

```ts
import type { PairingSpecialist } from './pairing-specialist';
import { parsePairingSpecialist } from './pairing-specialist';
import type { PairingSession } from './pairing-session';

export const PAIRING_STORAGE_KEY = 'meditv.persisted_pairing_state';
export const SCREEN_ID_STORAGE_KEY = 'meditv.screen_id';

export type PersistedPairingState = {
  pairingCode: string;
  screenId: string;
  customToken: string | null;
  screenDocumentPath: string | null;
  sessionDocumentPath: string | null;
  clinicId: number;
  doctorIds: number[];
  clinicName: string;
  clinicAddress: string;
  specialists: PairingSpecialist[];
};

export function createPersistedPairingState(pairingCode: string, session: PairingSession): PersistedPairingState {
  return {
    pairingCode,
    screenId: session.screenId,
    customToken: session.customToken,
    screenDocumentPath: session.screenDocumentPath,
    sessionDocumentPath: session.sessionDocumentPath,
    clinicId: session.clinicId,
    doctorIds: session.doctorIds,
    clinicName: session.clinicName,
    clinicAddress: session.clinicAddress,
    specialists: session.specialists,
  };
}

export function parsePersistedPairingState(value: unknown): PersistedPairingState | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const pairingCode = `${record.pairingCode ?? ''}`.trim();
  if (pairingCode.length !== 6) return null;
  return {
    pairingCode,
    screenId: `${record.screenId ?? ''}`.trim(),
    customToken: `${record.customToken ?? ''}`.trim() || null,
    screenDocumentPath: `${record.screenDocumentPath ?? ''}`.trim() || null,
    sessionDocumentPath: `${record.sessionDocumentPath ?? ''}`.trim() || null,
    clinicId: Number(record.clinicId ?? 0),
    doctorIds: Array.isArray(record.doctorIds) ? record.doctorIds.map((item) => Number(item)).filter((item) => item > 0) : [],
    clinicName: `${record.clinicName ?? 'MediTV'}`.trim(),
    clinicAddress: `${record.clinicAddress ?? '-'}`.trim(),
    specialists: Array.isArray(record.specialists) ? record.specialists.map(parsePairingSpecialist).filter((item) => item.doctorId > 0) : [],
  };
}
```

- [ ] **Step 8: Run the model tests again**

Run: `pnpm test -- src/features/pairing/models/pairing-session.test.ts src/features/pairing/models/persisted-pairing-state.test.ts src/shared/lib/device-context.test.ts`
Expected: PASS with all parser and device-context tests green.

- [ ] **Step 9: Commit**

```bash
git add src/shared/lib/browser-storage.ts src/shared/lib/device-context.ts src/shared/lib/device-context.test.ts src/features/pairing/models
git commit -m "feat: port pairing models and browser storage"
```

### Task 4: Implement Firebase Auth and Auto-Restore Session Logic

**Files:**
- Create: `src/features/auth/firebase-client.ts`
- Create: `src/features/auth/sign-in-with-custom-token.ts`
- Create: `src/features/bootstrap/restore-session.ts`
- Create: `src/features/bootstrap/restore-session.test.ts`

- [ ] **Step 1: Write failing tests for valid restore, invalid token clearing, and transient-network retry**

Create `src/features/bootstrap/restore-session.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { restoreSession } from './restore-session';

const savedState = {
  pairingCode: '123456',
  screenId: 'meditv_saved',
  customToken: 'token-123',
  screenDocumentPath: null,
  sessionDocumentPath: null,
  clinicId: 7,
  doctorIds: [11],
  clinicName: 'Klinik Sehat',
  clinicAddress: 'Jl. Sudirman',
  specialists: [],
};

describe('restoreSession', () => {
  it('returns a restored session when sign-in succeeds', async () => {
    const result = await restoreSession({
      savedState,
      signIn: vi.fn().mockResolvedValue(undefined),
      clearSavedState: vi.fn(),
    });

    expect(result.status).toBe('restored');
  });

  it('clears persisted state when the token is invalid', async () => {
    const clearSavedState = vi.fn();
    const result = await restoreSession({
      savedState,
      signIn: vi.fn().mockRejectedValue(new Error('customToken tidak tersedia untuk autentikasi Firebase.')),
      clearSavedState,
    });

    expect(result.status).toBe('invalid-session');
    expect(clearSavedState).toHaveBeenCalledTimes(1);
  });

  it('keeps saved state on network errors', async () => {
    const clearSavedState = vi.fn();
    const result = await restoreSession({
      savedState,
      signIn: vi.fn().mockRejectedValue(new Error('network timeout while signing in')),
      clearSavedState,
    });

    expect(result.status).toBe('retryable-error');
    expect(clearSavedState).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the restore tests to confirm the bootstrap module is missing**

Run: `pnpm test -- src/features/bootstrap/restore-session.test.ts`
Expected: FAIL with a module resolution error for `./restore-session`.

- [ ] **Step 3: Add Firebase singletons and the custom-token sign-in helper**

Create `src/features/auth/firebase-client.ts`:

```ts
import { getApps, getApp, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseWebConfig } from '@/shared/config/app-config';

const app = getApps().length ? getApp() : initializeApp(getFirebaseWebConfig());

export const firebaseApp = app;
export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
```

Create `src/features/auth/sign-in-with-custom-token.ts`:

```ts
import { signInWithCustomToken } from 'firebase/auth';
import { firebaseAuth } from './firebase-client';

export async function signInWithFirebaseCustomToken(customToken: string | null) {
  const token = customToken?.trim();
  if (!token) {
    throw new Error('customToken tidak tersedia untuk autentikasi Firebase.');
  }

  await signInWithCustomToken(firebaseAuth, token);
}
```

- [ ] **Step 4: Implement restore logic that mirrors the Flutter success, invalid-session, and retryable-error branches**

Create `src/features/bootstrap/restore-session.ts`:

```ts
import type { PersistedPairingState } from '@/features/pairing/models/persisted-pairing-state';

type RestoreSessionDeps = {
  savedState: PersistedPairingState | null;
  signIn: (customToken: string | null) => Promise<void>;
  clearSavedState: () => void | Promise<void>;
};

export async function restoreSession({ savedState, signIn, clearSavedState }: RestoreSessionDeps) {
  if (!savedState) {
    return { status: 'missing' } as const;
  }

  try {
    await signIn(savedState.customToken);
    return { status: 'restored', session: savedState } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const normalized = message.toLowerCase();
    const isRetryable = normalized.includes('internet') || normalized.includes('timeout') || normalized.includes('connection') || normalized.includes('network');

    if (isRetryable) {
      return { status: 'retryable-error', message } as const;
    }

    await clearSavedState();
    return { status: 'invalid-session', message } as const;
  }
}
```

- [ ] **Step 5: Run the restore tests again**

Run: `pnpm test -- src/features/bootstrap/restore-session.test.ts`
Expected: PASS with `3 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/features/auth src/features/bootstrap/restore-session.ts src/features/bootstrap/restore-session.test.ts
git commit -m "feat: add firebase bootstrap restore flow"
```

### Task 5: Implement Pairing Submission Against `/fcm/register-telly`

**Files:**
- Create: `src/features/pairing/api/register-telly.ts`
- Create: `src/features/pairing/submit-pairing-code.ts`
- Create: `src/features/pairing/submit-pairing-code.test.ts`

- [ ] **Step 1: Write failing tests for invalid code rejection and successful pairing persistence**

Create `src/features/pairing/submit-pairing-code.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { submitPairingCode } from './submit-pairing-code';

describe('submitPairingCode', () => {
  it('rejects non-six-digit codes before hitting the API', async () => {
    await expect(
      submitPairingCode({
        code: '123',
        screenId: 'meditv_test',
        registerTelly: vi.fn(),
        signIn: vi.fn(),
        saveState: vi.fn(),
        deviceContext: {
          deviceName: 'Chrome',
          platform: 'web',
          browserInfo: 'ua',
          appVersion: '1.0.0-web',
        },
      }),
    ).rejects.toThrow('Code must be exactly 6 digits.');
  });

  it('parses the response, signs in, and persists the pairing state', async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    const saveState = vi.fn();

    const session = await submitPairingCode({
      code: '123456',
      screenId: 'meditv_test',
      registerTelly: vi.fn().mockResolvedValue({ success: true, customToken: 'token-123', clinicId: 7, doctorIds: [11] }),
      signIn,
      saveState,
      deviceContext: {
        deviceName: 'Chrome',
        platform: 'web',
        browserInfo: 'ua',
        appVersion: '1.0.0-web',
      },
    });

    expect(signIn).toHaveBeenCalledWith('token-123');
    expect(saveState).toHaveBeenCalledTimes(1);
    expect(session.clinicId).toBe(7);
  });
});
```

- [ ] **Step 2: Run the pairing tests to confirm the use case is missing**

Run: `pnpm test -- src/features/pairing/submit-pairing-code.test.ts`
Expected: FAIL with a module resolution error for `./submit-pairing-code`.

- [ ] **Step 3: Implement the API client with the Flutter payload contract**

Create `src/features/pairing/api/register-telly.ts`:

```ts
import { getAppConfig } from '@/shared/config/app-config';

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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      node: config.node,
      ...payload,
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(data.message ?? 'Pairing failed'));
  }

  return data;
}
```

- [ ] **Step 4: Implement the submit use case with parsing, sign-in, and persistence**

Create `src/features/pairing/submit-pairing-code.ts`:

```ts
import { createPersistedPairingState } from '@/features/pairing/models/persisted-pairing-state';
import { parsePairingSession } from '@/features/pairing/models/pairing-session';

type SubmitPairingCodeDeps = {
  code: string;
  screenId: string;
  registerTelly: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>;
  signIn: (customToken: string | null) => Promise<void>;
  saveState: (state: ReturnType<typeof createPersistedPairingState>) => void | Promise<void>;
  deviceContext: {
    deviceName: string;
    platform: string;
    browserInfo: string;
    appVersion: string;
  };
};

export async function submitPairingCode({ code, screenId, registerTelly, signIn, saveState, deviceContext }: SubmitPairingCodeDeps) {
  if (code.length !== 6) {
    throw new Error('Code must be exactly 6 digits.');
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
    throw new Error(String(response.message ?? 'Pairing failed'));
  }

  const session = parsePairingSession(response, screenId);
  await signIn(session.customToken);
  await saveState(createPersistedPairingState(code, session));
  return session;
}
```

- [ ] **Step 5: Run the pairing tests again**

Run: `pnpm test -- src/features/pairing/submit-pairing-code.test.ts`
Expected: PASS with both validation and success cases green.

- [ ] **Step 6: Commit**

```bash
git add src/features/pairing/api/register-telly.ts src/features/pairing/submit-pairing-code.ts src/features/pairing/submit-pairing-code.test.ts
git commit -m "feat: add web pairing submission flow"
```

### Task 6: Build the Android TV Readiness Gate and Kiosk Unlock Flow

**Files:**
- Create: `src/features/kiosk/browser-capabilities.ts`
- Create: `src/features/kiosk/unlock-kiosk.ts`
- Create: `src/features/kiosk/browser-capabilities.test.ts`
- Create: `src/features/kiosk/components/readiness-gate.tsx`
- Create: `src/features/kiosk/components/readiness-gate.test.tsx`

- [ ] **Step 1: Write failing tests for support detection and the unlock button state update**

Create `src/features/kiosk/browser-capabilities.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { detectBrowserCapabilities } from './browser-capabilities';

describe('detectBrowserCapabilities', () => {
  it('marks audio, fullscreen, and notifications separately', () => {
    const result = detectBrowserCapabilities({
      hasSpeechSynthesis: true,
      hasAudioContext: true,
      hasFullscreenApi: true,
      hasNotificationApi: false,
      hasLocalStorage: true,
    });

    expect(result.audio.status).toBe('ready-to-request');
    expect(result.fullscreen.status).toBe('ready-to-request');
    expect(result.notifications.status).toBe('unsupported');
  });
});
```

Create `src/features/kiosk/components/readiness-gate.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ReadinessGate } from './readiness-gate';

it('runs the unlock callback when the kiosk button is pressed', async () => {
  const user = userEvent.setup();
  const onUnlock = vi.fn().mockResolvedValue(undefined);

  render(
    <ReadinessGate
      capabilities={{
        audio: { label: 'Audio', status: 'ready-to-request' },
        fullscreen: { label: 'Fullscreen', status: 'ready-to-request' },
        notifications: { label: 'Notifications', status: 'unsupported' },
      }}
      onUnlock={onUnlock}
      isBusy={false}
    />,
  );

  await user.click(screen.getByRole('button', { name: /aktifkan mode kiosk/i }));
  expect(onUnlock).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run the kiosk tests to confirm the modules are missing**

Run: `pnpm test -- src/features/kiosk/browser-capabilities.test.ts src/features/kiosk/components/readiness-gate.test.tsx`
Expected: FAIL with module resolution errors for the capability and component files.

- [ ] **Step 3: Implement capability detection and the one-click unlock runner**

Create `src/features/kiosk/browser-capabilities.ts`:

```ts
export type CapabilityStatus = 'ready' | 'ready-to-request' | 'unsupported' | 'manual-action-required';

export function detectBrowserCapabilities(input = {
  hasSpeechSynthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
  hasAudioContext: typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window),
  hasFullscreenApi: typeof document !== 'undefined' && !!document.documentElement.requestFullscreen,
  hasNotificationApi: typeof window !== 'undefined' && 'Notification' in window,
  hasLocalStorage: typeof window !== 'undefined' && 'localStorage' in window,
}) {
  return {
    audio: { label: 'Audio', status: input.hasSpeechSynthesis || input.hasAudioContext ? 'ready-to-request' : 'unsupported' as CapabilityStatus },
    fullscreen: { label: 'Fullscreen', status: input.hasFullscreenApi ? 'ready-to-request' : 'unsupported' as CapabilityStatus },
    notifications: { label: 'Notifications', status: input.hasNotificationApi ? 'ready-to-request' : 'unsupported' as CapabilityStatus },
    storage: { label: 'Storage', status: input.hasLocalStorage ? 'ready' : 'unsupported' as CapabilityStatus },
  };
}
```

Create `src/features/kiosk/unlock-kiosk.ts`:

```ts
export async function unlockKioskMode() {
  const audioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (audioContextCtor) {
    const context = new audioContextCtor();
    await context.resume();
  }

  if (document.documentElement.requestFullscreen) {
    await document.documentElement.requestFullscreen();
  }

  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}
```

- [ ] **Step 4: Implement the readiness gate component using shadcn/ui Button and Tailwind**

Create `src/features/kiosk/components/readiness-gate.tsx`:

```tsx
'use client';

import { Button } from '@/components/ui/button';

type GateProps = {
  capabilities: Record<string, { label: string; status: string }>;
  onUnlock: () => Promise<void>;
  isBusy: boolean;
};

export function ReadinessGate({ capabilities, onUnlock, isBusy }: GateProps) {
  return (
    <section aria-label="Kiosk readiness gate" className="space-y-4">
      <h2 className="text-lg font-semibold">Mode Kiosk</h2>
      <p className="text-sm text-muted-foreground">Aktifkan capability browser yang dibutuhkan sebelum pairing.</p>
      <Button type="button" onClick={() => void onUnlock()} disabled={isBusy}>
        {isBusy ? 'Mengaktifkan...' : 'Aktifkan Mode Kiosk'}
      </Button>
      <ul className="space-y-1 text-sm">
        {Object.entries(capabilities).map(([key, value]) => (
          <li key={key}>
            <strong>{value.label}</strong>: {value.status}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Run the kiosk tests again**

Run: `pnpm test -- src/features/kiosk/browser-capabilities.test.ts src/features/kiosk/components/readiness-gate.test.tsx`
Expected: PASS with support detection and button click coverage green.

- [ ] **Step 6: Commit**

```bash
git add src/features/kiosk
git commit -m "feat: add kiosk readiness gate"
```

### Task 7: Normalize Firestore Realtime Data Into the Web Screen Model

**Files:**
- Create: `src/features/realtime/models/meditv-status-type.ts`
- Create: `src/features/realtime/models/meditv-queue-card.ts`
- Create: `src/features/realtime/models/meditv-screen-data.ts`
- Create: `src/features/realtime/normalize-realtime-screen-data.ts`
- Create: `src/features/realtime/normalize-realtime-screen-data.test.ts`
- Create: `src/features/realtime/watch-meditv-screen.ts`

- [ ] **Step 1: Write failing tests for doctor queue merge, payment selection, and video fallback**

Create `src/features/realtime/normalize-realtime-screen-data.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { defaultVideoUrl, normalizeRealtimeScreenData } from './normalize-realtime-screen-data';

describe('normalizeRealtimeScreenData', () => {
  it('maps queue docs into ordered queue cards using specialist metadata', () => {
    const result = normalizeRealtimeScreenData({
      session: {
        clinicId: 7,
        doctorIds: [11],
        clinicName: 'Klinik Sehat',
        clinicAddress: 'Jl. Sudirman',
        specialists: [{ doctorId: 11, doctorName: 'dr. A', specialistName: 'Poli Umum' }],
      },
      screenDoc: {},
      queueDocs: { 11: { antrian: 'A-12', nextantrian: 'A-13', type: 'QUEUE_CALLING', lastResetDate: new Date().toISOString().slice(0, 10) } },
      paymentDocs: {},
    });

    expect(result.queueCards[0]).toMatchObject({
      doctorId: '11',
      currentNumber: 'A-12',
      nextNumber: 'A-13',
      statusLabel: 'MEMANGGIL',
    });
  });

  it('uses the fallback video URL when the screen document is empty', () => {
    const result = normalizeRealtimeScreenData({
      session: { clinicId: 7, doctorIds: [], clinicName: 'Klinik Sehat', clinicAddress: 'Jl. Sudirman', specialists: [] },
      screenDoc: {},
      queueDocs: {},
      paymentDocs: {},
    });

    expect(result.videoUrl).toBe(defaultVideoUrl);
  });
});
```

- [ ] **Step 2: Run the normalization tests to confirm the merger module is missing**

Run: `pnpm test -- src/features/realtime/normalize-realtime-screen-data.test.ts`
Expected: FAIL with a module resolution error for `./normalize-realtime-screen-data`.

- [ ] **Step 3: Implement the normalized queue and screen data model types**

Create `src/features/realtime/models/meditv-status-type.ts`:

```ts
export type MeditvStatusType = 'waiting' | 'calling';
```

Create `src/features/realtime/models/meditv-queue-card.ts`:

```ts
import type { MeditvStatusType } from './meditv-status-type';

export type MeditvQueueCard = {
  doctorId: string;
  poliLabel: string;
  doctorName: string;
  currentNumber: string;
  nextNumber: string;
  roomName: string;
  status: MeditvStatusType;
  statusLabel: string;
  updatedAt: Date;
};
```

Create `src/features/realtime/models/meditv-screen-data.ts`:

```ts
import type { MeditvQueueCard } from './meditv-queue-card';

export type MeditvScreenData = {
  clinicName: string;
  clinicAddress: string;
  videoUrl: string;
  paymentQueueNumber: string;
  paymentDoctorName: string;
  paymentUpdatedAt: Date;
  pharmacyQueueNumber: string;
  queueCards: MeditvQueueCard[];
};
```

- [ ] **Step 4: Port the Flutter fallback and current-day filtering rules into the normalization function**

Create `src/features/realtime/normalize-realtime-screen-data.ts`:

```ts
import type { MeditvQueueCard } from './models/meditv-queue-card';
import type { MeditvScreenData } from './models/meditv-screen-data';

export const defaultVideoUrl = 'https://pub-78a60da0218547c9a4f7c101e80b9234.r2.dev/Kehamilan%20Sehat%20Sejahtera%20I%20Klinik%20Kehamilan%20yang%20Pro-Normal%20-%20Kehamilan%20Sehat%20(720p%2C%20h264).mp4';

function hasCurrentDayPayload(queueDoc: Record<string, unknown>): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const resetDate = queueDoc.lastResetDate ?? queueDoc.resetDate ?? queueDoc.last_reset_date;
  if (typeof resetDate === 'string') {
    return resetDate.startsWith(today);
  }
  const ts = queueDoc.timestamp ?? queueDoc.updatedAt ?? queueDoc.time;
  if (ts) {
    const date = new Date(ts as string | number);
    return date.toISOString().slice(0, 10) === today;
  }
  return true;
}

function parseEventDate(value: unknown): Date {
  if (!value) return new Date(0);
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function pickLatestPayment(paymentDocs: Record<number, Record<string, unknown>>): { queueNumber: string; doctorName: string; updatedAt: Date } {
  let latest: { queueNumber: string; doctorName: string; updatedAt: Date } = { queueNumber: '-', doctorName: '-', updatedAt: new Date(0) };

  for (const doc of Object.values(paymentDocs)) {
    const ts = parseEventDate(doc.paymentUpdatedAt ?? doc.updatedAt);
    if (ts > latest.updatedAt) {
      latest = {
        queueNumber: `${doc.paymentQueueNumber ?? doc.queueNumber ?? '-'}`,
        doctorName: `${doc.paymentDoctorName ?? doc.doctorName ?? '-'}`,
        updatedAt: ts,
      };
    }
  }

  return latest;
}

export function normalizeRealtimeScreenData({ session, screenDoc, queueDocs, paymentDocs }: {
  session: { clinicId: number; doctorIds: number[]; clinicName: string; clinicAddress: string; specialists: Array<{ doctorId: number; doctorName: string; specialistName: string }> };
  screenDoc: Record<string, unknown>;
  queueDocs: Record<number, Record<string, unknown>>;
  paymentDocs: Record<number, Record<string, unknown>>;
}): MeditvScreenData {
  const cards = session.doctorIds.map((doctorId) => {
    const queueDoc = queueDocs[doctorId] ?? {};
    const specialist = session.specialists.find((item) => item.doctorId === doctorId);
    const isCurrentDay = hasCurrentDayPayload(queueDoc);
    const type = `${queueDoc.type ?? queueDoc.status ?? ''}`.trim().toUpperCase();

    return {
      doctorId: String(doctorId),
      poliLabel: specialist?.specialistName ?? 'Poli Umum',
      doctorName: specialist?.doctorName ?? 'Dokter',
      currentNumber: isCurrentDay ? `${queueDoc.antrian ?? queueDoc.currentNumber ?? '-'}` : '-',
      nextNumber: isCurrentDay ? `${queueDoc.nextantrian ?? queueDoc.nextNumber ?? '-'}` : '-',
      roomName: 'Ruang Pemeriksaan',
      status: type === 'QUEUE_CALLING' || type === 'QUEUE_RECALL' || type === 'CALLING' ? 'calling' as const : 'waiting' as const,
      statusLabel: type === 'QUEUE_RECALL' ? 'MEMANGGIL ULANG' : type === 'QUEUE_CALLING' || type === 'CALLING' ? 'MEMANGGIL' : 'MENUNGGU',
      updatedAt: parseEventDate(queueDoc.timestamp ?? queueDoc.updatedAt ?? queueDoc.time),
    } satisfies MeditvQueueCard;
  });

  return {
    clinicName: session.clinicName,
    clinicAddress: session.clinicAddress,
    videoUrl: `${screenDoc.url ?? screenDoc.videoUrl ?? defaultVideoUrl}`,
    paymentQueueNumber: pickLatestPayment(paymentDocs).queueNumber,
    paymentDoctorName: pickLatestPayment(paymentDocs).doctorName,
    paymentUpdatedAt: pickLatestPayment(paymentDocs).updatedAt,
    pharmacyQueueNumber: '-',
    queueCards: cards,
  };
}
```

- [ ] **Step 5: Add the Firestore watcher composer that merges screen, doctor, and payment streams**

Create `src/features/realtime/watch-meditv-screen.ts`:

```ts
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/features/auth/firebase-client';

export function watchMeditvScreen(
  session: { clinicId: number; doctorIds: number[]; screenDocumentPath: string | null },
  onData: (payload: { screenDoc: Record<string, unknown>; queueDocs: Record<number, Record<string, unknown>>; paymentDocs: Record<number, Record<string, unknown>> }) => void,
  onError: (error: Error) => void,
) {
  const screenDoc: Record<string, unknown> = {};
  const queueDocs: Record<number, Record<string, unknown>> = {};
  const paymentDocs: Record<number, Record<string, unknown>> = {};
  const unsubs: Array<() => void> = [];

  const emit = () => onData({ screenDoc: { ...screenDoc }, queueDocs: { ...queueDocs }, paymentDocs: { ...paymentDocs } });

  if (session.screenDocumentPath) {
    unsubs.push(onSnapshot(
      doc(firestore, session.screenDocumentPath),
      (snapshot) => {
        Object.assign(screenDoc, snapshot.data() ?? {});
        emit();
      },
      (error) => onError(error as Error),
    ));
  }

  for (const doctorId of session.doctorIds) {
    unsubs.push(onSnapshot(
      doc(firestore, 'doctorQueues', `${session.clinicId}_${doctorId}`),
      (snapshot) => {
        queueDocs[doctorId] = (snapshot.data() as Record<string, unknown>) ?? {};
        emit();
      },
      (error) => onError(error as Error),
    ));

    unsubs.push(onSnapshot(
      doc(firestore, 'paymentQueues', `${session.clinicId}_${doctorId}`),
      (snapshot) => {
        paymentDocs[doctorId] = (snapshot.data() as Record<string, unknown>) ?? {};
        emit();
      },
      (error) => onError(error as Error),
    ));
  }

  return () => unsubs.forEach((unsubscribe) => unsubscribe());
}
```

- [ ] **Step 6: Run the normalization tests again**

Run: `pnpm test -- src/features/realtime/normalize-realtime-screen-data.test.ts`
Expected: PASS with queue-card, payment, and default-video cases green.

- [ ] **Step 7: Commit**

```bash
git add src/features/realtime
git commit -m "feat: add realtime data normalization"
```

### Task 8: Implement the Announcement Engine and Browser Speaker Queue

**Files:**
- Create: `src/features/announcer/announcement-engine.ts`
- Create: `src/features/announcer/browser-speaker.ts`
- Create: `src/features/announcer/announcement-engine.test.ts`

- [ ] **Step 1: Write failing tests for initial seeding, doctor recalls, and payment announcements**

Create `src/features/announcer/announcement-engine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { AnnouncementEngine } from './announcement-engine';

describe('AnnouncementEngine', () => {
  it('does not announce during the initial seed snapshot', () => {
    const engine = new AnnouncementEngine();
    expect(engine.update({
      paymentQueueNumber: '-',
      paymentDoctorName: '-',
      paymentUpdatedAt: new Date('2026-04-17T10:00:00Z'),
      queueCards: [{ doctorId: '11', doctorName: 'dr. A', currentNumber: 'A-12', nextNumber: 'A-13', statusLabel: 'MEMANGGIL', status: 'calling', roomName: 'Ruang Pemeriksaan', poliLabel: 'Poli Umum', updatedAt: new Date('2026-04-17T10:00:00Z') }],
    } as never)).toEqual([]);
  });

  it('announces a new doctor queue number and caps recalls at three total calls', () => {
    const engine = new AnnouncementEngine();
    engine.update({ paymentQueueNumber: '-', paymentDoctorName: '-', paymentUpdatedAt: new Date('2026-04-17T10:00:00Z'), queueCards: [] } as never);

    const first = engine.update({ paymentQueueNumber: '-', paymentDoctorName: '-', paymentUpdatedAt: new Date('2026-04-17T10:00:00Z'), queueCards: [{ doctorId: '11', doctorName: 'dr. A', currentNumber: 'A-12', nextNumber: 'A-13', statusLabel: 'MEMANGGIL', status: 'calling', roomName: 'Ruang Pemeriksaan', poliLabel: 'Poli Umum', updatedAt: new Date('2026-04-17T10:01:00Z') }] } as never);
    const second = engine.update({ paymentQueueNumber: '-', paymentDoctorName: '-', paymentUpdatedAt: new Date('2026-04-17T10:00:00Z'), queueCards: [{ doctorId: '11', doctorName: 'dr. A', currentNumber: 'A-12', nextNumber: 'A-13', statusLabel: 'MEMANGGIL ULANG', status: 'calling', roomName: 'Ruang Pemeriksaan', poliLabel: 'Poli Umum', updatedAt: new Date('2026-04-17T10:02:00Z') }] } as never);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the announcer tests to confirm the engine is missing**

Run: `pnpm test -- src/features/announcer/announcement-engine.test.ts`
Expected: FAIL with a module resolution error for `./announcement-engine`.

- [ ] **Step 3: Implement the pure announcement engine with seed suppression and recall tracking**

Create `src/features/announcer/announcement-engine.ts`:

```ts
type Announcement = {
  text: string;
  doctorId?: string;
  isPayment?: boolean;
};

export class AnnouncementEngine {
  private initialized = false;
  private doctorCallTracker = new Map<string, { number: string; count: number }>();
  private lastDoctorAnnounceTime = new Map<string, number>();
  private lastPaymentAnnounceTime = 0;

  update(screenData: { paymentQueueNumber: string; paymentDoctorName: string; paymentUpdatedAt: Date; queueCards: Array<{ doctorId: string; doctorName: string; currentNumber: string; statusLabel: string; updatedAt: Date }> }): Announcement[] {
    if (!this.initialized) {
      this.initialized = true;
      this.seed(screenData);
      return [];
    }

    const announcements: Announcement[] = [];

    for (const card of screenData.queueCards) {
      const isCalling = card.statusLabel === 'MEMANGGIL' || card.statusLabel === 'MEMANGGIL ULANG';
      if (!isCalling || card.currentNumber === '-') continue;

      const previousTime = this.lastDoctorAnnounceTime.get(card.doctorId) ?? 0;
      const updatedAt = card.updatedAt.getTime();
      if (updatedAt <= previousTime) continue;

      const tracker = this.doctorCallTracker.get(card.doctorId);
      const isNewNumber = tracker?.number !== card.currentNumber;
      const nextCount = isNewNumber ? 1 : (tracker?.count ?? 0) + 1;

      this.lastDoctorAnnounceTime.set(card.doctorId, updatedAt);
      if (nextCount <= 3) {
        this.doctorCallTracker.set(card.doctorId, { number: card.currentNumber, count: nextCount });
        announcements.push({
          doctorId: card.doctorId,
          text: `Antrian nomor ${card.currentNumber}, ${card.doctorName}, silakan menuju ke ruang pemeriksaan.`,
        });
      }
    }

    const paymentTime = screenData.paymentUpdatedAt.getTime();
    if (screenData.paymentQueueNumber !== '-' && paymentTime > this.lastPaymentAnnounceTime) {
      this.lastPaymentAnnounceTime = paymentTime;
      announcements.push({
        isPayment: true,
        text: `Antrian nomor ${screenData.paymentQueueNumber}, ${screenData.paymentDoctorName}, silakan menuju ke meja registrasi.`,
      });
    }

    return announcements;
  }

  private seed(screenData: { paymentQueueNumber: string; paymentUpdatedAt: Date; queueCards: Array<{ doctorId: string; currentNumber: string; statusLabel: string; updatedAt: Date }> }) {
    for (const card of screenData.queueCards) {
      if (card.currentNumber !== '-' && (card.statusLabel === 'MEMANGGIL' || card.statusLabel === 'MEMANGGIL ULANG')) {
        this.doctorCallTracker.set(card.doctorId, { number: card.currentNumber, count: 3 });
        this.lastDoctorAnnounceTime.set(card.doctorId, card.updatedAt.getTime());
      }
    }

    if (screenData.paymentQueueNumber !== '-') {
      this.lastPaymentAnnounceTime = screenData.paymentUpdatedAt.getTime();
    }
  }
}
```

- [ ] **Step 4: Implement a queued browser speaker that serializes speech and exposes active-announcement metadata**

Create `src/features/announcer/browser-speaker.ts`:

```ts
export class BrowserSpeaker {
  private queue: Array<{ text: string; doctorId?: string; isPayment?: boolean }> = [];
  private speaking = false;

  constructor(
    private readonly synth: SpeechSynthesis = window.speechSynthesis,
    private readonly onStateChange?: (state: { isSpeaking: boolean; currentDoctorId?: string; isPayment?: boolean }) => void,
  ) {}

  async speak(announcement: { text: string; doctorId?: string; isPayment?: boolean }) {
    if (!announcement.text.trim()) return;
    this.queue.push(announcement);
    if (!this.speaking) {
      await this.flush();
    }
  }

  private async flush() {
    this.speaking = true;
    while (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.onStateChange?.({ isSpeaking: true, currentDoctorId: next.doctorId, isPayment: next.isPayment });
      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(next.text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        this.synth.speak(utterance);
      });
    }
    this.speaking = false;
    this.onStateChange?.({ isSpeaking: false });
  }
}
```

- [ ] **Step 5: Run the announcer tests again**

Run: `pnpm test -- src/features/announcer/announcement-engine.test.ts`
Expected: PASS with seed suppression and recall logic covered.

- [ ] **Step 6: Commit**

```bash
git add src/features/announcer
git commit -m "feat: add queue announcement engine"
```

### Task 9: Build the Slide Logic and Fullscreen Display Components

> **UI Reference:** The screen page layout is specified in the design doc under "Screen Page Layout Specification". All colors are defined as CSS custom properties in `globals.css`. The layout has three vertical zones: header (teal gradient with clock), middle (~50% for doctor queue cards carousel), and bottom (~33% split 60%-20%-20% for video, payment, pharmacy). Components use Tailwind utility classes exclusively, no CSS Modules.

**Files:**
- Create: `src/features/display/use-slide-state.ts`
- Create: `src/features/display/use-slide-state.test.ts`
- Create: `src/features/display/constants/design-tokens.ts`
- Create: `src/features/display/components/meditv-header.tsx`
- Create: `src/features/display/components/meditv-queue-card.tsx`
- Create: `src/features/display/components/meditv-payment-card.tsx`
- Create: `src/features/display/components/meditv-pharmacy-card.tsx`
- Create: `src/features/display/components/meditv-video-card.tsx`
- Create: `src/features/display/components/meditv-screen-view.tsx`
- Create: `src/features/display/components/meditv-screen-view.test.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add MediTV custom design tokens to globals.css**

Add the following custom properties inside the `:root` block of `src/app/globals.css`, after the existing shadcn tokens. These map to the design doc color palette:

```css
  /* MediTV Design Tokens */
  --meditv-background: #F9FAFB;
  --meditv-card: #FFFFFF;
  --meditv-foreground: #111827;
  --meditv-muted: #F3F4F6;
  --meditv-muted-foreground: #6B7280;
  --meditv-border: #E5E7EB;
  --meditv-accent: #3B82F6;
  --meditv-queue-number: #1F2937;
  --meditv-header-from: #186E75;
  --meditv-header-to: #194756;
  --meditv-status-waiting: #F59E0B;
  --meditv-status-calling: #EF4444;
  --meditv-poli-umum: #6839C5;
  --meditv-poli-anak: #D22C63;
  --meditv-poli-kandungan: #1A757E;
  --meditv-poli-laktasi: #EB6D13;
  --meditv-poli-gizi: #2B9658;
  --meditv-payment: #3B82F6;
  --meditv-pharmacy: #2B9658;
  --meditv-pairing-bg: #121212;
  --meditv-pairing-card: #1e1e1e;
```

Also add at the bottom of `globals.css` (after the `@layer base` block), a Tailwind theme extension so these are usable as `bg-[var(--meditv-header-from)]` etc. No extra `@theme` block needed since Tailwind v4 allows arbitrary `var()` values in utility classes.

- [ ] **Step 2: Create the design token constants for poli color mapping**

Create `src/features/display/constants/design-tokens.ts`:

```ts
export function getPoliColor(poliLabel: string): string {
  const label = poliLabel.toLowerCase();
  if (label.includes('anak')) return 'var(--meditv-poli-anak)';
  if (label.includes('kandungan') || label.includes('obgyn')) return 'var(--meditv-poli-kandungan)';
  if (label.includes('laktasi')) return 'var(--meditv-poli-laktasi)';
  if (label.includes('gizi')) return 'var(--meditv-poli-gizi)';
  return 'var(--meditv-poli-umum)';
}
```

- [ ] **Step 3: Write failing tests for slide pause behaviour**

Create `src/features/display/use-slide-state.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getNextSlideIndex, getTargetSlideIndex } from './use-slide-state';

describe('slide helpers', () => {
  it('keeps the current slide when TTS is speaking', () => {
    expect(getNextSlideIndex({ currentIndex: 1, totalSlides: 3, isSpeaking: true })).toBe(1);
  });

  it('moves to the doctor slide based on two cards per page', () => {
    expect(getTargetSlideIndex(['11', '12', '13', '14'], '13')).toBe(1);
  });
});
```

Create `src/features/display/components/meditv-screen-view.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MeditvScreenView } from './meditv-screen-view';

it('shows the empty queue state when every queue card is empty', () => {
  render(
    <MeditvScreenView
      isLoading={false}
      error={null}
      isSpeaking={false}
      activeDoctorId={undefined}
      screenData={{
        clinicName: 'Klinik Sehat',
        clinicAddress: 'Jl. Sudirman',
        videoUrl: 'https://example.com/video.mp4',
        paymentQueueNumber: '-',
        paymentDoctorName: '-',
        paymentUpdatedAt: new Date('2026-04-17T10:00:00Z'),
        pharmacyQueueNumber: '-',
        queueCards: [{ doctorId: '11', poliLabel: 'Poli Umum', doctorName: 'dr. A', currentNumber: '-', nextNumber: '-', roomName: 'Ruang Pemeriksaan', status: 'waiting', statusLabel: 'MENUNGGU', updatedAt: new Date('2026-04-17T10:00:00Z') }],
      }}
    />,
  );

  expect(screen.getByText(/belum ada antrian/i)).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the slide and screen-view tests to confirm the display files are missing**

Run: `pnpm test -- src/features/display/use-slide-state.test.ts src/features/display/components/meditv-screen-view.test.tsx`
Expected: FAIL with module resolution errors for the new display modules.

- [ ] **Step 5: Implement the pure slide helpers and timer-safe auto-advance rules**

Create `src/features/display/use-slide-state.ts`:

```ts
export function getNextSlideIndex({ currentIndex, totalSlides, isSpeaking }: { currentIndex: number; totalSlides: number; isSpeaking: boolean }) {
  if (isSpeaking || totalSlides === 0) return currentIndex;
  return (currentIndex + 1) % totalSlides;
}

export function getTargetSlideIndex(doctorIds: string[], activeDoctorId?: string) {
  if (!activeDoctorId) return 0;
  const index = doctorIds.indexOf(activeDoctorId);
  return index === -1 ? 0 : Math.floor(index / 2);
}
```

- [ ] **Step 6: Implement the header component with real-time clock using Tailwind**

Create `src/features/display/components/meditv-header.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';

export function MeditvHeader({ clinicName, clinicAddress }: { clinicName: string; clinicAddress: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="flex items-center justify-between px-8 py-5 text-white" style={{ background: `linear-gradient(135deg, var(--meditv-header-from), var(--meditv-header-to))` }}>
      <div className="flex flex-col gap-1">
        <h1 className="text-[clamp(1.25rem,2vw,2rem)] font-bold">{clinicName}</h1>
        <p className="text-[clamp(0.75rem,1vw,1rem)] opacity-85">{clinicAddress}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-bold tabular-nums">{timeStr}</span>
        <span className="text-[clamp(0.7rem,0.9vw,0.95rem)] opacity-80">{dateStr}</span>
      </div>
    </header>
  );
}
```

- [ ] **Step 7: Implement the queue card component with poli accent colors using Tailwind**

Create `src/features/display/components/meditv-queue-card.tsx`:

```tsx
'use client';

import { getPoliColor } from '../constants/design-tokens';

type QueueCardProps = {
  card: {
    poliLabel: string;
    currentNumber: string;
    nextNumber: string;
    doctorName: string;
    roomName: string;
    statusLabel: string;
    status: string;
  };
  isHighlighted: boolean;
};

export function MeditvQueueCard({ card, isHighlighted }: QueueCardProps) {
  const accentColor = getPoliColor(card.poliLabel);

  return (
    <article
      data-highlighted={isHighlighted}
      className={`flex flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${isHighlighted ? 'shadow-[0_0_0_3px_var(--meditv-status-calling),0_8px_32px_rgba(239,68,68,0.15)]' : ''}`}
      style={{ borderTop: `5px solid ${accentColor}` }}
    >
      <div className="flex items-center gap-3">
        <span className="inline-block rounded-full px-3.5 py-1 text-[clamp(0.7rem,0.85vw,0.9rem)] font-semibold text-white" style={{ backgroundColor: accentColor }}>{card.poliLabel}</span>
        <span className="text-[clamp(0.85rem,1vw,1.1rem)] text-[var(--meditv-muted-foreground)]">{card.doctorName}</span>
      </div>
      <div className="py-4 text-center">
        <span className="mb-1 block text-[clamp(0.75rem,0.9vw,1rem)] font-semibold uppercase tracking-wide text-[var(--meditv-status-calling)]">SEDANG DIPANGGIL</span>
        <span className="block text-[clamp(3rem,6vw,7rem)] font-extrabold leading-none text-[var(--meditv-queue-number)]">{card.currentNumber}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[10px] bg-[var(--meditv-muted)] p-2.5 text-center">
          <span className="mb-0.5 block text-[clamp(0.6rem,0.7vw,0.8rem)] text-[var(--meditv-muted-foreground)]">Berikutnya</span>
          <span className="block text-[clamp(0.9rem,1.2vw,1.4rem)] font-bold text-[var(--meditv-foreground)]">{card.nextNumber}</span>
        </div>
        <div className="rounded-[10px] bg-[var(--meditv-muted)] p-2.5 text-center">
          <span className="mb-0.5 block text-[clamp(0.6rem,0.7vw,0.8rem)] text-[var(--meditv-muted-foreground)]">Ruangan</span>
          <span className="block text-[clamp(0.9rem,1.2vw,1.4rem)] font-bold text-[var(--meditv-foreground)]">{card.roomName}</span>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 8: Implement the payment card with blue accent using Tailwind**

Create `src/features/display/components/meditv-payment-card.tsx`:

```tsx
export function MeditvPaymentCard({ queueNumber, doctorName }: { queueNumber: string; doctorName: string }) {
  return (
    <article className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl bg-white p-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]" style={{ borderTop: '5px solid var(--meditv-payment)' }}>
      <div className="text-[clamp(1.5rem,2vw,2.5rem)]">💳</div>
      <p className="m-0 text-[clamp(0.7rem,0.85vw,0.95rem)] font-bold uppercase tracking-widest text-[var(--meditv-muted-foreground)]">PEMBAYARAN</p>
      <span className="text-[clamp(2rem,4vw,4.5rem)] font-extrabold leading-none text-[var(--meditv-queue-number)]">{queueNumber}</span>
      <p className="m-0 text-[clamp(0.7rem,0.85vw,0.95rem)] text-[var(--meditv-muted-foreground)]">{doctorName}</p>
    </article>
  );
}
```

- [ ] **Step 9: Implement the pharmacy card with green accent (static placeholder)**

Create `src/features/display/components/meditv-pharmacy-card.tsx`:

```tsx
export function MeditvPharmacyCard({ queueNumber }: { queueNumber: string }) {
  return (
    <article className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl bg-white p-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]" style={{ borderTop: '5px solid var(--meditv-pharmacy)' }}>
      <div className="text-[clamp(1.5rem,2vw,2.5rem)]">💊</div>
      <p className="m-0 text-[clamp(0.7rem,0.85vw,0.95rem)] font-bold uppercase tracking-widest text-[var(--meditv-muted-foreground)]">FARMASI</p>
      <span className="text-[clamp(2rem,4vw,4.5rem)] font-extrabold leading-none text-[var(--meditv-queue-number)]">{queueNumber}</span>
    </article>
  );
}
```

- [ ] **Step 10: Implement the video card component**

Create `src/features/display/components/meditv-video-card.tsx`:

```tsx
export function MeditvVideoCard({ videoUrl, isMuted }: { videoUrl: string; isMuted: boolean }) {
  return <video className="h-full w-full rounded-2xl bg-black object-cover" src={videoUrl} autoPlay muted={isMuted} loop playsInline />;
}
```

- [ ] **Step 11: Implement the fullscreen screen view composing all zones with Tailwind**

Create `src/features/display/components/meditv-screen-view.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getNextSlideIndex, getTargetSlideIndex } from '../use-slide-state';
import { MeditvHeader } from './meditv-header';
import { MeditvPaymentCard } from './meditv-payment-card';
import { MeditvPharmacyCard } from './meditv-pharmacy-card';
import { MeditvQueueCard } from './meditv-queue-card';
import { MeditvVideoCard } from './meditv-video-card';

export function MeditvScreenView({ isLoading, error, isSpeaking, activeDoctorId, screenData }: {
  isLoading: boolean;
  error: string | null;
  isSpeaking: boolean;
  activeDoctorId?: string;
  screenData: {
    clinicName: string;
    clinicAddress: string;
    videoUrl: string;
    paymentQueueNumber: string;
    paymentDoctorName: string;
    paymentUpdatedAt: Date;
    pharmacyQueueNumber: string;
    queueCards: Array<{ doctorId: string; poliLabel: string; doctorName: string; currentNumber: string; nextNumber: string; roomName: string; status: string; statusLabel: string }>;
  };
}) {
  const allQueuesEmpty = screenData.queueCards.every((card) => card.currentNumber === '-');
  const doctorIds = screenData.queueCards.map((c) => c.doctorId);
  const totalSlides = Math.ceil(screenData.queueCards.length / 2);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => getNextSlideIndex({ currentIndex: prev, totalSlides, isSpeaking }));
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides, isSpeaking]);

  useEffect(() => {
    if (activeDoctorId) {
      setSlideIndex(getTargetSlideIndex(doctorIds, activeDoctorId));
    }
  }, [activeDoctorId, doctorIds]);

  if (isLoading && screenData.queueCards.length === 0 && screenData.paymentQueueNumber === '-') {
    return <main className="grid min-h-screen place-items-center bg-[var(--meditv-background)] text-[clamp(1rem,1.5vw,1.5rem)] text-[var(--meditv-muted-foreground)]">Menghubungkan Screen</main>;
  }

  if (error && screenData.queueCards.length === 0 && screenData.paymentQueueNumber === '-') {
    return <main className="grid min-h-screen place-items-center bg-[var(--meditv-background)] text-[clamp(1rem,1.5vw,1.5rem)] text-[var(--meditv-muted-foreground)]">Realtime Belum Terhubung: {error}</main>;
  }

  const visibleCards = screenData.queueCards.slice(slideIndex * 2, slideIndex * 2 + 2);

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-[var(--meditv-background)] text-[var(--meditv-foreground)]">
      <MeditvHeader clinicName={screenData.clinicName} clinicAddress={screenData.clinicAddress} />

      {allQueuesEmpty ? (
        <section className="flex flex-1 gap-4 p-4">
          <MeditvVideoCard videoUrl={screenData.videoUrl} isMuted={isSpeaking} />
          <div className="grid place-items-center rounded-2xl bg-white p-6 text-[clamp(1rem,1.5vw,1.5rem)] text-[var(--meditv-muted-foreground)] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">Belum Ada Antrian</div>
        </section>
      ) : (
        <>
          <section className="flex flex-[5] flex-col justify-center gap-3 px-4 pb-2 pt-4">
            <div className="grid flex-1 grid-cols-2 gap-4">
              {visibleCards.map((card) => (
                <MeditvQueueCard key={card.doctorId} card={card} isHighlighted={card.doctorId === activeDoctorId} />
              ))}
            </div>
            {totalSlides > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalSlides }, (_, i) => (
                  <span key={i} className={`h-2.5 w-2.5 rounded-full transition-colors ${i === slideIndex ? 'bg-[var(--meditv-header-from)]' : 'bg-[var(--meditv-border)]'}`} />
                ))}
              </div>
            )}
          </section>

          <section className="grid flex-[3] grid-cols-[6fr_2fr_2fr] gap-4 px-4 pb-4 pt-2">
            <div>
              <MeditvVideoCard videoUrl={screenData.videoUrl} isMuted={isSpeaking} />
            </div>
            <div>
              <MeditvPaymentCard queueNumber={screenData.paymentQueueNumber} doctorName={screenData.paymentDoctorName} />
            </div>
            <div>
              <MeditvPharmacyCard queueNumber={screenData.pharmacyQueueNumber} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 12: Run the display tests again**

Run: `pnpm test -- src/features/display/use-slide-state.test.ts src/features/display/components/meditv-screen-view.test.tsx`
Expected: PASS with helper and rendering checks green.

- [ ] **Step 13: Commit**

```bash
git add src/app/globals.css src/features/display
git commit -m "feat: add fullscreen display components with Tailwind TV layout"
```

### Task 10: Compose the Next.js Routes and Kiosk Runtime

**Files:**
- Create: `src/features/bootstrap/components/bootstrap-route.tsx`
- Create: `src/features/bootstrap/components/bootstrap-route.test.tsx`
- Create: `src/features/pairing/components/pairing-screen.tsx`
- Create: `src/features/pairing/components/pairing-screen.test.tsx`
- Create: `src/features/screen/components/screen-runtime.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/pairing/page.tsx`
- Create: `src/app/screen/page.tsx`

- [ ] **Step 1: Write failing tests for bootstrap redirect and pairing-screen submit flow**

Create `src/features/bootstrap/components/bootstrap-route.test.tsx`:

```tsx
import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BootstrapRoute } from './bootstrap-route';

it('routes to /screen when restore succeeds', async () => {
  const replace = vi.fn();
  render(<BootstrapRoute restore={vi.fn().mockResolvedValue({ status: 'restored' })} replace={replace} />);
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/screen'));
});
```

Create `src/features/pairing/components/pairing-screen.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PairingScreen } from './pairing-screen';

it('submits the six-digit code and then navigates to /screen', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  render(<PairingScreen onSubmit={onSubmit} onUnlock={vi.fn()} capabilityState={{ audio: { label: 'Audio', status: 'ready' } }} />);
  await user.type(screen.getByLabelText(/pair code/i), '123456');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith('123456');
});
```

- [ ] **Step 2: Run the route tests to confirm the top-level components are missing**

Run: `pnpm test -- src/features/bootstrap/components/bootstrap-route.test.tsx src/features/pairing/components/pairing-screen.test.tsx`
Expected: FAIL with module resolution errors for `bootstrap-route` and `pairing-screen`.

- [ ] **Step 3: Implement the client bootstrap route that restores state and redirects**

Create `src/features/bootstrap/components/bootstrap-route.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function BootstrapRoute({ restore, replace }: { restore: () => Promise<{ status: 'restored' | 'missing' | 'invalid-session' | 'retryable-error' }>; replace?: (path: string) => void }) {
  const router = useRouter();
  const navigate = replace ?? router.replace;
  const [message, setMessage] = useState('Memeriksa sesi perangkat...');

  useEffect(() => {
    void restore().then((result) => {
      if (result.status === 'restored') {
        navigate('/screen');
        return;
      }

      if (result.status === 'retryable-error') {
        setMessage('Koneksi bermasalah. Silakan coba lagi.');
        return;
      }

      navigate('/pairing');
    });
  }, [navigate, restore]);

  return <main>{message}</main>;
}
```

- [ ] **Step 4: Implement the pairing route component using Tailwind and shadcn/ui Button**

Create `src/features/pairing/components/pairing-screen.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReadinessGate } from '@/features/kiosk/components/readiness-gate';

export function PairingScreen({ onSubmit, onUnlock, capabilityState }: {
  onSubmit: (code: string) => Promise<void>;
  onUnlock: () => Promise<void>;
  capabilityState: Record<string, { label: string; status: string }>;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--meditv-pairing-bg)] p-8">
      <div className="w-full max-w-[420px] rounded-2xl bg-[var(--meditv-pairing-card)] p-8 text-white">
        <ReadinessGate capabilities={capabilityState} onUnlock={onUnlock} isBusy={isBusy} />
        <div className="mt-6 space-y-4">
          <label htmlFor="pair-code" className="text-sm">Pair code</label>
          <input id="pair-code" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-white" />
          {error ? <p className="text-red-400">{error}</p> : null}
          <Button
            type="button"
            onClick={async () => {
              setIsBusy(true);
              setError(null);
              try {
                await onSubmit(code);
              } catch (nextError) {
                setError(nextError instanceof Error ? nextError.message : String(nextError));
              } finally {
                setIsBusy(false);
              }
            }}
            disabled={isBusy}
            className="w-full"
          >
            {isBusy ? 'Loading...' : 'Submit'}
          </Button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Implement the screen runtime component that wires Firestore data, slide state, and announcements**

Create `src/features/screen/components/screen-runtime.tsx`:

```tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnnouncementEngine } from '@/features/announcer/announcement-engine';
import { BrowserSpeaker } from '@/features/announcer/browser-speaker';
import { MeditvScreenView } from '@/features/display/components/meditv-screen-view';
import { normalizeRealtimeScreenData } from '@/features/realtime/normalize-realtime-screen-data';
import { watchMeditvScreen } from '@/features/realtime/watch-meditv-screen';

export function ScreenRuntime({ session }: { session: { clinicId: number; doctorIds: number[]; clinicName: string; clinicAddress: string; screenDocumentPath: string | null; specialists: Array<{ doctorId: number; doctorName: string; specialistName: string }> } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screenData, setScreenData] = useState(() => normalizeRealtimeScreenData({ session, screenDoc: {}, queueDocs: {}, paymentDocs: {} }));
  const [speakerState, setSpeakerState] = useState<{ isSpeaking: boolean; currentDoctorId?: string }>({ isSpeaking: false });
  const engineRef = useRef(new AnnouncementEngine());
  const speakerRef = useRef<BrowserSpeaker | null>(null);

  useEffect(() => {
    speakerRef.current = new BrowserSpeaker(window.speechSynthesis, setSpeakerState);

    return watchMeditvScreen(
      session,
      async ({ screenDoc, queueDocs, paymentDocs }) => {
        const next = normalizeRealtimeScreenData({ session, screenDoc, queueDocs, paymentDocs });
        setScreenData(next);
        setIsLoading(false);
        setError(null);

        for (const announcement of engineRef.current.update(next)) {
          await speakerRef.current?.speak(announcement);
        }
      },
      (nextError) => {
        setIsLoading(false);
        setError(nextError.message);
      },
    );
  }, [session]);

  return <MeditvScreenView isLoading={isLoading} error={error} isSpeaking={speakerState.isSpeaking} activeDoctorId={speakerState.currentDoctorId} screenData={screenData} />;
}
```

- [ ] **Step 6: Replace the App Router pages with kiosk routes**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediTV',
  description: 'Clinic queue display kiosk',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

Replace `src/app/page.tsx`:

```tsx
'use client';

import { BootstrapRoute } from '@/features/bootstrap/components/bootstrap-route';

export default function HomePage() {
  return <BootstrapRoute restore={async () => ({ status: 'missing' })} />;
}
```

Create `src/app/pairing/page.tsx`:

```tsx
'use client';

import { PairingScreen } from '@/features/pairing/components/pairing-screen';

export default function PairingPage() {
  return <PairingScreen onSubmit={async () => undefined} onUnlock={async () => undefined} capabilityState={{}} />;
}
```

Create `src/app/screen/page.tsx`:

```tsx
'use client';

import { ScreenRuntime } from '@/features/screen/components/screen-runtime';

export default function ScreenPage() {
  return <ScreenRuntime session={{ clinicId: 0, doctorIds: [], clinicName: 'MediTV', clinicAddress: '-', screenDocumentPath: null, specialists: [] }} />;
}
```

- [ ] **Step 7: Run the route tests, lint, and build**

Run: `pnpm test -- src/features/bootstrap/components/bootstrap-route.test.tsx src/features/pairing/components/pairing-screen.test.tsx && pnpm lint && pnpm build`
Expected: Tests PASS, Biome exits `0`, and Next.js build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/app src/features/bootstrap/components src/features/pairing/components src/features/screen/components
git commit -m "feat: wire kiosk routes and screen runtime"
```

### Task 11: Add Migration README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the generated README with the MediTV Web runbook**

```md
# MediTV Web

Clinic queue display kiosk built with Next.js for Android TV browsers.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Install dependencies with `pnpm install`.
3. Start the app with `pnpm dev`.

## Routes

- `/` bootstrap and saved-session restore
- `/pairing` readiness gate and pairing form
- `/screen` fullscreen kiosk display

## Verification

- `pnpm test`
- `pnpm lint`
- `pnpm build`

## Android TV Manual Acceptance

- Open `/pairing`
- Click `Aktifkan Mode Kiosk`
- Confirm fullscreen and audio unlock succeed
- Pair with a valid 6-digit code
- Refresh and confirm saved session restores
- Trigger doctor and payment queue updates and confirm announcements, slide focus, and video muting
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add meditv web runbook"
```

### Task 12: Final Full-Stack Verification Pass

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/pairing/page.tsx`
- Modify: `src/app/screen/page.tsx`

- [ ] **Step 1: Replace the temporary page stubs with the real dependency wiring**

Replace `src/app/page.tsx`:

```tsx
'use client';

import { BootstrapRoute } from '@/features/bootstrap/components/bootstrap-route';
import { readJson, removeItem } from '@/shared/lib/browser-storage';
import { PAIRING_STORAGE_KEY, parsePersistedPairingState } from '@/features/pairing/models/persisted-pairing-state';
import { restoreSession } from '@/features/bootstrap/restore-session';
import { signInWithFirebaseCustomToken } from '@/features/auth/sign-in-with-custom-token';

export default function HomePage() {
  return (
    <BootstrapRoute
      restore={async () => {
        const saved = parsePersistedPairingState(readJson(PAIRING_STORAGE_KEY));
        return restoreSession({
          savedState: saved,
          signIn: signInWithFirebaseCustomToken,
          clearSavedState: () => removeItem(PAIRING_STORAGE_KEY),
        });
      }}
    />
  );
}
```

Replace `src/app/pairing/page.tsx`:

```tsx
'use client';

import { PairingScreen } from '@/features/pairing/components/pairing-screen';
import { detectBrowserCapabilities } from '@/features/kiosk/browser-capabilities';
import { unlockKioskMode } from '@/features/kiosk/unlock-kiosk';
import { registerTelly } from '@/features/pairing/api/register-telly';
import { submitPairingCode } from '@/features/pairing/submit-pairing-code';
import { buildDeviceContext } from '@/shared/lib/device-context';
import { readJson, writeJson } from '@/shared/lib/browser-storage';
import { PAIRING_STORAGE_KEY, SCREEN_ID_STORAGE_KEY } from '@/features/pairing/models/persisted-pairing-state';
import { signInWithFirebaseCustomToken } from '@/features/auth/sign-in-with-custom-token';

function getOrCreateScreenId() {
  const existing = readJson<string>(SCREEN_ID_STORAGE_KEY);
  if (typeof existing === 'string' && existing.trim()) return existing;
  const generated = `meditv_${Date.now().toString(36)}${crypto.randomUUID().replace(/-/g, '').slice(0, 6)}`;
  writeJson(SCREEN_ID_STORAGE_KEY, generated);
  return generated;
}

export default function PairingPage() {
  return (
    <PairingScreen
      capabilityState={detectBrowserCapabilities()}
      onUnlock={unlockKioskMode}
      onSubmit={(code) =>
        submitPairingCode({
          code,
          screenId: getOrCreateScreenId(),
          registerTelly,
          signIn: signInWithFirebaseCustomToken,
          saveState: (state) => writeJson(PAIRING_STORAGE_KEY, state),
          deviceContext: buildDeviceContext(),
        }).then(() => {
          window.location.assign('/screen');
        })
      }
    />
  );
}
```

- [ ] **Step 2: Wire `/screen` to the persisted session and reject missing sessions back to pairing**

Replace `src/app/screen/page.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { ScreenRuntime } from '@/features/screen/components/screen-runtime';
import { readJson } from '@/shared/lib/browser-storage';
import { PAIRING_STORAGE_KEY, parsePersistedPairingState } from '@/features/pairing/models/persisted-pairing-state';

export default function ScreenPage() {
  const saved = parsePersistedPairingState(readJson(PAIRING_STORAGE_KEY));
  useEffect(() => {
    if (!saved) {
      window.location.assign('/pairing');
    }
  }, [saved]);

  if (!saved) {
    return null;
  }

  return <ScreenRuntime session={saved} />;
}
```

- [ ] **Step 3: Run the entire verification suite**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: All tests PASS, lint passes, and production build succeeds with the final wiring.

- [ ] **Step 4: Manually verify the approved parity checklist on a real Android TV browser**

Run this checklist in order and record any mismatch before calling the migration complete:

```text
1. First launch opens the pairing page.
2. Clicking Aktifkan Mode Kiosk triggers fullscreen/audio unlock.
3. Invalid 6-digit code shows inline error.
4. Valid pairing routes to /screen.
5. Refresh restores the screen when the token is still valid.
6. Invalid saved token returns to /pairing.
7. Loading state appears before realtime data is available.
8. Empty queue state appears when the current-day queues are empty.
9. New doctor queue numbers speak once and recalls stop after the third total call.
10. Payment queue changes speak with the registration wording.
11. Speaking pauses slide rotation and mutes video audio.
12. Speaking auto-focuses the doctor slide.
13. Realtime errors show a visible failure state instead of a blank screen.
```

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/pairing/page.tsx src/app/screen/page.tsx
git commit -m "feat: finalize meditv web parity flow"
```
