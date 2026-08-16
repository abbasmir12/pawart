import { decode } from 'base64-arraybuffer';
import { randomUUID } from 'expo-crypto';
import { File } from 'expo-file-system';

import type { GenerationResult, PawArtDraft, SelectedPhoto } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

function extensionFor(mimeType: string, fallback: string) {
  const known: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'audio/m4a': 'm4a',
    'audio/mp4': 'm4a',
    'audio/aac': 'aac',
    'audio/webm': 'webm',
  };
  return known[mimeType] ?? fallback;
}

async function uploadLocalFile(
  bucket: string,
  path: string,
  uri: string,
  contentType: string,
) {
  const file = new File(uri);
  const base64 = await file.base64();
  const { error } = await supabase.storage.from(bucket).upload(path, decode(base64), {
    contentType,
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);
}

export async function generatePawArt(draft: PawArtDraft): Promise<GenerationResult> {
  if (!isSupabaseConfigured) {
    throw new Error('Add your Supabase URL and publishable key to .env before generating.');
  }
  if (!draft.photo || !draft.barkUri) {
    throw new Error('A dog photo and bark recording are required.');
  }

  const requestId = randomUUID();
  const photoExt = extensionFor(draft.photo.mimeType, 'jpg');
  const audioMimeType = draft.barkUri.endsWith('.webm') ? 'audio/webm' : 'audio/m4a';
  const audioExt = extensionFor(audioMimeType, 'm4a');
  const photoPath = `${requestId}/dog.${photoExt}`;
  const audioPath = `${requestId}/bark.${audioExt}`;

  await Promise.all([
    uploadLocalFile('dog-photos', photoPath, draft.photo.uri, draft.photo.mimeType),
    uploadLocalFile('bark-recordings', audioPath, draft.barkUri, audioMimeType),
  ]);

  const { data, error } = await supabase.functions.invoke('generate-pawart', {
    body: {
      dogName: draft.dogName.trim() || 'My Dog',
      photoPath,
      photoMimeType: draft.photo.mimeType,
      audioPath,
      audioMimeType,
      durationMs: draft.barkDurationMs,
    },
  });

  if (error) throw new Error(error.message || 'PawArt generation failed.');
  if (data?.error) throw new Error(data.error);
  return data as GenerationResult;
}

export async function removeUploadedDraft(photoPath: string, audioPath: string) {
  await Promise.allSettled([
    supabase.storage.from('dog-photos').remove([photoPath]),
    supabase.storage.from('bark-recordings').remove([audioPath]),
  ]);
}

export function normalizePhoto(asset: {
  uri: string;
  mimeType?: string | null;
  width: number;
  height: number;
}): SelectedPhoto {
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
    width: asset.width,
    height: asset.height,
  };
}
