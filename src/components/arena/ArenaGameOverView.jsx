import React, { useState, useEffect } from 'react';
import SolidIcon from '../SolidIcon.jsx';
import { ArrowClockwise as rotateRightIcon } from '@phosphor-icons/react';

const Typewriter = ({ 
  text, 
  speed = 50, 
  delay = 0, 
  onComplete, 
  className = "", 
  style = {},
  showCursor = true 
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    
    const startTimeout = setTimeout(() => {
      let currentText = "";
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < text.length) {
          currentText += text[index];
          setDisplayedText(currentText);
          index++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          if (onComplete) onComplete();
        }
      }, speed);
      
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={`${className} phosphor-glow`} style={style}>
      {displayedText}
      {showCursor && !isComplete && <span className="terminal-cursor" />}
    </span>
  );
};

const ArenaGameOverView = ({
  isCyber,
  activeAnalysisAccent,
  hexToRgba,
  showNeuralProfile,
  neuralProfileImage,
  neuralScanActive,
  neuralScanCompleted,
  activeAnalysisAnimationProfile,
  identityLockVisible,
  cognitiveIdentity,
  resultsCopy,
  neuralAnalysisLines,
  analysisLineCount,
  showPerformanceStrip,
  scoreDisplay,
  accuracy,
  bestStreak,
  showScoreBreakdown,
  scoreBreakdown,
  baseScoreDisplay,
  comboScoreDisplay,
  showActionButton,
  sessionOutcome,
  resetGame
}) => {
  return (
    <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-8 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${hexToRgba(activeAnalysisAccent, 0.5)}, transparent 70%)`,
              animation: "neural-glow 5.6s ease-in-out infinite",
            }}
          />
          <div
            className={`relative h-44 w-44 overflow-hidden rounded-4xl border border-white/10 bg-slate-950/70 p-2 backdrop-blur-md transition-all duration-700 md:h-52 md:w-52 ${
              showNeuralProfile ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
            style={{
              boxShadow: `0 0 40px ${hexToRgba(activeAnalysisAccent, 0.25)}`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[28px]"
              style={{
                background: `radial-gradient(circle at 50% 46%, ${hexToRgba(activeAnalysisAccent, 0.25)}, transparent 65%)`,
                animation: "neural-breath 6s ease-in-out infinite",
              }}
            />
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
              <div
                className="h-32 w-32 rounded-full border-4 opacity-0 animate-signal-pulse"
                style={{ borderColor: activeAnalysisAccent }}
              />
              <div
                className="absolute h-32 w-32 rounded-full border-2 opacity-0 animate-signal-pulse"
                style={{ borderColor: activeAnalysisAccent, animationDelay: '0.6s' }}
              />
              <div
                className="absolute h-32 w-32 rounded-full border opacity-0 animate-signal-pulse"
                style={{ borderColor: activeAnalysisAccent, animationDelay: '1.2s' }}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <img
                src={neuralProfileImage}
                alt="Neural identity profile"
                className={`neural-image-emission h-[72%] w-[72%] rounded-3xl object-contain transition-all duration-700 ${
                  neuralScanActive
                    ? "brightness-110 contrast-115 saturate-125"
                    : neuralScanCompleted
                      ? "brightness-105 contrast-125 saturate-115"
                      : "brightness-95 contrast-105 saturate-105"
                }`}
                style={{
                  filter:
                    neuralScanActive || neuralScanCompleted
                      ? `drop-shadow(0 0 ${neuralScanActive ? 30 : 20}px ${hexToRgba(activeAnalysisAccent, neuralScanActive ? 0.5 : 0.3)})`
                      : undefined,
                }}
              />
            </div>
            {neuralScanActive && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <div
                  className="neural-scan-pass absolute inset-x-0 top-0 h-20 mix-blend-screen"
                  style={{
                    background: `linear-gradient(to bottom, ${hexToRgba(activeAnalysisAccent, 0)}, ${hexToRgba(activeAnalysisAccent, 0.34)}, ${hexToRgba(activeAnalysisAccent, 0)})`,
                    animationDuration: `${activeAnalysisAnimationProfile.scanDurationMs}ms`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/80">
            Neural Identity
          </p>
          <div className={`relative ${identityLockVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-700`}>
            <h2
              className="text-4xl font-black uppercase tracking-[0.2em] md:text-5xl"
              style={{
                color: hexToRgba(activeAnalysisAccent, 0.98),
                textShadow: `0 0 26px ${hexToRgba(activeAnalysisAccent, 0.5)}`
              }}
            >
              {identityLockVisible ? (
                <Typewriter 
                  text={cognitiveIdentity?.label || resultsCopy.title} 
                  speed={70}
                  delay={500}
                />
              ) : (
                <span className="opacity-0">{cognitiveIdentity?.label || resultsCopy.title}</span>
              )}
            </h2>
          </div>
        </div>
      </div>

      <div className="crt-screen w-full max-w-2xl rounded-lg border border-white/5 bg-slate-950/40 p-6 text-left shadow-inner">
        <div className="crt-scanline" />
        <div className="relative z-10 space-y-2 font-mono text-[11px] leading-6 uppercase tracking-[0.22em]">
          {neuralAnalysisLines.slice(0, 3).map((line, index) => {
            const isVisible = analysisLineCount > index;
            // Base delay: headline (500ms) + headline length (~10 chars * 70ms = 700ms) + small buffer = 1500ms
            // Each line starts after previous line completes
            const lineDelay = 1800 + (index * 800); 

            return (
              <p
                key={`${line.text}-${index}`}
                className={`flex items-start gap-2 ${line.isFinal ? "text-white/90" : ""}`}
                style={{
                  color: isVisible
                    ? hexToRgba(activeAnalysisAccent, index === 2 ? 0.9 : 0.84)
                    : 'transparent',
                  textShadow: isVisible
                    ? `0 0 12px ${hexToRgba(activeAnalysisAccent, index === 2 ? 0.34 : 0.22)}`
                    : "none",
                }}
              >
                <span className="mt-1 text-slate-300/55">&gt;</span>
                {isVisible ? (
                  <Typewriter 
                    text={line.text}
                    speed={30}
                    delay={lineDelay}
                    className="flex-1"
                  />
                ) : (
                  <span className="flex-1" />
                )}
              </p>
            );
          })}
        </div>
      </div>

      <div
        className={`flex w-full max-w-3xl flex-col items-center justify-between gap-6 rounded-2xl bg-white/5 px-6 py-4 text-center transition-all duration-700 sm:flex-row ${
          showPerformanceStrip ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">
            Score
          </p>
          <p className="font-mono text-3xl font-black text-white text-glow-blue">
            {scoreDisplay.toLocaleString()}
          </p>
        </div>
        <div className="h-px w-20 bg-white/10 sm:h-12 sm:w-px" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300/70">
            Accuracy
          </p>
          <p className="font-mono text-3xl font-black text-white text-glow-emerald">
            {accuracy}
          </p>
        </div>
        <div className="h-px w-20 bg-white/10 sm:h-12 sm:w-px" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-300/70">
            Streak
          </p>
          <p className="font-mono text-3xl font-black text-white text-glow-pink">
            x{bestStreak.toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      <div
        className={`w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-left shadow-[0_0_40px_rgba(34,211,238,0.15)] backdrop-blur-md transition-all duration-700 ${
          showScoreBreakdown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/80">
            Score Breakdown
          </p>
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/80">
            {scoreBreakdown.comboStateLabel}
          </span>
        </div>
        <div className="mt-4 grid gap-4 text-left sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Base Score
            </p>
            <p className="mt-2 font-mono text-2xl font-black text-cyan-100">
              {baseScoreDisplay.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Combo Bonus
            </p>
            <p className="mt-2 font-mono text-2xl font-black text-fuchsia-200">
              +{comboScoreDisplay.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Total
            </p>
            <p className="mt-2 font-mono text-2xl font-black text-white">
              {scoreDisplay.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col items-center gap-4 transition-all duration-700 ${
          showActionButton ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {sessionOutcome?.nextRecommendedDifficulty && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
            Suggested Difficulty: {sessionOutcome.nextRecommendedDifficulty}
          </p>
        )}
        <button
          onClick={() => resetGame()}
          className={`group relative overflow-hidden rounded-xl px-10 py-4 font-black uppercase tracking-[0.2em] transition-all duration-300 ${
            isCyber
              ? "bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-cyan-300 hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95"
              : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg"
          }`}
        >
          <span className="relative z-10 flex items-center gap-3">
            <SolidIcon
              icon={rotateRightIcon}
              className="text-cyan-400 transition-transform duration-500 group-hover:rotate-180"
            />
            Run Again
          </span>
        </button>
      </div>
    </div>
  );
};

export default ArenaGameOverView;
