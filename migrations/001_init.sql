create table if not exists events (
  id integer primary key check (id = 1),
  title text not null,
  host_name text not null,
  message text not null,
  starts_at text not null,
  place text not null,
  host_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invitees (
  id bigint generated always as identity primary key,
  name text not null,
  name_key text not null unique,
  status text not null check (status in ('yes', 'no', 'maybe')),
  additional_guests integer not null default 0 check (additional_guests >= 0 and additional_guests <= 20),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
