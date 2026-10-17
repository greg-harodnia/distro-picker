-- Distro likes.
--
-- The anon role may only read this table: like counts are changed through the
-- atomic `increment_distro_likes()` function in `0004_atomic_counters.sql`
-- rather than by direct UPDATEs from the client.

create table if not exists distros (
  id text primary key,
  likes integer not null default 0
);

-- Older projects created this table without a default; make it safe to upsert.
alter table distros add column if not exists likes integer not null default 0;

alter table distros enable row level security;

drop policy if exists "anon_read_distros" on distros;
create policy "anon_read_distros" on distros
  for select using (true);
