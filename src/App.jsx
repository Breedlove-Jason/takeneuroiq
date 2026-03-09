import Header from "./layout/Header.jsx"
import Hero from "./components/Hero.jsx"
import HowItWorks from "./components/HowItWorks.jsx"
import FeatureHighlights from "./components/FeatureHighlights.jsx"

function App() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white selection:bg-cyan-400 selection:text-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.12),transparent_30%)]" />

      <Header />

      <main>
        <Hero />
        <HowItWorks />
        <FeatureHighlights />
      </main>
    </div>
  )
}

export default App
