import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

function Header({ theme, setTheme }) {
  const isCyber = theme === "cyber";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${
        isCyber
          ? "border-cyan-400/10 bg-[#0b1120]/80 text-white"
          : "border-slate-200 bg-white/80 text-slate-900"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="TakeNeuroIQ"
            className="h-10 w-10 rounded-lg object-contain"
          />

          <span
            className={`text-lg font-bold tracking-wide ${
              isCyber ? "text-cyan-400" : "text-cyan-600"
            }`}
          >
            TakeNeuroIQ
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <nav
            className={`flex items-center gap-2 text-sm font-medium ${
              isCyber ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <Link
              to="/"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isCyber
                  ? "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-cyan-600"
              }`}
            >
              Home
            </Link>

            <Link
              to="/play"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isCyber
                  ? "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-cyan-600"
              }`}
            >
              Play
            </Link>

            <Link
              to="/arena"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isCyber
                  ? "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-cyan-600"
              }`}
            >
              Pattern Rush
            </Link>

            <Link
              to="/leaderboard"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isCyber
                  ? "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-cyan-600"
              }`}
            >
              Leaderboard
            </Link>
          </nav>

          <button
            onClick={() => setTheme(isCyber ? "white" : "cyber")}
            className={`relative flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              isCyber
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                : "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-400"
            }`}
          >
            <span className={isCyber ? "text-cyan-300" : "text-slate-400"}>
              Cyber
            </span>

            <span className="relative flex h-6 w-14 items-center rounded-full bg-slate-900/80 px-1">
              <span
                className={`absolute h-4 w-4 rounded-full transition-all duration-300 ${
                  isCyber
                    ? "left-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                    : "left-9 bg-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.8)]"
                }`}
              />
            </span>

            <span className={!isCyber ? "text-fuchsia-400" : "text-slate-400"}>
              White
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
