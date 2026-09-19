-- NeuroIQ competition v1. All answer keys, scoring and settlement stay in PostgreSQL.
-- Apply after 202609180001_accounts_and_scores.sql.
begin;
create schema if not exists neuro_private;
revoke all on schema neuro_private from public, anon, authenticated;

create table neuro_private.matches (
 id uuid primary key default gen_random_uuid(),
 mode text not null check(mode in ('ranked','friend','daily')),
 status text not null default 'waiting' check(status in ('waiting','active','complete','cancelled')),
 code text unique not null default upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
 host uuid not null references auth.users(id) on delete cascade,
 guest uuid references auth.users(id) on delete set null,
 questions jsonb not null,
 day date,
 created_at timestamptz not null default clock_timestamp(),
 started_at timestamptz,
 expires_at timestamptz not null default clock_timestamp()+interval '10 minutes',
 settled_at timestamptz,
 check(host is distinct from guest)
);
create unique index daily_one_attempt on neuro_private.matches(host,day) where mode='daily';
create index match_queue on neuro_private.matches(mode,status,created_at);
create index match_guest on neuro_private.matches(guest);
create table neuro_private.entries (
 match_id uuid not null references neuro_private.matches(id) on delete cascade,
 player uuid not null references auth.users(id) on delete cascade,
 position integer not null default 0,
 score integer not null default 0,
 correct integer not null default 0,
 question_started timestamptz,
 finished boolean not null default false,
 answers jsonb not null default '[]',
 outcome text,
 rating_delta integer not null default 0,
 xp integer not null default 0,
 primary key(match_id,player)
);
create table neuro_private.ratings (
 player uuid primary key references auth.users(id) on delete cascade,
 rating integer not null default 1000,
 xp integer not null default 0,
 wins integer not null default 0,
 losses integer not null default 0,
 draws integer not null default 0,
 games integer not null default 0,
 correct integer not null default 0,
 answered integer not null default 0,
 perfect integer not null default 0
);
create table neuro_private.daily_sets(day date primary key, questions jsonb not null);
revoke all on all tables in schema neuro_private from public, anon, authenticated;
alter table neuro_private.matches enable row level security;
alter table neuro_private.entries enable row level security;
alter table neuro_private.ratings enable row level security;
alter table neuro_private.daily_sets enable row level security;

-- Procedural, exactly solvable questions. The answer index is never returned before submission.
create function neuro_private.make_questions(n integer) returns jsonb
language plpgsql set search_path='' as $$
declare qs jsonb='[]'; opts jsonb; i integer; a integer; b integer; c integer;
 k integer; d integer; answer text; prompt text; explanation text; family text; other text[]; candidates text[];
