function Header() {
  // Renders site header with brand and navigation.

  return (
    <header className="w-full border-b border-slate-700 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <div className="text-xl font-bold text-cyan-400">
          TakeNeuroIQ
        </div>

        {/* Primary navigation */}
        <nav className="flex gap-6 text-sm font-medium">
          <a href="#" className="hover:text-cyan-400 transition">
            Play
          </a>

          <a href="#" className="hover:text-cyan-400 transition">
            Leaderboard
          </a>

          <a href="#" className="hover:text-cyan-400 transition">
            Profile
          </a>
        </nav>

      </div>
    </header>
  )
}

export default Header