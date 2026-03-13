function PuzzleShape({ shape }) {
  if (shape === "square") {
    return (
      <div className="h-10 w-10 shrink-0 rounded-sm bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.35)] md:h-14 md:w-14" />
    )
  }

  if (shape === "circle") {
    return (
      <div className="h-10 w-10 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.35)] md:h-14 md:w-14" />
    )
  }

  if (shape === "triangle") {
    return (
      <div className="h-0 w-0 shrink-0 border-b-[38px] border-x-[22px] border-b-cyan-400 border-x-transparent border-solid drop-shadow-[0_0_10px_rgba(34,211,238,0.35)] md:border-b-[48px] md:border-x-[28px]" />
    )
  }

  if (shape === "diamond") {
    return (
      <div className="h-10 w-10 shrink-0 rotate-45 bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.35)] md:h-14 md:w-14" />
    )
  }

  if (shape === "missing") {
    return (
      <span className="shrink-0 text-4xl font-bold text-cyan-400 md:text-5xl">?</span>
    )
  }

  // Graceful fallback for unknown or undefined shapes to help debugging
  return <div className="text-[8px] text-red-500">{shape || "ERR"}</div>
}

export default PuzzleShape