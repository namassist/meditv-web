# MediTV README Design

## Objective

Replace the default Flutter `README.md` with a developer-focused project README for internal use. The README must explain what the project does, how the runtime flow works at a high level, and how to run or build the Android app for each supported environment.

## Audience

Internal developers who need fast onboarding into the repository, its purpose, and the current Android build workflow.

## Scope

The README will include:

- A short overview of the MediTV project
- A concise feature summary based on the implemented codebase
- The current tech stack and key dependencies
- A short project structure map for important directories under `lib/`
- A high-level runtime flow: pairing, Firebase authentication, Firestore realtime subscription, and queue/video display
- Environment configuration details sourced from `lib/core/config/app_config.dart`
- Local setup instructions for Flutter developers
- Android run commands per environment
- Android build commands per environment
- Practical notes constrained to the current implementation

The README will not include:

- Android product flavors, because they are not implemented
- iOS, web, macOS, Linux, or Windows build instructions
- Release signing instructions, because the Android Gradle file still uses the debug signing config for release
- Deployment, CI/CD, or store publishing steps

## Confirmed Implementation Facts

### Project nature

This is a Flutter application named `meditv`.

The main entry point initializes Firebase and launches `MyApp`, which opens the pairing flow first.

### User flow

1. The app starts on `PairingPage`
2. The user enters a 6-digit pairing code obtained from Medibook
3. The app registers the screen through the backend API
4. The app signs in to Firebase using a custom token
5. The app opens `MeditvScreenPage`
6. The screen listens to Firestore documents for realtime queue and content updates
7. The screen plays video content and announces queues via TTS

### Environment switching

Environment selection is implemented through `--dart-define=ENV=<value>`.

Supported values:

- `staging`
- `production`

Concrete config values:

| Environment | `baseUrl` | `nodeUrl` | `node` |
| --- | --- | --- | --- |
| `staging` | `https://devkss.idempiereonline.com/api/v1` | `https://medibook.medital.id/api` | `dev` |
| `production` | `https://ksslive.idempiereonline.com/api/v1` | `https://medibook.medital.id/api` | `live` |

### Android build reality

The Android project currently uses the standard Flutter Gradle setup with no product flavors.

The `release` build type currently signs with the debug signing config, so the README must describe commands as they exist in the repository and avoid implying production-ready signing.

## Proposed README Structure

1. `# MediTV`
2. `Overview`
3. `Features`
4. `Tech Stack`
5. `Project Structure`
6. `How It Works`
7. `Environment Configuration`
8. `Getting Started`
9. `Run on Android`
10. `Build APK on Android`
11. `Useful Notes`

## Content Rules

- Use English
- Keep the document practical and concise
- Make Android per-environment commands highly visible
- Only document behaviors and commands confirmed by the repository
- Avoid speculative setup steps that are not visible in the codebase
- Use exact command examples with `--dart-define=ENV=staging` and `--dart-define=ENV=production`

## Validation Criteria

The README is acceptable when:

- Every environment name and endpoint matches `lib/core/config/app_config.dart`
- Android commands reflect the current repository setup
- The setup section matches the dependencies and Flutter project structure in `pubspec.yaml`
- The architecture summary matches the implemented pairing and realtime flow in `lib/`
- The document no longer looks like the default Flutter template

## Constraints

- Do not add unsupported claims about flavors, signing, or deployment
- Do not expand scope beyond Android local run/build usage
- Keep the focus on internal developer onboarding
