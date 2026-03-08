// src/components/Hero.jsx - Landing hero section

function Hero() {
  // Centered hero with headline, description, and CTA button.

  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-32">
      <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
        Test Your Intelligence.
        <span className="block text-cyan-400">Challenge the World.</span>
      </h1>

      {/* Short descriptive paragraph */}
      <p className="mt-6 text-lg text-slate-400 max-w-xl">
        TakeNeuroIQ turns intelligence testing into competitive games. Solve
        puzzles, challenge friends, and climb the global leaderboard.
      </p>

      {/* Primary CTA */}
      <button
        type="button"
        aria-label="Start a Challenge"
        className="mt-10 bg-cyan-400 text-slate-900 font-semibold px-8 py-4 rounded-lg hover:bg-cyan-300 transition"
      >
        Start a Challenge
      </button>
    </section>
  );
}

export default Hero;