begin
 for i in 1..n loop
  a:=3+floor(random()*17)::integer; b:=2+floor(random()*7)::integer; c:=2+floor(random()*5)::integer;
  d:=least(3,1+(i-1)/3); k:=(i-1)%6;
  if k=0 then
   family:='Number sequences';
   if d=1 then
    prompt:=format('Find the next term: %s, %s, %s, %s, ?',a,a+b,a+2*b,a+3*b);
    answer:=(a+4*b)::text; explanation:=format('Add %s each time.',b);
   elsif d=2 then
    prompt:=format('Find the next term: %s, %s, %s, %s, ?',a,a+b,a+3*b,a+6*b);
    answer:=(a+10*b)::text; explanation:=format('The increments are %s, %s, %s, then %s.',b,2*b,3*b,4*b);
   else
    prompt:=format('Find the next term: %s, %s, %s, %s, ?',a,2*a+b,4*a+3*b,8*a+7*b);
    answer:=(16*a+15*b)::text; explanation:=format('Multiply the previous term by 2, then add %s.',b);
   end if;
   other:=array[(answer::int+b)::text,(answer::int-b)::text,(answer::int+2*b)::text];
  elsif k=1 then
   family:='Rule transfer';
   prompt:=format('The same rule applies in every row: (%s, %s) → %s; (%s, %s) → %s. What is (%s, %s) → ?',a,b,a*b+c,a+2,b+1,(a+2)*(b+1)+c,a+1,b+2);
   answer:=((a+1)*(b+2)+c)::text;
   explanation:=format('Multiply the two inputs and add %s.',c);
   other:=array[(answer::int-c)::text,(answer::int+c)::text,(answer::int+c+1)::text];
  elsif k=2 then
   family:='Deductive logic';
   if random()<0.5 then
    prompt:='Every amber token is round. No round token is striped. Which statement must be true?';
    answer:='No amber token is striped';
    other:=array['Every round token is amber','Every striped token is amber','Some amber tokens are striped'];
    explanation:='Amber implies round, and round excludes striped. The reverse implication is not given.';
   else
    prompt:='If the beacon is on, the gate is open. The gate is closed. Which statement must be true?';
    answer:='The beacon is off'; other:=array['The beacon is on','The gate sensor is broken','Nothing follows about the beacon'];
    explanation:='Contraposition: if beacon implies open, then not open implies not beacon.';
   end if;
  elsif k=3 then
   family:='Spatial reasoning';
   prompt:=format('Rotate the point (%s, %s) 90° clockwise around the origin. Where does it land?',a,b);
   answer:=format('(%s, %s)',b,-a);
   other:=array[format('(%s, %s)',-b,a),format('(%s, %s)',-a,-b),format('(%s, %s)',b,a)];
   explanation:='A clockwise quarter-turn maps (x, y) to (y, −x).';
  elsif k=4 then
   family:='Quantitative reasoning';
   prompt:=format('%s identical machines produce %s parts in %s minutes. At the same rate, how many parts do %s machines produce in %s minutes?',b,b*a,c,b+2,c*2);
   answer:=(2*a*(b+2))::text;
   other:=array[(a*(b+2))::text,(2*a*b)::text,(2*a*(b+3))::text];
   explanation:=format('Each machine produces %s parts every %s minutes. Multiply %s × %s × 2.',a,c,a,b+2);
  else
   family:='Working rules';
   prompt:=format('Start with %s. Double it, subtract %s, then multiply by %s. What is the result?',a,b,c);
   answer:=((2*a-b)*c)::text;
   other:=array[(2*a-b*c)::text,((2*a+b)*c)::text,((a-b)*2*c)::text];
   explanation:=format('Follow the order: (%s × 2 − %s) × %s = %s.',a,b,c,answer);
  end if;
  candidates:=array_prepend(answer,other);
  select jsonb_agg(v order by r) into opts from (select distinct v, random() r from unnest(candidates) v) x;
  select (ord-1)::integer into k from jsonb_array_elements_text(opts) with ordinality x(v,ord) where v=answer limit 1;
  qs:=qs || jsonb_build_array(jsonb_build_object('family',family,'difficulty',d,'prompt',prompt,'options',opts,'answer',k,'explanation',explanation));
 end loop;
 return qs;
end $$;

create function neuro_private.settle(mid uuid) returns void
language plpgsql set search_path='' as $$
declare m neuro_private.matches; e neuro_private.entries; h neuro_private.entries; g neuro_private.entries;
 hr integer; gr integer; delta integer=0; result numeric; earned integer; repeated integer;
begin
 select * into m from neuro_private.matches where id=mid for update;
 if m.status not in ('active','waiting') then return; end if;
 if m.status='waiting' then
  if clock_timestamp()>m.expires_at then update neuro_private.matches set status='cancelled' where id=mid; end if;
  return;
 end if;
 if clock_timestamp()>m.expires_at then update neuro_private.entries set finished=true where match_id=mid; end if;
 if exists(select 1 from neuro_private.entries where match_id=mid and not finished) then return; end if;
 -- Ordered locks prevent deadlocks if opponents finish different games at the same time.
 insert into neuro_private.ratings(player) select player from neuro_private.entries where match_id=mid on conflict do nothing;
 perform 1 from neuro_private.ratings where player in (select player from neuro_private.entries where match_id=mid) order by player for update;
 select * into h from neuro_private.entries where match_id=mid and player=m.host;
 if m.mode<>'daily' then
  select * into g from neuro_private.entries where match_id=mid and player=m.guest;
  result:=case when h.score>g.score then 1 when h.score<g.score then 0 else 0.5 end;
  if m.mode='ranked' then
   select rating into hr from neuro_private.ratings where player=m.host;
   select rating into gr from neuro_private.ratings where player=m.guest;
   select count(*) into repeated from neuro_private.matches x where x.mode='ranked' and x.status='complete'
    and x.settled_at>clock_timestamp()-interval '24 hours'
    and ((x.host=m.host and x.guest=m.guest) or (x.host=m.guest and x.guest=m.host));
   if repeated<3 then delta:=round(32*(result-1/(1+power(10::numeric,(gr-hr)::numeric/400)))); end if;
  end if;
  update neuro_private.entries set outcome=case when player=m.host then case when result=1 then 'win' when result=0 then 'loss' else 'draw' end
    else case when result=0 then 'win' when result=1 then 'loss' else 'draw' end end,
    rating_delta=case when player=m.host then delta else -delta end where match_id=mid;
 else
  update neuro_private.entries set outcome='daily' where match_id=mid;
 end if;
 for e in select * from neuro_private.entries where match_id=mid loop
  earned:=e.correct*20 + case when e.position=jsonb_array_length(m.questions) then 40 else 0 end + case when e.outcome='win' then 40 else 0 end;
  update neuro_private.entries set xp=earned where match_id=mid and player=e.player;
  update neuro_private.ratings set rating=rating+e.rating_delta, xp=xp+earned,
    games=games+1, wins=wins+case when e.outcome='win' then 1 else 0 end,
    losses=losses+case when e.outcome='loss' then 1 else 0 end, draws=draws+case when e.outcome='draw' then 1 else 0 end,
    correct=correct+e.correct, answered=answered+jsonb_array_length(m.questions),
    perfect=perfect+case when e.correct=jsonb_array_length(m.questions) then 1 else 0 end where player=e.player;
 end loop;
 update neuro_private.matches set status='complete',settled_at=clock_timestamp() where id=mid;
