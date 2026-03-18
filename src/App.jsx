import { useState } from "react";
import { Routes, Route } from "react-router-dom";

// import Header from "./layout/Header"
import Home from "./pages/Home";
import Play from "./pages/Play";
import Arena from "./pages/Arena";
import Header from "./layout/Header.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

/**
 * App Root Component
 * 
 * Sets the overall theme and application routing structure using React Router.
 * Managed themes: 'cyber' (dark/futuristic) and 'light' (clean/modern).
 */
function App() {
  const [theme, setTheme] = useState("cyber");

  return (
    <div
      className={
        theme === "cyber"
          ? "bg-[#060b14] min-h-screen"
          : "bg-white min-h-screen"
      }
    >
      <Header theme={theme} setTheme={setTheme} />

      <Routes>
        <Route path="/" element={<Home theme={theme} />} />
        <Route path="/play" element={<Play theme={theme} />} />
        <Route path="/arena" element={<Arena theme={theme} />} />
        <Route path="/leaderboard" element={<LeaderboardPage theme={theme} />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
