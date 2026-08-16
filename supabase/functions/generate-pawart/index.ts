import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type RequestBody = {
  dogName: string;
  photoPath: string;
  photoMimeType: string;
  audioPath: string;
  audioMimeType: string;
  durationMs: number;
};

type BarkAnalysis = {
  energy: number;
  pitch: 'Low' | 'Medium Low' | 'Medium' | 'Medium High' | 'High';
  rhythm: 'Slow' | 'Steady' | 'Varied' | 'Rapid';
  intensity: 'Gentle' | 'Moderate' | 'Strong';
  bark_count: number;
  pauses: number;
  duration_seconds: number;
  art_direction: {
    style: string;
    palette: string;
    composition: string;
    brushwork: string;
    background: string;
    visual_intensity: string;
    descriptors: string[];
  };
};

const ANALYSIS_PROMPT = (dogName: string) =>
  `Analyze this short dog bark recording strictly as sound. Measure pitch range, acoustic intensity, temporal rhythm, distinct bark count, pauses, duration, and overall energy. Do not infer, diagnose, or claim to translate the dog's emotions, needs, thoughts, or intent. Then map only those acoustic traits into an original fine-art direction for a recognizable portrait of ${dogName}. High energy means dynamic composition; low energy means calm composition; high pitch means a brighter palette; low pitch means deeper colors; rapid rhythm means energetic brushwork; slow rhythm means spacious softness; strong intensity means bold contrast; gentle intensity means subtle texture. Return exactly the requested structure. Descriptors must be three concise, title-cased adjectives.`;

const analysisSchema = {
  type: 'object',
  properties: {
    energy: { type: 'integer', minimum: 0, maximum: 100, description: 'Overall acoustic energy, normalized 0 to 100.' },
    pitch: { type: 'string', enum: ['Low', 'Medium Low', 'Medium', 'Medium High', 'High'] },
    rhythm: { type: 'string', enum: ['Slow', 'Steady', 'Varied', 'Rapid'] },
    intensity: { type: 'string', enum: ['Gentle', 'Moderate', 'Strong'] },
    bark_count: { type: 'integer', minimum: 0 },
    pauses: { type: 'integer', minimum: 0 },
    duration_seconds: { type: 'number', minimum: 0 },
    art_direction: {
      type: 'object',
      properties: {
        style: { type: 'string' },
        palette: { type: 'string' },
        composition: { type: 'string' },
        brushwork: { type: 'string' },
        background: { type: 'string' },
        visual_intensity: { type: 'string' },
        descriptors: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
      },
      required: ['style', 'palette', 'composition', 'brushwork', 'background', 'visual_intensity', 'descriptors'],
      additionalProperties: false,
    },
  },
  required: ['energy', 'pitch', 'rhythm', 'intensity', 'bark_count', 'pauses', 'duration_seconds', 'art_direction'],
  additionalProperties: false,
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function extractText(interaction: Record<string, unknown>) {
  if (typeof interaction.output_text === 'string') return interaction.output_text;
  const steps = Array.isArray(interaction.steps) ? interaction.steps : [];
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    const step = steps[index] as { type?: string; content?: Array<{ type?: string; text?: string }> };
    if (step.type !== 'model_output' || !Array.isArray(step.content)) continue;
    const text = step.content.filter((block) => block.type === 'text').map((block) => block.text ?? '').join('');
    if (text) return text;
  }
  throw new Error('Gemini returned no text analysis.');
}

function extractImage(interaction: Record<string, unknown>) {
  const direct = interaction.output_image as { data?: string; mime_type?: string } | undefined;
  if (direct?.data) return { data: direct.data, mimeType: direct.mime_type ?? 'image/jpeg' };
  const steps = Array.isArray(interaction.steps) ? interaction.steps : [];
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    const step = steps[index] as { type?: string; content?: Array<{ type?: string; data?: string; mime_type?: string }> };
    const image = step.content?.find((block) => block.type === 'image' && block.data);
    if (image?.data) return { data: image.data, mimeType: image.mime_type ?? 'image/jpeg' };
  }
  throw new Error('Gemini returned no generated artwork.');
}

async function callGemini(apiKey: string, body: Record<string, unknown>) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    const detail = payload?.error?.message ?? `Google AI request failed (${response.status}).`;
    throw new Error(detail);
  }
  return payload as Record<string, unknown>;
}

