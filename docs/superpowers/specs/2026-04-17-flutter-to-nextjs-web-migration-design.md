# Flutter to Next.js Web Migration Design

## Objective

Create a new, separate Next.js/React web project that reproduces the current Flutter MediTV application for kiosk use on Android TV browsers, with no intentional loss of UI, feature coverage, or runtime behaviour.

The migration must preserve:

- The pairing flow and persisted screen identity
- Firebase custom-token authentication
- Realtime Firestore subscriptions for screen, doctor queue, and payment queue data
- Video playback and fallback handling
- Queue announcement behaviour, including recall limits and initial snapshot suppression
- Queue card slide rotation, auto-focus, loading, empty, and error states
- The current visual structure closely enough that the web screen feels like the same product

## Confirmed Context

The current Flutter app is a fullscreen clinic display app that starts at `PairingPage`, restores a saved session when possible, signs in to Firebase with a custom token, subscribes to Firestore documents, renders queue cards and a payment card beside video content, and announces queue updates through TTS.

The supported runtime environments today are `staging` and `production`, resolved from `ENV`, and the current backend/Firebase contract must remain unchanged during migration.

The target runtime for the new web version is a kiosk browser on Android TV or Android box devices.

## Scope

The design covers:

- The target web architecture for a new standalone Next.js repository
- Behaviour-preserving mapping from Flutter flows to web flows
- Browser capability handling required for kiosk mode on Android TV
- Data, state, and subscription boundaries needed to keep parity with the current app
- Testing and verification strategy for migration parity

The design does not cover:

- Replacing or redesigning the backend API contract
- Replacing Firebase or Firestore
- A native Android TV app rewrite
- A broad visual redesign of MediTV
- CI/CD, hosting vendor selection, or infrastructure rollout details beyond architectural constraints

## Product Goals

1. Deliver a web version that behaves like the existing Flutter app from the operator's perspective.
2. Keep the runtime lightweight enough for kiosk-class Android TV browsers.
3. Preserve resilience features such as persisted session restore and sensible fallbacks.
4. Make the implementation maintainable by separating pairing, auth, realtime data, display rendering, and announcement logic into explicit web modules.

## Non-Goals

- Introducing new end-user features during migration
- Relaxing parity requirements for queue logic or kiosk startup behaviour
- Depending on backend changes to make the first release viable
- Optimizing for general staff desktop workflows ahead of kiosk display workflows

## Constraints

- The web app must run against the same pairing endpoint and the same Firebase project.
- Firestore document shapes and backend response variability must be handled client-side, like the Flutter implementation does now.
- Android TV browsers may block autoplay audio or Web Speech until the user performs an initial gesture.
- Browser permissions and site settings cannot be forced by the app; the app can only request what the browser exposes.
- Session restore should succeed automatically when the persisted token remains valid and should fall back to pairing when it is invalid.

## Recommended Approach

Use a new standalone Next.js repository with a client-first kiosk architecture.

Why this approach:

- It keeps the runtime close to the Flutter app's current shape, where the screen itself owns pairing bootstrap, Firebase auth, Firestore subscriptions, and presentation.
- It avoids introducing a mandatory server layer before there is evidence that one is needed.
- It keeps deployment options open: the implementation can remain static-first while still allowing a Next.js runtime later if required.
- It is the lightest architecture that still supports strict behaviour parity.

Rejected alternatives:

- A heavier Next.js server-centric design adds operational complexity without solving the core Android TV browser audio constraint.
- A native wrapper around React would improve device control, but it stops being a pure web migration and should only be considered as a fallback if browser audio policy proves incompatible in real devices.

## Target Architecture

The new project should use Next.js App Router mainly as the application shell and build system, with the runtime experience driven by client components and browser APIs.

Recommended feature boundaries:

- `src/features/bootstrap`
- `src/features/pairing`
- `src/features/auth`
- `src/features/realtime`
- `src/features/display`
- `src/features/announcer`
- `src/features/kiosk`
- `src/shared`

Responsibilities:

