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
  description text,
  video_url text not null,
  thumbnail_url text,
  category text,
  subcategory text,
  privacy text default 'public',
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

-- Ensure columns exist if tables were already created
do $$ 
begin
  -- Profiles
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='username') then
    alter table public.profiles add column username text unique;
  end if;

  -- Videos
  if not exists (select 1 from information_schema.columns where table_name='videos' and column_name='creator_name') then
    alter table public.videos add column creator_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='videos' and column_name='creator_avatar') then
    alter table public.videos add column creator_avatar text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='videos' and column_name='likes_count') then
    alter table public.videos add column likes_count integer default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='videos' and column_name='privacy') then
    alter table public.videos add column privacy text default 'public';
  end if;

  -- Clips
  if not exists (select 1 from information_schema.columns where table_name='clips' and column_name='creator_name') then
    alter table public.clips add column creator_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='clips' and column_name='creator_avatar') then
    alter table public.clips add column creator_avatar text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='clips' and column_name='likes_count') then
    alter table public.clips add column likes_count integer default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='clips' and column_name='privacy') then
    alter table public.clips add column privacy text default 'public';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='clips' and column_name='description') then
    alter table public.clips add column description text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='clips' and column_name='category') then
    alter table public.clips add column category text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='clips' and column_name='subcategory') then
    alter table public.clips add column subcategory text;
  end if;

  -- Posts
  if not exists (select 1 from information_schema.columns where table_name='posts' and column_name='privacy') then
    alter table public.posts add column privacy text default 'public';
  end if;

  -- Update any existing NULL privacy values to 'public' so they appear in feeds
  update public.videos set privacy = 'public' where privacy is null;
  update public.clips set privacy = 'public' where privacy is null;
  update public.posts set privacy = 'public' where privacy is null;
end $$;

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
drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles" on public.profiles for select using (true);

drop policy if exists "Public read videos" on public.videos;
create policy "Public read videos" on public.videos for select using (privacy in ('public', 'unlisted') or auth.uid() = creator_id);

drop policy if exists "Public read clips" on public.clips;
create policy "Public read clips" on public.clips for select using (privacy in ('public', 'unlisted') or auth.uid() = creator_id);

drop policy if exists "Public read posts" on public.posts;
create policy "Public read posts" on public.posts for select using (privacy in ('public', 'unlisted') or auth.uid() = creator_id);

drop policy if exists "Public read ads" on public.ads;
create policy "Public read ads" on public.ads for select using (true);

drop policy if exists "Public read courses" on public.courses;
create policy "Public read courses" on public.courses for select using (true);

drop policy if exists "Public read communities" on public.communities;
create policy "Public read communities" on public.communities for select using (true);

drop policy if exists "Public read comments" on public.comments;
create policy "Public read comments" on public.comments for select using (true);

drop policy if exists "Public read follows" on public.follows;
create policy "Public read follows" on public.follows for select using (true);

-- PRIVATE READ POLICIES (Owner only)
drop policy if exists "Owner read history" on public.watch_history;
create policy "Owner read history" on public.watch_history for select using (auth.uid() = user_id);

drop policy if exists "Owner read watch later" on public.watch_later;
create policy "Owner read watch later" on public.watch_later for select using (auth.uid() = user_id);

drop policy if exists "Owner read notes" on public.notes;
create policy "Owner read notes" on public.notes for select using (auth.uid() = user_id);

drop policy if exists "Owner read likes" on public.likes;
create policy "Owner read likes" on public.likes for select using (auth.uid() = user_id);

drop policy if exists "Owner read accounts" on public.user_accounts;
create policy "Owner read accounts" on public.user_accounts for select using (auth.uid() = user_id);

-- PLAYLISTS POLICY (Owner or Public)
drop policy if exists "Viewable playlists" on public.playlists;
create policy "Viewable playlists" on public.playlists 
for select using (auth.uid() = user_id or is_public = true);

-- WRITE POLICIES (Authenticated Users)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can manage own videos" on public.videos;
create policy "Users can manage own videos" on public.videos for all using (auth.uid() = creator_id);

drop policy if exists "Users can manage own clips" on public.clips;
create policy "Users can manage own clips" on public.clips for all using (auth.uid() = creator_id);

drop policy if exists "Users can manage own posts" on public.posts;
create policy "Users can manage own posts" on public.posts for all using (auth.uid() = creator_id);

