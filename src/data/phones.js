/** Chuẩn hóa số để so khớp (chỉ chữ số). */
export function normalizePhoneDigits(phone) {
  return String(phone ?? '').replace(/\D/g, '')
}

/**
 * Màn “3 ô may mắn”: không bao giờ chọn các SĐT này.
 */
export const LUCKY_CIRCLES_EXCLUDED_PHONES = new Set([
  normalizePhoneDigits('0342292415'), // Đào Trọng Duy
  normalizePhoneDigits('0397538105'), // Trần Nhật Duy
])

/**
 * Nhóm 4 người: cả 3 lượt quay gộp lại đúng LUCKY_CIRCLES_TOTAL_FAVORED người trong nhóm
 * và đúng LUCKY_CIRCLES_TOTAL_NON_FAVORED người ngoài nhóm.
 */
export const LUCKY_CIRCLES_FAVORED_PHONES = new Set([
  normalizePhoneDigits('0919475444'), // Vũ Phan Gia Thịnh
  normalizePhoneDigits('0327043644'), // Trần Thảo Tiên
  normalizePhoneDigits('0981975303'), // Trịnh Ngọc Thái
  normalizePhoneDigits('0901038251'), // Ngô Quốc Tuấn
])

export const LUCKY_CIRCLES_TOTAL_FAVORED = 2
export const LUCKY_CIRCLES_TOTAL_NON_FAVORED = 1

export const PHONE_BOOK = [
  { name: 'Dương Thế Khánh', phone: '0383251210' },
  { name: 'Đào Trọng Duy', phone: '0342292415' },
  { name: 'Đoàn Ngọc Bảo Uyên', phone: '0943648490' },
  { name: 'Hồ Minh Khoa', phone: '0708358539' },
  { name: 'Huỳnh Đăng Khoa', phone: '0763200602' },
  { name: 'Huỳnh Trung Nghi', phone: '0902384234' },
  { name: 'Lê Công Chung', phone: '0377019958' },
  { name: 'Lê Đình Trường', phone: '0912152693' },
  { name: 'Lê Hữu Phúc', phone: '0901498500' },
  { name: 'Lê Trung Min', phone: '0397809003' },
  { name: 'Lê Văn Trọng Tín', phone: '0372185965' },
  { name: 'Lưu Tín Nghĩa', phone: '0333596848' },
  { name: 'Mai Văn Thanh Bình', phone: '0349791786' },
  { name: 'Ngô Quốc Tuấn', phone: '0901038251' },
  { name: 'Nguyễn Đức Lương', phone: '0946186245' },
  { name: 'Nguyễn Gia Bảo', phone: '0934776810' },
  { name: 'Nguyễn Thanh Huy', phone: '0914941896' },
  { name: 'Nguyễn Thanh Nhàn', phone: '0934093545' },
  { name: 'Nguyễn Tuấn Hùng', phone: '0359167613' },
  { name: 'Nguyễn Văn Long', phone: '0829313315' },
  { name: 'Nguyễn Việt Cường', phone: '0383380258' },
  { name: 'Nguyễn Xuân Chức', phone: '0389568496' },
  { name: 'Phạm Thanh Tiến', phone: '0333259407' },
  { name: 'Phan Anh Tuấn', phone: '0355095013' },
  { name: 'Tô Bảo Thành', phone: '0785376177' },
  { name: 'Trần Nguyễn Trường Giang', phone: '0369021948' },
  { name: 'Trần Nhật Duy', phone: '0397538105' },
  { name: 'Trần Phạm Bảo Khang', phone: '0968275246' },
  { name: 'Trần Thảo Tiên', phone: '0327043644' },
  { name: 'Trịnh Ngọc Thái', phone: '0981975303' },
  { name: 'Trương Gia Huy', phone: '0862769500' },
  { name: 'Võ Thái Duy', phone: '0799681949' },
  { name: 'Vũ Phan Gia Thịnh', phone: '0919475444' },
]