- `bootstrap`: startup decisions, persisted session read, restore attempt, route choice
- `pairing`: 6-digit pairing UI, register-telly request, success and error states
- `auth`: Firebase custom-token sign-in, token validity handling
- `realtime`: Firestore subscriptions, normalization, merged screen state
- `display`: fullscreen screen layout, queue cards, payment card, video, empty/loading/error views
- `announcer`: queue diffing, recall limit tracking, initial snapshot suppression, TTS queue orchestration, slide targeting during announcements
- `kiosk`: readiness gate, capability checks, audio unlock, fullscreen request, browser support status
- `shared`: environment config, storage helpers, parsing utilities, constants, and common UI primitives

## Routing Model

The app should expose a minimal route surface tailored to kiosk use:

- `/` for startup bootstrap and route redirection
- `/pairing` for readiness gate plus 6-digit pairing flow
- `/screen` for the fullscreen MediTV display

The app should not introduce broader navigation concepts, because the product is a persistent kiosk display rather than a multi-page operator application.

## Runtime Flow

### Startup bootstrap

1. Load stored `screenId` and persisted pairing state from browser storage.
2. Run capability discovery for storage, audio, fullscreen, notification support, and browser compatibility signals.
3. If a stored session exists, attempt Firebase custom-token sign-in.
4. If sign-in succeeds, navigate directly to `/screen`.
5. If sign-in fails because the token or session is invalid, clear persisted session data and navigate to `/pairing`.
6. If sign-in fails because of transient connectivity, keep the stored session, expose retry state, and do not immediately discard it.

### Pairing flow

1. The pairing screen shows the readiness gate status and the existing 6-digit form.
2. The user clicks the kiosk activation button when needed to unlock browser capabilities.
3. The user enters a 6-digit code.
4. The app calls `/fcm/register-telly` with the same backend contract currently used by Flutter.
5. The app parses the response with the same flexible key-reading strategy used in the current `PairingSession` model.
6. The app signs in to Firebase using the returned custom token.
7. The app persists the pairing state and routes to `/screen`.

### Screen flow

1. Subscribe to the optional screen document path returned by pairing.
2. Subscribe to each `doctorQueues/{clinicId_doctorId}` document.
3. Subscribe to each `paymentQueues/{clinicId_doctorId}` document.
4. Merge the snapshot set into a single presentation model equivalent to `MeditvScreenData`.
5. Render header, queue area, video section, and payment section from that single model.
6. Run announcement logic against state transitions rather than raw snapshots.

## Data Mapping and State Model

The web app should retain the same data interpretation rules as the Flutter code.

### Persisted pairing state

Persist:

- pairing code
- screen ID
- custom token
- screen document path
- session document path
- clinic ID
- doctor IDs
- clinic name
- clinic address
- specialist list

The web app should separate persistent state from transient UI state so that restore logic is deterministic and easy to test.

### Screen identity

The app should generate and persist a stable `screenId` in browser storage using a web-safe random identifier strategy. The value should remain stable across reloads until browser storage is cleared.

### Normalized display state

The display layer should consume one normalized object equivalent in purpose to `MeditvScreenData`, containing:

- clinic name
- clinic address
- video URL
- payment queue number
- payment doctor name
- payment updated timestamp
- pharmacy queue number (static placeholder `-` until backend integration)
- queue card collection

This model should own the same fallbacks used in Flutter today:

- fallback clinic metadata from the saved session
- default video URL when screen data is missing or empty
- `-` for absent queue values
- current-day filtering for queue and payment documents based on reset date or event timestamp

## Tooling

The project uses **Biome** for linting and formatting (not ESLint/Prettier). Biome handles both JavaScript/TypeScript linting and code formatting in a single tool with significantly faster execution, which is appropriate for a lightweight kiosk project.

## UI Parity Requirements

The web UI must preserve the current MediTV display structure and major visual behaviour:

- a pairing page with centered card layout and 6-digit code input
- a fullscreen display page with header, queue area, video card, payment card, and pharmacy card
- two queue cards per slide
- slide indicators when more than one queue slide exists
- loading, empty, and error states equivalent to the Flutter app
- responsive layout behavior that still favors TV-scale fullscreen presentation

