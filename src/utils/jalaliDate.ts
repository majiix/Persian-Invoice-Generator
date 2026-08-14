/**
 * Accurate Gregorian to Jalali (Shamsi) date converter algorithm (Kazimierz M. Borkowski)
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy, jm, jd];
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy: number;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && days >= sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }
  const gd = days + 1;
  return [gy, gm, gd];
}

const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/**
 * Returns today's date formatted as YYYY/MM/DD in Jalali (Shamsi)
 */
export function getTodayJalali(): string {
  const now = new Date();
  const [jy, jm, jd] = gregorianToJalali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

/**
 * Returns today's date in Gregorian (YYYY-MM-DD)
 */
export function getTodayGregorian(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Adds N days to a Jalali formatted date string (YYYY/MM/DD)
 */
export function addDaysToJalali(jalaliDateStr: string, daysToAdd: number): string {
  const parts = jalaliDateStr.split('/').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return getTodayJalali();
  }
  const [gy, gm, gd] = jalaliToGregorian(parts[0], parts[1], parts[2]);
  const date = new Date(gy, gm - 1, gd);
  date.setDate(date.getDate() + daysToAdd);
  
  const [njy, njm, njd] = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return `${njy}/${String(njm).padStart(2, '0')}/${String(njd).padStart(2, '0')}`;
}

/**
 * Formats a Jalali date string into full Persian text:
 * Example: "1403/05/24" -> "۲۴ مرداد ۱۴۰۳"
 */
export function formatJalaliReadable(jalaliDateStr: string): string {
  const parts = jalaliDateStr.split('/').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return jalaliDateStr;
  }
  const [jy, jm, jd] = parts;
  const monthName = PERSIAN_MONTH_NAMES[jm - 1] || '';
  return `${jd} ${monthName} ${jy}`;
}
