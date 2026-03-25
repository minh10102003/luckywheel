import { useEffect, useMemo, useRef, useState } from 'react'

function randomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive)
}

function shuffleCopy(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickLast3FromShuffled(numbers) {
  const deck = shuffleCopy(numbers)
  return {
    deck,
    final3: deck.slice(-3),
  }
}

export function CardShuffleScreen({ numbers, onDone, onContinue }) {
  const [phase, setPhase] = useState('idle') // idle | shuffling | revealed
  const [preview, setPreview] = useState(() => shuffleCopy(numbers).slice(0, 12))
  const [finalCards, setFinalCards] = useState(null)

  const timersRef = useRef({ intervalId: null, timeoutId: null })

  const headline = useMemo(() => {
    if (phase === 'idle') return 'Xáo trộn card số'
    if (phase === 'shuffling') return 'Đang xáo trộn...'
    return '3 card cuối cùng'
  }, [phase])

  useEffect(() => {
    return () => {
      if (timersRef.current.intervalId) window.clearInterval(timersRef.current.intervalId)
      if (timersRef.current.timeoutId) window.clearTimeout(timersRef.current.timeoutId)
    }
  }, [])

  const start = () => {
    if (phase !== 'idle') return
    setFinalCards(null)
    setPhase('shuffling')

    // fast preview changes to simulate shuffling
    timersRef.current.intervalId = window.setInterval(() => {
      const a = []
      for (let i = 0; i < 12; i++) a.push(numbers[randomInt(numbers.length)])
      setPreview(a)
    }, 90)

    timersRef.current.timeoutId = window.setTimeout(() => {
      if (timersRef.current.intervalId) window.clearInterval(timersRef.current.intervalId)
      timersRef.current.intervalId = null

      const { final3 } = pickLast3FromShuffled(numbers)
      setFinalCards(final3)
      setPhase('revealed')
      onDone?.(final3)
    }, 2200)
  }

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
      <div className="text-center">
        <h1 className="text-balance text-3xl font-black tracking-tight text-white md:text-5xl">
          {headline}
        </h1>
        <p className="mt-3 text-sm text-white/70 md:text-base">
          {phase === 'idle' && 'Bấm Bắt đầu để xáo trộn và chốt 3 card số.'}
          {phase === 'shuffling' && 'Hệ thống đang xáo trộn bộ card...'}
          {phase === 'revealed' && 'Đây là 3 card số được chọn.'}
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:mt-10">
        <div className="mx-auto w-full max-w-2xl">
          <div className="grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-4">
            {preview.map((n, idx) => (
              <div
                key={`${idx}-${n}`}
                className={[
                  'relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-center',
                  'shadow-[0_18px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/10',
                  phase === 'shuffling' ? 'shuffle-wiggle' : '',
                ].join(' ')}
              >
                <div className="absolute inset-0 opacity-60 [background:radial-gradient(500px_circle_at_30%_15%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(400px_circle_at_70%_20%,rgba(236,72,153,0.18),transparent_55%)]" />
                <div className="relative text-xl font-black tracking-wider text-white/90 md:text-2xl">
                  {phase === 'revealed' ? n : phase === 'shuffling' ? n : '•••'}
                </div>
                <div className="relative mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  CARD
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center justify-center gap-3 md:gap-4">
            {[0, 1, 2].map((i) => {
              const val = finalCards?.[i]
              const isFaceUp = phase === 'revealed'
              return (
                <div
                  key={i}
                  className={[
                    'grid h-[110px] w-[90px] place-items-center rounded-2xl border border-white/10',
                    'bg-gradient-to-b from-slate-950/70 to-slate-950/40 shadow-[0_22px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/10',
                    isFaceUp ? 'flip-in' : '',
                  ].join(' ')}
                >
                  <div className="text-center">
                    <div className="text-3xl font-black tracking-wider text-white">
                      {isFaceUp ? val : '—'}
                    </div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                      FINAL
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-1 flex items-center justify-center gap-3">
          {phase !== 'revealed' ? (
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-black tracking-wider text-slate-950 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/40 transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50 active:translate-y-[1px]"
            >
              {phase === 'shuffling' ? 'ĐANG XÁO TRỘN...' : 'BẮT ĐẦU'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-black tracking-wider text-slate-950 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/40 transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50 active:translate-y-[1px]"
            >
              TIẾP TỤC VÒNG QUAY
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

