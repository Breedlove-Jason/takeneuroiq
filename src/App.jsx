// src/App.jsx - Main application shell

import Header from "./layout/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import FeatureHighlights from "./components/FeatureHighlights";

function App() {
  // App layout: header + main content sections
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top navigation/header */}
      <Header />

      {/* Primary page content */}
      <main>
        {/* Hero / primary CTA */}
        <Hero />

        {/* Explainer: how it works */}
        <HowItWorks />

        {/* Feature highlights */}
        <FeatureHighlights />
      </main>
    </div>
  );
}

export default App;
