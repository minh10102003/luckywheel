import { useEffect, useMemo, useRef, useState } from 'react'

function shuffleCopy(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function last3(phone) {
  return String(phone ?? '').slice(-3)
}

export function PhoneShuffleScreen({ phoneBook, onDone, onContinue }) {
  const [phase, setPhase] = useState('idle') // idle | shuffling | revealed
  const [preview, setPreview] = useState(() => shuffleCopy(phoneBook).slice(0, 12))
  const [finalPicks, setFinalPicks] = useState(null)
  const timersRef = useRef({ intervalId: null, timeoutId: null })

  const headline = useMemo(() => {
    if (phase === 'idle') return 'Xáo trộn danh sách'
    if (phase === 'shuffling') return 'Đang xáo trộn...'
    return '3 số may mắn'
  }, [phase])

  useEffect(() => {
    return () => {
      if (timersRef.current.intervalId) window.clearInterval(timersRef.current.intervalId)
      if (timersRef.current.timeoutId) window.clearTimeout(timersRef.current.timeoutId)
    }
  }, [])

  const start = () => {
    if (phase !== 'idle') return
    setFinalPicks(null)
    setPhase('shuffling')

    timersRef.current.intervalId = window.setInterval(() => {
      setPreview(shuffleCopy(phoneBook).slice(0, 12))
    }, 90)

    timersRef.current.timeoutId = window.setTimeout(() => {
      if (timersRef.current.intervalId) window.clearInterval(timersRef.current.intervalId)
      timersRef.current.intervalId = null

      const picks = shuffleCopy(phoneBook).slice(0, 3).map((p) => ({
        name: p.name,
        phone: p.phone,
        last3: last3(p.phone),
      }))
      setFinalPicks(picks)
      setPhase('revealed')
      onDone?.(picks)
    }, 2200)
  }

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
      <div className="text-center">
        <h1 className="text-balance text-3xl font-black tracking-tight text-white md:text-5xl">
          {headline}
        </h1>
        <p className="mt-3 text-sm text-white/70 md:text-base">
          {phase === 'idle' && 'Bấm Bắt đầu để xáo trộn và chọn ra 3 số may mắn.'}
          {phase === 'shuffling' && 'Hệ thống đang xáo trộn danh sách...'}
          {phase === 'revealed' && 'Đây là 3 số may mắn được chọn.'}
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:mt-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {preview.map((p) => (
              <div
                key={`${p.phone}-${p.name}`}
                className={[
                  'relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4',
                  'shadow-[0_18px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/10',
                  phase === 'shuffling' ? 'shuffle-wiggle' : '',
                ].join(' ')}
              >
                <div className="absolute inset-0 opacity-60 [background:radial-gradient(500px_circle_at_30%_15%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(400px_circle_at_70%_20%,rgba(236,72,153,0.18),transparent_55%)]" />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold tracking-wide text-white">
                      {p.name}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold tracking-wider text-white/55">
                      {phase === 'idle' ? '•••' : `***${last3(p.phone)}`}
                    </div>
                  </div>
                  <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <div className="text-base font-black tracking-widest text-white/90">
                      {phase === 'idle' ? '—' : last3(p.phone)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <div className="flex flex-col items-stretch justify-center gap-3 md:flex-row md:gap-4">
            {[0, 1, 2].map((i) => {
              const pick = finalPicks?.[i]
              const isFaceUp = phase === 'revealed'
              return (
                <div
                  key={i}
                  className={[
                    'flex-1 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950/70 to-slate-950/40 p-4',
                    'shadow-[0_22px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/10',
                    isFaceUp ? 'flip-in' : '',
                  ].join(' ')}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">
                      Số may mắn
                    </div>
                    <div className="mt-2 text-3xl font-black tracking-widest text-white">
                      {isFaceUp ? pick?.last3 : '—'}
                    </div>
                    <div className="mt-2 text-sm font-extrabold text-white">
                      {isFaceUp ? pick?.name : ''}
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

