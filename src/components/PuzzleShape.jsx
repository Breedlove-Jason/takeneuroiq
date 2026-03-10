function PuzzleShape({ shape }) {
  if (shape === "square") {
    return (
      <div className="h-10 w-10 rounded-sm bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.35)] md:h-14 md:w-14" />
    )
  }

  if (shape === "circle") {
    return (
      <div className="h-10 w-10 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.35)] md:h-14 md:w-14" />
    )
  }

  if (shape === "triangle") {
    return (
      <div className="h-0 w-0 border-l-[22px] border-r-[22px] border-b-[38px] border-l-transparent border-r-transparent border-b-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)] md:border-l-[28px] md:border-r-[28px] md:border-b-[48px]" />
    )
  }

  if (shape === "diamond") {
    return (
      <div className="h-10 w-10 rotate-45 bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.35)] md:h-14 md:w-14" />
    )
  }

  if (shape === "missing") {
    return (
      <span className="text-4xl font-bold text-cyan-400 md:text-5xl">?</span>
    )
  }

  return null
}

export default PuzzleShape