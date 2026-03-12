import { useState } from "react";
import { Routes, Route } from "react-router-dom";

// import Header from "./layout/Header"
import Home from "./pages/Home";
import Play from "./pages/Play";
import Arena from "./pages/Arena";
import Header from "./layout/Header.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

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
