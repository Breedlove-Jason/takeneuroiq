// src/pages/Play.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import {
  faWaveSquare,
  faArrowTrendUp,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Play Page Component
 *
 * Provides a selection screen for different game modes (challenges).
 * Currently, all modes link to the 'Arena' where the primary 'Pattern Rush'
 * game logic resides.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.theme - Current UI theme ('cyber' or 'light').
 */
function Play({ theme }) {
  const isCyber = theme === 'cyber';

  const challenges = [
    {
      icon: faWaveSquare,
      puzzleType: 'pattern_rush',
      title: 'Pattern Rush',
      description:
        'Spot sequences, decode visual patterns, and react fast under pressure.',
      buttonText: 'Launch Pattern Rush',
      skills: ['Pattern Recognition', 'Visual Processing'],
      cardTone: {
        cyber:
          'border-cyan-300/35 bg-[linear-gradient(160deg,rgba(34,211,238,0.18)_0%,rgba(8,16,30,0.88)_45%,rgba(4,9,18,0.96)_100%)] shadow-[0_0_34px_rgba(34,211,238,0.22)] hover:border-cyan-300/75 hover:shadow-[0_0_50px_rgba(34,211,238,0.32)]',
        light:
          'border-cyan-300 bg-[linear-gradient(155deg,rgba(236,254,255,0.95)_0%,rgba(255,255,255,1)_55%,rgba(240,249,255,0.9)_100%)] shadow-[0_14px_32px_rgba(8,145,178,0.14)] hover:border-cyan-400 hover:shadow-[0_18px_38px_rgba(8,145,178,0.2)]',
      },
      iconTone: {
        cyber:
          'text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.55)]',
        light: 'text-cyan-600',
      },
      buttonTone: {
        cyber:
          'bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.42)] hover:bg-cyan-200 hover:shadow-[0_0_34px_rgba(34,211,238,0.56)]',
        light: 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-sm',
      },
      tagTone: {
        cyber: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200',
        light: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      },
    },
    {
      icon: faArrowTrendUp,
      puzzleType: 'sequence_sprint',
      title: 'Sequence Sprint',
      description:
        'Read number patterns, predict what comes next, and respond under pressure.',
      buttonText: 'Launch Sequence Sprint',
      skills: ['Working Memory', 'Predictive Reasoning'],
      cardTone: {
        cyber:
          'border-violet-300/35 bg-[linear-gradient(160deg,rgba(168,85,247,0.16)_0%,rgba(14,12,30,0.9)_48%,rgba(7,9,20,0.96)_100%)] shadow-[0_0_34px_rgba(168,85,247,0.2)] hover:border-violet-300/75 hover:shadow-[0_0_50px_rgba(168,85,247,0.32)]',
        light:
          'border-violet-300 bg-[linear-gradient(155deg,rgba(245,243,255,0.96)_0%,rgba(255,255,255,1)_58%,rgba(250,245,255,0.9)_100%)] shadow-[0_14px_32px_rgba(124,58,237,0.14)] hover:border-violet-400 hover:shadow-[0_18px_38px_rgba(124,58,237,0.2)]',
      },
      iconTone: {
        cyber:
          'text-violet-300 drop-shadow-[0_0_18px_rgba(168,85,247,0.58)]',
        light: 'text-violet-600',
      },
      buttonTone: {
        cyber:
          'bg-[linear-gradient(90deg,rgba(167,139,250,0.95)_0%,rgba(34,211,238,0.95)_100%)] text-slate-950 shadow-[0_0_24px_rgba(167,139,250,0.4)] hover:brightness-110 hover:shadow-[0_0_36px_rgba(167,139,250,0.54)]',
        light:
          'bg-[linear-gradient(90deg,rgba(124,58,237,0.95)_0%,rgba(14,165,233,0.95)_100%)] text-white hover:brightness-110 shadow-sm',
      },
      tagTone: {
        cyber: 'border-violet-300/30 bg-violet-400/10 text-violet-200',
        light: 'border-violet-200 bg-violet-50 text-violet-700',
      },
    },
    {
      icon: faShieldHalved,
      puzzleType: 'grid_recall',
      title: 'Grid Recall',
      description:
        'Memorize complex neural patterns and reconstruct them from memory.',
      buttonText: 'Launch Grid Recall',
      skills: ['Spatial Memory', 'Attention'],
      cardTone: {
        cyber:
          'border-emerald-300/35 bg-[linear-gradient(160deg,rgba(16,185,129,0.16)_0%,rgba(6,20,13,0.9)_48%,rgba(2,10,6,0.96)_100%)] shadow-[0_0_34px_rgba(16,185,129,0.2)] hover:border-emerald-300/75 hover:shadow-[0_0_50px_rgba(16,185,129,0.32)]',
        light:
          'border-emerald-300 bg-[linear-gradient(155deg,rgba(236,253,245,0.96)_0%,rgba(255,255,255,1)_58%,rgba(240,253,244,0.9)_100%)] shadow-[0_14px_32px_rgba(16,185,129,0.14)] hover:border-emerald-400 hover:shadow-[0_18px_38px_rgba(16,185,129,0.2)]',
      },
      iconTone: {
        cyber:
          'text-emerald-300 drop-shadow-[0_0_18px_rgba(16,185,129,0.58)]',
        light: 'text-emerald-600',
      },
      buttonTone: {
        cyber:
          'bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.42)] hover:bg-emerald-300 hover:shadow-[0_0_34px_rgba(16,185,129,0.56)]',
        light: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm',
      },
      tagTone: {
        cyber: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200',
        light: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      },
    },
  ];

  return (
    <section className="animate-fadeIn px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative mx-auto max-w-3xl text-center">
          {isCyber && (
            <div className="pointer-events-none absolute inset-x-10 -bottom-6 -top-8 -z-10 rounded-full bg-cyan-400/20 blur-[100px] animate-pulse" />
          )}
          <p
            className={`text-sm font-bold uppercase tracking-[0.25em] ${
              isCyber
                ? 'text-cyan-300 text-glow-blue'
                : 'text-cyan-600'
            }`}
          >
            Neural Challenge Console
          </p>

          <h1
            className={`mt-4 text-4xl font-bold md:text-5xl ${
              isCyber
                ? 'bg-linear-to-r from-white via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                : 'text-slate-900'
            }`}
          >
            Choose your challenge arena
          </h1>

          <p
            className={`mt-6 text-lg font-medium leading-8 ${
              isCyber ? 'text-slate-200' : 'text-slate-600'
            }`}
          >
            Enter a fast-paced cognitive challenge designed to test how you
            think, react, and adapt under pressure.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.title}
              className={`group flex h-full flex-col rounded-2xl border p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 ${
                isCyber
                  ? challenge.cardTone.cyber
                  : challenge.cardTone.light
              }`}
            >
              <div
                className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl border text-4xl transition-all duration-300 ${
                  isCyber
                    ? 'border-white/15 bg-white/5 group-hover:scale-105'
                    : 'border-slate-200 bg-white group-hover:scale-105'
                } ${isCyber ? challenge.iconTone.cyber : challenge.iconTone.light}`}
              >
                <FontAwesomeIcon icon={challenge.icon} />
              </div>

              <h2
                className={`mt-5 text-2xl font-semibold ${
                  isCyber ? 'text-white' : 'text-slate-900'
                }`}
              >
                {challenge.title}
              </h2>

              <p
                className={`mt-4 font-medium leading-7 ${
                  isCyber ? 'text-slate-200' : 'text-slate-600'
                }`}
              >
                {challenge.description}
              </p>

              {challenge.skills && (
                <div className="mt-5 flex flex-nowrap gap-2 overflow-x-auto pb-1">
                  {challenge.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
                        isCyber ? challenge.tagTone.cyber : challenge.tagTone.light
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {challenge.puzzleType ? (
                <div className="mt-auto pt-[5px]">
                  <Link
                    to="/arena"
                    state={{ puzzleType: challenge.puzzleType }}
                    className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${
                      theme === 'cyber'
                        ? challenge.buttonTone.cyber
                        : challenge.buttonTone.light
                    }`}
                  >
                    {challenge.buttonText}
                  </Link>
                </div>
              ) : (
                <div className="mt-auto pt-[5px]">
                  <button
                    type="button"
                    disabled
                    className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${
                      theme === 'cyber'
                        ? 'cursor-not-allowed border border-amber-300/25 bg-amber-300/10 text-amber-200'
                        : 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Coming Soon
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Play;
