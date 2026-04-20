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
