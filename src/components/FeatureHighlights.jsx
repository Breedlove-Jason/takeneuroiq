import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faBolt, faBrain } from '@fortawesome/free-solid-svg-icons';

function FeatureHighlights() {
  const features = [
    {
      icon: faTrophy,
      title: 'Compete Globally',
      description:
        'Challenge other players, improve your ranking, and climb a leaderboard built for competitive brain games.',
    },
    {
      icon: faBolt,
      title: 'Daily Brain Challenges',
      description:
        'Come back each day for fresh puzzles, fast rounds, and new chances to test your speed and reasoning.',
    },
    {
      icon: faBrain,
      title: 'Track Cognitive Skills',
      description:
        'See how you perform across logic, pattern recognition, memory, and processing speed over time.',
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-400">
            Why TakeNeuroIQ
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
            Built for competitive minds
          </h2>

          <p className="mt-4 text-slate-300">
            More than a test. TakeNeuroIQ transforms intelligence challenges
            into a modern, replayable experience.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-fuchsia-400/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(0,0,0,0.18)] backdrop-blur-sm transition hover:border-fuchsia-400/30"
            >
              <div className="text-4xl text-cyan-400 drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]">
                <FontAwesomeIcon icon={feature.icon} />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-white">
                {feature.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-300">
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
