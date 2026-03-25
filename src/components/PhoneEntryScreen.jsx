import { useMemo, useState } from 'react'

function onlyDigits(s) {
  return String(s ?? '').replace(/\D/g, '')
}

export function PhoneEntryScreen({ phoneNumbers, onContinue }) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)

  const last3 = useMemo(() => {
    const d = onlyDigits(value)
    return d.slice(-3)
  }, [value])

  const matches = useMemo(() => {
    if (last3.length !== 3) return 0
    return phoneNumbers.filter((p) => String(p.phone).endsWith(last3))
  }, [last3, phoneNumbers])

  const selected = matches?.[Math.min(selectedIdx, Math.max(0, (matches?.length ?? 1) - 1))]
  const matchCount = matches?.length ?? 0
  const isValid = last3.length === 3 && matchCount > 0 && Boolean(selected)
  const error =
    touched && last3.length === 3 && matchCount === 0
      ? '3 số cuối không nằm trong danh sách. Không thể vào vòng quay.'
      : null

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
      <div className="text-center">
        <h1 className="text-balance text-3xl font-black tracking-tight text-white md:text-5xl">
          Nhập 3 số cuối SĐT
        </h1>
        <p className="mt-3 text-sm text-white/70 md:text-base">
          Nhập 3 số cuối số điện thoại. Nếu không có trong danh sách, bạn sẽ không thể vào vòng quay.
        </p>
      </div>

      <div className="mt-8 grid place-items-center gap-4 md:mt-10">
        <div className="w-full max-w-md">
          <label className="block text-sm font-bold tracking-wide text-white/85">
            3 số cuối
          </label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            inputMode="numeric"
            placeholder="Ví dụ: 444"
            className={[
              'mt-2 w-full rounded-2xl border bg-slate-950/50 px-4 py-4 text-lg font-extrabold tracking-widest text-white outline-none',
              'shadow-[0_18px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/10',
              error ? 'border-rose-400/50 focus:ring-4 focus:ring-rose-400/20' : 'border-white/10 focus:ring-4 focus:ring-indigo-400/20',
            ].join(' ')}
          />

          <div className="mt-3 min-h-[20px] text-sm">
            {error ? (
              <div className="font-semibold text-rose-200">{error}</div>
            ) : last3.length === 3 ? (
              <div className="text-white/70">
                Đã nhập: <span className="font-extrabold text-white">{last3}</span> — khớp{' '}
                <span className="font-extrabold text-white">{matchCount}</span> SĐT trong danh sách.
              </div>
            ) : (
              <div className="text-white/45">Hãy nhập đủ 3 chữ số.</div>
            )}
          </div>

          {last3.length === 3 && matchCount > 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">
                Chủ sở hữu
              </div>
              {matchCount === 1 ? (
                <div className="mt-2 text-base font-extrabold text-white">
                  {matches[0].name}
                </div>
              ) : (
                <div className="mt-2 grid gap-2">
                  <div className="text-sm font-semibold text-white/70">
                    Có {matchCount} người trùng 3 số cuối. Chọn đúng người:
                  </div>
                  <div className="grid gap-2">
                    {matches.map((m, idx) => (
                      <label
                        key={m.phone}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 hover:bg-slate-950/55"
                      >
                        <input
                          type="radio"
                          name="phoneMatch"
                          checked={idx === selectedIdx}
                          onChange={() => setSelectedIdx(idx)}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-extrabold text-white">{m.name}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          disabled={!isValid}
          onClick={() => onContinue?.({ last3, ...selected })}
          className={[
            'inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-black tracking-wider',
            'bg-gradient-to-b from-white to-white/85 text-slate-950 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/40 transition active:translate-y-[1px]',
            isValid
              ? 'hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50'
              : 'cursor-not-allowed opacity-60',
          ].join(' ')}
        >
          TIẾP TỤC
        </button>
      </div>
    </div>
  )
}