The intent is not pixel-perfect browser cloning of Flutter widgets, but the resulting screen should be recognizably the same product and should not omit current display states or hierarchy.

### Screen Page Layout Specification

The screen page is divided into three vertical zones:

#### Header (Top Bar)

An executive header with a teal gradient background (`#186E75` → `#194756`).

- **Left side**: clinic logo, clinic name, and full address clearly readable
- **Right side**: a large real-time digital clock with ticking seconds, plus day and date displayed below

The header conveys a well-managed waiting room aesthetic.

#### Middle Zone (~50% of viewport) — Doctor Queue Cards

This area is dedicated to patient queue calling. It displays up to two large "Kartu Antrian Poli" side by side.

Each card has:

- A unique poli accent color (see color palette below)
- **Top**: doctor name and specialization badge
- **Center**: a giant queue number with "SEDANG DIPANGGIL" label
- **Bottom**: two info boxes — "Berikutnya" (next queue number) and "Ruangan" (static: "Ruang Pemeriksaan")

When there are more than two doctors, the cards rotate automatically as a carousel with dot indicators at the bottom.

#### Bottom Zone (~33% of viewport) — Entertainment & Services

Split into three proportional columns: **60% – 20% – 20%**

- **Video (left, 60%)**: a large video player continuously showing clinic education/promo content. Auto-mutes when TTS announcements are active.
- **Payment Card (center, 20%)**: a vertically-oriented card with blue accent. Shows "PEMBAYARAN" text, a credit card icon, and a giant queue number for patients heading to the cashier.
- **Pharmacy Card (right, 20%)**: similar structure to the payment card but with green accent. Shows "FARMASI" text, a medicine/tube icon, and a giant queue number for patients whose medication is ready. (Static placeholder in the first release — same component structure as payment, different color.)

#### Visual Style

- Glassmorphism / modern floating card aesthetic
- Rounded corners with subtle shadow to create a "hovering" effect
- Proportional gaps between all sections
- Fluid sizing: scales elegantly on 4K TV screens while remaining legible on a nurse's laptop
- Automatic TTS triggered on every queue number change

### Screen Page Color Palette

```
background:       #F9FAFB
card:             #FFFFFF
foreground:       #111827
muted:            #F3F4F6
mutedForeground:  #6B7280
border:           #E5E7EB
accent:           #3B82F6
queueNumber:      #1F2937
headerFrom:       #186E75
headerTo:         #194756

// Status Colors
statusWaiting:    #F59E0B
statusCalling:    #EF4444

// Poli Colors
poliUmum:         #6839C5  (purple)
poliAnak:         #D22C63  (pink)
poliKandungan:    #1A757E  (teal)
poliLaktasi:      #EB6D13  (orange)
poliGizi:         #2B9658  (green)
```

### Pairing Page Layout

The pairing page follows the standard plan layout:

- Centered card on a dark background
- Readiness gate section with capability checklist and "Aktifkan Mode Kiosk" button
- 6-digit numeric input field
- Submit button with loading/error states

## Kiosk Readiness Gate

The pairing page must include a startup readiness gate designed for Android TV browser limitations.

Requirements:

- A primary action button such as `Aktifkan Mode Kiosk`
- A status checklist that reports the readiness of each capability
- Clear distinction between `ready`, `unsupported`, and `manual action required`

The gate may request, when browser APIs allow it:

- audio unlock
- fullscreen mode
- notification permission
- storage/session availability checks
- Firebase and Firestore runtime readiness checks

Important rules:

- Audio unlock is the primary blocker and should be treated as mandatory for full announcement parity.
- Notification permission is supportive, not a blocker for the main realtime display flow.
- The app must not loop permission prompts or imply that unsupported browser capabilities can be forced.
- If a capability cannot be granted programmatically, the UI should show a short manual instruction instead of failing silently.

## Audio and Announcement Design

The announcement subsystem is the highest-risk parity area and must preserve the existing rules.

Required behaviour:

