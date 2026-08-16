# Every Bark Becomes Art: I Built PawArt with Google Gemini

> Submission for the DEV Weekend Challenge: Dog Days Edition — Best Use of Google AI

## What I built

PawArt is a mobile creative studio for dogs. You take a photo, record a 3–10 second bark, and receive a recognizable AI-generated portrait whose palette, composition, brushwork, and visual intensity are shaped by that particular recording.

**Demo:** _Add video or live demo URL_

**Repository:** _Add repository URL_

## Why I built it

AI pet portraits are fun, but the prompt usually comes entirely from the human. I wanted the dog to contribute something genuinely unique. A bark has measurable character—pitch, intensity, timing, pauses, and energy—so PawArt turns those traits into creative constraints.

It is important that PawArt does not pretend to decode what a dog thinks or feels. It analyzes sound only, and the interface says this plainly.

## How it works

The Expo app captures a dog photo and a short recording, then uploads both to private Supabase Storage. A Supabase Edge Function sends the audio and image to Gemini 3.6 Flash with a strict structured-output schema. Gemini returns acoustic traits and an art direction such as:

```text
Style: expressive impressionist painting
Palette: warm gold, orange, and crimson
Composition: energetic and dynamic
Brushwork: sweeping and bold
Background: dreamy natural environment
Visual intensity: high
```

The function then sends the original dog photo and that direction to Gemini 3.1 Flash Image. The prompt explicitly preserves the dog's face, markings, coat, ears, and proportions. The result is stored privately and returned through a signed URL.

```text
Expo → Supabase Storage → Edge Function
     → Gemini bark analysis → structured art direction
     → Gemini image generation → Supabase → Expo
```

## Bark-to-art mapping

- High energy → dynamic composition
- Low energy → calm, spacious composition
- High pitch → brighter palette
- Low pitch → deeper colors
- Rapid rhythm → energetic brushwork
- Slow rhythm → softer brushwork
- Strong intensity → bold contrast
- Gentle intensity → subtle textures

This makes two recordings of the same dog produce meaningfully different visual treatments.

## The details I cared about

- A live microphone waveform instead of a static recording screen
- Automatic recording cutoff at ten seconds
- Playback and retry before spending an AI request
- Story-like progress messages instead of a generic spinner
- Visible acoustic traits on the reveal screen
- Save, share, and bark replay actions
- Private source media and server-only Google credentials
- A clear, repeated boundary against emotion or thought translation claims

## What I learned

Multimodal AI becomes much more compelling when each modality has a clear job. Audio does not go directly into image generation here. It first becomes a transparent, structured creative direction; the image model then combines that direction with the visual reference. That separation made the result easier to explain, debug, and trust.

## Built with

- Expo / React Native / TypeScript
- Supabase Database, Storage, and Edge Functions
- Google Gemini 3.6 Flash
- Google Gemini 3.1 Flash Image

## AI disclosure

AI-assisted development was used during implementation. The PawArt app mark was generated for this project with OpenAI image generation. PawArt's core experience uses the official Google Gemini API. No existing application code was reused.

#weekendchallenge #googleai #reactnative #supabase
