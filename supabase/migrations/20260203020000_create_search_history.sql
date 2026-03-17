create table if not exists search_history (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  query text not null,
  searched_at timestamptz not null default now(),
  
  unique(user_id, query)
);

create index if not exists idx_search_history_user_id on search_history(user_id);
create index if not exists idx_search_history_searched_at on search_history(searched_at desc);
