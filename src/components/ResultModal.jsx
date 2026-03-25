import { useEffect } from 'react'

const ICON_WIN = '/favpng_a1ee4cd51df3a9374249f518432b3e67.png'
/** File trong public có dấu gạch em — trong tên; encode để URL hợp lệ. */
const ICON_CONSOLATION =
  '/' + encodeURIComponent('—Pngtree—cool smiley emoji sunglasses thumbs_22595487.png')

function isConsolationPrize(prize) {
  const id = prize?.prize?.id
  if (id === 1 || id === 4) return true
  const name = prize?.prize?.name ?? prize?.name
  return name === 'Chúc bạn may mắn lần sau'
}

export function ResultModal({ open, prize, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const headerIconSrc =
    prize && isConsolationPrize(prize) ? ICON_CONSOLATION : ICON_WIN

  if (!open) return null

  const spinRound = prize?.spinRound
  const isReplay = Boolean(prize?.isReplay)
  const title = prize?.tier ?? (isReplay ? 'Giải đã nhận' : 'Chúc mừng!')
  const luckyNumber = prize?.luckyNumber
  const luckyOwner = prize?.luckyOwner
  const prizeName = prize?.prize?.name ?? prize?.name

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-slate-950/96 p-6 shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(600px_circle_at_30%_15%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(500px_circle_at_70%_20%,rgba(236,72,153,0.28),transparent_55%)]" />

        <div className="relative">
          <div className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15">
            <img
              src={headerIconSrc}
              alt=""
              className="h-full w-full object-contain p-1.5"
              decoding="async"
            />
          </div>

          <h3 className="mt-5 text-center text-2xl font-black tracking-tight text-white">
            {title}
          </h3>
          {typeof spinRound === 'number' ? (
            <p className="mt-2 text-center text-xs font-semibold tracking-wider text-white/70">
              Lượt {spinRound}/3
            </p>
          ) : null}
          <p className="mt-2 text-center text-sm text-white/80">
            {isReplay ? 'Giải thưởng:' : 'Bạn đã trúng:'}
          </p>

          <div className="mt-4 rounded-2xl border border-white/12 bg-slate-900/90 p-4 text-center ring-1 ring-black/25">
            <div className="text-base font-extrabold text-white">
              {prizeName}
            </div>
            {typeof luckyNumber === 'string' && luckyNumber.length ? (
              <div className="mt-2 text-xs font-semibold tracking-wider text-white/75">
                Số may mắn: <span className="font-extrabold text-white">{luckyNumber}</span>
              </div>
            ) : null}
            {luckyOwner ? (
              <div className="mt-2 text-xs font-semibold tracking-wider text-white/75">
                Chủ sở hữu:{' '}
                <span className="font-extrabold text-white">{luckyOwner}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-slate-950 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/40 transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50 active:translate-y-[1px]"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