function validateBody(value: unknown): RequestBody {
  const body = value as Partial<RequestBody>;
  if (!body || typeof body.dogName !== 'string' || !body.dogName.trim() || body.dogName.length > 32) throw new Error('Invalid dog name.');
  if (typeof body.photoPath !== 'string' || !body.photoPath.includes('/')) throw new Error('Invalid photo path.');
  if (typeof body.audioPath !== 'string' || !body.audioPath.includes('/')) throw new Error('Invalid audio path.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(body.photoMimeType ?? '')) throw new Error('Unsupported photo format.');
  if (!['audio/m4a', 'audio/mp4', 'audio/aac', 'audio/webm'].includes(body.audioMimeType ?? '')) throw new Error('Unsupported audio format.');
  if (typeof body.durationMs !== 'number' || body.durationMs < 2500 || body.durationMs > 11000) throw new Error('Bark recording must be 3–10 seconds.');
  return body as RequestBody;
}

function getSupabaseServerKey() {
  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacyKey) return legacyKey;

  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (!secretKeys) return null;
  try {
    const parsed = JSON.parse(secretKeys) as Record<string, string>;
    return parsed.default ?? Object.values(parsed)[0] ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const body = validateBody(await request.json());
    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = getSupabaseServerKey();
    if (!googleApiKey || !supabaseUrl || !serviceKey) throw new Error('Server secrets are not configured.');

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const [photoDownload, audioDownload] = await Promise.all([
      admin.storage.from('dog-photos').download(body.photoPath),
      admin.storage.from('bark-recordings').download(body.audioPath),
    ]);
    if (photoDownload.error) throw photoDownload.error;
    if (audioDownload.error) throw audioDownload.error;

    const [photoBytes, audioBytes] = await Promise.all([
      photoDownload.data.arrayBuffer().then((buffer) => new Uint8Array(buffer)),
      audioDownload.data.arrayBuffer().then((buffer) => new Uint8Array(buffer)),
    ]);
    const photoBase64 = bytesToBase64(photoBytes);
    const audioBase64 = bytesToBase64(audioBytes);

    const analysisText = extractText(await callGemini(googleApiKey, {
      model: 'gemini-3.7-flash',
      input: [
        { type: 'text', text: ANALYSIS_PROMPT(body.dogName) },
        { type: 'audio', data: audioBase64, mime_type: body.audioMimeType },
        { type: 'image', data: photoBase64, mime_type: body.photoMimeType },
      ],
      response_format: { type: 'text', mime_type: 'application/json', schema: analysisSchema },
      generation_config: { temperature: 0.35 },
    }));

    const analysis = JSON.parse(analysisText) as BarkAnalysis;
    analysis.energy = Math.max(0, Math.min(100, Math.round(analysis.energy)));
    analysis.duration_seconds = Math.round((body.durationMs / 1000) * 10) / 10;

    const direction = analysis.art_direction;
    const imagePrompt = `Create a premium, gallery-worthy 4:5 portrait artwork of the exact dog in the supplied reference photo. Preserve the dog's recognizable identity: facial structure, muzzle, eyes, ears, coat colors, markings, and proportions. The bark recording produced this artistic direction: Style: ${direction.style}. Palette: ${direction.palette}. Composition: ${direction.composition}. Brushwork: ${direction.brushwork}. Background: ${direction.background}. Visual intensity: ${direction.visual_intensity}. Make the dog the clear hero, with an expressive handcrafted fine-art finish and sophisticated detail. No text, letters, frame, watermark, duplicate animals, accessories not present in the reference, or change of breed.`;

    const generated = extractImage(await callGemini(googleApiKey, {
      model: 'gemini-3.1-flash-image',
      input: [
        { type: 'text', text: imagePrompt },
        { type: 'image', data: photoBase64, mime_type: body.photoMimeType },
      ],
      response_format: { type: 'image', mime_type: 'image/jpeg', aspect_ratio: '4:5', image_size: '1K' },
    }));
    const resultBytes = Uint8Array.from(atob(generated.data), (character) => character.charCodeAt(0));
    const id = crypto.randomUUID();
    const resultPath = `${id}/masterpiece.jpg`;
    const upload = await admin.storage.from('pawart-results').upload(resultPath, resultBytes, {
      contentType: generated.mimeType,
      cacheControl: '3600',
      upsert: false,
    });
    if (upload.error) throw upload.error;

    const insert = await admin.from('generations').insert({
      id,
      dog_name: body.dogName.trim(),
      photo_path: body.photoPath,
      bark_audio_path: body.audioPath,
      energy: analysis.energy,
      pitch: analysis.pitch,
      rhythm: analysis.rhythm,
      intensity: analysis.intensity,
      bark_count: analysis.bark_count,
      pauses: analysis.pauses,
      duration_seconds: analysis.duration_seconds,
      art_style: direction.style,
      art_direction: direction,
      generated_image_path: resultPath,
    });
    if (insert.error) throw insert.error;

    const signed = await admin.storage.from('pawart-results').createSignedUrl(resultPath, 60 * 60 * 6);
    if (signed.error) throw signed.error;

    return json({
      id,
      dogName: body.dogName.trim(),
      imageUrl: signed.data.signedUrl,
      features: {
        energy: analysis.energy,
        pitch: analysis.pitch,
        rhythm: analysis.rhythm,
        intensity: analysis.intensity,
        barkCount: analysis.bark_count,
        pauses: analysis.pauses,
        durationSeconds: analysis.duration_seconds,
      },
      artDirection: {
        style: direction.style,
        palette: direction.palette,
        composition: direction.composition,
        brushwork: direction.brushwork,
        background: direction.background,
        visualIntensity: direction.visual_intensity,
        descriptors: direction.descriptors,
      },
    });
  } catch (error) {
    console.error('generate-pawart failed', error);
    return json({ error: error instanceof Error ? error.message : 'Generation failed.' }, 500);
  }
});
