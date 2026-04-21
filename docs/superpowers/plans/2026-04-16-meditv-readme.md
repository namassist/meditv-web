# MediTV README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the default Flutter README with an internal developer README that documents the project purpose, architecture snapshot, and Android run/build workflow for `staging` and `production`.

**Architecture:** The implementation is a documentation-only change centered in `README.md`. Content must be derived from the current Flutter app structure, `AppConfig` environment values, and the existing Android build setup so the README matches the repository exactly.

**Tech Stack:** Markdown, Flutter, Dart, Android Gradle, Firebase, Firestore

---

## File Structure

- Modify: `README.md`
- Reference: `pubspec.yaml`
- Reference: `lib/core/config/app_config.dart`
- Reference: `lib/main.dart`
- Reference: `lib/app.dart`
- Reference: `lib/presentation/pages/pairing/pairing_page.dart`
- Reference: `lib/data/repositories/pairing_repository.dart`
- Reference: `lib/data/repositories/meditv_screen_repository.dart`
- Reference: `android/app/build.gradle.kts`
- Reference: `.vscode/launch.json`

### Task 1: Replace the Default README Skeleton

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Confirm the current README is still the default template**

Run: `rg -n "A new Flutter project|Getting Started" README.md`
Expected: Matches showing the default Flutter placeholder content.

- [ ] **Step 2: Replace the top-level README structure with the approved sections**

```md
# MediTV

## Overview

## Features

## Tech Stack

## Project Structure

## How It Works

## Environment Configuration

## Getting Started

## Run on Android

## Build APK on Android

## Useful Notes
```

- [ ] **Step 3: Save the file update with only section scaffolding first**

Use `apply_patch` to replace the current contents of `README.md` with the approved section outline.

- [ ] **Step 4: Verify the new section structure exists**

Run: `rg -n "^## " README.md`
Expected: The section list includes Overview, Features, Tech Stack, Project Structure, How It Works, Environment Configuration, Getting Started, Run on Android, Build APK on Android, and Useful Notes.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: scaffold MediTV README structure"
```

### Task 2: Fill in Project Overview, Features, and Architecture Summary

**Files:**
- Modify: `README.md`
- Reference: `lib/main.dart`
- Reference: `lib/app.dart`
- Reference: `lib/presentation/pages/pairing/pairing_page.dart`
- Reference: `lib/data/repositories/pairing_repository.dart`
- Reference: `lib/data/repositories/meditv_screen_repository.dart`

- [ ] **Step 1: Draft the overview and feature summary from the implemented app flow**

```md
## Overview

MediTV is a Flutter-based display application for clinic queue screens. The app pairs a screen with Medibook using a 6-digit code, signs in with Firebase using a custom token, and then renders realtime queue and media updates from Firestore.

## Features

- Screen pairing with a 6-digit code
- Firebase custom-token authentication
- Realtime queue updates from Firestore
- Video playback for display content
- Text-to-speech queue announcements
- Session restoration from locally persisted pairing data
```

- [ ] **Step 2: Add the tech stack and project structure summary**

```md
## Tech Stack

- Flutter and Dart
- Firebase Core, Firebase Auth, and Cloud Firestore
- Dio for backend API access
- `video_player` for media playback
- `flutter_tts` for queue announcements
- `shared_preferences` for persisted pairing state

## Project Structure

```text
lib/
  core/
    config/
    network/
  data/
    repositories/
    services/
  presentation/
    pages/
      pairing/
      meditv/
```
```

- [ ] **Step 3: Add the high-level runtime flow section**

```md
## How It Works

1. The app starts on the pairing screen.
2. The user enters a 6-digit code from Medibook.
3. The backend registers the screen and returns session data plus a Firebase custom token.
4. The app signs in to Firebase.
5. The app opens the MediTV screen view.
6. The screen subscribes to Firestore documents for queue, payment, and display content updates.
7. The UI rotates queue cards, shows video content, and speaks queue announcements through TTS.
```

- [ ] **Step 4: Verify the README now documents the implemented flow**

Run: `rg -n "custom token|Firestore|6-digit|TTS|video" README.md`
Expected: Matches for the pairing flow, Firebase custom token, Firestore updates, TTS, and video playback.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add MediTV overview and architecture summary"
```

### Task 3: Document Environment Configuration and Android Commands

**Files:**
- Modify: `README.md`
- Reference: `lib/core/config/app_config.dart`
- Reference: `android/app/build.gradle.kts`
- Reference: `.vscode/launch.json`

- [ ] **Step 1: Add the environment table using the exact values from `AppConfig`**

```md
## Environment Configuration

The app selects its environment through `--dart-define=ENV=<value>`.

| Environment | ENV value | Base URL | Node URL | Node |
| --- | --- | --- | --- | --- |
| Staging | `staging` | `https://devkss.idempiereonline.com/api/v1` | `https://medibook.medital.id/api` | `dev` |
| Production | `production` | `https://ksslive.idempiereonline.com/api/v1` | `https://medibook.medital.id/api` | `live` |
```

- [ ] **Step 2: Add setup and Android run commands for each environment**

```md
## Getting Started

1. Install Flutter SDK compatible with the project.
2. Install Android Studio and the Android SDK.
3. Verify tooling with `flutter doctor`.
4. Install dependencies with `flutter pub get`.

## Run on Android

Run staging:

```bash
flutter run -d android --dart-define=ENV=staging
```

Run production:

```bash
flutter run -d android --dart-define=ENV=production
```
```

- [ ] **Step 3: Add Android APK build commands and implementation notes**

```md
## Build APK on Android

Build staging APK:

```bash
flutter build apk --dart-define=ENV=staging
```

Build production APK:

```bash
flutter build apk --dart-define=ENV=production
```

## Useful Notes

- The project currently switches environment through `--dart-define`, not Android product flavors.
- The Android Gradle project in this repository does not yet define release signing for distribution builds.
- `.vscode/launch.json` already includes staging and production launch examples.
```

- [ ] **Step 4: Verify commands and environment labels are exact**

Run: `rg -n "ENV=staging|ENV=production|devkss|ksslive|medibook.medital.id/api" README.md`
Expected: Matches for both environment commands and both configured backend endpoints.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add environment-specific Android usage"
```

### Task 4: Final Accuracy Pass

**Files:**
- Modify: `README.md`
- Reference: `pubspec.yaml`
- Reference: `lib/core/config/app_config.dart`
- Reference: `android/app/build.gradle.kts`

- [ ] **Step 1: Compare the dependency names in the README against `pubspec.yaml`**

Run: `rg -n "firebase_core|firebase_auth|cloud_firestore|dio|video_player|flutter_tts|shared_preferences" pubspec.yaml README.md`
Expected: The README references only dependencies that actually exist in `pubspec.yaml`.

- [ ] **Step 2: Read the completed README and remove any unsupported claims**

Check for these exact risks and fix them inline if present:

```text
- Mention of product flavors
- Mention of completed release signing
- Mention of iOS or other platform build instructions
- Claims not supported by AppConfig or implemented app flow
```

- [ ] **Step 3: Verify the README is no longer the default Flutter template**

Run: `rg -n "A new Flutter project|Lab: Write your first Flutter app|Cookbook: Useful Flutter samples" README.md`
Expected: No matches.

- [ ] **Step 4: Inspect the final diff before handoff**

Run: `git diff -- README.md`
Expected: A full replacement of the default README with MediTV-specific documentation.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: finalize MediTV developer README"
```
