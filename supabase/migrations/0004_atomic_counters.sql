-- Atomic blog view/like and distro like counters, plus tightened RLS.
--
-- Previously the client read a counter and wrote back an absolute value
-- (SELECT then UPDATE), which loses concurrent updates, and the anon role was
-- allowed to UPDATE any row to any value. Counters now move through
-- SECURITY DEFINER functions that apply a delta in a single statement, and the
-- anon role is left with read-only access to the underlying tables.
--
-- The anon key is public, so the functions clamp the caller's delta to a single
-- like/unlike and clamp the counter at 0. That limits the abuse to "one vote per
-- call", which is the same trust the UI already assumes.
--
-- Apply after 0001_blog_posts.sql and 0002_distros.sql.

-- 1. Counter functions -----------------------------------------------------

drop function if exists increment_blog_view(text);
create function increment_blog_view(p_slug text)
returns table (slug text, views integer, likes integer)
language sql
security definer
set search_path = public
as $$
  insert into blog_posts (slug, views, likes)
  values (p_slug, 1, 0)
  on conflict (slug) do update set views = blog_posts.views + 1
  returning blog_posts.slug, blog_posts.views, blog_posts.likes;
$$;

drop function if exists increment_blog_like(text, integer);
create function increment_blog_like(p_slug text, p_delta integer)
returns table (slug text, views integer, likes integer)
language sql
security definer
set search_path = public
as $$
  insert into blog_posts (slug, views, likes)
  values (p_slug, 0, greatest(least(greatest(p_delta, -1), 1), 0))
  on conflict (slug) do update
    set likes = greatest(blog_posts.likes + least(greatest(p_delta, -1), 1), 0)
  returning blog_posts.slug, blog_posts.views, blog_posts.likes;
$$;

drop function if exists increment_distro_likes(text, integer);
create function increment_distro_likes(p_id text, p_delta integer)
returns integer
language sql
security definer
set search_path = public
as $$
  update distros
     set likes = greatest(likes + least(greatest(p_delta, -1), 1), 0)
   where id = p_id
  returning likes;
$$;

-- Functions are executable by PUBLIC by default; revoke that and grant only to
-- the roles the app uses.
revoke all on function increment_blog_view(text) from public;
revoke all on function increment_blog_like(text, integer) from public;
revoke all on function increment_distro_likes(text, integer) from public;

grant execute on function increment_blog_view(text) to anon, authenticated;
grant execute on function increment_blog_like(text, integer) to anon, authenticated;
grant execute on function increment_distro_likes(text, integer) to anon, authenticated;

-- 2. Non-negative counters -------------------------------------------------
-- `not valid` keeps the migration from failing on counters that the old
-- client may have driven negative; the constraint is still enforced for every
-- subsequent insert/update.

alter table blog_posts drop constraint if exists blog_posts_views_nonnegative;
alter table blog_posts drop constraint if exists blog_posts_likes_nonnegative;
alter table blog_posts
  add constraint blog_posts_views_nonnegative check (views >= 0) not valid,
  add constraint blog_posts_likes_nonnegative check (likes >= 0) not valid;

alter table distros drop constraint if exists distros_likes_nonnegative;
alter table distros
  add constraint distros_likes_nonnegative check (likes >= 0) not valid;

-- 3. Read-only access for anon --------------------------------------------
-- Drop whatever write policies exist on the two counter tables (names from
-- earlier setups are unknown, so sweep them) and leave only SELECT.

do $$
declare p record;
begin
  for p in
    select policyname, tablename
      from pg_policies
     where schemaname = 'public'
       and tablename in ('distros', 'blog_posts')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

create policy "anon_read_distros" on distros
  for select using (true);

create policy "anon_read_blog_posts" on blog_posts
  for select using (true);

-- RLS policies are the row-level gate; table privileges are the statement-level
-- one. The app never writes these tables directly (only through the functions
-- above), so drop the default write grants as well — TRUNCATE in particular is
-- not filtered by RLS at all.
revoke insert, update, delete, truncate on distros from anon, authenticated;
revoke insert, update, delete, truncate on blog_posts from anon, authenticated;