drop policy if exists "Users can manage own courses" on public.courses;
create policy "Users can manage own courses" on public.courses for all using (auth.uid() = creator_id);

drop policy if exists "Users can manage own communities" on public.communities;
create policy "Users can manage own communities" on public.communities for all using (auth.uid() = creator_id);

drop policy if exists "Users can manage own playlists" on public.playlists;
create policy "Users can manage own playlists" on public.playlists for all using (auth.uid() = user_id);

drop policy if exists "Users can manage own playlist items" on public.playlist_items;
create policy "Users can manage own playlist items" on public.playlist_items for all 
using (exists (select 1 from public.playlists where id = playlist_id and user_id = auth.uid()));

drop policy if exists "Users can manage own likes" on public.likes;
create policy "Users can manage own likes" on public.likes for all using (auth.uid() = user_id);

drop policy if exists "Users can manage own history" on public.watch_history;
create policy "Users can manage own history" on public.watch_history for all using (auth.uid() = user_id);

drop policy if exists "Users can manage own watch later" on public.watch_later;
create policy "Users can manage own watch later" on public.watch_later for all using (auth.uid() = user_id);

drop policy if exists "Users can manage own notes" on public.notes;
create policy "Users can manage own notes" on public.notes for all using (auth.uid() = user_id);

drop policy if exists "Users can manage own comments" on public.comments;
create policy "Users can manage own comments" on public.comments for all using (auth.uid() = author_id);

drop policy if exists "Users can manage own follows" on public.follows;
create policy "Users can manage own follows" on public.follows for all using (auth.uid() = follower_id);

-- Direct Messages
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid (),
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- AI Chats
create table if not exists public.ai_chats (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

-- AI Chat Messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid (),
  chat_id uuid not null references public.ai_chats (id) on delete cascade,
  role text not null, -- 'user' or 'assistant'
  content text not null,
  created_at timestamptz not null default now()
);

-- Video Summaries
create table if not exists public.video_summaries (
  id uuid primary key default gen_random_uuid (),
  video_id uuid not null references public.videos (id) on delete cascade,
  summary text not null,
  created_at timestamptz not null default now()
);

-- Groups/Communities (Already have communities, but entities.js uses groups)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid (),
  creator_id uuid not null references auth.users (id) on delete cascade,
  name text not null unique,
  description text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Forum Posts
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid (),
  group_id uuid not null references public.groups (id) on delete cascade,
  creator_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Wishlists
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_name text not null,
  product_url text,
  created_at timestamptz not null default now()
);

-- Enable RLS on new tables
alter table public.direct_messages enable row level security;
alter table public.ai_chats enable row level security;
alter table public.chat_messages enable row level security;
alter table public.video_summaries enable row level security;
alter table public.groups enable row level security;
alter table public.forum_posts enable row level security;
alter table public.wishlists enable row level security;

-- Basic RLS Policies for new tables
drop policy if exists "Users can manage own DMs" on public.direct_messages;
create policy "Users can manage own DMs" on public.direct_messages for all using (auth.uid() in (sender_id, receiver_id));

drop policy if exists "Users can manage own AI chats" on public.ai_chats;
create policy "Users can manage own AI chats" on public.ai_chats for all using (auth.uid() = user_id);

drop policy if exists "Users can manage own chat messages" on public.chat_messages;
create policy "Users can manage own chat messages" on public.chat_messages for all using (exists (select 1 from public.ai_chats where id = chat_id and user_id = auth.uid()));

drop policy if exists "Public read video summaries" on public.video_summaries;
create policy "Public read video summaries" on public.video_summaries for select using (true);

drop policy if exists "Public read groups" on public.groups;
create policy "Public read groups" on public.groups for select using (true);

drop policy if exists "Public read forum posts" on public.forum_posts;
create policy "Public read forum posts" on public.forum_posts for select using (true);

drop policy if exists "Users can manage own wishlists" on public.wishlists;
create policy "Users can manage own wishlists" on public.wishlists for all using (auth.uid() = user_id);

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
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id in ('videos', 'clips', 'thumbnails', 'avatars', 'ads', 'courses', 'communities', 'posts') );

-- 2. Authenticated Upload
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload" 
on storage.objects for insert 
with check ( auth.role() = 'authenticated' );

-- 3. Owner Delete/Update
drop policy if exists "Owner Manage" on storage.objects;
create policy "Owner Manage" 
on storage.objects for all 
using ( auth.uid() = owner );
