import Header from "./layout/Header.jsx";
import Hero from "./components/Hero.jsx";
function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <h1 className="text-5xl font-bold text-cyan-400">TakeNeuroIQ</h1>
      <Header />
      <Hero />
    </div>
  );
}

export default App;
