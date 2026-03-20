create table if not exists public.game_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  game_state jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.game_saves enable row level security;

grant select, insert, update on public.game_saves to authenticated;

drop policy if exists "Users can read own game save" on public.game_saves;
create policy "Users can read own game save"
on public.game_saves
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own game save" on public.game_saves;
create policy "Users can insert own game save"
on public.game_saves
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own game save" on public.game_saves;
create policy "Users can update own game save"
on public.game_saves
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
