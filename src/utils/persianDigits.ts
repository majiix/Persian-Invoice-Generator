const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts English or Arabic digits in a string or number to Persian digits.
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  return str.replace(/[0-9]/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)]);
}

/**
 * Converts Persian or Arabic digits in a string to standard English digits.
 */
export function toEnglishDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  let str = input.toString();
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), i.toString());
    str = str.replace(new RegExp(ARABIC_DIGITS[i], 'g'), i.toString());
  }
  return str;
}

/**
 * Formats a number with comma separators (e.g., 1,250,000).
 * Optionally converts the output to Persian digits based on isPersianDigits flag.
 */
export function formatAmount(
  amount: number | string | null | undefined,
  isPersianDigits = true
): string {
  if (amount === null || amount === undefined || amount === '') return '۰';
  
  const num = typeof amount === 'number' ? amount : parseFloat(toEnglishDigits(amount));
  if (isNaN(num)) return isPersianDigits ? '۰' : '0';

  // Format with commas, handling decimal numbers gracefully
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  const formatted = parts.join('.');
  return isPersianDigits ? toPersianDigits(formatted) : formatted;
}

/**
 * Parses user input string (which might contain commas, spaces, and Persian digits) into a valid float.
 */
export function parseNumberInput(input: string | number): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;
  
  const cleaned = toEnglishDigits(input).replace(/[,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
