-- Supabase setup for AutoPod.
-- Reconstructed from what backend/src/controllers/podcast.controller.ts reads and
-- writes; the original project's exact schema is not in the repo.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.

-- 1. Metadata table -------------------------------------------------------
create table if not exists public.podcasts (
  id          bigint generated always as identity primary key,
  created_at  date        not null default current_date,
  title       text        not null,
  description text,
  duration    integer     not null check (duration in (5, 10)),
  style       text        not null,
  url         text        not null,            -- path inside the storage bucket
  author      uuid        not null default auth.uid() references auth.users (id) on delete cascade
);

create index if not exists podcasts_author_created_idx
  on public.podcasts (author, created_at desc);

-- 2. Row Level Security: a user can only see and add their own rows --------
alter table public.podcasts enable row level security;

drop policy if exists "podcasts_select_own" on public.podcasts;
create policy "podcasts_select_own" on public.podcasts
  for select to authenticated
  using (author = (select auth.uid()));

drop policy if exists "podcasts_insert_own" on public.podcasts;
create policy "podcasts_insert_own" on public.podcasts
  for insert to authenticated
  with check (author = (select auth.uid()));

-- 3. Private storage bucket for the MP3s ----------------------------------
insert into storage.buckets (id, name, public)
values ('podcasts', 'podcasts', false)
on conflict (id) do nothing;

-- Files are stored at podcasts/<user id>/<title>.mp3, so the second path
-- segment must be the caller's own user id.
drop policy if exists "podcast_audio_select_own" on storage.objects;
create policy "podcast_audio_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'podcasts' and (storage.foldername(name))[2] = (select auth.uid())::text);

drop policy if exists "podcast_audio_insert_own" on storage.objects;
create policy "podcast_audio_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'podcasts' and (storage.foldername(name))[2] = (select auth.uid())::text);

-- The backend uploads with upsert, which needs update on an existing file.
drop policy if exists "podcast_audio_update_own" on storage.objects;
create policy "podcast_audio_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'podcasts' and (storage.foldername(name))[2] = (select auth.uid())::text)
  with check (bucket_id = 'podcasts' and (storage.foldername(name))[2] = (select auth.uid())::text);
