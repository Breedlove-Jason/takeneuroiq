import { useEffect, useState } from "react";
import { supabase, accountsEnabled } from "../lib/supabase";
import { setAccountId } from "./accountIdentity";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(accountsEnabled);
  const [authError, setAuthError] = useState("");
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let changed = false;
    function accept(session) {
      if (!active) return;
      setAccountId(session?.user?.id || null);
      setUser(session?.user || null);
      setLoading(false);
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      changed = true;
      accept(session);
    });
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error)
          setAuthError(
            "Your session could not be restored. Please sign in again.",
          );
        if (!changed) accept(data?.session);
      })
      .catch(() => {
        if (active) {
          setLoading(false);
          setAuthError(
            "Accounts could not be reached. Guest play is still available.",
          );
        }
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError("Sign out failed. Please try again.");
      return;
    }
    setAuthError("");
  }
  return (
    <AuthContext.Provider
      value={{ user, loading, enabled: accountsEnabled, authError, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
