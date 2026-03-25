import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LUCKY_CIRCLES_EXCLUDED_PHONES,
  LUCKY_CIRCLES_FAVORED_PHONES,
  LUCKY_CIRCLES_TOTAL_FAVORED,
  LUCKY_CIRCLES_TOTAL_NON_FAVORED,
  normalizePhoneDigits,
} from '../data/phones'

function last3(phone) {
  return String(phone ?? '').slice(-3)
}

function randomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive)
}

function winnerIsFavoredEntry(w, phoneBook) {
  const ph =
    w.phone ??
    phoneBook.find((p) => p.name === w.name && last3(p.phone) === w.last3)?.phone
  return Boolean(ph && LUCKY_CIRCLES_FAVORED_PHONES.has(normalizePhoneDigits(ph)))
}

/**
 * Chọn người tiếp theo sao cho sau 3 lượt có đúng LUCKY_CIRCLES_TOTAL_FAVORED người nhóm 4
 * và LUCKY_CIRCLES_TOTAL_NON_FAVORED người ngoài nhóm.
 */
function pickLuckyCircleWinnerConstrained(eligible, winners, phoneBook) {
  if (eligible.length === 0) return null

  const favSoFar = winners.filter((w) => winnerIsFavoredEntry(w, phoneBook)).length
  const nonSoFar = winners.length - favSoFar
  const roundsLeft = 3 - winners.length
  const needFav = LUCKY_CIRCLES_TOTAL_FAVORED - favSoFar
  const needNon = LUCKY_CIRCLES_TOTAL_NON_FAVORED - nonSoFar

  const favored = eligible.filter((p) => LUCKY_CIRCLES_FAVORED_PHONES.has(normalizePhoneDigits(p.phone)))
  const nonFavored = eligible.filter((p) => !LUCKY_CIRCLES_FAVORED_PHONES.has(normalizePhoneDigits(p.phone)))

  if (needFav === roundsLeft) {
    return favored.length ? favored[randomInt(favored.length)] : null
  }
  if (needNon === roundsLeft) {
    return nonFavored.length ? nonFavored[randomInt(nonFavored.length)] : null
  }
  if (needFav > 0 && favored.length === 0) return null
  if (needNon > 0 && nonFavored.length === 0) return null
  if (needFav === 0) return nonFavored[randomInt(nonFavored.length)]
  if (needNon === 0) return favored[randomInt(favored.length)]
  return Math.random() < 0.5
    ? favored[randomInt(favored.length)]
    : nonFavored[randomInt(nonFavored.length)]
}

