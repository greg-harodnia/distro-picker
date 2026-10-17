-- Contact form submissions.
--
-- Insert-only for the anon role: submissions must never be readable with the
-- public anon key. The checks mirror the client-side validation so a bypassed
-- client cannot store empty or oversized rows.

create table if not exists messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (
    char_length(email) between 3 and 254 and position('@' in email) > 1
  ),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

drop policy if exists "anon_insert_messages" on messages;
create policy "anon_insert_messages" on messages
  for insert with check (true);

-- No select/update/delete policy: rows are only reachable from the dashboard.
--
-- RLS would already hide every row from `anon` without a SELECT policy, but
-- take the table privilege away too so a future policy mistake can't expose
-- submissions. INSERT is all the client does (it never chains `.select()`).
revoke select, update, delete, truncate on messages from anon, authenticated;
