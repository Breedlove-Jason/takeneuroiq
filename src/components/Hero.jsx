function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto max-w-5xl text-center animate-fadeIn">
        <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium tracking-wide text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          Competitive Intelligence Gaming
        </p>

        <h1 className="mt-8 text-5xl font-bold leading-tight text-white md:text-7xl">
          Test Your Intelligence.
          <br />
          <span className="text-glow-blue bg-linear-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(34,211,238,0.5)]">
            Challenge the World.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl opacity-90">
          TakeNeuroIQ turns brain testing into a high-energy competitive arena.
          Solve logic, memory, pattern, and speed challenges while climbing the
          global leaderboard.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button className="group relative overflow-hidden rounded-xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all hover:scale-105 hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.6)]">
            <span className="relative z-10">Start a Challenge</span>
            <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </button>

          <button className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-8 py-4 font-bold text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.1)] transition-all hover:scale-105 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/20 hover:shadow-[0_0_25px_rgba(217,70,239,0.3)]">
            View Leaderboard
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
