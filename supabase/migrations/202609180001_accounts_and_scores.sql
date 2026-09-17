-- Apply once to a Supabase project. Email/password auth is managed by Supabase.
begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 24),
  leaderboard_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update(display_name, leaderboard_opt_in) on public.profiles to authenticated;
create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Edit own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.create_player_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values(new.id, case when char_length(trim(new.raw_user_meta_data->>'display_name')) between 2 and 24
    then trim(new.raw_user_meta_data->>'display_name') else 'Arena Runner' end);
  return new;
end;
$$;
revoke all on function public.create_player_profile() from public, anon, authenticated;
create trigger create_player_after_signup after insert on auth.users for each row execute function public.create_player_profile();
-- Existing accounts get private profiles too.
insert into public.profiles(id, display_name) select id, 'Arena Runner' from auth.users on conflict do nothing;

create table public.practice_scores (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  puzzle_type text not null check (puzzle_type in ('pattern_rush','sequence_sprint','rule_shift','grid_recall','logic_grid','logic_gate','signal_path','spatial_rotation','memory_chain','symbol_recall','odd_one_matrix','number_weave')),
  score integer not null check(score between 0 and 1000000),
  attempted integer not null check(attempted between 1 and 1000),
  correct integer not null check(correct between 0 and attempted),
  streak integer not null check(streak between 0 and correct),
  played_at timestamptz not null default now()
);
alter table public.practice_scores enable row level security;
revoke all on public.practice_scores from anon, authenticated;
grant select on public.practice_scores to authenticated;
-- Never accept a client-provided timestamp; ranking periods use server time.
grant insert(id,user_id,puzzle_type,score,attempted,correct,streak) on public.practice_scores to authenticated;
create policy "Read own scores" on public.practice_scores for select to authenticated using ((select auth.uid()) = user_id);
create policy "Submit own scores" on public.practice_scores for insert to authenticated with check ((select auth.uid()) = user_id);
create index practice_scores_ranking on public.practice_scores(puzzle_type, score desc, played_at desc);
create index practice_scores_owner on public.practice_scores(user_id);

-- Expose only opted-in display names and best scores, never emails or account IDs.
-- Casual practice board: scores originate in the browser, not an authoritative game server.
create function public.community_leaderboard(family text, recent_only boolean default false)
returns table(id uuid, display_name text, score integer, accuracy numeric, streak integer, played_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select ranked.id, ranked.display_name, ranked.score, ranked.accuracy, ranked.streak, ranked.played_at
  from (
    select s.id, p.display_name, s.score, round(100.0*s.correct/s.attempted) as accuracy, s.streak, s.played_at,
      row_number() over(partition by s.user_id order by s.score desc, (1.0*s.correct/s.attempted) desc, s.played_at asc, s.id) as player_rank
    from public.practice_scores s join public.profiles p on p.id=s.user_id
    where p.leaderboard_opt_in and s.puzzle_type=family
      and (not recent_only or s.played_at >= now()-interval '7 days')
  ) ranked where ranked.player_rank=1
  order by ranked.score desc, ranked.accuracy desc, ranked.played_at asc, ranked.id limit 100;
$$;
revoke all on function public.community_leaderboard(text,boolean) from public;
grant execute on function public.community_leaderboard(text,boolean) to anon, authenticated;
commit;
