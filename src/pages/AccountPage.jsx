import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";

function AccountForm({ user }) {
  const [profile, setProfile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    supabase
      .from("profiles")
      .select("display_name, leaderboard_opt_in")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!active) return;
        if (error)
          setError("Your account settings could not be loaded. Please retry.");
        else {
          setProfile(data);
          setError("");
        }
      })
      .catch(() => {
        if (active)
          setError("Your account settings could not be loaded. Please retry.");
      });
    return () => {
      active = false;
    };
  }, [user.id, retry]);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const display_name = String(form.get("display_name")).trim();
    if (display_name.length < 2) {
      setError("Enter a display name with at least 2 characters.");
      setBusy(false);
      return;
    }
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name,
          leaderboard_opt_in: form.get("leaderboard_opt_in") === "on",
        })
        .eq("id", user.id);
      if (error) throw error;
      setMessage("Settings saved. Your board visibility is up to date.");
    } catch {
      setError("Settings could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="neuro-panel mt-8">
      <p className="mb-6 break-all text-sm text-slate-300">
        Signed in as {user.email}
      </p>
      {error && (
        <div role="alert" className="mb-4 text-rose-300">
          {error}
          {!profile && (
            <button
              className="ml-3 underline"
              onClick={() => setRetry((x) => x + 1)}
            >
              Retry
            </button>
          )}
        </div>
      )}
      {!profile ? (
        <p role="status">
          {error ? "Settings unavailable." : "Loading settings…"}
        </p>
      ) : (
        <form onSubmit={save} className="space-y-6">
          <label className="block font-semibold">
            Public display name
            <input
              className="neuro-field mt-2"
              name="display_name"
              minLength={2}
              maxLength={24}
              defaultValue={profile.display_name}
              required
            />
          </label>
          <label className="flex items-start gap-3">
            <input
              name="leaderboard_opt_in"
              type="checkbox"
              defaultChecked={profile.leaderboard_opt_in}
              className="mt-1"
            />
            <span>
              <span className="font-bold">
                Include me on public leaderboards
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-300">
                Show my display name, competition rating, results, and best practice scores. My email and
                detailed history remain private. Turning this off hides my
                scores immediately.
              </span>
            </span>
          </label>
          <button className="neuro-button" disabled={busy}>
            {busy ? "Saving…" : "Save preferences"}
          </button>
          {message && (
            <p role="status" className="text-emerald-300">
              {message}
            </p>
          )}
        </form>
      )}
      <p className="mt-7 border-t border-slate-700 pt-5 text-sm leading-6 text-slate-400">
        New signed-in runs are saved to your account when online. Detailed
        analytics on the Profile page stay on this device. Guest history is kept
        separately.
      </p>
      <Link className="mt-5 inline-block text-cyan-300" to="/forgot-password">
        Request a password reset
      </Link>
    </div>
  );
}
export default function AccountPage() {
  const { user, loading, signOut, authError } = useAuth();
  if (loading)
    return (
      <main className="p-10" role="status">
        Restoring your session…
      </main>
    );
  if (!user)
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="text-3xl font-bold">Your account</h1>
        <p className="my-6">
          Sign in to manage your display name and community visibility.
        </p>
        <Link className="neuro-button" to="/login">
          Log in
        </Link>
      </main>
    );
  return (
    <main className="mx-auto max-w-2xl px-5 py-14">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black">Your account</h1>
        <button className="neuro-button neuro-muted-button" onClick={signOut}>
          Log out
        </button>
      </div>
      {authError && (
        <p role="alert" className="mt-4 text-rose-400">
          {authError}
        </p>
      )}
      <AccountForm key={user.id} user={user} />
    </main>
  );
}
