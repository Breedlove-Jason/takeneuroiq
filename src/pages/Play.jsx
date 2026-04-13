// src/pages/Play.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import {
  faMicrochip,
  faBorderAll,
  faRoute,
  faStar,
  faDiagramProject,
  faTableCells,
  faLink,
  faRotateRight
} from '@fortawesome/pro-duotone-svg-icons';

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

  const TechCorners = () => (
    <>
      <div className="absolute -left-px -top-px h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-cyan-400/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute -right-px -top-px h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-fuchsia-400/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute -bottom-px -left-px h-6 w-6 rounded-bl-2xl border-b-2 border-l-2 border-fuchsia-400/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute -bottom-px -right-px h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-cyan-400/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </>
  );

  const challenges = [
    {
      icon: faStar,
      puzzleType: 'pattern_rush',
      title: 'Pattern Rush',
      description:
        'Spot sequences, decode visual patterns, and react fast under pressure.',
      buttonText: 'Launch Pattern Rush',
      skills: ['Patterns', 'Visual'],
      cardTone: {
        cyber:
          'border-cyan-300/40 bg-[linear-gradient(160deg,rgba(34,211,238,0.20)_0%,rgba(22,16,54,0.88)_48%,rgba(4,9,18,0.96)_100%)] shadow-[0_0_34px_rgba(34,211,238,0.24)] hover:border-cyan-300/80 hover:shadow-[0_0_54px_rgba(168,85,247,0.24)]',
        light:
          'border-cyan-300 bg-[linear-gradient(155deg,rgba(236,254,255,0.95)_0%,rgba(255,255,255,1)_55%,rgba(240,249,255,0.9)_100%)] shadow-[0_14px_32px_rgba(8,145,178,0.14)] hover:border-cyan-400 hover:shadow-[0_18px_38px_rgba(8,145,178,0.2)]',
      },
      iconTone: {
        cyber:
          'text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.62)]',
        light: 'text-cyan-600',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-cyan-300 via-violet-400 to-fuchsia-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.42)] hover:from-fuchsia-400 hover:via-violet-400 hover:to-cyan-300 hover:brightness-110 hover:shadow-[0_0_42px_rgba(168,85,247,0.45)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-cyan-600 to-blue-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:brightness-110 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200',
        light: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      },
      glowTone: 'group-hover:text-glow-blue',
    },
    {
      icon: faDiagramProject,
      puzzleType: 'sequence_sprint',
      title: 'Sequence Sprint',
      description:
        'Read number patterns, predict what comes next, and respond under pressure.',
      buttonText: 'Launch Sequence Sprint',
      skills: ['Memory', 'Prediction'],
      hasPulse: true,
      cardTone: {
        cyber:
          'border-fuchsia-300/40 bg-[linear-gradient(160deg,rgba(236,72,153,0.18)_0%,rgba(38,10,46,0.9)_48%,rgba(16,8,6,0.96)_100%)] shadow-[0_0_34px_rgba(236,72,153,0.22)] hover:border-fuchsia-300/80 hover:shadow-[0_0_54px_rgba(245,158,11,0.22)]',
        light:
          'border-fuchsia-300 bg-[linear-gradient(155deg,rgba(253,244,255,0.96)_0%,rgba(255,255,255,1)_58%,rgba(252,231,243,0.9)_100%)] shadow-[0_14px_32px_rgba(192,38,211,0.14)] hover:border-fuchsia-400 hover:shadow-[0_18px_38px_rgba(192,38,211,0.2)]',
      },
      iconTone: {
        cyber:
          'text-fuchsia-300 drop-shadow-[0_0_18px_rgba(236,72,153,0.62)]',
        light: 'text-fuchsia-600',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-fuchsia-500 via-violet-500 to-amber-400 text-slate-950 shadow-[0_0_24px_rgba(236,72,153,0.42)] hover:from-amber-400 hover:via-violet-500 hover:to-fuchsia-500 hover:brightness-125 hover:shadow-[0_0_44px_rgba(245,158,11,0.5)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-fuchsia-600 to-sky-600 text-white hover:from-sky-700 hover:to-fuchsia-700 hover:brightness-110 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-200',
        light: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
      },
      glowTone: 'group-hover:text-glow-pink',
    },
    {
      icon: faRotateRight,
      puzzleType: 'rule_shift',
      title: 'Rule Shift',
      description:
        'Adapt to changing rules mid-session. Maintain cognitive flexibility to keep scoring.',
      buttonText: 'Launch Rule Shift',
      skills: ['Adaptation', 'Rules'],
      hasPulse: true,
      cardTone: {
        cyber:
          'border-amber-300/40 bg-[linear-gradient(160deg,rgba(245,158,11,0.18)_0%,rgba(24,18,8,0.9)_48%,rgba(4,9,18,0.96)_100%)] shadow-[0_0_34px_rgba(245,158,11,0.22)] hover:border-amber-300/80 hover:shadow-[0_0_54px_rgba(34,211,238,0.24)]',
        light:
          'border-amber-300 bg-[linear-gradient(155deg,rgba(255,251,235,0.96)_0%,rgba(255,255,255,1)_58%,rgba(254,243,199,0.9)_100%)] shadow-[0_14px_32px_rgba(245,158,11,0.14)] hover:border-amber-400 hover:shadow-[0_18px_38px_rgba(245,158,11,0.2)]',
      },
      iconTone: {
        cyber:
          'text-amber-300 drop-shadow-[0_0_18px_rgba(245,158,11,0.62)]',
        light: 'text-amber-600',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-amber-400 via-violet-500 to-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.42)] hover:from-cyan-400 hover:via-violet-500 hover:to-amber-400 hover:brightness-110 hover:shadow-[0_0_42px_rgba(34,211,238,0.5)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-amber-600 to-orange-600 text-white hover:from-orange-700 hover:to-amber-700 hover:brightness-110 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-amber-300/30 bg-amber-400/10 text-amber-200',
        light: 'border-amber-200 bg-amber-50 text-amber-700',
      },
      glowTone: 'group-hover:text-glow-orange',
    },
    {
      icon: faTableCells,
      puzzleType: 'grid_recall',
      title: 'Grid Recall',
      description:
        'Memorize complex neural patterns and reconstruct them from memory.',
      buttonText: 'Launch Grid Recall',
      skills: ['Spatial', 'Attention'],
      hasPulse: true,
      cardTone: {
        cyber:
          'border-violet-400/40 bg-[linear-gradient(160deg,rgba(139,92,246,0.20)_0%,rgba(33,12,40,0.9)_46%,rgba(8,4,18,0.96)_100%)] shadow-[0_0_34px_rgba(139,92,246,0.24)] hover:border-violet-400/80 hover:shadow-[0_0_54px_rgba(217,70,239,0.22)]',
        light:
          'border-violet-300 bg-[linear-gradient(155deg,rgba(245,243,255,0.96)_0%,rgba(255,255,255,1)_56%,rgba(245,243,255,0.92)_100%)] shadow-[0_14px_32px_rgba(139,92,246,0.14)] hover:border-violet-400 hover:shadow-[0_18px_38px_rgba(139,92,246,0.22)]',
      },
      iconTone: {
        cyber:
          'text-violet-300 drop-shadow-[0_0_18px_rgba(139,92,246,0.62)]',
        light: 'text-violet-600',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-[0_0_24px_rgba(139,92,246,0.42)] hover:from-cyan-400 hover:via-fuchsia-500 hover:to-violet-500 hover:brightness-110 hover:shadow-[0_0_44px_rgba(217,70,239,0.52)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 hover:brightness-110 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
        light: 'border-violet-200 bg-violet-50 text-violet-700',
      },
      glowTone: 'group-hover:text-glow-purple',
    },
    {
      icon: faBorderAll,
      puzzleType: 'logic_grid',
      title: 'Logic Grid',
      description:
        'Solve a missing cell by tracing structured reasoning across a matrix and inferring the hidden rule.',
      buttonText: 'Launch Logic Grid',
      skills: ['Matrices', 'Inference'],
      hasPulse: true,
      cardTone: {
        cyber:
          'border-cyan-300/40 bg-[linear-gradient(160deg,rgba(34,211,238,0.20)_0%,rgba(18,12,42,0.9)_46%,rgba(4,8,18,0.96)_100%)] shadow-[0_0_34px_rgba(34,211,238,0.24)] hover:border-cyan-300/80 hover:shadow-[0_0_54px_rgba(168,85,247,0.24)]',
        light:
          'border-cyan-300 bg-[linear-gradient(155deg,rgba(236,254,255,0.96)_0%,rgba(255,255,255,1)_56%,rgba(240,249,255,0.92)_100%)] shadow-[0_14px_32px_rgba(34,211,238,0.14)] hover:border-cyan-400 hover:shadow-[0_18px_38px_rgba(34,211,238,0.22)]',
      },
      iconTone: {
        cyber:
          'text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.62)]',
        light: 'text-cyan-600',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-cyan-400 via-violet-500 to-amber-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.42)] hover:from-amber-400 hover:via-violet-500 hover:to-cyan-400 hover:brightness-110 hover:shadow-[0_0_44px_rgba(168,85,247,0.5)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-cyan-600 via-violet-600 to-amber-600 text-white hover:from-amber-700 hover:via-violet-700 hover:to-cyan-700 hover:brightness-110 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200',
        light: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      },
      glowTone: 'group-hover:text-glow-blue',
    },
    {
      icon: faRoute,
      puzzleType: 'signal_path',
      title: 'Signal Path',
      description:
        'Route the correct signal path through a compact network using constraint-driven logic.',
      buttonText: 'Launch Signal Path',
      skills: ['Planning', 'Routing'],
      hasPulse: true,
      cardTone: {
        cyber:
          'border-fuchsia-300/40 bg-[linear-gradient(160deg,rgba(236,72,153,0.18)_0%,rgba(38,10,46,0.9)_48%,rgba(16,8,6,0.96)_100%)] shadow-[0_0_34px_rgba(236,72,153,0.22)] hover:border-fuchsia-300/80 hover:shadow-[0_0_54px_rgba(245,158,11,0.22)]',
        light:
          'border-fuchsia-300 bg-[linear-gradient(155deg,rgba(253,244,255,0.96)_0%,rgba(255,255,255,1)_58%,rgba(252,231,243,0.9)_100%)] shadow-[0_14px_32px_rgba(192,38,211,0.14)] hover:border-fuchsia-400 hover:shadow-[0_18px_38px_rgba(192,38,211,0.2)]',
      },
      iconTone: {
        cyber:
          'text-fuchsia-300 drop-shadow-[0_0_18px_rgba(236,72,153,0.62)]',
        light: 'text-fuchsia-600',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-fuchsia-500 via-violet-500 to-amber-400 text-slate-950 shadow-[0_0_24px_rgba(236,72,153,0.42)] hover:from-amber-400 hover:via-violet-500 hover:to-fuchsia-500 hover:brightness-125 hover:shadow-[0_0_44px_rgba(245,158,11,0.5)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-fuchsia-600 to-sky-600 text-white hover:from-sky-700 hover:to-fuchsia-700 hover:brightness-110 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-200',
        light: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
      },
      glowTone: 'group-hover:text-glow-pink',
    },
    {
      icon: faMicrochip,
      puzzleType: 'logic_gate',
      title: 'Logic Gate',
      description:
        'Resolve binary signal outputs through gate logic and deductive reasoning.',
      buttonText: 'Launch Logic Gate',
      skills: ['Signals', 'Binary Logic'],
      hasPulse: true,
      cardTone: {
        cyber:
          'border-amber-400/40 bg-[linear-gradient(160deg,rgba(245,158,11,0.22)_0%,rgba(19,18,6,0.9)_48%,rgba(10,4,24,0.96)_100%)] shadow-[0_0_34px_rgba(245,158,11,0.26)] hover:border-amber-400/80 hover:shadow-[0_0_54px_rgba(168,85,247,0.24)]',
        light:
          'border-amber-300 bg-[linear-gradient(155deg,rgba(255,251,235,0.98)_0%,rgba(255,255,255,1)_58%,rgba(254,243,199,0.95)_100%)] shadow-[0_14px_32px_rgba(245,158,11,0.14)] hover:border-amber-400 hover:shadow-[0_18px_38px_rgba(245,158,11,0.22)]',
      },
      iconTone: {
        cyber:
          'text-amber-300 drop-shadow-[0_0_18px_rgba(245,158,11,0.62)]',
        light: 'text-amber-600',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-amber-400 via-cyan-400 to-violet-500 text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.42)] hover:from-violet-500 hover:via-cyan-400 hover:to-amber-400 hover:brightness-110 hover:shadow-[0_0_42px_rgba(168,85,247,0.5)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-amber-600 to-orange-600 text-white hover:from-orange-700 hover:to-amber-700 hover:brightness-110 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
        light: 'border-amber-200 bg-amber-50 text-amber-700',
      },
      glowTone: 'group-hover:text-glow-orange',
    },
    {
      icon: faLink,
      puzzleType: 'memory_chain',
      title: 'Memory Chain',
      description:
        'An ordered chain of values is shown with one hidden. Recall the missing value to maintain the sequence.',
      buttonText: 'Launch Memory Chain',
      skills: ['Ordered Recall', 'Working Memory'],
      hasPulse: true,
      cardTone: {
        cyber:
          'border-violet-400/40 bg-[linear-gradient(160deg,rgba(139,92,246,0.20)_0%,rgba(33,12,40,0.9)_46%,rgba(8,4,18,0.96)_100%)] shadow-[0_0_34px_rgba(139,92,246,0.24)] hover:border-violet-400/80 hover:shadow-[0_0_54px_rgba(217,70,239,0.22)]',
        light:
          'border-violet-300 bg-[linear-gradient(155deg,rgba(245,243,255,0.96)_0%,rgba(255,255,255,1)_56%,rgba(245,243,255,0.92)_100%)] shadow-[0_14px_32px_rgba(139,92,246,0.14)] hover:border-violet-400 hover:shadow-[0_18px_38px_rgba(139,92,246,0.22)]',
      },
      iconTone: {
        cyber:
          'text-violet-300 drop-shadow-[0_0_18px_rgba(139,92,246,0.62)]',
        light: 'text-violet-600',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-[0_0_24px_rgba(139,92,246,0.42)] hover:from-cyan-400 hover:via-fuchsia-500 hover:to-violet-500 hover:brightness-110 hover:shadow-[0_0_44px_rgba(217,70,239,0.52)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 hover:brightness-110 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
        light: 'border-violet-200 bg-violet-50 text-violet-700',
      },
      glowTone: 'group-hover:text-glow-purple',
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative mx-auto max-w-3xl text-center animate-fadeIn">
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

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 perspective-distant">
          {challenges.map((challenge, index) => (
            <div
              key={challenge.title}
              style={{ animationDelay: `${index * 200}ms` }}
              className={`group relative flex h-full flex-col rounded-2xl border p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-3 hover:scale-[1.03] hover:rotate-1 animate-puzzle-piece-in ${
                isCyber
                  ? challenge.cardTone.cyber
                  : challenge.cardTone.light
              }`}
            >
              {isCyber && <TechCorners />}
              {isCyber && <div className="card-scanline absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
              
              <div
                className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl border text-4xl transition-all duration-300 relative ${
                  isCyber
                    ? 'border-white/15 bg-white/5 group-hover:scale-110 group-hover:rotate-6'
                    : 'border-slate-200 bg-white group-hover:scale-110'
                } ${isCyber ? challenge.iconTone.cyber : challenge.iconTone.light}`}
              >
                {isCyber && challenge.hasPulse && (
                  <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full border-2 border-current opacity-0 animate-signal-pulse" />
                    <div className="absolute w-12 h-12 rounded-full border border-current opacity-0 animate-signal-pulse" style={{ animationDelay: '0.6s' }} />
                  </div>
                )}
                <FontAwesomeIcon
                  icon={challenge.icon}
                  className="relative z-10 animate-float-subtle [--fa-secondary-opacity:0.4]"
                />
              </div>

              <h2
                className={`mt-5 text-2xl font-semibold transition-all duration-300 ${
                  isCyber ? `text-white ${challenge.glowTone}` : 'text-slate-900'
                }`}
              >
                {challenge.title}
              </h2>

              <p
                className={`mt-4 min-h-18 font-medium leading-7 ${
                  isCyber ? 'text-slate-200' : 'text-slate-600'
                }`}
              >
                {challenge.description}
              </p>

              {challenge.skills && (
                <div className="mt-auto flex min-h-10 flex-wrap gap-2 pt-8">
                  {challenge.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                        isCyber ? challenge.tagTone.cyber : challenge.tagTone.light
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {challenge.puzzleType ? (
                <div className="mt-4">
                  <Link
                    to="/arena"
                    state={{ puzzleType: challenge.puzzleType }}
                    className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-[0.97] ${
                      theme === 'cyber'
                        ? challenge.buttonTone.cyber
                        : challenge.buttonTone.light
                    }`}
                  >
                    {challenge.buttonText}
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    type="button"
                    disabled
                    className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-[0.97] ${
                      theme === 'cyber'
                        ? 'cursor-not-allowed border border-amber-300/25 bg-amber-300/5 text-amber-200 opacity-60'
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
