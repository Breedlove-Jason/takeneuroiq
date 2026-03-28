import { useMemo } from "react";

const CHARSET = ["0", "1", "{", "}", "[", "]", "<", ">", "/", "\\", "|", "_", "-", "A", "N", "X", "Z", "0x", "FF", "FE"];

const VARIANT_CONFIG = {
  transition: {
    density: 0.75,
    baseOpacity: 0.45,
    minDuration: 4.2,
    maxDuration: 7.8,
    minLength: 12,
    maxLength: 24,
    top: "-5%",
    height: "110%",
  },
  success: {
    density: 1.05,
    baseOpacity: 0.65,
    minDuration: 2.8,
    maxDuration: 5.4,
    minLength: 18,
    maxLength: 32,
    top: "-10%",
    height: "120%",
  },
  victory: {
    density: 1.45,
    baseOpacity: 0.55,
    minDuration: 4.8,
    maxDuration: 9.6,
    minLength: 20,
    maxLength: 48,
    top: "-15%",
    height: "130%",
  },
};

const INTENSITY_MULTIPLIER = {
  light: 0.75,
  medium: 1,
  heavy: 1.35,
};

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomFloat(min, max + 1));
}

function buildColumn(length) {
  return Array.from({ length }, () => CHARSET[randomInt(0, CHARSET.length - 1)]).join("\n");
}

function MatrixRain({
  variant = "transition",
  intensity = "medium",
  className = "",
}) {
  const variantConfig = VARIANT_CONFIG[variant] || VARIANT_CONFIG.transition;
  const intensityMultiplier = INTENSITY_MULTIPLIER[intensity] || INTENSITY_MULTIPLIER.medium;

  const columns = useMemo(() => {
    const baseCount = 22;
        const columnCount = Math.max(8, Math.round(baseCount * variantConfig.density * intensityMultiplier));
    return Array.from({ length: columnCount }, (_, index) => {
      const length = randomInt(variantConfig.minLength, variantConfig.maxLength);
      return {
        id: `${variant}-${intensity}-${index}`,
        left: `${randomFloat(0, 100).toFixed(2)}%`,
        delay: `${randomFloat(-12, 0).toFixed(2)}s`,
        duration: `${randomFloat(variantConfig.minDuration, variantConfig.maxDuration).toFixed(2)}s`,
        opacity: randomFloat(variantConfig.baseOpacity * 0.8, variantConfig.baseOpacity * 1.5),
        content: buildColumn(length),
        fontSize: `${randomFloat(14, 22).toFixed(1)}px`,
      };
    });
  }, [intensity, intensityMultiplier, variant, variantConfig]);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 overflow-hidden ${className}`}
      style={{
        top: variantConfig.top,
        height: variantConfig.height,
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
      }}
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
      {columns.map((column) => (
        <div
          key={column.id}
          className="absolute will-change-transform"
          style={{
            left: column.left,
            top: 0,
            animationName: "matrix-rain-fall",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: column.delay,
            animationDuration: column.duration,
            opacity: column.opacity,
            filter: "drop-shadow(0 0 12px rgba(16, 185, 129, 0.9))",
          }}
        >
          <span
            className="block whitespace-pre text-emerald-300 font-mono select-none"
            style={{
              lineHeight: 0.9,
              fontSize: column.fontSize,
              fontWeight: 800,
              textShadow: "0 0 8px rgba(16, 185, 129, 1), 0 0 16px rgba(16, 185, 129, 0.6)",
            }}
          >
            {column.content}
          </span>
        </div>
      ))}
    </div>
  );
}

export default MatrixRain;
