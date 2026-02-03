create table if not exists watch_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null, -- Client-generated UUID
  media_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  season integer default 0, -- 0 for movies
  episode integer default 0, -- 0 for movies
  progress float not null default 0,
  timestamp float not null default 0,
  duration float not null default 0,
  last_watched timestamptz not null default now(),
  media_details jsonb,
  
  unique(user_id, media_id, season, episode)
);

create index if not exists idx_watch_history_user_id on watch_history(user_id);
create index if not exists idx_watch_history_last_watched on watch_history(last_watched desc);