end $$;

create function public.competition_state(match_id uuid) returns jsonb
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
  if e.question_started is null then
   update neuro_private.entries set question_started=clock_timestamp() where entries.match_id=m.id and player=mine returning * into e;
  end if;
  q:=(m.questions->e.position)-'answer'-'explanation';
 end if;
 return jsonb_build_object('id',m.id,'mode',m.mode,'status',m.status,'code',case when m.mode='friend' then m.code else null end,
  'day',m.day,'expires_at',m.expires_at,'server_now',clock_timestamp(),'total',jsonb_array_length(m.questions),
  'position',e.position,'score',e.score,'correct',e.correct,'finished',e.finished,'question',q,
  'question_deadline',case when q is not null then least(e.question_started+interval '30 seconds',m.expires_at) else null end,
  'outcome',e.outcome,'rating_delta',e.rating_delta,'xp',e.xp,
  'opponent',case when op.player is not null then jsonb_build_object('name',coalesce(opponent_name,'Challenger'),'score',op.score,'position',op.position,'finished',op.finished) else null end,
  'review',case when m.status='complete' then e.answers else '[]'::jsonb end);
end $$;

create function public.competition_start(game_mode text, join_code text default null) returns jsonb
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
   return public.competition_state(old.id);
  end if;
 end loop;
 if (select count(*) from neuro_private.matches where host=mine and created_at>clock_timestamp()-interval '1 hour')>=30 then
  raise exception 'You have started many matches. Please take a break and try again later.';
 end if;
 if game_mode='daily' then
  select * into m from neuro_private.matches where host=mine and day=today and mode='daily';
  if found then return public.competition_state(m.id); end if;
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
 return public.competition_state(m.id);
end $$;

