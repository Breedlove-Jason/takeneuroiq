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
  faRotateRight,
  faBullseye,
  faShapes,
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
      hasPulse: true,
      cardTone: {
        cyber:
          'border-cyan-300/40 bg-[linear-gradient(160deg,rgba(34,211,238,0.20)_0%,rgba(22,16,54,0.88)_48%,rgba(4,9,18,0.96)_100%)] shadow-[0_0_34px_rgba(34,211,238,0.24)] hover:border-cyan-300/80 hover:shadow-[0_0_54px_rgba(34,211,238,0.32)]',
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
          'bg-linear-to-r from-cyan-300 via-sky-400 to-cyan-200 text-white shadow-[0_0_24px_rgba(34,211,238,0.42)] hover:from-cyan-200 hover:via-sky-300 hover:to-cyan-400 hover:brightness-110 hover:shadow-[0_0_42px_rgba(34,211,238,0.45)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-cyan-100 via-sky-100 to-violet-100 text-white border border-slate-900/10 hover:from-cyan-200 hover:via-sky-50 hover:to-violet-100 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200',
        light: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      },
      glowTone: 'group-hover:text-glow-blue',
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
          'border-amber-400/45 bg-[linear-gradient(160deg,rgba(245,158,11,0.24)_0%,rgba(36,22,8,0.92)_46%,rgba(12,8,4,0.96)_100%)] shadow-[0_0_34px_rgba(245,158,11,0.28)] hover:border-amber-300/85 hover:shadow-[0_0_54px_rgba(251,191,36,0.32)]',
        light:
          'border-amber-300 bg-[linear-gradient(155deg,rgba(255,251,235,0.98)_0%,rgba(255,255,255,1)_56%,rgba(254,243,199,0.94)_100%)] shadow-[0_14px_32px_rgba(245,158,11,0.16)] hover:border-amber-400 hover:shadow-[0_18px_38px_rgba(245,158,11,0.22)]',
      },
      iconTone: {
        cyber:
          'text-amber-300 drop-shadow-[0_0_18px_rgba(245,158,11,0.65)]',
        light: 'text-amber-700',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-amber-400 via-orange-400 to-yellow-500 text-white shadow-[0_0_24px_rgba(245,158,11,0.45)] hover:from-yellow-500 hover:via-amber-500 hover:to-orange-400 hover:brightness-110 hover:shadow-[0_0_42px_rgba(251,191,36,0.4)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-amber-100 to-orange-50 text-white border border-slate-900/10 hover:from-amber-200 hover:to-orange-100 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-amber-400/35 bg-amber-500/15 text-amber-100',
        light: 'border-amber-200 bg-amber-50 text-amber-800',
      },
      glowTone: 'group-hover:text-glow-orange',
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
          'border-fuchsia-500/40 bg-[linear-gradient(160deg,rgba(217,70,239,0.22)_0%,rgba(48,12,44,0.92)_46%,rgba(18,6,22,0.96)_100%)] shadow-[0_0_34px_rgba(217,70,239,0.3)] hover:border-pink-400/70 hover:shadow-[0_0_54px_rgba(236,72,153,0.32)]',
        light:
          'border-fuchsia-400 bg-[linear-gradient(155deg,rgba(253,244,255,0.98)_0%,rgba(255,255,255,1)_56%,rgba(250,232,255,0.95)_100%)] shadow-[0_14px_32px_rgba(192,38,211,0.16)] hover:border-fuchsia-500 hover:shadow-[0_18px_38px_rgba(217,70,239,0.22)]',
      },
      iconTone: {
        cyber:
          'text-fuchsia-300 drop-shadow-[0_0_18px_rgba(217,70,239,0.68)]',
        light: 'text-fuchsia-700',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-fuchsia-500 via-pink-500 to-fuchsia-600 text-white shadow-[0_0_24px_rgba(217,70,239,0.48)] hover:from-fuchsia-600 hover:via-pink-400 hover:to-fuchsia-500 hover:brightness-110 hover:shadow-[0_0_44px_rgba(236,72,153,0.45)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-fuchsia-100 via-pink-50 to-fuchsia-50 text-white border border-slate-900/10 hover:from-fuchsia-200 hover:via-pink-100 hover:to-fuchsia-50 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-100',
        light: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800',
      },
      glowTone: 'group-hover:text-glow-pink',
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
          'border-[var(--color-aqua-border)]/45 bg-[linear-gradient(160deg,var(--color-aqua-tint)_0%,rgba(8,28,32,0.92)_42%,rgba(6,14,20,0.96)_100%)] shadow-[0_0_34px_rgba(104,217,207,0.28)] hover:border-[var(--color-aqua-border)] hover:shadow-[0_0_54px_rgba(168,240,234,0.28)]',
        light:
          'border-[var(--color-aqua-border)] bg-[linear-gradient(155deg,rgba(240,253,250,0.98)_0%,rgba(255,255,255,1)_54%,rgba(236,254,255,0.95)_100%)] shadow-[0_14px_32px_rgba(104,217,207,0.15)] hover:border-[var(--color-aqua-accent)] hover:shadow-[0_18px_38px_rgba(168,240,234,0.18)]',
      },
      iconTone: {
        cyber:
          'text-[var(--color-aqua-icon)] drop-shadow-[0_0_18px_rgba(168,240,234,0.55)]',
        light: 'text-[var(--color-aqua-accent)]',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-[var(--color-aqua-border)] via-[var(--color-aqua-accent)] to-teal-500 text-white shadow-[0_0_24px_rgba(104,217,207,0.42)] hover:from-teal-500 hover:via-[var(--color-aqua-accent)] hover:to-[var(--color-aqua-border)] hover:brightness-110 hover:shadow-[0_0_44px_rgba(168,240,234,0.38)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-teal-100 via-[var(--color-aqua-icon)] to-sky-50 text-white border border-slate-900/10 hover:from-teal-200 hover:via-[var(--color-aqua-icon)] hover:to-sky-50 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-[var(--color-aqua-border)]/35 bg-[var(--color-aqua-accent)]/12 text-[var(--color-aqua-icon)]',
        light: 'border-[var(--color-aqua-border)] bg-[var(--color-aqua-tint)] text-[var(--color-aqua-accent)]',
      },
      glowTone: 'group-hover:text-glow-aqua',
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
          'border-sky-400/50 bg-[linear-gradient(160deg,rgba(56,189,248,0.24)_0%,rgba(12,24,58,0.92)_44%,rgba(6,10,28,0.96)_100%)] shadow-[0_0_34px_rgba(59,130,246,0.32)] hover:border-blue-400/55 hover:shadow-[0_0_54px_rgba(56,189,248,0.3)]',
        light:
          'border-sky-300 bg-[linear-gradient(155deg,rgba(240,249,255,0.98)_0%,rgba(255,255,255,1)_54%,rgba(224,242,254,0.96)_100%)] shadow-[0_14px_32px_rgba(56,189,248,0.16)] hover:border-blue-400 hover:shadow-[0_18px_38px_rgba(59,130,246,0.2)]',
      },
      iconTone: {
        cyber:
          'text-sky-300 drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]',
        light: 'text-sky-700',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 text-white shadow-[0_0_24px_rgba(56,189,248,0.45)] hover:from-indigo-500 hover:via-blue-500 hover:to-sky-400 hover:brightness-110 hover:shadow-[0_0_44px_rgba(59,130,246,0.42)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-sky-100 via-blue-50 to-indigo-50 text-white border border-slate-900/10 hover:from-sky-200 hover:via-blue-50 hover:to-indigo-50 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-sky-400/35 bg-blue-500/12 text-sky-100',
        light: 'border-sky-200 bg-sky-50 text-sky-800',
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
          'border-cyan-600/50 bg-[linear-gradient(160deg,rgba(8,145,178,0.22)_0%,rgba(6,28,40,0.92)_42%,rgba(2,10,18,0.96)_100%)] shadow-[0_0_34px_rgba(8,145,178,0.28)] hover:border-cyan-500 hover:shadow-[0_0_54px_rgba(6,182,212,0.32)]',
        light:
          'border-cyan-600 bg-[linear-gradient(155deg,rgba(236,254,255,0.98)_0%,rgba(255,255,255,1)_52%,rgba(224,242,254,0.96)_100%)] shadow-[0_14px_32px_rgba(8,145,178,0.15)] hover:border-cyan-700 hover:shadow-[0_18px_38px_rgba(6,182,212,0.18)]',
      },
      iconTone: {
        cyber:
          'text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.45)]',
        light: 'text-cyan-700',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-[0_0_24px_rgba(8,145,178,0.48)] hover:from-indigo-600 hover:via-blue-600 hover:to-cyan-600 hover:brightness-110 hover:shadow-[0_0_44px_rgba(37,99,235,0.48)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-cyan-100 via-blue-50 to-indigo-50 text-white border border-slate-900/10 hover:from-cyan-200 hover:via-blue-50 hover:to-indigo-50 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-cyan-500/35 bg-blue-600/10 text-cyan-100',
        light: 'border-cyan-200 bg-blue-50 text-blue-800',
      },
      glowTone: 'group-hover:text-glow-blue',
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
          'border-[var(--color-lilac-border)]/45 bg-[linear-gradient(160deg,var(--color-lilac-tint)_0%,rgba(46,16,72,0.9)_44%,rgba(10,8,28,0.96)_100%)] shadow-[0_0_34px_rgba(168,139,255,0.3)] hover:border-[var(--color-lilac-border)] hover:shadow-[0_0_54px_rgba(201,182,255,0.32)]',
        light:
          'border-[var(--color-lilac-border)] bg-[linear-gradient(155deg,rgba(238,242,255,0.98)_0%,rgba(255,255,255,1)_54%,rgba(245,243,255,0.96)_100%)] shadow-[0_14px_32px_rgba(169,139,255,0.16)] hover:border-[var(--color-lilac-accent)] hover:shadow-[0_18px_38px_rgba(201,182,255,0.2)]',
      },
      iconTone: {
        cyber:
          'text-[var(--color-lilac-icon)] drop-shadow-[0_0_18px_rgba(201,182,255,0.65)]',
        light: 'text-[var(--color-lilac-accent)]',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-[var(--color-lilac-border)] via-[var(--color-lilac-accent)] to-indigo-600 text-white shadow-[0_0_24px_rgba(168,139,255,0.45)] hover:from-indigo-600 hover:via-[var(--color-lilac-accent)] hover:to-[var(--color-lilac-border)] hover:brightness-110 hover:shadow-[0_0_44px_rgba(201,182,255,0.42)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-indigo-100 via-[var(--color-lilac-icon)] to-fuchsia-50 text-white border border-slate-900/10 hover:from-indigo-200 hover:via-[var(--color-lilac-icon)] hover:to-fuchsia-50 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-[var(--color-lilac-border)]/35 bg-[var(--color-lilac-accent)]/12 text-[var(--color-lilac-icon)]',
        light: 'border-[var(--color-lilac-border)] bg-[var(--color-lilac-tint)] text-[var(--color-lilac-accent)]',
      },
      glowTone: 'group-hover:text-glow-lilac',
    },
    {
      icon: faShapes,
      puzzleType: 'symbol_recall',
      title: 'Symbol Recall',
      description:
        'A target symbol is shown first, then you must remember it and identify the same symbol from the answer options.',
      buttonText: 'Launch Symbol Recall',
      skills: ['Visual Memory', 'Rapid Recall'],
      hasPulse: true,
      cardTone: {
        cyber:
          'border-[var(--color-rose-border)]/50 bg-[linear-gradient(160deg,var(--color-rose-tint)_0%,rgba(80,12,72,0.88)_42%,rgba(12,6,22,0.96)_100%)] shadow-[0_0_34px_rgba(255,143,192,0.32)] hover:border-[var(--color-rose-border)] hover:shadow-[0_0_54px_rgba(255,183,213,0.38)]',
        light:
          'border-[var(--color-rose-border)] bg-[linear-gradient(155deg,rgba(250,245,255,0.98)_0%,rgba(255,255,255,1)_54%,rgba(253,244,255,0.96)_100%)] shadow-[0_14px_32px_rgba(255,143,192,0.18)] hover:border-[var(--color-rose-accent)] hover:shadow-[0_18px_38px_rgba(255,183,213,0.22)]',
      },
      iconTone: {
        cyber:
          'text-[var(--color-rose-icon)] drop-shadow-[0_0_20px_rgba(255,183,213,0.65)]',
        light: 'text-[var(--color-rose-accent)]',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-[var(--color-rose-border)] via-[var(--color-rose-accent)] to-pink-500 text-white shadow-[0_0_24px_rgba(255,143,192,0.48)] hover:from-pink-500 hover:via-[var(--color-rose-accent)] hover:to-[var(--color-rose-border)] hover:brightness-110 hover:shadow-[0_0_44px_rgba(255,183,213,0.45)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-pink-100 via-[var(--color-rose-icon)] to-fuchsia-50 text-white border border-slate-900/10 hover:from-pink-200 hover:via-[var(--color-rose-icon)] hover:to-fuchsia-50 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-[var(--color-rose-border)]/35 bg-[var(--color-rose-accent)]/12 text-[var(--color-rose-icon)]',
        light: 'border-[var(--color-rose-border)] bg-[var(--color-rose-tint)] text-[var(--color-rose-accent)]',
      },
      glowTone: 'group-hover:text-glow-rose',
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
          'border-[var(--color-lilac-border)]/50 bg-[#2d2b55] shadow-[0_0_34px_rgba(201,182,255,0.3)] hover:border-[var(--color-lilac-glow)] hover:shadow-[0_0_54px_rgba(201,182,255,0.45)]',
        light:
          'border-[var(--color-lilac-border)]/40 bg-[linear-gradient(155deg,rgba(245,243,255,0.98)_0%,rgba(255,255,255,1)_56%,rgba(245,243,255,0.96)_100%)] shadow-[0_14px_32px_rgba(143,107,255,0.16)] hover:border-[var(--color-lilac-accent)] hover:shadow-[0_18px_38px_rgba(143,107,255,0.22)]',
      },
      iconTone: {
        cyber:
          'text-[var(--color-lilac-icon)] drop-shadow-[0_0_20px_rgba(201,182,255,0.65)]',
        light: 'text-[var(--color-lilac-accent)]',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-[var(--color-lilac-border)] via-[var(--color-lilac-accent)] to-[var(--color-lilac-glow)] text-white shadow-[0_0_24px_rgba(168,139,255,0.42)] hover:from-[var(--color-lilac-glow)] hover:via-[var(--color-lilac-accent)] hover:to-[var(--color-lilac-border)] hover:brightness-110 hover:shadow-[0_0_42px_rgba(201,182,255,0.5)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-violet-100 to-fuchsia-50 text-white border border-slate-900/10 hover:from-violet-200 hover:to-fuchsia-100 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-[var(--color-lilac-border)]/35 bg-[var(--color-lilac-accent)]/12 text-[var(--color-lilac-icon)]',
        light: 'border-[var(--color-lilac-border)] bg-[var(--color-lilac-tint)] text-[var(--color-lilac-accent)]',
      },
      glowTone: 'group-hover:text-glow-lilac',
    },
    {
      icon: faBullseye,
      puzzleType: 'odd_one_matrix',
      title: 'Odd One Matrix',
      description:
        'Almost every cell follows the same hidden rule. One cell breaks that rule — scan the matrix and select the odd one out.',
      buttonText: 'Launch Odd One Matrix',
      skills: ['Pattern Filtering', 'Visual Logic'],
      hasPulse: true,
      cardTone: {
        cyber:
          'border-rose-400/45 bg-[linear-gradient(160deg,rgba(244,63,94,0.18)_0%,rgba(72,12,36,0.9)_40%,rgba(217,70,239,0.08)_72%,rgba(10,6,18,0.96)_100%)] shadow-[0_0_34px_rgba(244,63,94,0.26)] hover:border-fuchsia-400/65 hover:shadow-[0_0_54px_rgba(217,70,239,0.3)]',
        light:
          'border-rose-300 bg-[linear-gradient(155deg,rgba(255,241,242,0.96)_0%,rgba(255,255,255,1)_52%,rgba(253,244,255,0.94)_100%)] shadow-[0_14px_32px_rgba(244,63,94,0.14)] hover:border-fuchsia-400 hover:shadow-[0_18px_38px_rgba(217,70,239,0.18)]',
      },
      iconTone: {
        cyber:
          'text-rose-300 drop-shadow-[0_0_18px_rgba(244,63,94,0.58)]',
        light: 'text-rose-700',
      },
      buttonTone: {
        cyber:
          'bg-linear-to-r from-rose-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_24px_rgba(244,63,94,0.42)] hover:from-pink-500 hover:via-fuchsia-500 hover:to-rose-500 hover:brightness-110 hover:shadow-[0_0_44px_rgba(217,70,239,0.42)] hover:-translate-y-0.5',
        light:
          'bg-linear-to-r from-rose-100 via-fuchsia-50 to-pink-50 text-white border border-slate-900/10 hover:from-rose-200 hover:via-fuchsia-50 hover:to-pink-50 hover:brightness-105 shadow-md hover:shadow-lg hover:-translate-y-0.5',
      },
      tagTone: {
        cyber: 'border-rose-400/35 bg-fuchsia-500/10 text-rose-100',
        light: 'border-rose-200 bg-fuchsia-50 text-rose-800',
      },
      glowTone: 'group-hover:text-glow-rose',
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
                  className="relative z-10 animate-float-subtle group-hover:animate-bounce [--fa-secondary-opacity:0.4]"
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
                    className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-[0.97] text-white ${
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
