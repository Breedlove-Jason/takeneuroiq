import { useState } from "react";
import Header from "./layout/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import FeatureHighlights from "./components/FeatureHighlights";

function App() {
  const [theme, setTheme] = useState("cyber");

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === "cyber"
          ? "bg-[#070b14] text-white"
          : "bg-white text-slate-900"
      }`}
    >
      {/* Background effects only for cyber mode */}
      {theme === "cyber" && (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.12),_transparent_30%)]" />
      )}

      <Header theme={theme} setTheme={setTheme} />

      <main>
        <Hero theme={theme} />
        <HowItWorks theme={theme} />
        <FeatureHighlights theme={theme} />
      </main>
    </div>
  );
}

export default App;
