-- Blog post views & likes.
-- The client (anon key) reads/writes counters directly, matching the existing
-- `distros`-likes pattern. Upserts rely on INSERT + UPDATE.

create table if not exists blog_posts (
  slug text primary key,
  views integer not null default 0,
  likes integer not null default 0
);

alter table blog_posts enable row level security;

drop policy if exists "anon_read_blog_posts" on blog_posts;
create policy "anon_read_blog_posts" on blog_posts
  for select using (true);

drop policy if exists "anon_insert_blog_posts" on blog_posts;
create policy "anon_insert_blog_posts" on blog_posts
  for insert with check (true);

drop policy if exists "anon_update_blog_posts" on blog_posts;
create policy "anon_update_blog_posts" on blog_posts
  for update using (true) with check (true);
