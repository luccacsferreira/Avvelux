-- ==========================================
-- 1. TABLES DEFINITION (PUBLIC DATA)
-- ==========================================

-- Profiles (Publicly viewable)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Videos (Publicly viewable)
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid (),
  creator_id uuid not null references auth.users (id) on delete cascade,
  creator_name text,
  creator_avatar text,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  category text,
  subcategory text,
  privacy text default 'public', -- 'public' or 'private'
  views integer default 0,
  likes_count integer default 0,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clips (Publicly viewable)
create table if not exists public.clips (
  id uuid primary key default gen_random_uuid (),
  creator_id uuid not null references auth.users (id) on delete cascade,
  creator_name text,
  creator_avatar text,
  title text not null,
  video_url text not null,
  thumbnail_url text,
  views integer default 0,
  likes_count integer default 0,
  created_at timestamptz not null default now()
);

-- Posts (Publicly viewable)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid (),
  creator_id uuid not null references auth.users (id) on delete cascade,
  creator_name text,
  creator_avatar text,
  title text not null,
  content text,
  image_url text,
  is_poll boolean default false,
  poll_options jsonb default '[]'::jsonb,
  likes_count integer default 0,
  comments_count integer default 0,
  privacy text default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ads (Publicly viewable)
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid (),
  title text,
  video_url text,
  thumbnail_url text,
  link_url text,
  created_at timestamptz not null default now()
);

-- Courses (Publicly viewable)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid (),
  creator_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  thumbnail_url text,
  price decimal(10,2) default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Communities (Publicly viewable)
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid (),
  creator_id uuid not null references auth.users (id) on delete cascade,
  name text not null unique,
  description text,
  avatar_url text,
  banner_url text,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 2. TABLES DEFINITION (PRIVATE / USER DATA)
-- ==========================================

-- Playlists (Private by default, can be public)
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  is_public boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Playlist Items
create table if not exists public.playlist_items (
  id uuid primary key default gen_random_uuid (),
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  content_id uuid not null, -- ID of video or clip
  content_type text not null, -- 'video' or 'clip'
  added_at timestamptz not null default now()
);

-- Liked Content (Private)
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null,
  content_type text not null, -- 'video', 'clip', 'post'
  created_at timestamptz not null default now(),
  unique(user_id, content_id)
);

-- Watch History (Private)
create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null,
  content_type text not null,
  watched_at timestamptz not null default now()
);

-- Watch Later (Private)
create table if not exists public.watch_later (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null,
  content_type text not null,
  created_at timestamptz not null default now(),
  unique(user_id, content_id)
);

-- Notes (Private)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id uuid references public.videos (id) on delete cascade,
  title text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments (Publicly viewable)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid (),
  video_id uuid not null references public.videos (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);

-- Follows
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid (),
  follower_id uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id)
);

-- Device/Account Mapping (Private - tracks accounts used on a device)
create table if not exists public.user_accounts (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id text not null,
  last_login timestamptz not null default now(),
  unique(user_id, device_id)
);

-- ==========================================
-- 3. AUTH TRIGGERS
-- ==========================================

-- Function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, username, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    ''
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 4. SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.clips enable row level security;
alter table public.posts enable row level security;
alter table public.ads enable row level security;
alter table public.courses enable row level security;
alter table public.communities enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;
alter table public.likes enable row level security;
alter table public.watch_history enable row level security;
alter table public.watch_later enable row level security;
alter table public.notes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.user_accounts enable row level security;

-- PUBLIC READ POLICIES
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Public read videos" on public.videos for select using (true);
create policy "Public read clips" on public.clips for select using (true);
create policy "Public read posts" on public.posts for select using (true);
create policy "Public read ads" on public.ads for select using (true);
create policy "Public read courses" on public.courses for select using (true);
create policy "Public read communities" on public.communities for select using (true);
create policy "Public read comments" on public.comments for select using (true);
create policy "Public read follows" on public.follows for select using (true);

-- PRIVATE READ POLICIES (Owner only)
create policy "Owner read history" on public.watch_history for select using (auth.uid() = user_id);
create policy "Owner read watch later" on public.watch_later for select using (auth.uid() = user_id);
create policy "Owner read notes" on public.notes for select using (auth.uid() = user_id);
create policy "Owner read likes" on public.likes for select using (auth.uid() = user_id);
create policy "Owner read accounts" on public.user_accounts for select using (auth.uid() = user_id);

-- PLAYLISTS POLICY (Owner or Public)
create policy "Viewable playlists" on public.playlists 
for select using (auth.uid() = user_id or is_public = true);

-- WRITE POLICIES (Authenticated Users)
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can manage own videos" on public.videos for all using (auth.uid() = creator_id);
create policy "Users can manage own clips" on public.clips for all using (auth.uid() = creator_id);
create policy "Users can manage own posts" on public.posts for all using (auth.uid() = creator_id);
create policy "Users can manage own courses" on public.courses for all using (auth.uid() = creator_id);
create policy "Users can manage own communities" on public.communities for all using (auth.uid() = creator_id);
create policy "Users can manage own playlists" on public.playlists for all using (auth.uid() = user_id);
create policy "Users can manage own playlist items" on public.playlist_items for all 
using (exists (select 1 from public.playlists where id = playlist_id and user_id = auth.uid()));
create policy "Users can manage own likes" on public.likes for all using (auth.uid() = user_id);
create policy "Users can manage own history" on public.watch_history for all using (auth.uid() = user_id);
create policy "Users can manage own watch later" on public.watch_later for all using (auth.uid() = user_id);
create policy "Users can manage own notes" on public.notes for all using (auth.uid() = user_id);
create policy "Users can manage own comments" on public.comments for all using (auth.uid() = author_id);
create policy "Users can manage own follows" on public.follows for all using (auth.uid() = follower_id);

-- ==========================================
-- 5. STORAGE BUCKETS SETUP
-- ==========================================

-- Create the buckets
insert into storage.buckets (id, name, public)
values 
  ('videos', 'videos', true),
  ('clips', 'clips', true),
  ('thumbnails', 'thumbnails', true),
  ('avatars', 'avatars', true),
  ('ads', 'ads', true),
  ('courses', 'courses', true),
  ('communities', 'communities', true),
  ('posts', 'posts', true)
on conflict (id) do nothing;

-- STORAGE POLICIES
-- 1. Public Read Access
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id in ('videos', 'clips', 'thumbnails', 'avatars', 'ads', 'courses', 'communities', 'posts') );

-- 2. Authenticated Upload
create policy "Authenticated Upload" 
on storage.objects for insert 
with check ( auth.role() = 'authenticated' );

-- 3. Owner Delete/Update
create policy "Owner Manage" 
on storage.objects for all 
using ( auth.uid() = owner );
