import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faBolt, faBrain } from "@fortawesome/free-solid-svg-icons";

function FeatureHighlights() {
  const features = [
    {
      icon: faTrophy,
      title: "Compete Globally",
      description:
        "Challenge other players, improve your ranking, and climb a leaderboard built for competitive brain games.",
    },
    {
      icon: faBolt,
      title: "Daily Brain Challenges",
      description:
        "Come back each day for fresh puzzles, fast rounds, and new chances to test your speed and reasoning.",
    },
    {
      icon: faBrain,
      title: "Track Cognitive Skills",
      description:
        "See how you perform across logic, pattern recognition, memory, and processing speed over time.",
    },
  ];

  return (
    <section className="px-6 py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-cyan-400 font-semibold uppercase tracking-wider text-sm">
            Why TakeNeuroIQ
          </p>

          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
            Built for competitive minds
          </h2>

          <p className="mt-4 text-slate-400">
            More than a test. TakeNeuroIQ transforms intelligence challenges
            into a modern competitive experience.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-lg hover:border-cyan-400 transition"
            >
              <div className="text-4xl text-cyan-400">
                <FontAwesomeIcon icon={feature.icon} />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-white">
                {feature.title}
              </h3>

              <p className="mt-4 text-slate-400 leading-7">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureHighlights;
