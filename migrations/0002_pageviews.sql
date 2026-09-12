-- unowned: no user_id. pageviews + heartbeats of anonymous sessions.
create table if not exists pageviews (
  path text primary key,
  n integer not null default 0
);

create table if not exists presence_heartbeats (
  session_key text not null,
  path text not null,
  seen_at timestamptz not null default now(),
  primary key (session_key, path)
);

create index if not exists presence_heartbeats_path_seen_idx
  on presence_heartbeats (path, seen_at);
