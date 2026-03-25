import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { PHONE_BOOK } from './data/phones'
import { PRIZE_LIST } from './data/prizes'
import { LuckyCirclesScreen } from './components/LuckyCirclesScreen'
import { ResultModal } from './components/ResultModal'
import { SpinButton } from './components/SpinButton'
import { Wheel } from './components/Wheel'
import { computeSpinTargetRotation, pickWeightedIndex } from './lib/wheelMath'

const SPIN_DURATION_MS = 10_000

function mod360(deg) {
  const m = deg % 360
  return m < 0 ? m + 360 : m
}

function randBetween(min, max) {
  return min + Math.random() * (max - min)
}

/**
 * Góc trong không gian của conic-gradient(from -90deg, …): 12h = 90°, cạnh đầu (ô 0) bắt đầu ở 9h.
 * Phải khớp với Wheel.jsx (pegs/labels). Công thức cũ 360 - R lệch 90° nên kết quả sai ô.
 */
function gradientAngleUnderPointer(rotationDeg) {
  return mod360(90 - mod360(rotationDeg))
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/**
 * ease-out bậc 2: tốc độ góc giảm gần tuyến tính theo thời gian → chậm dần đều về cuối.
 * f(u)=1-(1-u)², f'(u)=2(1-u).
 */
function spinEaseQuad(u) {
  const x = Math.min(1, Math.max(0, u))
  return 1 - Math.pow(1 - x, 2)
}

export default function App() {
  const prizes = useMemo(() => PRIZE_LIST, [])
  const phoneBook = useMemo(() => PHONE_BOOK, [])
  const [stage, setStage] = useState('shuffle') // shuffle | wheel
  const [luckyPicks, setLuckyPicks] = useState([])
  /** Đã quay xong bấy nhiêu người (0..3); gạch tên các dòng idx < spinsCompleted */
  const [spinsCompleted, setSpinsCompleted] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [prizeResult, setPrizeResult] = useState(null)
  /** Kết quả theo từng người (0..2), để bấm tên xem lại giải */
  const [spinResultsByIndex, setSpinResultsByIndex] = useState([null, null, null])
  const timeoutRef = useRef(null)
  const wheelElRef = useRef(null)
  const [pointerAngleDeg, setPointerAngleDeg] = useState(0)
  const pointerAngleRef = useRef(0)
  const pointerVelRef = useRef(0)
  const physicsRafRef = useRef(0)
  const lastBoundaryBucketRef = useRef(null)
  const lastFrameRef = useRef({ t: 0, rot: 0 })
  const wheelAudioRef = useRef(null)
  const victoryAudioRef = useRef(null)

  useEffect(() => {
    return () => {
      if (physicsRafRef.current) window.cancelAnimationFrame(physicsRafRef.current)
      if (wheelAudioRef.current) {
        wheelAudioRef.current.pause()
        wheelAudioRef.current.currentTime = 0
      }
      if (victoryAudioRef.current) {
        victoryAudioRef.current.pause()
        victoryAudioRef.current.currentTime = 0
      }
    }
  }, [])

  const handleShuffleDone = useCallback((picks) => {
    setLuckyPicks(picks ?? [])
    setSpinsCompleted(0)
    setSpinResultsByIndex([null, null, null])
    setPrizeResult(null)
    setIsSpinning(false)
    setRotation(0)
  }, [])

  const handleContinueToWheel = useCallback(() => {
    setStage('wheel')
  }, [])

  /** Về màn chọn 3 người may mắn, làm lại luồng từ đầu. */
  const returnToShuffle = () => {
    if (isSpinning) return
    if (physicsRafRef.current) window.cancelAnimationFrame(physicsRafRef.current)
    physicsRafRef.current = 0
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (wheelAudioRef.current) {
      wheelAudioRef.current.pause()
      wheelAudioRef.current.currentTime = 0
    }
    if (victoryAudioRef.current) {
      victoryAudioRef.current.pause()
      victoryAudioRef.current.currentTime = 0
    }
    pointerAngleRef.current = 0
    pointerVelRef.current = 0
    lastBoundaryBucketRef.current = null
    lastFrameRef.current = { t: performance.now(), rot: 0 }

    setStage('shuffle')
    setLuckyPicks([])
    setSpinsCompleted(0)
    setSpinResultsByIndex([null, null, null])
    setPrizeResult(null)
    setIsSpinning(false)
    setRotation(0)
    setPointerAngleDeg(0)
  }

  const spinWheel = () => {
    if (isSpinning) return
    if (!luckyPicks || luckyPicks.length !== 3) return
    if (spinsCompleted >= 3) return
    const turnIndex = spinsCompleted
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (physicsRafRef.current) window.cancelAnimationFrame(physicsRafRef.current)

    setPrizeResult(null)
    setIsSpinning(true)

    if (!wheelAudioRef.current) {
      wheelAudioRef.current = new Audio('/NhacXoSo%20(mp3cut.net).mp3')
      wheelAudioRef.current.loop = true
      wheelAudioRef.current.preload = 'auto'
      wheelAudioRef.current.volume = 0.9
    }
    wheelAudioRef.current.currentTime = 0
    wheelAudioRef.current.play().catch(() => {
      // Browser may block autoplay edge-cases; user gesture usually allows this.
    })

    const targetIdx = pickWeightedIndex(prizes.map((p) => p.weight))
    const sliceAngle = 360 / prizes.length
    const startRot = rotation
    const extraFullSpins = randInt(5, 8)
    const targetFinalRot = computeSpinTargetRotation(
      startRot,
      targetIdx,
      prizes.length,
      extraFullSpins,
    )
    const totalTravel = targetFinalRot - startRot
    const duration = randBetween(9800, 10_200)
    const spinStartedAt = performance.now()

    pointerAngleRef.current = 0
    pointerVelRef.current = 0
    lastBoundaryBucketRef.current = null
    lastFrameRef.current = { t: performance.now(), rot: startRot }
    setPointerAngleDeg(0)

    const completeSpin = () => {
      setRotation(targetFinalRot)
      lastFrameRef.current = { t: performance.now(), rot: targetFinalRot }
      setPointerAngleDeg(0)
      pointerAngleRef.current = 0
      pointerVelRef.current = 0

      const chosen = prizes[targetIdx]
      const picked = luckyPicks[turnIndex]

      setIsSpinning(false)
      setSpinsCompleted((c) => c + 1)
      if (wheelAudioRef.current) {
        wheelAudioRef.current.pause()
        wheelAudioRef.current.currentTime = 0
      }
      if (!victoryAudioRef.current) {
        victoryAudioRef.current = new Audio('/victory_sJDDywi.mp3')
        victoryAudioRef.current.loop = false
        victoryAudioRef.current.preload = 'auto'
        victoryAudioRef.current.volume = 0.95
      }
      victoryAudioRef.current.currentTime = 0
      victoryAudioRef.current.play().catch(() => {
        // Ignore autoplay restrictions if browser blocks.
      })
      const resultPayload = {
        spinRound: turnIndex + 1,
        luckyNumber: picked?.last3,
        luckyOwner: picked?.name,
        prize: chosen,
      }
      setSpinResultsByIndex((prev) => {
        const next = [...prev]
        next[turnIndex] = resultPayload
        return next
      })
      setPrizeResult(resultPayload)
      const isConsolation = targetIdx === 0 || targetIdx === 3
      confetti({
        particleCount: isConsolation ? 55 : 140,
        spread: isConsolation ? 50 : 70,
        origin: { y: 0.65 },
      })
    }

    const tick = (now) => {
      const prev = lastFrameRef.current
      const dt = Math.max(0.001, (now - prev.t) / 1000)
      const elapsed = now - spinStartedAt
      const u = Math.min(1, elapsed / duration)
      const eased = spinEaseQuad(u)
      const rot = startRot + totalTravel * eased

      const dEasedDu = 2 * Math.max(0, 1 - u)
      const wheelDegPerSec = u >= 1 ? 0 : (totalTravel * dEasedDu) / duration
      const speedAbs = Math.abs(wheelDegPerSec)

      const thetaG = gradientAngleUnderPointer(rot)
      const bucket = Math.floor(thetaG / sliceAngle)
      const lastBucket = lastBoundaryBucketRef.current
      if (lastBucket === null) lastBoundaryBucketRef.current = bucket
      else if (bucket !== lastBucket) {
        lastBoundaryBucketRef.current = bucket
        const impulse = Math.min(360, 0.22 * speedAbs + 55)
        pointerVelRef.current += impulse
      }

      const nearEnd = u > 0.88 || speedAbs < 55
      const k = nearEnd ? 280 : 215
      const c = nearEnd ? 38 : 28
      const maxAngle = Math.max(8, nearEnd ? 16 : 32)

      const angle = pointerAngleRef.current
      const vel = pointerVelRef.current
      const acc = (-k * angle - c * vel) / 1000
      let nextVel = vel + acc / Math.max(1, dt * 60)
      let nextAngle = angle + nextVel * dt

      if (nextAngle < 0) {
        nextAngle = 0
        nextVel = 0
      }
      if (nextAngle > maxAngle) {
        nextAngle = maxAngle
        nextVel *= 0.15
      }

      pointerAngleRef.current = nextAngle
      pointerVelRef.current = nextVel * 0.985

      lastFrameRef.current = { t: now, rot }
      setRotation(rot)
      setPointerAngleDeg(nextAngle)

      if (u < 1) {
        physicsRafRef.current = window.requestAnimationFrame(tick)
      } else {
        physicsRafRef.current = 0
        completeSpin()
      }
    }

    physicsRafRef.current = window.requestAnimationFrame(tick)

  }

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-slate-950"
      >
        <div
          className="absolute -inset-[12%] bg-cover bg-center bg-no-repeat blur-lg"
          style={{ backgroundImage: "url('/wheel-background.png')" }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-950/78 via-slate-950/62 to-slate-950/88"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1000px_circle_at_50%_20%,rgba(99,102,241,0.12),transparent_60%),radial-gradient(800px_circle_at_80%_80%,rgba(236,72,153,0.08),transparent_55%)]" />
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center px-4 py-10">
        {stage === 'shuffle' ? (
          <LuckyCirclesScreen
            phoneBook={phoneBook}
            onDone={handleShuffleDone}
            onContinue={handleContinueToWheel}
          />
        ) : (
          <div className="w-full rounded-3xl border border-white/15 bg-slate-950/95 p-6 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-md md:p-10">
            <div className="text-center">
              <h1 className="text-balance text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-5xl">
                Vòng Quay May Mắn
              </h1>
              <p className="mt-3 text-sm text-white/85 md:text-base">
                {spinsCompleted >= 3
                  ? 'Đã quay xong cả 3 người.'
                  : `Lượt ${spinsCompleted + 1}/3 — nhấn QUAY cho người tiếp theo.`}
              </p>
              {luckyPicks?.length === 3 ? (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {luckyPicks.map((p, idx) => {
                    const done = idx < spinsCompleted
                    const stored = spinResultsByIndex[idx]
                    const key = `${idx}-${p?.name ?? 'pick'}-${p?.last3 ?? ''}`
                    if (done && stored) {
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={isSpinning}
                          title="Xem lại giải thưởng"
                          onClick={() => setPrizeResult({ ...stored, isReplay: true })}
                          className={[
                            'rounded-full border px-3 py-1 text-left text-xs font-extrabold tracking-wider transition',
                            'border-white/15 bg-slate-900/60 text-white/80 line-through decoration-white/30',
                            'hover:border-indigo-400/40 hover:bg-slate-800/90 hover:text-white hover:decoration-transparent',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60',
                            isSpinning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                          ].join(' ')}
                        >
                          {p?.last3} — {p?.name}
                        </button>
                      )
                    }
                    return (
                      <div
                        key={key}
                        className={[
                          'rounded-full border px-3 py-1 text-xs font-extrabold tracking-wider',
                          done
                            ? 'border-white/8 bg-slate-900/50 text-white/45 line-through decoration-white/35'
                            : 'border-white/12 bg-slate-900/90 text-white',
                        ].join(' ')}
                      >
                        {p?.last3} — {p?.name}
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col items-center gap-6 md:mt-10">
              <div className="relative">
                <Wheel
                  prizes={prizes}
                  rotation={rotation}
                  isSpinning={isSpinning}
                  durationMs={SPIN_DURATION_MS}
                  wheelRef={wheelElRef}
                />
                <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                  <div
                    className="h-0 w-0 border-x-[14px] border-t-[26px] border-x-transparent border-t-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.55)]"
                    style={{
                      transformOrigin: '50% 0%',
                      transform: `rotate(${-pointerAngleDeg}deg)`,
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <SpinButton
                  isSpinning={isSpinning}
                  disabled={spinsCompleted >= 3}
                  label={spinsCompleted >= 3 ? 'ĐÃ HẾT 3 LƯỢT' : `QUAY (lượt ${spinsCompleted + 1}/3)`}
                  onClick={spinWheel}
                />
                <button
                  type="button"
                  onClick={returnToShuffle}
                  disabled={isSpinning}
                  className={[
                    'inline-flex items-center justify-center rounded-full border border-white/20 bg-slate-800/95 px-8 py-3.5 text-sm font-bold tracking-wide text-white',
                    'shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition',
                    isSpinning
                      ? 'cursor-not-allowed opacity-45'
                      : 'hover:border-white/30 hover:bg-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/40 active:translate-y-[1px]',
                  ].join(' ')}
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ResultModal
        open={Boolean(prizeResult)}
        prize={prizeResult}
        onClose={() => setPrizeResult(null)}
      />
    </div>
  )
}