create function public.competition_answer(match_id uuid, question_number integer, choice integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare mine uuid=auth.uid(); m neuro_private.matches; e neuro_private.entries; q jsonb; valid boolean; points integer; elapsed numeric;
begin
 if mine is null then raise exception 'Sign in to compete.'; end if;
 select * into m from neuro_private.matches where id=match_id and (host=mine or guest=mine) for update;
 if not found then raise exception 'Match not found.'; end if;
 perform neuro_private.settle(m.id);
 select * into m from neuro_private.matches where id=m.id;
 select * into e from neuro_private.entries where entries.match_id=m.id and player=mine;
 if m.status<>'active' or e.finished then return public.competition_state(m.id); end if;
 -- A retry of an already accepted answer returns current state without awarding points again.
 if question_number is null or question_number<0 or question_number>e.position then raise exception 'Question is out of order.'; end if;
 if question_number<e.position then return public.competition_state(m.id); end if;
 if e.question_started is null then raise exception 'Open the question before answering.'; end if;
 q:=m.questions->e.position;
 if choice is null or choice< -1 or choice>=jsonb_array_length(q->'options') then raise exception 'Choose a valid answer.'; end if;
 elapsed:=extract(epoch from (clock_timestamp()-e.question_started));
 valid:=elapsed<=30 and choice=(q->>'answer')::integer;
 points:=case when valid then 100+greatest(0,floor((30-elapsed)*50/30)::integer) else 0 end;
 update neuro_private.entries set position=position+1,score=score+points,correct=correct+case when valid then 1 else 0 end,
  question_started=null,finished=position+1>=jsonb_array_length(m.questions),
  answers=answers || jsonb_build_array(jsonb_build_object('number',e.position+1,'prompt',q->>'prompt','family',q->>'family','correct',valid,'points',points,
   'your_answer',case when choice>=0 then q->'options'->>choice else 'Skipped' end,'answer',q->'options'->>((q->>'answer')::integer),'explanation',q->>'explanation'))
  where entries.match_id=m.id and player=mine;
 perform neuro_private.settle(m.id);
 -- Do not start the next question until its separate state request, so feedback does not consume time.
 return jsonb_build_object('accepted',true,'correct',valid,'points',points,'explanation',q->>'explanation','answer',q->'options'->>((q->>'answer')::integer));
end $$;

create function public.competition_leave(match_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m neuro_private.matches; mine uuid=auth.uid();
begin
 if mine is null then raise exception 'Sign in to compete.'; end if;
 select * into m from neuro_private.matches where id=match_id and (host=mine or guest=mine) for update;
 if not found then raise exception 'Match not found.'; end if;
 if m.status='waiting' then update neuro_private.matches set status='cancelled' where id=m.id;
 elsif m.status='active' then
  update neuro_private.entries set finished=true where entries.match_id=m.id and player=mine;
  perform neuro_private.settle(m.id);
 end if;
 return public.competition_state(m.id);
end $$;

create function public.competition_dashboard() returns jsonb
language plpgsql security definer set search_path='' as $$
declare mine uuid=auth.uid(); r neuro_private.ratings; m neuro_private.matches; current_match uuid; history jsonb; streak integer=0; check_day date=(clock_timestamp() at time zone 'UTC')::date; d date;
begin
 if mine is null then raise exception 'Sign in to compete.'; end if;
 for m in select * from neuro_private.matches where (host=mine or guest=mine) and status in ('waiting','active') order by created_at loop
  perform neuro_private.settle(m.id);
 end loop;
 select id into current_match from neuro_private.matches where (host=mine or guest=mine) and status in ('waiting','active') order by created_at desc limit 1;
 select * into r from neuro_private.ratings where player=mine;
 for d in select x.day from neuro_private.matches x join neuro_private.entries e on e.match_id=x.id and e.player=mine
   where x.mode='daily' and x.status='complete' and e.position=jsonb_array_length(x.questions) order by x.day desc loop
  if streak=0 and d=check_day-1 then check_day:=check_day-1; end if;
  if d<>check_day then exit; end if;
  streak:=streak+1; check_day:=check_day-1;
 end loop;
 select coalesce(jsonb_agg(row order by row.created_at desc),'[]') into history from (
  select x.id,x.mode,x.status,x.created_at,x.day,e.score,e.correct,e.position,e.outcome,e.rating_delta,e.xp,jsonb_array_length(x.questions) total
  from neuro_private.matches x join neuro_private.entries e on e.match_id=x.id
  where e.player=mine and x.status='complete' order by x.created_at desc limit 20
 ) row;
 return jsonb_build_object('stats',jsonb_build_object('rating',coalesce(r.rating,1000),'xp',coalesce(r.xp,0),'wins',coalesce(r.wins,0),
  'losses',coalesce(r.losses,0),'draws',coalesce(r.draws,0),'games',coalesce(r.games,0),'correct',coalesce(r.correct,0),
  'answered',coalesce(r.answered,0),'perfect',coalesce(r.perfect,0),'daily_streak',streak),
  'active_match',current_match,'history',history,'today',(clock_timestamp() at time zone 'UTC')::date,
  'daily_played',exists(select 1 from neuro_private.matches where host=mine and mode='daily' and day=(clock_timestamp() at time zone 'UTC')::date));
end $$;

create function public.competition_leaderboard(board text default 'rating') returns jsonb
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
   and (board='rating' or (m.status='complete' and ((board='week' and m.settled_at>=date_trunc('week',clock_timestamp() at time zone 'UTC') at time zone 'UTC')
    or (board='daily' and m.mode='daily' and m.day=(clock_timestamp() at time zone 'UTC')::date))))
  group by p.id,p.display_name,r.rating,r.correct,r.wins,r.games,r.answered
  order by value desc,correct desc,p.display_name limit 100
 ) t;
 return rows;
end $$;

revoke all on all functions in schema neuro_private from public,anon,authenticated;
revoke all on function public.competition_start(text,text), public.competition_state(uuid), public.competition_answer(uuid,integer,integer),
 public.competition_leave(uuid), public.competition_dashboard(), public.competition_leaderboard(text) from public,anon,authenticated;
grant execute on function public.competition_start(text,text), public.competition_state(uuid), public.competition_answer(uuid,integer,integer),
 public.competition_leave(uuid), public.competition_dashboard() to authenticated;
grant execute on function public.competition_leaderboard(text) to anon,authenticated;
commit;
