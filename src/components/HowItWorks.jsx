// src/components/HowItWorks.jsx - How it works section
function HowItWorks() {
  // Renders the three-step explanation with semantic markup.
  const steps = [
    {
      title: "Choose a Challenge",
      description:
        "Jump into pattern, logic, memory, and speed-based games designed to test different cognitive skills.",
    },
    {
      title: "Play and Score",
      description:
        "Complete fast-paced challenges, earn a score, and see how your performance stacks up.",
    },
    {
      title: "Climb the Leaderboard",
      description:
        "Track your progress, challenge others, and rise through the ranks in competitive brain games.",
    },
  ];

  return (
    <section
      className="px-6 py-24 bg-slate-950"
      aria-labelledby="howitworks-head"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-cyan-400 font-semibold uppercase tracking-wider text-sm">
            How It Works
          </p>
          <h2
            id="howitworks-head"
            className="mt-4 text-3xl md:text-4xl font-bold text-white"
          >
            Train your brain. Compete with purpose.
          </h2>
          <p className="mt-4 text-slate-400">
            TakeNeuroIQ turns intelligence testing into a modern competitive
            experience.
          </p>
        </div>

        {/* Semantic list of steps */}
        <ul className="mt-16 grid gap-6 md:grid-cols-3" role="list">
          {steps.map((step) => {
            // create a stable id for accessibility
            const id = `how-step-${step.title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")}`;
            return (
              <li key={step.title}>
                <article
                  aria-labelledby={id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-lg"
                >
                  <h3 id={id} className="text-xl font-semibold text-cyan-400">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-slate-400 leading-7">
                    {step.description}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default HowItWorks;
