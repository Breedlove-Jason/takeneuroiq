-- Start question timers only when a player explicitly opens the question.
begin;
create function public.competition_snapshot(match_id uuid, reveal_next boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m neuro_private.matches; e neuro_private.entries; op neuro_private.entries; q jsonb; opponent_name text; mine uuid=auth.uid();
begin
 if mine is null then raise exception 'Sign in to compete.'; end if;
 select * into m from neuro_private.matches where id=match_id and (host=mine or guest=mine) for update;
 if not found then raise exception 'Match not found.'; end if;
 perform neuro_private.settle(m.id);
 select * into m from neuro_private.matches where id=m.id;
 select * into e from neuro_private.entries where entries.match_id=m.id and player=mine;
 select * into op from neuro_private.entries where entries.match_id=m.id and player<>mine;
 if op.player is not null then select case when leaderboard_opt_in then display_name else 'Challenger' end into opponent_name from public.profiles where id=op.player; end if;
 if m.status='active' and not e.finished then
  if e.question_started is null and reveal_next then
   update neuro_private.entries set question_started=clock_timestamp() where entries.match_id=m.id and player=mine returning * into e;
  end if;
  if e.question_started is not null then q:=(m.questions->e.position)-'answer'-'explanation'; end if;
 end if;
 return jsonb_build_object('id',m.id,'mode',m.mode,'status',m.status,'code',case when m.mode='friend' then m.code else null end,
  'day',m.day,'expires_at',m.expires_at,'server_now',clock_timestamp(),'total',jsonb_array_length(m.questions),
  'position',e.position,'score',e.score,'correct',e.correct,'finished',e.finished,'question',q,
  'question_deadline',case when q is not null then least(e.question_started+interval '30 seconds',m.expires_at) else null end,
  'outcome',e.outcome,'rating_delta',e.rating_delta,'xp',e.xp,
  'opponent',case when op.player is not null then jsonb_build_object('name',coalesce(opponent_name,'Challenger'),'score',op.score,'position',op.position,'finished',op.finished) else null end,
  'review',case when m.status='complete' then e.answers else '[]'::jsonb end);
end $$;

create or replace function public.competition_start(game_mode text, join_code text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare mine uuid=auth.uid(); m neuro_private.matches; old neuro_private.matches; qs jsonb; today date=(clock_timestamp() at time zone 'UTC')::date; my_rating integer;
begin
 if mine is null then raise exception 'Sign in to compete.'; end if;
 if game_mode is null or game_mode not in ('ranked','friend','daily') then raise exception 'Choose a valid game mode.'; end if;
 -- Serialize queue matching so simultaneous arrivals cannot both miss each other.
 if game_mode='ranked' then perform pg_advisory_xact_lock(hashtextextended('neuroiq-ranked-queue',0)); end if;
 -- Serialize starts per account, including requests from another device.
 perform pg_advisory_xact_lock(hashtextextended(mine::text,0));
 insert into neuro_private.ratings(player) values(mine) on conflict do nothing;
 for old in select * from neuro_private.matches where (host=mine or guest=mine) and status in ('waiting','active') order by created_at loop
  perform neuro_private.settle(old.id);
  if exists(select 1 from neuro_private.matches where id=old.id and status in ('waiting','active')) then
   return public.competition_snapshot(old.id,true);
  end if;
 end loop;
 if (select count(*) from neuro_private.matches where host=mine and created_at>clock_timestamp()-interval '1 hour')>=30 then
  raise exception 'You have started many matches. Please take a break and try again later.';
 end if;
 if game_mode='daily' then
  select * into m from neuro_private.matches where host=mine and day=today and mode='daily';
  if found then return public.competition_snapshot(m.id,true); end if;
  insert into neuro_private.daily_sets(day,questions) values(today,neuro_private.make_questions(10)) on conflict do nothing;
  select questions into qs from neuro_private.daily_sets where day=today;
 elsif game_mode='friend' and nullif(trim(join_code),'') is not null then
  select * into m from neuro_private.matches where code=upper(trim(join_code)) and mode='friend' and status='waiting' and expires_at>clock_timestamp() for update;
  if not found or m.host=mine then raise exception 'That challenge code is unavailable or expired.'; end if;
 elsif game_mode='ranked' then
  select rating into my_rating from neuro_private.ratings where player=mine;
  select x.* into m from neuro_private.matches x join neuro_private.ratings r on r.player=x.host
   where x.mode='ranked' and x.status='waiting' and x.host<>mine and x.expires_at>clock_timestamp()
    and (abs(r.rating-my_rating)<=300 or x.created_at<clock_timestamp()-interval '60 seconds')
   order by x.created_at for update of x skip locked limit 1;
 end if;
 if m.id is not null then
  update neuro_private.matches set guest=mine,status='active',started_at=clock_timestamp(),expires_at=clock_timestamp()+interval '5 minutes' where id=m.id;
  insert into neuro_private.entries(match_id,player) values(m.id,mine);
 else
  insert into neuro_private.matches(mode,host,questions,day,status,started_at,expires_at)
   values(game_mode,mine,coalesce(qs,neuro_private.make_questions(8)),case when game_mode='daily' then today end,
     case when game_mode='daily' then 'active' else 'waiting' end,
     case when game_mode='daily' then clock_timestamp() end,
     clock_timestamp()+case when game_mode='daily' then interval '6 minutes' else interval '10 minutes' end) returning * into m;
  insert into neuro_private.entries(match_id,player) values(m.id,mine);
 end if;
 return public.competition_snapshot(m.id,true);
end $$;


revoke all on function public.competition_snapshot(uuid,boolean) from public,anon,authenticated;
grant execute on function public.competition_snapshot(uuid,boolean) to authenticated;
create or replace function public.competition_leaderboard(board text default 'rating') returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare rows jsonb;
begin
 if board is null or board not in ('rating','week','daily') then raise exception 'Choose a valid leaderboard.'; end if;
 select coalesce(jsonb_agg(t order by t.value desc,t.correct desc,t.display_name),'[]') into rows from (
  select p.display_name,
   case when board='rating' then r.rating when board='week' then coalesce(sum(e.xp),0)::integer else coalesce(max(e.score),0) end as value,
   case when board='daily' then coalesce(max(e.correct),0) else r.correct end correct,
   r.wins, r.games, r.rating,
   case when board='daily' then 10 else r.answered end answered
  from neuro_private.ratings r join public.profiles p on p.id=r.player
  left join neuro_private.entries e on e.player=r.player
  left join neuro_private.matches m on m.id=e.match_id
  where p.leaderboard_opt_in and r.games>0
   and (board<>'rating' or exists(select 1 from neuro_private.entries re join neuro_private.matches rm on rm.id=re.match_id where re.player=r.player and rm.mode='ranked' and rm.status='complete'))
   and (board='rating' or (m.status='complete' and ((board='week' and m.settled_at>=date_trunc('week',clock_timestamp() at time zone 'UTC') at time zone 'UTC')
    or (board='daily' and m.mode='daily' and m.day=(clock_timestamp() at time zone 'UTC')::date))))
  group by p.id,p.display_name,r.rating,r.correct,r.wins,r.games,r.answered
  order by value desc,correct desc,p.display_name limit 100
 ) t;
 return rows;
end $$;

create or replace function public.competition_state(match_id uuid) returns jsonb
language sql security definer set search_path='' as $$ select public.competition_snapshot(match_id,false) $$;
commit;
