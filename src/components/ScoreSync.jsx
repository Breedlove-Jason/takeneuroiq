import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";
import { makeScorePayload } from "../lib/scorePayload";

export default function ScoreSync() {
  const { user } = useAuth();
  const [failed, setFailed] = useState(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(new Map());
  const userId = user?.id;
  async function send(payload) {
    const { error } = await supabase.from("practice_scores").insert(payload);
    if (error && error.code !== "23505") throw error;
  }
  useEffect(() => {
    if (!userId || !supabase) return;
    let active = true;
    const onRecorded = async (event) => {
      const payload = makeScorePayload(event.detail, userId);
      if (!payload || pending.current.has(payload.id)) return;
      pending.current.set(payload.id, payload);
      try {
        await send(payload);
        pending.current.delete(payload.id);
      } catch {
        if (active) setFailed({ userId });
      }
    };
    window.addEventListener("takeneuroiq:session-recorded", onRecorded);
    return () => {
      active = false;
      window.removeEventListener("takeneuroiq:session-recorded", onRecorded);
    };
  }, [userId]);
  async function retry() {
    setBusy(true);
    try {
      for (const [id, payload] of pending.current)
        if (payload.user_id === userId) {
          await send(payload);
          pending.current.delete(id);
        }
      setFailed(null);
    } catch {
      setFailed({ userId });
    } finally {
      setBusy(false);
    }
  }
  if (!failed || failed.userId !== userId) return null;
  return (
    <div
      role="status"
      className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-b border-amber-400/30 bg-amber-400/10 px-5 py-3 text-sm"
    >
      <span>Your run is saved on this device. Account sync failed.</span>
      <button className="font-bold underline" disabled={busy} onClick={retry}>
        {busy ? "Retrying…" : "Retry sync"}
      </button>
    </div>
  );
}
