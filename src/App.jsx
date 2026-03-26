import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// import Header from "./layout/Header"
import Home from './pages/Home';
import Play from './pages/Play';
import Arena from './pages/Arena';
import Header from './layout/Header.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

/**
 * App Root Component
 *
 * Sets the overall theme and application routing structure using React Router.
 * Managed themes: 'cyber' (dark/futuristic) and 'light' (clean/modern).
 */
function App() {
  const [theme, setTheme] = useState('cyber');

  return (
    <div
      className={
        theme === 'cyber'
          ? 'relative min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden'
          : 'min-h-screen bg-white'
      }
    >
      {theme === 'cyber' && (
        <>
          <div className="bg-grid-cyber pointer-events-none fixed inset-0 z-0 opacity-20" />
          <div className="pointer-events-none fixed -top-[10%] -left-[10%] z-0 h-[40%] w-[40%] rounded-full bg-cyan-500/10 blur-[120px] animate-float" />
          <div className="pointer-events-none fixed -bottom-[10%] -right-[10%] z-0 h-[40%] w-[40%] rounded-full bg-fuchsia-500/10 blur-[120px] animate-float [animation-delay:2s]" />
          <div className="pointer-events-none fixed top-[20%] right-[10%] z-0 h-[30%] w-[30%] rounded-full bg-violet-500/5 blur-[100px] animate-float [animation-delay:4s]" />
          <div className="bg-linear-to-b pointer-events-none fixed inset-0 z-0 from-transparent via-transparent to-slate-950/80" />
        </>
      )}
      <div className="relative z-10">
        <Header theme={theme} setTheme={setTheme} />

        <Routes>
          <Route path="/" element={<Home theme={theme} />} />
          <Route path="/play" element={<Play theme={theme} />} />
          <Route path="/arena" element={<Arena theme={theme} />} />
          <Route
            path="/leaderboard"
            element={<LeaderboardPage theme={theme} />}
          />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
