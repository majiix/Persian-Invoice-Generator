const ONES = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const TEENS = [
  'ده',
  'یازده',
  'دوازده',
  'سیزده',
  'چهارده',
  'پانزده',
  'شانزده',
  'هفده',
  'هجده',
  'نوزده',
];
const TENS = [
  '',
  '',
  'بیست',
  'سی',
  'چهل',
  'پنجاه',
  'شصت',
  'هفتاد',
  'هشتاد',
  'نود',
];
const HUNDREDS = [
  '',
  'یکصد',
  'دویست',
  'سیصد',
  'چهارصد',
  'پانصد',
  'ششصد',
  'هفتصد',
  'هشتصد',
  'نهصد',
];
const THOUSANDS = [
  '',
  'هزار',
  'میلیون',
  'میلیارد',
  'تریلیون',
  'کوادریلیون',
];

function threeDigitsToWords(num: number): string {
  const parts: string[] = [];
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const o = num % 10;

  if (h > 0) {
    parts.push(HUNDREDS[h]);
  }

  const remainder = num % 100;
  if (remainder >= 10 && remainder <= 19) {
    parts.push(TEENS[remainder - 10]);
  } else {
    if (t > 0) {
      parts.push(TENS[t]);
    }
    if (o > 0) {
      parts.push(ONES[o]);
    }
  }

  return parts.join(' و ');
}

/**
 * Converts any number to Persian verbal representation.
 * Example: 1540000 -> "یک میلیون و پانصد و چهل هزار"
 */
export function numberToWords(num: number): string {
  if (isNaN(num) || num === 0) return 'صفر';
  if (num < 0) return 'منفی ' + numberToWords(Math.abs(num));

  // Split integer and decimal if any
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  const chunks: number[] = [];
  let temp = integerPart;

  while (temp > 0) {
    chunks.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const wordsParts: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];
    if (chunk > 0) {
      const chunkWord = threeDigitsToWords(chunk);
      const scale = THOUSANDS[i];
      if (scale) {
        wordsParts.push(`${chunkWord} ${scale}`);
      } else {
        wordsParts.push(chunkWord);
      }
    }
  }

  let result = wordsParts.join(' و ');

  if (decimalPart > 0) {
    const decimalWords = threeDigitsToWords(decimalPart);
    result += ` و ${decimalWords} صدم`;
  }

  return result;
}

/**
 * Converts amount into Persian verbal representation with currency suffix.
 * Example: (150000, 'toman') -> "یکصد و پنجاه هزار تومان"
 */
export function amountToWordsWithCurrency(
  amount: number,
  currencyName = 'تومان'
): string {
  if (isNaN(amount) || amount === 0) return `صفر ${currencyName}`;
  const words = numberToWords(amount);
  return `${words} ${currencyName}`;
}
