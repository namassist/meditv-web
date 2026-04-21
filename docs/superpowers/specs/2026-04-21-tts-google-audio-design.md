# TTS via Google Translate Audio — Design Spec

## Problem

`BrowserSpeaker` menggunakan Web Speech API (`SpeechSynthesis`). Tidak jalan di TV Bro (Android TV) — browser tidak punya voice engine. Video juga muted karena `isMuted` state bergantung pada TTS.

## Solution

Ganti `BrowserSpeaker` dengan `AudioTtsSpeaker` — TTS via Google Translate endpoint menggunakan `<audio>` element. Approach sama dengan kompetitor yang sudah terbukti jalan di TV Bro.

## Architecture

```
AnnouncementEngine (unchanged)
  → Announcement { text, doctorId?, isPayment? }
    → AudioTtsSpeaker (new, replaces BrowserSpeaker)
        → split text per sentence if >200 char
        → per chunk: <audio src="google_tts_url"> → play
        → sequential playback, resolve on complete
    → ScreenRuntime (import updated only)
```

## Google TTS Endpoint

```
https://translate.google.com/translate_tts?ie=UTF-8&q={encodedText}&tl=id&client=tw-ob
```

- Free, no API key
- Rate limit: ~200 char per request
- Returns MP3 audio stream
- Stable for years (same endpoint used by competitors)

## File Changes

| File | Action |
|------|--------|
| `src/features/announcer/browser-speaker.ts` | Delete |
| `src/features/announcer/audio-tts-speaker.ts` | New |
| `src/features/screen/components/screen-runtime.tsx` | Update import |

## AudioTtsSpeaker Design

### Interface (same as BrowserSpeaker)

```ts
type Announcement = {
  text: string;
  doctorId?: string;
  isPayment?: boolean;
};

class AudioTtsSpeaker {
  speak(announcement: Announcement): Promise<void>;
  constructor(onStateChange?: (state: SpeakerState) => void);
}
```

### Core Logic

1. **Text splitting**: `splitTextToChunks(text, maxLen=200)` — split per sentence boundary (`. `, `, `, `! `, `? `), fallback to hard split at maxLen
2. **Audio playback per chunk**: `new Audio(googleTtsUrl)` → `await playAudio(audioElement)` via `onended`/`onerror` promise
3. **Sequential queue**: Same queue pattern as BrowserSpeaker — flush queue, process one at a time
4. **Error handling**: `onerror` → skip chunk, continue to next. No silent failure — log via `onStateChange`

### Text Splitting Algorithm

```
splitTextToChunks(text, maxLen=200):
  sentences = text.split(/(?<=[.!?,])\s+/)
  chunks = []
  current = ""
  for sentence in sentences:
    if current.length + sentence.length + 1 > maxLen:
      if current: chunks.push(current)
      if sentence.length > maxLen:
        // hard split
        for i in range(0, sentence.length, maxLen):
          chunks.push(sentence.slice(i, i + maxLen))
        current = ""
      else:
        current = sentence
    else:
      current = current ? current + " " + sentence : sentence
  if current: chunks.push(current)
  return chunks
```

## Constraints

- Language: Bahasa Indonesia only (`tl=id`)
- Max text per announcement: ~300 characters
- Max chunk size: 200 characters (Google TTS limit)
- Browser compatibility: must work on TV Bro, Chrome, Safari, Firefox

## Out of Scope

- Video audio fix (separate issue — requires user interaction unlock for autoplay policy)
- Multi-language support
- Google Cloud TTS (official API with billing)
