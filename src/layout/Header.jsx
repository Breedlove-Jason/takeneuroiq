function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-400/10 bg-[#0b1120]/80 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-xl font-bold tracking-wide text-cyan-400">
          TakeNeuroIQ
        </div>

        <nav className="flex gap-6 text-sm font-medium text-slate-300">
          <a href="#" className="transition hover:text-cyan-400">
            Play
          </a>

          <a href="#" className="transition hover:text-cyan-400">
            Leaderboard
          </a>

          <a href="#" className="transition hover:text-cyan-400">
            Profile
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header