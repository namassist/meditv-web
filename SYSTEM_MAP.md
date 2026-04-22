# Project Summary

- **Tujuan**: Aplikasi display antrian klinik (kiosk TV). Menampilkan nomor antrian dokter, antrian pembayaran, farmasi, dan video promosi secara realtime dengan text-to-speech.
- **Tech stack**: Next.js 16.2.4, React 19, TypeScript, Tailwind CSS 4, Firebase (Auth + Firestore realtime), Web Speech API, pnpm
- **Arsitektur**: Client-side SPA (semua page `"use client"`). Tidak ada server-side logic. Data realtime via Firestore `onSnapshot`. Backend eksternal (Node API) hanya untuk pairing/registrasi.

---

# Core Logic Flow

## Flow 1: Bootstrap (Entry)
```
/ (page.tsx) → BootstrapRoute[restore]
  → restoreSession[savedState, signIn, clearSavedState]
    → signInWithFirebaseCustomToken → Firebase Auth
  → Redirect: /screen (restored) | /pairing (missing/invalid)
```

## Flow 2: Pairing (Registrasi Device Baru)
```
/pairing (page.tsx)
  → detectBrowserCapabilities[hasAudioElement, hasAudioContext, hasFullscreenApi, hasNotificationApi, hasLocalStorage, isFullscreenActive, notificationPermission, audioContextState] → UI capabilities check
  → ReadinessGate[onUnlock]
    → unlockKioskMode → { audioContextState } (AudioContext init, fullscreen, notification)
    → re-detectBrowserCapabilities (update state post-unlock)
  → PairingScreen[onSubmit]
    → submitPairingCode[code, screenId, registerTelly, signIn, saveState]
      → registerTelly → POST {nodeUrl}/fcm/register-telly (External API)
      → parsePairingSession (parse response, includes token)
      → signInWithFirebaseCustomToken → Firebase Auth
      → writeJson(localStorage) → persist session (includes token)
  → Redirect: /screen
```

## Flow 3: Screen (Display Antrian Realtime)
```
/screen (page.tsx)
  → parsePersistedPairingState(localStorage)
  → ScreenRuntime[session (includes token, screenId)]
    → watchMeditvScreen[session, onData, onError]
      → Firestore onSnapshot: screenDoc, doctorQueues/{clinicId}_{doctorId}, paymentQueues/{clinicId}_{doctorId}
      → Debounced emit (100ms) to batch rapid onSnapshot callbacks
    → normalizeRealtimeScreenData → MeditvScreenData (sanitize inputs, resolve payment doctor via specialists)
    → AnnouncementEngine.update(screenData) → Announcement[]
    → Deferred UI update: snapshot mechanism syncs TTS announcements with UI card updates
      → onBeforePlay: shift pendingSnapshot → update specific queueCard or payment data
      → Non-deferred parts: immediate UI update
      → After all TTS: sync display to latestDataRef
    → AudioTtsSpeaker.speak(announcement) → Backend TTS API (mp3)
    → MeditvScreenView[screenData, isSpeaking, activeDoctorId, isPaymentSpeaking]
      → MeditvHeader, MeditvQueueCard[], MeditvVideoCard, MeditvPaymentCard, MeditvPharmacyCard
      → useSlideState (carousel 2 kartu/slide, 5s interval)
    → (Heartbeat: useHeartbeat — currently commented out, POST every 2 min to /fcm/heartbeat-screen)
```

---

