-- Run as database owner in the Supabase SQL editor. Everything is rolled back.
-- No passwords, email addresses, permanent test accounts or scores are created.
begin;
do $$
declare a uuid=gen_random_uuid(); b uuid=gen_random_uuid(); m jsonb; state jsonb; q jsonb; mid uuid; secret_answer integer;
begin
 insert into auth.users(id,raw_user_meta_data) values(a,'{"display_name":"Smoke A"}'),(b,'{"display_name":"Smoke B"}');
 perform set_config('request.jwt.claim.sub',a::text,true);
 execute 'set local role authenticated';
 m:=public.competition_start('friend'); mid:=(m->>'id')::uuid;
 if m->>'status'<>'waiting' then raise exception 'Waiting room failed'; end if;
 perform set_config('request.jwt.claim.sub',b::text,true);
 m:=public.competition_start('friend',m->>'code');
 if m->>'status'<>'active' or m->'question' ? 'answer' then raise exception 'Question privacy failed'; end if;
 execute 'reset role';
 select questions->0 into q from neuro_private.matches where id=mid; secret_answer:=(q->>'answer')::integer;
 execute 'set local role authenticated';
 state:=public.competition_answer(mid,0,secret_answer);
 if not (state->>'correct')::boolean then raise exception 'Answer validation failed'; end if;
 state:=public.competition_state(mid);
 if state->'question'<>'null'::jsonb then raise exception 'Polling opened next question'; end if;
 perform public.competition_leave(mid);
 perform set_config('request.jwt.claim.sub',a::text,true);
 state:=public.competition_leave(mid);
 if state->>'status'<>'complete' or state->>'outcome'<>'loss' then raise exception 'Settlement failed'; end if;
 perform set_config('request.jwt.claim.sub',b::text,true);
 state:=public.competition_dashboard();
 if (state->'stats'->>'wins')::integer<>1 then raise exception 'Statistics failed'; end if;
 m:=public.competition_start('daily'); perform public.competition_leave((m->>'id')::uuid);
 state:=public.competition_start('daily');
 if state->>'id'<>m->>'id' then raise exception 'Daily replay limit failed'; end if;
 execute 'reset role';
 if has_schema_privilege('authenticated','neuro_private','USAGE') then raise exception 'Private schema is exposed'; end if;
 if has_function_privilege('anon','public.competition_start(text,text)','EXECUTE') then raise exception 'Guest can compete'; end if;
end $$;
rollback;
select 'Competition smoke checks passed; all temporary fixtures rolled back.' as result;