export function LuckyCirclesScreen({ phoneBook, onDone, onContinue }) {
  const [phase, setPhase] = useState('idle') // idle | rolling
  const [digits, setDigits] = useState([0, 0, 0])
  const [locked, setLocked] = useState([false, false, false])
  const [winners, setWinners] = useState([]) // [{name,last3,phone}]
  const timersRef = useRef([])
  const lockedRef = useRef([false, false, false])
  const audioRef = useRef(null)

  const eligiblePeople = useMemo(() => {
    const pickedNames = new Set(winners.map((w) => w.name))
    return phoneBook.filter((p) => {
      if (pickedNames.has(p.name)) return false
      if (LUCKY_CIRCLES_EXCLUDED_PHONES.has(normalizePhoneDigits(p.phone))) return false
      return true
    })
  }, [phoneBook, winners])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  useEffect(() => {
    onDone?.(winners)
  }, [winners, onDone])

  useEffect(() => {
    lockedRef.current = locked
  }, [locked])

  const start = () => {
    if (phase !== 'idle') return
    if (winners.length >= 3) return
    if (eligiblePeople.length === 0) return

    const chosen = pickLuckyCircleWinnerConstrained(eligiblePeople, winners, phoneBook)
    if (!chosen) return

    setPhase('rolling')
    setLocked([false, false, false])
    lockedRef.current = [false, false, false]

    if (!audioRef.current) {
      // Put the mp3 file at: d:\lucky-wheel\public\slot-machine-jackpot-sound-effect.mp3
      audioRef.current = new Audio('/slot-machine-jackpot-sound-effect.mp3')
      audioRef.current.loop = true
      audioRef.current.preload = 'auto'
      audioRef.current.volume = 0.9
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {
      // Autoplay might still be blocked in some browsers; ignore.
    })

    const code = last3(chosen.phone)
    const target = code.split('').map((d) => Number.parseInt(d, 10))

    const intervalId = window.setInterval(() => {
      setDigits((prev) => [
        lockedRef.current[0] ? prev[0] : randomInt(10),
        lockedRef.current[1] ? prev[1] : randomInt(10),
        lockedRef.current[2] ? prev[2] : randomInt(10),
      ])
    }, 85)
    timersRef.current.push(intervalId)

    const stop1 = window.setTimeout(() => {
      setDigits((prev) => [target[0], prev[1], prev[2]])
      setLocked((prev) => [true, prev[1], prev[2]])
      lockedRef.current = [true, lockedRef.current[1], lockedRef.current[2]]
    }, 1600)

    const stop2 = window.setTimeout(() => {
      setDigits((prev) => [prev[0], target[1], prev[2]])
      setLocked((prev) => [prev[0], true, prev[2]])
      lockedRef.current = [lockedRef.current[0], true, lockedRef.current[2]]
    }, 2400)

    const stop3 = window.setTimeout(() => {
      setDigits((prev) => [prev[0], prev[1], target[2]])
      setLocked((prev) => [prev[0], prev[1], true])
      lockedRef.current = [lockedRef.current[0], lockedRef.current[1], true]
      window.clearInterval(intervalId)
      setWinners((prevW) => [...prevW, { name: chosen.name, last3: code, phone: chosen.phone }])
      setPhase('idle')

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }, 3200)

    timersRef.current.push(stop1, stop2, stop3)
  }

  return (
    <div className="w-full rounded-3xl border border-white/15 bg-slate-950/95 p-6 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-md md:p-10">
      <div className="text-center">
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-white drop-shadow-sm md:text-5xl">
          3 ô may mắn
        </h1>
        <p className="mt-3 text-sm text-white/85 md:text-base">
          {winners.length >= 3
            ? 'Đã chọn đủ 3 người may mắn.'
            : `Bấm Bắt đầu để quay số. Lượt còn lại: ${3 - winners.length}/3.`}
        </p>
      </div>

      <div className="mt-8 grid place-items-center gap-6 md:mt-10">
        <div className="flex items-center justify-center gap-4 md:gap-6">
          {digits.map((d, idx) => (
            <div
              key={idx}
              className={[
                'flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full border shadow-[0_22px_70px_rgba(0,0,0,0.45)]',
                locked[idx]
                  ? 'border-indigo-400/35 bg-slate-800 ring-2 ring-indigo-400/30'
                  : 'border-white/12 bg-slate-900/95 ring-1 ring-white/10',
                phase === 'rolling' && !locked[idx] ? 'shuffle-wiggle' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-flex min-h-0 min-w-[1ch] items-center justify-center tabular-nums',
                  'text-[2.5rem] font-semibold leading-none tracking-normal md:text-[3rem]',
                  'translate-y-px',
                  locked[idx] ? 'text-white' : 'text-white/85',
                ].join(' ')}
              >
                {d}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={phase !== 'idle' || winners.length >= 3 || eligiblePeople.length === 0}
            onClick={start}
            className={[
              'inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-black tracking-wider',
              'bg-gradient-to-b from-white to-white/85 text-slate-950 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/40 transition active:translate-y-[1px]',
              phase !== 'idle' || winners.length >= 3 || eligiblePeople.length === 0
                ? 'cursor-not-allowed opacity-60'
                : 'hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50',
            ].join(' ')}
          >
            {phase === 'rolling' ? 'ĐANG QUAY...' : 'BẮT ĐẦU'}
          </button>

          {winners.length >= 3 ? (
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-black tracking-wider text-slate-950 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/40 transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50 active:translate-y-[1px]"
            >
              TIẾP TỤC VÒNG QUAY
            </button>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-2xl border border-white/12 bg-slate-900/90 p-5 ring-1 ring-black/30">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
              Danh sách người may mắn
            </div>
            {winners.length === 0 ? (
              <div className="mt-3 text-sm font-semibold text-white/70">Chưa có người nào được chọn.</div>
            ) : (
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {winners.map((w) => (
                  <div
                    key={`${w.name}-${w.last3}`}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/65">
                      {w.last3}
                    </div>
                    <div className="mt-1 truncate text-sm font-extrabold text-white">{w.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

