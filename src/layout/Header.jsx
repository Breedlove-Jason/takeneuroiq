import { NavLink, Link } from "react-router-dom";
import { Sun, Moon, UserCircle } from "@phosphor-icons/react";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/logo.png";

export default function Header({ theme, setTheme }) {
  const isCyber = theme === "cyber";
  const { user, loading } = useAuth();
  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isCyber ? "border-slate-700/70 bg-slate-950/90 text-slate-100" : "border-slate-200 bg-white/95 text-slate-900"}`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-black tracking-tight"
        >
          <img
            src={logo}
            alt=""
            className="h-9 w-9 rounded-lg object-contain"
          />
          Take<span className="text-cyan-500">NeuroIQ</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full flex-wrap items-center justify-center gap-1 text-sm font-bold lg:order-none lg:w-auto"
        >
          {[
            ["/", "Home"],
            ["/play", "Challenges"],
            ["/leaderboard", "Leaderboard"],
            ["/profile", "My progress"],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 transition ${isActive ? (isCyber ? "bg-cyan-400/10 text-cyan-300" : "bg-cyan-50 text-cyan-800") : "opacity-75 hover:opacity-100"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isCyber ? "light" : "cyber")}
            aria-label={`Switch to ${isCyber ? "light" : "dark"} theme`}
            className="rounded-xl border border-slate-500/30 p-3"
          >
            {isCyber ? (
              <Sun size={19} weight="fill" />
            ) : (
              <Moon size={19} weight="fill" />
            )}
          </button>
          {loading ? (
            <span className="text-xs opacity-60" role="status">
              Connecting…
            </span>
          ) : user ? (
            <Link to="/account" className="neuro-button">
              <UserCircle size={18} weight="fill" />
              Account
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-bold"
              >
                Log in
              </Link>
              <Link to="/register" className="neuro-button text-sm">
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
