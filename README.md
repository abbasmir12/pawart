# PawArt

### Every bark becomes art.

**Your dog. Their bark. Their masterpiece.**

PawArt is a polished Expo app that turns a dog's photo and a 3–10 second bark recording into a recognizable, one-of-a-kind artwork. Google Gemini analyzes measurable audio traits—not thoughts or emotions—and maps them to palette, composition, brushwork, contrast, and texture before generating the portrait.

Built for the **DEV Weekend Challenge: Dog Days Edition** and the **Best Use of Google AI** category.

## The experience

1. Pick or capture a clear dog photo.
2. Record a short bark with a real-time microphone waveform.
3. Watch PawArt interpret energy, pitch, rhythm, intensity, bark count, and pauses.
4. Gemini creates a structured art direction from those acoustic traits.
5. Gemini image generation preserves the dog's appearance while painting the bark-driven direction.
6. Save, share, replay the bark, or create another piece.

PawArt never claims to translate a dog's feelings, intentions, or thoughts.

## Stack

- Expo SDK 54, React Native, TypeScript
- `expo-audio`, `expo-image-picker`, Media Library, and native sharing
- Supabase Postgres, private Storage, and Edge Functions
- Google Gemini 3.7 Flash for multimodal bark analysis
- Google Gemini 3.1 Flash Image (Nano Banana 2) for reference-preserving artwork generation

## Architecture

```text
Expo mobile app
  ├─ dog photo ──────────────→ private Supabase Storage
  └─ 3–10 second bark ───────→ private Supabase Storage
                                      ↓
                              Supabase Edge Function
                                      ↓
                       Gemini multimodal audio analysis
                                      ↓
                         structured artistic direction
                                      ↓
                    Gemini image editing + dog reference
                                      ↓
                  private result + generation metadata
                                      ↓
                         signed URL → result screen
```

The Google AI key exists only as a Supabase Edge Function secret. It is never bundled into the Expo application.

## Run locally

Requirements: Node.js LTS, npm, Expo Go, a Supabase project, and a Google AI API key.

```bash
npm install
cp .env.example .env
npm start
```

Add your Supabase URL and publishable key to `.env`. These values are designed to be public client configuration; never add the Google AI API key there.

## Configure Supabase

Link the intended project, apply the schema, add the server secret, and deploy:

```bash
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npx supabase@latest db push
npx supabase@latest secrets set GOOGLE_AI_API_KEY=YOUR_GOOGLE_AI_API_KEY
npx supabase@latest functions deploy generate-pawart --no-verify-jwt
```

The migration creates:

- Private `dog-photos`, `bark-recordings`, and `pawart-results` buckets
- A private, RLS-enabled `generations` metadata table
- Narrow anonymous insert policies for only the two input buckets
- File type and size limits suitable for this short-form flow

For a public production launch, add anonymous abuse prevention/rate limiting and automated source-media cleanup. The current policy is intentionally scoped to a hackathon MVP with no authentication.

## Security model

- `GOOGLE_AI_API_KEY` is read only from Edge Function secrets.
- The mobile app can upload accepted photo/audio types but cannot read private input buckets.
- Database writes and reads are performed by the server-side client.
- Generated results are delivered with a six-hour signed URL.
- Server input validation limits names, formats, paths, and recording duration.

## Useful commands

```bash
npm run typecheck
npm run check
npm start -- --clear
```

## Project layout

```text
src/
  components/        Reusable native UI and waveform
  lib/               Supabase client and generation workflow
  screens/           Welcome, photo, bark, generation, result
supabase/
  migrations/        Database, storage, and RLS setup
  functions/         Secure Google AI orchestration
assets/
  brand/             Original PawArt app mark
  inspiration/       Non-shipping design reference
docs/
  DEMO_SCRIPT.md      Fast judging/demo walkthrough
  DEV_SUBMISSION.md   Submission draft
```

## AI and design disclosure

AI-assisted development was used to help build PawArt. The PawArt app icon was generated specifically for this project using OpenAI image generation. The product itself uses the official Google Gemini API for bark analysis and artwork generation. Generated artworks include Google's SynthID watermarking.

The visual direction was inspired by a publicly shared Dribbble pet-app composition. The downloaded image in `assets/inspiration` is retained only as an internal reference and is not shipped in the app. PawArt's screens, product flow, copy, components, and brand asset are original project work.
