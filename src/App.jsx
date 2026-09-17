import RouteErrorBoundary from "./components/RouteErrorBoundary";
import { lazy, Suspense } from "react";
import { useAuth } from "./auth/AuthContext";

import ScoreSync from "./components/ScoreSync";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

// import Header from "./layout/Header"
import Home from "./pages/Home";
import Play from "./pages/Play";

import Header from "./layout/Header.jsx";

/**
 * App Root Component
 *
 * Sets the overall theme and application routing structure using React Router.
 * Managed themes: 'cyber' (dark/futuristic) and 'light' (clean/modern).
 */
const AuthPage = lazy(() => import("./pages/AuthPage"));

const AccountPage = lazy(() => import("./pages/AccountPage"));

const Arena = lazy(() => import("./pages/Arena"));

const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage.jsx"));

const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));

function App() {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("neuroiq_theme") === "light"
        ? "light"
        : "cyber";
    } catch {
      return "cyber";
    }
  });
  const { pathname } = useLocation();
  useEffect(() => {
    try {
      localStorage.setItem("neuroiq_theme", theme);
    } catch {
      /* Storage is optional. */
    }
  }, [theme]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div
      className={
        theme === "cyber"
          ? "relative min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden"
          : "min-h-screen bg-white"
      }
    >
      {theme === "cyber" && (
        <>
          <div className="bg-grid-cyber pointer-events-none fixed inset-0 z-0 opacity-20" />
          <div className="pointer-events-none fixed -top-[10%] -left-[10%] z-0 h-[40%] w-[40%] rounded-full bg-cyan-500/10 blur-[120px] animate-float" />
          <div className="pointer-events-none fixed -bottom-[10%] -right-[10%] z-0 h-[40%] w-[40%] rounded-full bg-fuchsia-500/10 blur-[120px] animate-float [animation-delay:2s]" />
          <div className="pointer-events-none fixed top-[20%] right-[10%] z-0 h-[30%] w-[30%] rounded-full bg-violet-500/5 blur-[100px] animate-float [animation-delay:4s]" />
          <div className="bg-linear-to-b pointer-events-none fixed inset-0 z-0 from-transparent via-transparent to-slate-950/80" />
        </>
      )}
      <div className="relative z-10">
        <Header theme={theme} setTheme={setTheme} />

        <ScoreSync />
        {loading ? (
          <p role="status" className="p-12 text-center">
            Restoring your account…
          </p>
        ) : (
          <RouteErrorBoundary path={pathname}><Suspense
            fallback={
              <p role="status" className="p-12 text-center">
                Loading your next challenge…
              </p>
            }
          >
            <Routes>
              <Route path="/login" element={<AuthPage key="login" />} />
              <Route
                path="/register"
                element={<AuthPage key="register" mode="register" />}
              />
              <Route
                path="/forgot-password"
                element={<AuthPage key="forgot" mode="forgot" />}
              />
              <Route
                path="/reset-password"
                element={<AuthPage key="reset" mode="reset" />}
              />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/" element={<Home theme={theme} />} />
              <Route path="/play" element={<Play theme={theme} />} />
              <Route
                path="/arena"
                element={<Arena key={user?.id || "guest"} theme={theme} />}
              />
              <Route
                path="/leaderboard"
                element={<LeaderboardPage theme={theme} />}
              />
              <Route
                path="/profile"
                element={<ProfilePage key={user?.id || "guest"} />}
              />
              <Route
                path="*"
                element={
                  <main className="mx-auto max-w-xl px-5 py-20 text-center">
                    <h1 className="text-4xl font-black">
                      That path is still a mystery.
                    </h1>
                    <p className="my-6">Let’s find you a challenge instead.</p>
                    <Link to="/play" className="neuro-button">
                      Back to challenges
                    </Link>
                  </main>
                }
              />
            </Routes>
          </Suspense></RouteErrorBoundary>
        )}
      </div>
    </div>
  );
}

export default App;