# Clean Tree

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Geist font, metadata)
│   ├── page.tsx                # / — Bootstrap route
│   ├── pairing/page.tsx        # /pairing — Pairing device
│   └── screen/page.tsx         # /screen — Display antrian
├── features/
│   ├── auth/
│   │   ├── firebase-client.ts          # Firebase app/auth/firestore init
│   │   └── sign-in-with-custom-token.ts
│   ├── bootstrap/
│   │   ├── restore-session.ts          # Restore session dari localStorage
│   │   └── components/bootstrap-route.tsx
│   ├── pairing/
│   │   ├── api/register-telly.ts       # POST ke Node API
│   │   ├── submit-pairing-code.ts      # Orchestrator pairing
│   │   ├── models/pairing-session.ts
│   │   ├── models/persisted-pairing-state.ts
│   │   ├── models/pairing-specialist.ts
│   │   └── components/pairing-screen.tsx
│   ├── realtime/
│   │   ├── watch-meditv-screen.ts      # Firestore listener
│   │   ├── normalize-realtime-screen-data.ts
│   │   └── models/
│   │       ├── meditv-screen-data.ts
│   │       ├── meditv-queue-card.ts
│   │       └── meditv-status-type.ts
│   ├── announcer/
│   │   ├── announcement-engine.ts      # Logic kapan announce
│   │   └── audio-tts-speaker.ts        # TTS via backend API (mp3)
│   ├── display/
│   │   ├── use-slide-state.ts          # Carousel logic
│   │   ├── constants/design-tokens.ts
│   │   └── components/
│   │       ├── meditv-screen-view.tsx   # Main screen layout
│   │       ├── meditv-header.tsx
│   │       ├── meditv-queue-card.tsx
│   │       ├── meditv-payment-card.tsx
│   │       ├── meditv-pharmacy-card.tsx
│   │       └── meditv-video-card.tsx
│   ├── kiosk/
│   │   ├── browser-capabilities.ts     # Detect audio/fullscreen/notif (detailed state tracking)
│   │   ├── unlock-kiosk.ts             # Request permissions, returns audioContextState
│   │   └── components/readiness-gate.tsx
│   ├── heartbeat/
│   │   ├── heartbeat-screen.ts         # POST heartbeat to backend API
│   │   └── use-heartbeat.ts            # Hook: periodic heartbeat every 2 min
│   └── screen/
│       └── components/screen-runtime.tsx # Orchestrator realtime + TTS + deferred UI
├── shared/
│   ├── config/app-config.ts            # Env config (staging/prod URLs)
│   └── lib/
│       ├── browser-storage.ts          # localStorage wrapper
│       └── device-context.ts           # UA parsing
├── components/ui/button.tsx            # shadcn button
├── lib/utils.ts                        # cn() utility
├── test/setup.ts                       # Vitest setup
└── test/vitest.d.ts                    # Vitest type reference
```

---

# Module Map

| Path | Fungsi Utama | Peran |
|------|-------------|-------|
| `src/app/page.tsx` | `HomePage` | Entry point, bootstrap session restore |
| `src/app/pairing/page.tsx` | `PairingPage` | Halaman input kode pairing 6 digit |
| `src/app/screen/page.tsx` | `ScreenPage` | Halaman display antrian (post-pairing) |
| `src/features/auth/firebase-client.ts` | `firebaseApp`, `firebaseAuth`, `firestore` | Singleton Firebase init |
| `src/features/auth/sign-in-with-custom-token.ts` | `signInWithFirebaseCustomToken` | Auth Firebase dengan custom token |
| `src/features/bootstrap/restore-session.ts` | `restoreSession` | Cek & restore session dari localStorage |
| `src/features/bootstrap/components/bootstrap-route.tsx` | `BootstrapRoute` | UI routing berdasar status session |
| `src/features/pairing/api/register-telly.ts` | `registerTelly` | HTTP POST registrasi device ke backend |
| `src/features/pairing/submit-pairing-code.ts` | `submitPairingCode` | Orchestrator: validate → register → signIn → save |
| `src/features/pairing/models/pairing-session.ts` | `parsePairingSession` | Parse response API jadi PairingSession (includes token) |
| `src/features/pairing/models/persisted-pairing-state.ts` | `createPersistedPairingState`, `parsePersistedPairingState` | Serialisasi session ke/dari localStorage (includes token) |
| `src/features/realtime/watch-meditv-screen.ts` | `watchMeditvScreen` | Subscribe Firestore docs (queue + payment), debounced emit 100ms |
| `src/features/realtime/normalize-realtime-screen-data.ts` | `normalizeRealtimeScreenData` | Transform raw Firestore → MeditvScreenData (sanitize inputs, resolve payment doctor via specialists) |
| `src/features/announcer/announcement-engine.ts` | `AnnouncementEngine` | Decide announcements berdasar state diff |
| `src/features/announcer/audio-tts-speaker.ts` | `AudioTtsSpeaker` | Queue + play TTS via backend API (mp3) |
| `src/features/display/components/meditv-screen-view.tsx` | `MeditvScreenView` | Layout utama screen (header + cards + video), routes isPaymentSpeaking to payment card |
| `src/features/display/use-slide-state.ts` | `getNextSlideIndex`, `getTargetSlideIndex` | Logic carousel auto-rotate |
| `src/features/kiosk/browser-capabilities.ts` | `detectBrowserCapabilities` | Cek support audio/fullscreen/notif/storage with detailed state (ready, ready-to-request, denied, unsupported) |
| `src/features/kiosk/unlock-kiosk.ts` | `unlockKioskMode` | Request fullscreen + audio + notif permissions, returns audioContextState |
| `src/features/heartbeat/heartbeat-screen.ts` | `sendHeartbeat` | POST heartbeat ke backend (token, screenId, clinicId, doctorIds) |
| `src/features/heartbeat/use-heartbeat.ts` | `useHeartbeat` | Hook: kirim heartbeat periodik setiap 2 menit |
| `src/features/screen/components/screen-runtime.tsx` | `ScreenRuntime` | Orchestrator: realtime + normalization + deferred TTS/UI sync + render |
| `src/shared/config/app-config.ts` | `getAppConfig`, `getFirebaseWebConfig` | Config per environment |
| `src/shared/lib/browser-storage.ts` | `readJson`, `writeJson`, `removeItem` | localStorage helper |
| `src/shared/lib/device-context.ts` | `buildDeviceContext` | Parse UA untuk device info |

---

# Data & Config

## Config
- `.env.example` → `NEXT_PUBLIC_ENV=staging`
- `src/shared/config/app-config.ts` → staging/production URLs + Firebase web config (hardcoded)

## Data Storage
- **Firebase Firestore** (realtime):
  - `doctorQueues/{clinicId}_{doctorId}` — antrian dokter (antrian, nextantrian, type, timestamp)
  - `paymentQueues/{clinicId}_{doctorId}` — antrian pembayaran (paymentQueueNumber, paymentDoctorName, paymentUpdatedAt)
  - `{screenDocumentPath}` — screen config (url/videoUrl)
- **localStorage**:
  - `meditv.persisted_pairing_state` — session lengkap (clinicId, doctorIds, customToken, specialists, dll)
  - `meditv.screen_id` — device ID unik

## Migration/Seed
- Not found (Firestore, no local migration)

## Output/Artifacts
- `.next/` (build output, excluded)

---

# External Integrations

| Service | Endpoint | Modul Pemanggil |
|---------|----------|-----------------|
| MediBook Node API | `{nodeUrl}/fcm/register-telly` (POST) | `src/features/pairing/api/register-telly.ts` |
| MediBook Node API | `{nodeUrl}/fcm/heartbeat-screen?node={node}` (POST) | `src/features/heartbeat/heartbeat-screen.ts` |
| Firebase Auth | Custom token sign-in | `src/features/auth/sign-in-with-custom-token.ts` |
| Firebase Firestore | Realtime listeners (onSnapshot) | `src/features/realtime/watch-meditv-screen.ts` |
| MediBook Node TTS API | `{nodeUrl}/fcm/queue-announcement-tts` (POST) | `src/features/announcer/audio-tts-speaker.ts` |
| R2/CDN Video | Default video URL (hardcoded) | `src/features/realtime/normalize-realtime-screen-data.ts` |

---

# Risks / Blind Spots

- **Firebase config hardcoded** di `app-config.ts` — bukan dari env vars
- **customToken expiry** — tidak ada refresh logic; jika token expire, session invalid dan user harus re-pair
- **pharmacyQueueNumber** selalu `"-"` — fitur farmasi belum diimplementasi (hardcoded)
- **screenDocumentPath** — path Firestore dari response API, tidak diketahui strukturnya tanpa akses backend
- **pairing-specialist.ts** — file ada tapi tidak di-read (parsing specialist dari response)
- **Tidak ada error boundary** — jika Firestore disconnect, hanya tampil pesan error statis
- **Tidak ada service worker / offline support** — kiosk bergantung penuh pada koneksi internet
- **Heartbeat (useHeartbeat)** — currently commented out in ScreenRuntime; ready to enable but not yet active
- **QUEUE_WARNING status** — treated as "calling" in normalize; verify backend intent
