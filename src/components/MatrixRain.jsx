import { useMemo } from "react";

const FIBONACCI_SEQUENCE = [
  "0",
  "1",
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "34",
  "55",
  "89",
  "144",
];

const MODE_CONFIG = {
  idle: {
    density: 0.45,
    opacity: 0.35,
    speed: 1,
    glow: 0.8,
    top: "-6%",
    height: "112%",
  },
  transition: {
    density: 0.8,
    opacity: 0.55,
    speed: 1.05,
    glow: 1,
    top: "-8%",
    height: "116%",
  },
  success: {
    density: 1,
    opacity: 0.65,
    speed: 1,
    glow: 1.15,
    top: "-10%",
    height: "120%",
  },
  victory: {
    density: 1.2,
    opacity: 0.6,
    speed: 0.95,
    glow: 1.2,
    top: "-12%",
    height: "125%",
  },
};

const INTENSITY_MULTIPLIER = {
  light: 0.85,
  medium: 1,
  heavy: 1.2,
};

const MAX_COLUMNS = 34;

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomFloat(min, max + 1));
}

function buildColumn(length) {
  const startIndex = randomInt(0, FIBONACCI_SEQUENCE.length - 1);
  return Array.from({ length }, (_, index) => {
    const position = (startIndex + index) % FIBONACCI_SEQUENCE.length;
    return FIBONACCI_SEQUENCE[position];
  }).join("\n");
}

function buildBaseColumns(count = MAX_COLUMNS) {
  const columns = [];
  for (let index = 0; index < count; index += 1) {
    const length = randomInt(16, 38);
    columns.push({
      id: `matrix-column-${index}`,
      left: `${randomFloat(0, 100).toFixed(2)}%`,
      delay: `${randomFloat(-18, 0).toFixed(2)}s`,
      baseDuration: randomFloat(5.5, 11.5),
      baseOpacity: randomFloat(0.35, 0.9),
      content: buildColumn(length),
      fontSize: `${randomFloat(13, 22).toFixed(1)}px`,
    });
  }
  return columns;
}

function MatrixRain({
  mode = "idle",
  intensity = "medium",
  className = "",
  opacity = 1,
}) {
  const columns = useMemo(() => buildBaseColumns(), []);

  const modeConfig = MODE_CONFIG[mode] || MODE_CONFIG.idle;
  const intensityMultiplier = INTENSITY_MULTIPLIER[intensity] || INTENSITY_MULTIPLIER.medium;
  const activeColumnThreshold = Math.max(
    6,
    Math.round(columns.length * modeConfig.density * intensityMultiplier),
  );

  const containerStyle = useMemo(
    () => ({
      top: modeConfig.top,
      height: modeConfig.height,
      WebkitMaskImage:
        "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
      maskImage:
        "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
      "--rain-speed": modeConfig.speed,
      "--rain-opacity-scale": modeConfig.opacity * intensityMultiplier * opacity,
      "--rain-glow": modeConfig.glow,
    }),
    [intensityMultiplier, modeConfig, opacity],
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${className}`}
      style={containerStyle}
      aria-hidden="true"
    >
      <style>
        {`
          @keyframes matrix-rain-fall {
            from { transform: translateY(-100%); }
            to { transform: translateY(500%); }
          }
        `}
      </style>
      {columns.map((column, index) => {
        const isActive = index < activeColumnThreshold;
        const columnOpacity = isActive
          ? column.baseOpacity * (containerStyle["--rain-opacity-scale"] || 1)
          : 0;

        return (
          <div
            key={column.id}
            className="absolute will-change-transform transition-opacity duration-700"
            style={{
              left: column.left,
              top: 0,
              animationName: "matrix-rain-fall",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDelay: column.delay,
              animationDuration: `calc(${column.baseDuration.toFixed(2)}s / var(--rain-speed, 1))`,
              opacity: columnOpacity,
              filter: `drop-shadow(0 0 ${10 * (containerStyle["--rain-glow"] || 1)}px rgba(16, 185, 129, 0.85))`,
            }}
          >
            <span
              className="block select-none whitespace-pre font-mono text-emerald-300"
              style={{
                lineHeight: 0.9,
                fontSize: column.fontSize,
                fontWeight: 800,
                textShadow: `0 0 ${8 * (containerStyle["--rain-glow"] || 1)}px rgba(16, 185, 129, 1), 0 0 ${16 * (containerStyle["--rain-glow"] || 1)}px rgba(16, 185, 129, 0.6)`
              }}
            >
              {column.content}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default MatrixRain;
