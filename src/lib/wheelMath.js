export function pickRandomPrize(prizes) {
  const idx = Math.floor(Math.random() * prizes.length)
  return prizes[idx]
}

/** Chỉ số ngẫu nhiên theo trọng số (tổng weights > 0). */
export function pickWeightedIndex(weights) {
  const safe = weights.map((w) => (typeof w === 'number' && w > 0 ? w : 0))
  const total = safe.reduce((s, w) => s + w, 0)
  if (total <= 0) return Math.floor(Math.random() * weights.length)
  let r = Math.random() * total
  for (let i = 0; i < safe.length; i++) {
    r -= safe[i]
    if (r < 0) return i
  }
  return safe.length - 1
}

/**
 * Góc dừng chính xác: nhiều vòng + đúng mod 360 để mũi tên nằm trong ô targetIdx (ngẫu nhiên trong ô).
 * Dùng cho tiến trình quay một đoạn duy nhất, không cần “nhảy” chỉnh sau cùng.
 */
export function computeSpinTargetRotation(startRotDeg, targetIdx, prizeCount, extraFullSpins) {
  const sliceAngle = 360 / prizeCount
  const frac = 0.12 + Math.random() * 0.76
  const desiredThetaG = targetIdx * sliceAngle + frac * sliceAngle
  const targetMod = mod360(90 - desiredThetaG)
  const startMod = mod360(startRotDeg)
  const deltaMod = mod360(targetMod - startMod)
  return startRotDeg + extraFullSpins * 360 + deltaMod
}

function mod360(deg) {
  const m = deg % 360
  return m < 0 ? m + 360 : m
}

/**
 * Khớp conic-gradient(from -90deg): tướng đối vật lý tại 12h có θ_g = mod(90 - R, 360).
 * Tâm ô i ở θ_g = (i + 0.5) * slice → φ trên vòng = mod(270 + θ_g, 360) (cw từ 12h).
 */
export function rotationForPrizeIndex({
  currentRotation,
  prizeIndex,
  prizeCount,
  extraSpins,
}) {
  const sliceAngle = 360 / prizeCount
  const thetaCenter = (prizeIndex + 0.5) * sliceAngle
  const phiCenter = mod360(270 + thetaCenter)
  const desiredFinalMod = mod360(-phiCenter)
  const currentMod = mod360(currentRotation)
  const delta = mod360(desiredFinalMod - currentMod)

  return currentRotation + extraSpins * 360 + delta
}

