export default function SequenceSprintPuzzle({
  prompt,
  sequence = [],
  options = [],
  selectedAnswer,
  onSelectAnswer,
}) {
  return (
    <div className="rounded-3xl border border-violet-400/30 bg-slate-950/70 p-6 shadow-[0_0_30px_rgba(168,85,247,0.12)] backdrop-blur-md">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          Sequence Sprint
        </p>
        <h2 className="mt-2 text-xl font-bold text-white">{prompt}</h2>
      </div>

      <div className="mb-6 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-5">
        <div className="flex flex-wrap items-center justify-center gap-3 text-lg font-bold text-white sm:text-2xl">
          {sequence.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="rounded-xl bg-slate-900/80 px-4 py-2 shadow-[0_0_18px_rgba(168,85,247,0.08)]"
            >
              {value}
            </span>
          ))}

          <span className="rounded-xl border border-dashed border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.10)]">
            ?
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedAnswer === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelectAnswer?.(option)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.16)]'
                  : 'border-white/10 bg-slate-900/70 text-slate-200 hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
