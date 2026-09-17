import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, ShieldCheck, ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";

const TITLES = {
  login: "Welcome back.",
  register: "Make room for your next best.",
  forgot: "Let’s get you back in.",
  reset: "Choose a new password.",
};
export default function AuthPage({ mode = "login" }) {
  const { enabled, loading, user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).has("error")
      ? "That email link could not be verified. Request a new link and open it in this browser."
      : "",
  );
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (!enabled || busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const displayName = String(form.get("displayName") || "").trim();
    setError("");
    setNotice("");
    if (
      ["register", "reset"].includes(mode) &&
      password !== form.get("confirm")
    ) {
      setError("The passwords don’t match.");
      return;
    }
    if (
      mode === "register" &&
      (displayName.length < 2 || displayName.length > 24)
    ) {
      setError("Choose a display name between 2 and 24 characters.");
      return;
    }
    setBusy(true);
    try {
      let result;
      if (mode === "register") {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: { display_name: displayName },
          },
        });
        if (!result.error) {
          setNotice("Check your email to confirm your account, then sign in.");
          if (result.data.session) navigate("/account", { replace: true });
        }
      } else if (mode === "forgot") {
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (!result.error)
          setNotice(
            "If an account exists for that email, a reset link is on its way.",
          );
      } else if (mode === "reset") {
        result = await supabase.auth.updateUser({ password });
        if (!result.error) {
          setNotice("Password updated. You can return to your account.");
          event.target.reset();
        }
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
        if (!result.error) navigate("/account", { replace: true });
      }
      if (result.error)
        setError(
          mode === "login"
            ? "Unable to sign in. Check your email and password, and confirm your email first."
            : result.error.message,
        );
    } catch {
      setError("We couldn’t reach the account service. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const disabled = busy || loading || !enabled;
  return (
    <main className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-12 px-5 py-14 lg:grid-cols-2">
      <section>
        <p className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[.2em] text-cyan-500">
          <Brain weight="fill" size={28} /> Your next level
        </p>
        <h1 className="text-4xl font-black leading-tight sm:text-6xl">
          {TITLES[mode]}
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 opacity-75">
          Twelve ways to challenge your thinking. One place to celebrate your
          progress.
        </p>
        <div className="mt-8 flex gap-3 text-sm leading-6 opacity-75">
          <ShieldCheck size={24} className="shrink-0" />
          Your email stays private. Choose whether your display name and scores
          appear on the community board.
        </div>
        <Link
          to="/play"
          className="mt-8 inline-flex items-center gap-2 font-bold text-cyan-500"
        >
          Keep playing as a guest <ArrowRight />
        </Link>
      </section>
      <section className="neuro-panel">
        <div className="mb-7 flex gap-5 border-b border-slate-700 pb-5 font-bold">
          <Link
            to="/login"
            className={mode === "login" ? "text-cyan-300" : "text-slate-400"}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className={
              mode === "register" ? "text-fuchsia-300" : "text-slate-400"
            }
          >
            Register
          </Link>
        </div>
        {!enabled ? (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Accounts are opening soon.</h2>
            <p className="leading-7 text-slate-300">
              Guest play is ready now. Your practice history stays in this
              browser until accounts are available.
            </p>
            <Link to="/play" className="neuro-button">
              Explore the challenges
            </Link>
          </div>
        ) : loading ? (
          <p role="status">Restoring your session…</p>
        ) : user && ["login", "register"].includes(mode) ? (
          <div>
            <p className="mb-5">You’re signed in.</p>
            <Link className="neuro-button" to="/account">
              Open account
            </Link>
          </div>
        ) : mode === "reset" && !user ? (
          <div>
            <p className="mb-4">
              Open the reset link from your email to set a new password.
            </p>
            <Link to="/forgot-password" className="text-cyan-300">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {mode === "register" && (
              <label className="block text-sm font-semibold">
                Display name
                <input
                  name="displayName"
                  autoComplete="nickname"
                  minLength={2}
                  maxLength={24}
                  required
                  className="neuro-field mt-2"
                  placeholder="How should we call you?"
                />
              </label>
            )}
            {mode !== "reset" && (
              <label className="block text-sm font-semibold">
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="neuro-field mt-2"
                  placeholder="you@example.com"
                />
              </label>
            )}
            {mode !== "forgot" && (
              <>
                <label className="block text-sm font-semibold">
                  Password
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    minLength={mode === "login" ? 1 : 12}
                    maxLength={128}
                    required
                    className="neuro-field mt-2"
                  />
                </label>
                {mode !== "login" && (
                  <>
                    <p className="text-xs text-slate-400">
                      Use at least 12 characters.
                    </p>
                    <label className="block text-sm font-semibold">
                      Confirm password
                      <input
                        name="confirm"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={12}
                        required
                        className="neuro-field mt-2"
                      />
                    </label>
                  </>
                )}
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  Show password
                </label>
              </>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200"
              >
                {error}
              </p>
            )}
            {notice && (
              <p
                role="status"
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"
              >
                {notice}
              </p>
            )}
            <button
              disabled={disabled}
              className="neuro-button w-full"
              type="submit"
            >
              {busy
                ? "Please wait…"
                : {
                    login: "Log in",
                    register: "Create account",
                    forgot: "Send reset link",
                    reset: "Update password",
                  }[mode]}
            </button>
            {mode === "login" && (
              <Link
                className="block text-center text-sm text-cyan-300"
                to="/forgot-password"
              >
                Forgot your password?
              </Link>
            )}
            {mode === "reset" && notice && (
              <Link className="block text-center text-cyan-300" to="/account">
                Back to account
              </Link>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
