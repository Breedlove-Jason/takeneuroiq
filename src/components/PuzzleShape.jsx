import clsx from 'clsx';

function ShapeIcon({ shape }) {
  switch (shape) {
    case 'circle':
      return <div className="h-10 w-10 rounded-full border-2 border-current" />;

    case 'square':
      return <div className="h-10 w-10 border-2 border-current" />;

    case 'triangle':
      return (
        <div
          className="h-0 w-0 border-l-20 border-r-20 border-b-32 border-l-transparent border-r-transparent border-b-current"
          aria-hidden="true"
        />
      );

    case 'diamond':
      return <div className="h-9 w-9 rotate-45 border-2 border-current" />;

    default:
      return <div className="h-10 w-10 rounded-full border-2 border-current" />;
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
        'group relative flex h-32 w-20 items-center justify-center rounded-[1.2rem] border border-white/10 bg-slate-950 text-cyan-100 shadow-[2px_6px_0_rgb(2,6,23)] transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        isInteractive &&
          'hover:-translate-y-[0.1rem] hover:shadow-[2px_5px_0_rgb(2,6,23)] active:translate-y-0.5 active:shadow-[1px_3px_0_rgb(2,6,23)]',
        selected && 'border-cyan-200/80 bg-cyan-500/10 shadow-[2px_6px_0_rgba(34,211,238,0.55)]',
        correct && 'border-emerald-200/80 bg-emerald-500/15 shadow-[2px_6px_0_rgba(16,185,129,0.6)]',
        wrong && 'border-rose-200/80 bg-rose-500/15 shadow-[2px_6px_0_rgba(248,113,113,0.65)]',
        disabled && 'cursor-not-allowed opacity-60',
      )}
      aria-label={`Select ${shape}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[1.2rem] border border-white/5 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950" />

      <span className="pointer-events-none absolute inset-x-5 top-4 h-0.5 rounded-full bg-linear-to-r from-slate-500 via-white/90 to-slate-500/70 shadow-[0_0_6px_rgba(255,255,255,0.45)]" />
      <span className="pointer-events-none absolute inset-x-5 bottom-4 h-0.5 rounded-full bg-linear-to-r from-slate-500 via-white/90 to-slate-500/70 shadow-[0_0_6px_rgba(255,255,255,0.45)]" />

      <div className="relative z-10 flex h-24 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] transition-shadow duration-200 group-hover:shadow-[inset_0_3px_8px_rgba(0,0,0,0.9)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-[0.65rem] border border-white/20 bg-slate-900/90 shadow-[inset_0_2px_6px_rgba(255,255,255,0.1)]">
          <ShapeIcon shape={shape} />
        </div>
      </div>
    </button>
  );
}
