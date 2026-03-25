export function SpinButton({ isSpinning, disabled, label, onClick }) {
  const isDisabled = Boolean(isSpinning || disabled)
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={[
        'relative inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-black tracking-wider',
        'bg-gradient-to-b from-white to-white/85 text-slate-950 shadow-[0_18px_50px_rgba(0,0,0,0.55)]',
        'ring-1 ring-white/40 transition active:translate-y-[1px]',
        isDisabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50',
      ].join(' ')}
    >
      {isSpinning ? 'ĐANG QUAY...' : label ?? 'QUAY'}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.75),transparent_45%)]" />
    </button>
  )
}

