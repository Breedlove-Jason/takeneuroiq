import clsx from "clsx";

function ShapeIcon({ shape }) {
  const baseStroke = "stroke-cyan-200/80";
  const baseFill = "fill-[#0b1626]";
  const accentStroke = "stroke-emerald-300/80";

  switch (shape) {
    case "circle":
      return (
        <div className="relative h-14 w-14 text-cyan-200">
          <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-md" />
          <svg
            viewBox="0 0 100 100"
            className="relative h-full w-full drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]"
          >
            <circle cx="50" cy="50" r="42" className={`${baseFill} ${baseStroke}`} strokeWidth="3" />
            <circle
              cx="50"
              cy="50"
              r="32"
              className="fill-transparent stroke-cyan-200/50"
              strokeWidth="3"
              strokeDasharray="6 10"
            />
            <circle cx="50" cy="50" r="18" className="fill-emerald-400/10 stroke-emerald-300/70" strokeWidth="3" />
            <circle cx="50" cy="50" r="6" className="fill-emerald-300/80" />
          </svg>
        </div>
      );

    case "square":
      return (
        <div className="relative h-14 w-14 text-cyan-200">
          <div className="absolute inset-1 rounded-[10px] bg-cyan-400/5" />
          <svg
            viewBox="0 0 100 100"
            className="relative h-full w-full drop-shadow-[0_0_10px_rgba(34,211,238,0.25)]"
          >
            <rect x="14" y="14" width="72" height="72" rx="10" className={`${baseFill} ${baseStroke}`} strokeWidth="3" />
            <rect x="24" y="24" width="52" height="52" rx="8" className="fill-transparent stroke-emerald-300/70" strokeWidth="3" strokeDasharray="10 6" />
            <path d="M14 34 H34 M66 14 V34 M34 86 V66 M86 66 H66" className="stroke-cyan-200/60" strokeWidth="3" strokeLinecap="round" />
            <path d="M24 50 H76 M50 24 V76" className="stroke-emerald-200/50" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
          </svg>
        </div>
      );

    case "triangle":
      return (
        <div className="relative h-14 w-14 text-cyan-200">
          <svg
            viewBox="0 0 100 100"
            className="relative h-full w-full drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]"
          >
            <path
              d="M50 8 L92 86 H8 Z"
              className={`${baseFill} ${accentStroke}`}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M32 70 L68 30"
              className="stroke-cyan-200/60"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 6"
            />
            <path
              d="M25 56 L75 56"
              className="stroke-emerald-300/60"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="5 4"
            />
            <path
              d="M42 36 L58 76"
              className="stroke-cyan-100/50"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="3 5"
            />
          </svg>
        </div>
      );

    case "diamond":
      return (
        <div className="relative h-14 w-14 text-cyan-200">
          <svg
            viewBox="0 0 100 100"
            className="relative h-full w-full drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]"
          >
            <path
              d="M50 6 L90 50 L50 94 L10 50 Z"
              className={`${baseFill} ${accentStroke}`}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M50 22 L78 50 L50 78 L22 50 Z"
              className="fill-transparent stroke-cyan-200/60"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
            <path d="M50 18 V82" className="stroke-emerald-200/60" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M18 50 H82" className="stroke-cyan-100/50" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="6" className="fill-emerald-300/70" />
          </svg>
        </div>
      );

    case "cross":
      return (
        <div className="relative h-14 w-14 text-cyan-200 drop-shadow-[0_0_10px_rgba(59,130,246,0.25)]">
          <div className="absolute inset-0 bg-emerald-300/5 blur" />
          <svg viewBox="0 0 100 100" className="relative h-full w-full">
            <path
              d="M44 10 H56 V44 H90 V56 H56 V90 H44 V56 H10 V44 H44 Z"
              className={`${baseFill} ${baseStroke}`}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M30 30 L70 70 M70 30 L30 70" className="stroke-emerald-200/60" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" />
          </svg>
        </div>
      );

    case "bolt":
      return (
        <div className="relative h-14 w-14 text-cyan-200 drop-shadow-[0_0_10px_rgba(59,130,246,0.25)]">
          <svg viewBox="0 0 100 100" className="relative h-full w-full">
            <path
              d="M56 6 L18 56 H46 L38 94 L82 42 H54 Z"
              className={`${baseFill} ${accentStroke}`}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M40 28 L60 50 L36 70" className="stroke-cyan-200/60" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" />
            <path d="M52 18 L44 36" className="stroke-emerald-300/60" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    default:
      return (
        <div className="relative h-14 w-14 text-cyan-200">
          <div className="absolute inset-0 rounded-lg bg-cyan-400/5 blur" />
          <div className="relative h-full w-full rounded-lg border border-cyan-200/40" />
        </div>
      );
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
  const isInteractive = typeof onClick === "function" && !disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "group relative flex h-36 w-24 items-center justify-center overflow-hidden rounded-xl border border-cyan-400/15 bg-[#070d16] text-cyan-100 shadow-[0_14px_32px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out backdrop-blur",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        isInteractive &&
          "hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.55)] active:translate-y-0.5 active:shadow-[0_10px_25px_rgba(0,0,0,0.4)]",
        !selected && !correct && !wrong && "border-white/5",
        selected && "border-cyan-300/60 shadow-[0_0_28px_rgba(34,211,238,0.25)]",
        correct && "border-emerald-300/70 shadow-[0_0_30px_rgba(16,185,129,0.35)]",
        wrong && "border-rose-400/60 shadow-[0_0_30px_rgba(248,113,113,0.25)]",
        disabled && !onClick && "cursor-default",
        disabled && onClick && "cursor-not-allowed opacity-60",
      )}
      aria-label={`Select ${shape}`}
    >
      {/* Holographic shimmer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.06),transparent_35%)] opacity-60" />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />

      {/* Hover scan line */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-16 translate-y-[-120%] bg-linear-to-b from-transparent via-cyan-400/12 to-transparent opacity-0 transition-all duration-500 group-hover:translate-y-[140%] group-hover:opacity-100" />

      {/* Soft glow pulses for correctness */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-xl",
          correct && "animate-ping bg-emerald-400/15",
          wrong && "animate-pulse bg-rose-500/10",
        )}
      />

      {/* Decorative corner accents */}
      <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-cyan-200/30" />
      <div className="absolute right-0 top-0 h-2 w-2 border-r border-t border-cyan-200/30" />
      <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-cyan-200/30" />
      <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-cyan-200/30" />

      {/* Top data strip */}
      <div className="absolute left-0 top-0 flex h-6 w-full items-center justify-between bg-slate-900/60 px-2">
        <div className="h-1 w-6 rounded-full bg-cyan-300/20" />
        <div className="text-[6px] font-mono uppercase tracking-[0.2em] text-cyan-100/40">
          NX-402
        </div>
      </div>

      <div className="relative z-10 flex h-24 w-18 items-center justify-center rounded-lg border border-white/10 bg-slate-950/60 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <ShapeIcon shape={shape} />
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 flex h-1.5 w-full overflow-hidden">
        <div
          className={clsx(
            "h-full w-1/3 transition-colors duration-300",
            correct
              ? "bg-emerald-400"
              : wrong
                ? "bg-rose-500"
                : selected
                  ? "bg-cyan-400"
                  : "bg-white/10",
          )}
        />
        <div className="h-full w-px bg-white/10" />
        <div className="h-full flex-1 bg-white/5" />
      </div>
    </button>
  );
}
