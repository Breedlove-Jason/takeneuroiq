import clsx from 'clsx';

function ShapeIcon({ shape }) {
  switch (shape) {
    case 'circle':
      return <div className="h-12 w-12 rounded-full border-4 border-current" />;

    case 'square':
      return <div className="h-12 w-12 border-4 border-current" />;

    case 'triangle':
      return (
        <div
          className="h-0 w-0 border-l-26 border-r-26 border-b-44 border-l-transparent border-r-transparent border-b-current"
          aria-hidden="true"
        />
      );

    case 'diamond':
      return <div className="h-10 w-10 rotate-45 border-4 border-current" />;

    default:
      return <div className="h-12 w-12 rounded-full border-4 border-current" />;
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
        'group relative flex h-28 w-24 items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300 ease-out',
        'bg-slate-950/90 backdrop-blur-sm',
        "before:absolute before:inset-px before:rounded-[14px] before:border before:border-white/5 before:content-['']",
        "after:pointer-events-none after:absolute after:inset-x-3 after:top-2 after:h-6 after:rounded-full after:bg-white/5 after:blur-md after:content-['']",
        selected &&
          'border-cyan-300 bg-cyan-500/10 text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-[1.02]',
        correct &&
          'border-emerald-300 bg-emerald-500/10 text-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.45)]',
        wrong &&
          'border-rose-300 bg-rose-500/10 text-rose-200 shadow-[0_0_25px_rgba(251,113,133,0.4)]',
        !selected &&
          !correct &&
          !wrong &&
          'border-cyan-500/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.1)]',
        isInteractive &&
          'hover:-translate-y-1.5 hover:border-cyan-300/80 hover:bg-cyan-500/15 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] active:translate-y-0 active:scale-[0.98]',
        disabled && 'cursor-not-allowed opacity-60',
      )}
      aria-label={`Select ${shape}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),transparent_35%,transparent_65%,rgba(217,70,239,0.06))]" />

      <div className="absolute inset-x-2 top-2 h-3 rounded-full border border-white/5 bg-slate-900/70" />
      <div className="absolute inset-x-2 bottom-2 h-3 rounded-full border border-white/5 bg-slate-900/70" />

      <div className="relative z-10 flex h-19.5 w-19.5 items-center justify-center rounded-2xl border border-white/8 bg-slate-900/80 shadow-inner shadow-black/30">
        <div
          className={clsx(
            'flex items-center justify-center transition-transform duration-200',
            isInteractive && 'group-hover:scale-105',
          )}
        >
          <ShapeIcon shape={shape} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-6 left-1 w-0.5 rounded-full bg-white/6" />
      <div className="pointer-events-none absolute inset-y-6 right-1 w-0.5 rounded-full bg-white/6" />
    </button>
  );
}
