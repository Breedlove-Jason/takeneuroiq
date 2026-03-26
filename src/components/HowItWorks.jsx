function HowItWorks() {
  const steps = [
    {
      title: 'Choose a Challenge',
      description:
        'Jump into pattern, logic, memory, and speed-based games designed to test different cognitive skills.',
    },
    {
      title: 'Play and Score',
      description:
        'Complete fast-paced challenges, earn a score, and see how your performance stacks up.',
    },
    {
      title: 'Climb the Leaderboard',
      description:
        'Track your progress, challenge others, and rise through the ranks in competitive brain games.',
    },
  ];

  return (
    <section className="animate-fadeIn px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-glow-blue text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            How It Works
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl text-glow-blue">
            Train your mind. Enter the arena.
          </h2>

          <p className="mt-4 text-slate-300">
            Fast rounds, real competition, and a platform designed to make
            intelligence feel alive.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-cyan-400/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-cyan-400 text-glow-blue">
                {step.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
