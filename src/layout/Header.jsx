import logo from '../assets/logo.png';
import { getPlayerName } from '../game/playerIdentity';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Header({ theme, setTheme }) {
  const isCyber = theme === 'cyber';
  const [playerName, setPlayerName] = useState(() => getPlayerName());
  useEffect(() => {
    const handlePlayerIdentityUpdated = () => {
      setPlayerName(getPlayerName());
    };

    window.addEventListener(
      'takeneuroiq:player-identity-updated',
      handlePlayerIdentityUpdated,
    );

    return () => {
      window.removeEventListener(
        'takeneuroiq:player-identity-updated',
        handlePlayerIdentityUpdated,
      );
    };
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-2xl transition-all duration-300 ${
        isCyber
          ? 'border-cyan-400/20 bg-slate-950/80 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
          : 'border-slate-200 bg-white/80 text-slate-900 shadow-sm'
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link
          to="/"
          className="flex items-center justify-center gap-3 lg:justify-start"
        >
          <img
            src={logo}
            alt="TakeNeuroIQ"
            className="h-10 w-10 rounded-lg object-contain"
          />

          <span
            className={`text-lg font-bold tracking-wide ${
              isCyber ? 'text-cyan-400 text-glow-blue' : 'text-cyan-600'
            }`}
          >
            TakeNeuroIQ
          </span>
        </Link>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center lg:gap-6">
          <nav
            className={`flex flex-wrap items-center justify-center gap-2 text-sm font-semibold lg:justify-start ${
              isCyber ? 'text-slate-200' : 'text-slate-600'
            }`}
          >
            <Link
              to="/"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-bold transition ${
                isCyber
                  ? 'text-slate-200 hover:bg-white/5 hover:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
              }`}
            >
              Home
            </Link>

            <Link
              to="/play"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-bold transition ${
                isCyber
                  ? 'text-slate-200 hover:bg-white/5 hover:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
              }`}
            >
              Play
            </Link>

            <Link
              to="/arena"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-bold transition ${
                isCyber
                  ? 'text-slate-200 hover:bg-white/5 hover:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
              }`}
            >
              Pattern Rush
            </Link>

            <Link
              to="/leaderboard"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-bold transition ${
                isCyber
                  ? 'text-slate-200 hover:bg-white/5 hover:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
              }`}
            >
              Leaderboard
            </Link>

            <Link
              to="/profile"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-bold transition ${
                isCyber
                  ? 'text-slate-200 hover:bg-white/5 hover:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
              }`}
            >
              Profile
            </Link>
          </nav>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-end">
            <div
              className={`rounded-xl border px-3 py-2 text-center text-sm font-semibold sm:text-left ${
                isCyber
                  ? 'border-cyan-400/20 bg-slate-900/70 text-cyan-300'
                  : 'border-slate-300 bg-white/80 text-slate-700'
              }`}
            >
              {playerName}
            </div>

            <button
              onClick={() => setTheme(isCyber ? 'white' : 'cyber')}
              className={`group relative flex items-center justify-center gap-3 self-center rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                isCyber
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                  : 'border-slate-300 bg-slate-50 text-slate-500 shadow-sm'
              }`}
            >
              <span className={isCyber ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                Cyber
              </span>

              <div className="relative flex h-5 w-10 items-center rounded-full bg-slate-900/80 px-1 transition-all duration-300 group-hover:bg-slate-800">
                <div
                  className={`h-3 w-3 rounded-full transition-all duration-500 ${
                    isCyber
                      ? 'translate-x-0 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                      : 'translate-x-5 bg-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.8)]'
                  }`}
                />
              </div>

              <span
                className={!isCyber ? 'text-fuchsia-500 font-bold' : 'text-slate-400'}
              >
                White
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
