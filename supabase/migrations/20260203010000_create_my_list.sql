create table if not exists my_list (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  media_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  media_details jsonb,
  added_at timestamptz not null default now(),
  
  unique(user_id, media_id, media_type)
);

create index if not exists idx_my_list_user_id on my_list(user_id);
create index if not exists idx_my_list_added_at on my_list(added_at desc);
