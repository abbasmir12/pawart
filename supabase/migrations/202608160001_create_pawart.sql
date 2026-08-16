create extension if not exists pgcrypto;

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  dog_name text not null check (char_length(dog_name) between 1 and 32),
  photo_path text not null,
  bark_audio_path text not null,
  energy integer not null check (energy between 0 and 100),
  pitch text not null,
  rhythm text not null,
  intensity text not null,
  bark_count integer not null default 0,
  pauses integer not null default 0,
  duration_seconds numeric(5,2) not null,
  art_style text not null,
  art_direction jsonb not null,
  generated_image_path text not null,
  created_at timestamptz not null default now()
);

alter table public.generations enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('dog-photos', 'dog-photos', false, 6291456, array['image/jpeg', 'image/png', 'image/webp']),
  ('bark-recordings', 'bark-recordings', false, 4194304, array['audio/m4a', 'audio/mp4', 'audio/aac', 'audio/webm']),
  ('pawart-results', 'pawart-results', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anonymous dog photo uploads" on storage.objects;
create policy "anonymous dog photo uploads"
on storage.objects for insert to anon
with check (
  bucket_id = 'dog-photos'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "anonymous bark uploads" on storage.objects;
create policy "anonymous bark uploads"
on storage.objects for insert to anon
with check (
  bucket_id = 'bark-recordings'
  and lower(storage.extension(name)) in ('m4a', 'mp4', 'aac', 'webm')
);

comment on table public.generations is
  'PawArt generation metadata. Source media is private and accessed only by the Edge Function.';
