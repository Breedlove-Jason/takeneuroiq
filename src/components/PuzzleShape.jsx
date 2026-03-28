import clsx from 'clsx';

function ShapeIcon({ shape }) {
  const glowStyle = {
    filter: 'drop-shadow(0 0 5px currentColor) drop-shadow(0 0 10px currentColor)',
  };

  switch (shape) {
    case 'circle':
      return (
        <div 
          className="h-10 w-10 rounded-full border-4 border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
          style={glowStyle}
        />
      );

    case 'square':
      return (
        <div 
          className="h-9 w-9 border-4 border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(217,70,239,0.8)]"
          style={glowStyle}
        />
      );

    case 'triangle':
      return (
        <div
          className="relative flex h-10 w-10 items-center justify-center text-amber-400"
          style={glowStyle}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full fill-amber-400/20 stroke-amber-400 stroke-[8]">
            <path d="M50 10 L90 90 L10 90 Z" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'diamond':
      return (
        <div 
          className="h-8 w-8 rotate-45 border-4 border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.8)]"
          style={glowStyle}
        />
      );

    case 'cross':
      return (
        <div className="relative h-10 w-10 text-rose-500" style={glowStyle}>
          <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 rounded-full bg-current shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
          <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-current shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
        </div>
      );

    case 'bolt':
      return (
        <div className="h-10 w-10 text-blue-400" style={glowStyle}>
          <svg viewBox="0 0 24 24" className="h-full w-full fill-blue-400/20 stroke-blue-400 stroke-[2]">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" />
          </svg>
        </div>
      );

    default:
      return <div className="h-10 w-10 rounded-full border-4 border-slate-400 bg-slate-400/10 shadow-[0_0_15px_rgba(148,163,184,0.8)]" />;
  }
}

export default function PuzzleShape({
  shape,
  selected = false,
  correct = false,
  wrong = false,
  disabled = false,
  onClick,
}) {
  const isInteractive = typeof onClick === 'function' && !disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'group relative flex h-36 w-24 items-center justify-center overflow-hidden rounded-[0.5rem] border-2 transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        isInteractive &&
          'hover:-translate-y-[0.2rem] hover:scale-105 active:translate-y-0.5 active:scale-95',
        !selected && !correct && !wrong && 'border-white/10 bg-[#020b1c] shadow-[0_8px_0_rgb(1,4,12)]',
        selected && 'border-cyan-400 bg-cyan-500/10 shadow-[0_4px_20px_rgba(34,211,238,0.4),0_0_0_2px_rgba(34,211,238,0.2)]',
        correct && 'border-emerald-400 bg-emerald-500/15 shadow-[0_4px_25px_rgba(16,185,129,0.5),0_0_0_2px_rgba(16,185,129,0.2)]',
        wrong && 'border-rose-500 bg-rose-500/15 shadow-[0_4px_25px_rgba(244,63,94,0.5),0_0_0_2px_rgba(244,63,94,0.2)]',
        disabled && !onClick && 'cursor-default',
        disabled && onClick && 'cursor-not-allowed opacity-60',
      )}
      aria-label={`Select ${shape}`}
    >
      {/* High-tech background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

      {/* Decorative corner accents */}
      <div className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-white/20" />
      <div className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-white/20" />
      <div className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-white/20" />
      <div className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-white/20" />

      {/* Top data strip */}
      <div className="absolute left-0 top-0 h-6 w-full bg-slate-900/40 px-2 flex items-center justify-between">
        <div className="h-1 w-4 rounded-full bg-white/10" />
        <div className="text-[6px] font-mono text-white/40 uppercase tracking-tighter">NX-402</div>
      </div>

      <div className="relative z-10 flex h-24 w-18 items-center justify-center rounded-lg border border-white/5 bg-slate-950/40 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <ShapeIcon shape={shape} />
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 h-1.5 w-full overflow-hidden flex">
         <div className={clsx("h-full w-1/3 transition-colors duration-300", correct ? "bg-emerald-400" : wrong ? "bg-rose-500" : selected ? "bg-cyan-400" : "bg-white/5")} />
         <div className="h-full w-px bg-white/10" />
         <div className="h-full flex-1 bg-white/5" />
      </div>
    </button>
  );
}
