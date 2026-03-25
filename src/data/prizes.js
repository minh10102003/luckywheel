/**
 * 6 ô: 4 mệnh giá + 2 ô chúc may mắn đối nhau (0 ↔ 3).
 * `weight`: tỉ lệ trên tổng (xem SUMMARY_WEIGHT); tiền + 2 ô chúc = 100%.
 *
 * Tỉ lệ mục tiêu: 50k 0.1% | 20k 1% | 10k 15% | 5k 20% | còn lại ~63.9% chia đều 2 ô chúc.
 * Dùng thang 10_000 phần nguyên: tổng trọng số = 10_000.
 */
export const PRIZE_WEIGHT_SUM = 10_000

export const PRIZE_LIST = [
  { id: 1, name: 'Chúc bạn may mắn lần sau', color: '#64748b', weight: 3195 },
  { id: 2, name: '5.000 VND', color: '#22c55e', weight: 2000 },
  { id: 3, name: '10.000 VND', color: '#4ade80', weight: 1500 },
  { id: 4, name: 'Chúc bạn may mắn lần sau', color: '#475569', weight: 3195 },
  { id: 5, name: '20.000 VND', color: '#fbbf24', weight: 100 },
  { id: 6, name: '50.000 VND', color: '#a855f7', weight: 10 },
]
