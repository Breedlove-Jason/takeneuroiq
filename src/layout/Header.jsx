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
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${
        isCyber
          ? 'border-cyan-400/10 bg-[#0b1120]/80 text-white'
          : 'border-slate-200 bg-white/80 text-slate-900'
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
              isCyber ? 'text-cyan-400' : 'text-cyan-600'
            }`}
          >
            TakeNeuroIQ
          </span>
        </Link>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center lg:gap-6">
          <nav
            className={`flex flex-wrap items-center justify-center gap-2 text-sm font-medium lg:justify-start ${
              isCyber ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <Link
              to="/"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isCyber
                  ? 'text-slate-300 hover:bg-white/5 hover:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
              }`}
            >
              Home
            </Link>

            <Link
              to="/play"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isCyber
                  ? 'text-slate-300 hover:bg-white/5 hover:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
              }`}
            >
              Play
            </Link>

            <Link
              to="/arena"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isCyber
                  ? 'text-slate-300 hover:bg-white/5 hover:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
              }`}
            >
              Pattern Rush
            </Link>

            <Link
              to="/leaderboard"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isCyber
                  ? 'text-slate-300 hover:bg-white/5 hover:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
              }`}
            >
              Leaderboard
            </Link>

            <Link
              to="/profile"
              className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isCyber
                  ? 'text-slate-300 hover:bg-white/5 hover:text-cyan-300'
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
              className={`relative flex items-center justify-center gap-3 self-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                isCyber
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
                  : 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-400'
              }`}
            >
              <span className={isCyber ? 'text-cyan-300' : 'text-slate-400'}>
                Cyber
              </span>

              <span className="relative flex h-6 w-14 items-center rounded-full bg-slate-900/80 px-1">
                <span
                  className={`absolute h-4 w-4 rounded-full transition-all duration-300 ${
                    isCyber
                      ? 'left-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                      : 'left-9 bg-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.8)]'
                  }`}
                />
              </span>

              <span
                className={!isCyber ? 'text-fuchsia-400' : 'text-slate-400'}
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
