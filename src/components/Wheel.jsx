function buildConicGradient(prizes) {
  const n = prizes.length
  const slice = 360 / n
  const stops = prizes.map((p, i) => {
    const start = i * slice
    const end = (i + 1) * slice
    return `${p.color} ${start}deg ${end}deg`
  })
  return `conic-gradient(from -90deg, ${stops.join(', ')})`
}

export function Wheel({ prizes, rotation, isSpinning, durationMs, wheelRef }) {
  const sliceAngle = 360 / prizes.length
  const bg = buildConicGradient(prizes)

  return (
    <div className="relative mx-auto grid place-items-center">
      <div className="absolute -inset-6 -z-10 rounded-full bg-white/5 blur-2xl" />

      <div
        className="relative grid aspect-square w-[320px] place-items-center md:w-[420px]"
        aria-label="Lucky wheel"
      >
        <div
          className={[
            'relative h-full w-full rounded-full',
            'shadow-[0_30px_90px_rgba(0,0,0,0.65)]',
            'ring-8 ring-white/10',
          ].join(' ')}
        >
          <div
            className="absolute inset-0 rounded-full"
            ref={wheelRef}
            style={{
              backgroundImage: bg,
              transform: `rotate(${rotation}deg)`,
              // rotation is driven frame-by-frame for pointer/peg physics
              transition: 'none',
            }}
          >
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_2px_rgba(255,255,255,0.12),inset_0_20px_60px_rgba(0,0,0,0.35)]" />

            {/* Pegs at each slice boundary */}
            <div className="pointer-events-none absolute inset-0 rounded-full [--pegR:154px] md:[--pegR:204px]">
              {prizes.map((p, i) => {
                const a = i * sliceAngle - 90
                return (
                  <div
                    key={`peg-${p.id}`}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${a}deg) translateY(calc(-1 * var(--pegR)))`,
                      transformOrigin: 'center',
                    }}
                  >
                    <div className="h-[10px] w-[10px] rounded-full bg-white/90 shadow-[0_10px_20px_rgba(0,0,0,0.35),inset_0_-2px_0_rgba(0,0,0,0.18)] ring-1 ring-black/10 md:h-[12px] md:w-[12px]" />
                  </div>
                )
              })}
            </div>

            <div className="absolute inset-0 rounded-full [--labelR:96px] md:[--labelR:140px]">
              {prizes.map((p, i) => {
                const angle = (i + 0.5) * sliceAngle - 90
                return (
                  <div
                    key={p.id}
                    className="absolute left-1/2 top-1/2 w-[96px] md:w-[128px]"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * var(--labelR))) rotate(90deg)`,
                      transformOrigin: 'center',
                    }}
                  >
                    <div
                      className={[
                        'pointer-events-none select-none text-center text-[11px] font-extrabold uppercase leading-tight tracking-wide text-white drop-shadow text-stroke md:text-[13px]',
                        'line-clamp-2',
                        'px-1',
                      ].join(' ')}
                    >
                      {p.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 rounded-full [background:radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.25),transparent_45%)]" />
        </div>

        <div className="absolute grid h-[92px] w-[92px] place-items-center rounded-full bg-slate-950/85 shadow-[0_18px_60px_rgba(0,0,0,0.75)] ring-1 ring-white/20 md:h-[110px] md:w-[110px]">
          <div className="h-3 w-3 rounded-full bg-white/80 shadow-[0_0_0_10px_rgba(255,255,255,0.08)]" />
        </div>
      </div>
    </div>
  )
}

