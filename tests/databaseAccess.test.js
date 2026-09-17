import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(
  `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key, raw_user_meta_data jsonb); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`,
);
await db.exec(
  fs.readFileSync(
    new URL(
      "../supabase/migrations/202609180001_accounts_and_scores.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222";
await db.exec(
  `insert into auth.users values('${a}','{"display_name":"Player A"}'),('${b}','{"display_name":"Player B"}');`,
);
let checks = 0;
function ok(condition) {
  assert.ok(condition);
  checks++;
}
async function fails(sql) {
  await assert.rejects(db.exec(sql));
  checks++;
}
await db.exec(
  `set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`,
);
ok((await db.query("select * from public.profiles")).rows.length === 1);
ok(
  (await db.query("select leaderboard_opt_in from public.profiles")).rows[0]
    .leaderboard_opt_in === false,
);
await db.exec(
  `update public.profiles set display_name='Stolen' where id='${b}'`,
);
await fails(
  `insert into public.practice_scores(id,user_id,puzzle_type,score,attempted,correct,streak) values('33333333-3333-4333-8333-333333333333','${b}','pattern_rush',500,10,8,3)`,
);
await fails(
  `insert into public.practice_scores(id,user_id,puzzle_type,score,attempted,correct,streak,played_at) values('33333333-3333-4333-8333-333333333333','${a}','pattern_rush',500,10,8,3,'2099-01-01')`,
);
await db.exec(
  `insert into public.practice_scores(id,user_id,puzzle_type,score,attempted,correct,streak) values('33333333-3333-4333-8333-333333333333','${a}','pattern_rush',500,10,8,3)`,
);
await fails(`update public.practice_scores set score=9999`);
await fails(
  `insert into public.practice_scores(id,user_id,puzzle_type,score,attempted,correct,streak) values('44444444-4444-4444-8444-444444444444','${a}','pattern_rush',500,10,11,3)`,
);
await db.exec("set role anon");
await fails("select * from public.profiles");
await fails("select * from public.practice_scores");
ok(
  (
    await db.query(
      "select * from public.community_leaderboard('pattern_rush',false)",
    )
  ).rows.length === 0,
);
await db.exec(
  `set role authenticated; update public.profiles set leaderboard_opt_in=true where id='${a}'; set role anon;`,
);
const rows = (
  await db.query(
    "select * from public.community_leaderboard('pattern_rush',false)",
  )
).rows;
ok(rows.length === 1 && rows[0].display_name === "Player A");
ok(!("user_id" in rows[0]) && !("email" in rows[0]));
await db.exec(
  `set role authenticated; update public.profiles set leaderboard_opt_in=false where id='${a}'; select set_config('request.jwt.claim.sub','${b}',false);`,
);
ok((await db.query("select * from public.practice_scores")).rows.length === 0);
ok(
  (await db.query("select display_name from public.profiles")).rows[0]
    .display_name === "Player B",
);
await db.exec("set role anon");
ok(
  (
    await db.query(
      "select * from public.community_leaderboard('pattern_rush',false)",
    )
  ).rows.length === 0,
);
console.log(
  `${checks} database privacy, ownership, timestamp and opt-in checks passed.`,
);
await db.close();