- Initial Firestore snapshots seed internal state and do not trigger announcements.
- A doctor queue announcement is triggered when a new number is called.
- A recall of the same number may be announced, but no more than three total times for the same number per doctor.
- Old events with unchanged timestamps are ignored.
- Payment queue announcements trigger when `paymentUpdatedAt` moves forward.
- Announcements are queued and played sequentially.
- While an announcement is active, video audio is muted or suppressed.
- While an announcement is active, automatic slide rotation is paused.
- If an announcement targets a doctor on another slide, the display auto-jumps to that slide.

Implementation note:

The design should assume browser-based speech or audio playback requires a one-time startup unlock gesture on Android TV browsers. The first release should not assume truly unrestricted autoplay TTS in web-only Android TV environments.

## Video Behaviour

The video section must preserve current runtime behavior:

- use the realtime screen document video URL when present
- use the current default video fallback when absent
- render within the main display layout rather than as a separate route or modal
- coordinate with the announcer so queue announcements do not compete with display audio

## Error Handling

The web app should preserve the current distinction between empty data, connection delay, and hard failure.

Examples:

- If subscriptions have not produced usable data yet, show a connecting/loading state.
- If realtime fails while no meaningful data is available, show an error state with retry action.
- If queue documents exist but contain no current-day payload, show the empty queue state rather than an error.
- If persisted restore fails due to invalid session, clear stored pairing state and return to pairing.
- If persisted restore fails due to transient network conditions, keep the session and expose retry semantics.

## Performance and Weight Constraints

The web implementation should favor low-runtime overhead suitable for kiosk devices:

- keep the route surface minimal
- prefer direct feature modules over heavy cross-cutting abstractions
- avoid adding large client libraries without a direct migration need
- keep realtime parsing and announcement logic deterministic and localized
- avoid unnecessary re-renders in the fullscreen screen view

The architecture should remain simple enough that the full startup, pairing, display, and announcement logic can be reasoned about feature-by-feature against the Flutter source.

## Verification Strategy

Parity must be verified explicitly rather than assumed.

### Automated checks

- parsing tests for pairing response variability and Firestore document normalization
- logic tests for session restore outcomes
- logic tests for queue announcement triggering, duplicate suppression, and recall cap
- logic tests for slide targeting and empty-state selection

### Manual acceptance checks

- first boot with no session
- kiosk readiness gate flow
- successful pairing
- reload after successful pairing with valid token
- reload after successful pairing with invalid token
- loading state before snapshots arrive
- empty queue state for current day with no active queue numbers
- queue updates that trigger doctor announcements
- repeated queue update for same number up to the recall cap
- payment queue announcements
- auto-slide rotation and pause during announcements
- auto-jump to the doctor slide during active announcement
- video fallback and realtime video switching
- realtime error state and retry path

### Parity checklist

The migration is not considered complete until every current Flutter behaviour has an explicit web outcome for:

- pairing success and failure
- saved-session restore outcomes
- Firebase auth outcomes
- Firestore loading, empty, error, and populated states
- video fallback behavior
- empty queue layout
- manual and automatic slide changes
- TTS pause and focus interactions
- doctor recall cap of three
- payment announcement behavior
- readiness gate capability handling

## Deployment Direction

Deployment is intentionally left open, but the implementation should be compatible with a lightweight client-first deployment model. The preferred first implementation shape is static-first, provided Firebase client auth and Firestore subscriptions are supported cleanly in the final build target.

If later production validation shows that Android TV browser constraints materially block required behaviour, the first escalation path should be a thin wrapper or device-specific hosting adjustment rather than a redesign of the product logic.

## Acceptance Criteria

This design is acceptable when:

- the new web app can be implemented in a separate repository without backend contract changes
- every major Flutter MediTV feature has a mapped web equivalent
- the Android TV browser audio constraint is addressed through a readiness gate and one-time unlock flow
- persisted session restore semantics remain intact
- queue, payment, video, and slide behaviour remain functionally equivalent
- the architecture stays light enough for kiosk deployment and explicit enough for parity auditing
