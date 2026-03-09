function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto max-w-5xl text-center">
        <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium tracking-wide text-cyan-300">
          Competitive Intelligence Gaming
        </p>

        <h1 className="mt-8 text-5xl font-bold leading-tight text-white md:text-7xl">
          Test Your Intelligence.
          <br />
          <span className="text-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)]">
            Challenge the World.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
          TakeNeuroIQ turns brain testing into a high-energy competitive arena.
          Solve logic, memory, pattern, and speed challenges while climbing the global leaderboard.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button className="rounded-xl bg-cyan-400 px-8 py-4 font-semibold text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300">
            Start a Challenge
          </button>

          <button className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-8 py-4 font-semibold text-fuchsia-300 transition hover:bg-fuchsia-500/20">
            View Leaderboard
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
