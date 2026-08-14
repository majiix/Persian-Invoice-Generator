import { BusinessInfo, Invoice, LineItem, BankAccount } from '../types/invoice';
import { addDaysToJalali, getTodayJalali } from './jalaliDate';

const STORAGE_KEY_INVOICES = 'faktor_invoices_v1';
const STORAGE_KEY_BUSINESS_PROFILE = 'faktor_business_profile_v1';
const STORAGE_KEY_THEME = 'faktor_theme_v1';

export function normalizeInvoice(inv: any): Invoice {
  // Ensure bankAccounts array exists
  let accounts: BankAccount[] = [];
  if (Array.isArray(inv.payment?.bankAccounts) && inv.payment.bankAccounts.length > 0) {
    accounts = inv.payment.bankAccounts;
  } else if (inv.payment?.bankName || inv.payment?.cardNumber || inv.payment?.iban || inv.payment?.accountNumber) {
    accounts = [
      {
        id: 'acc-1',
        bankName: inv.payment.bankName || '',
        accountHolder: inv.payment.accountHolder || '',
        accountNumber: inv.payment.accountNumber || '',
        cardNumber: inv.payment.cardNumber || '',
        iban: inv.payment.iban || '',
      },
    ];
  }

  return {
    ...inv,
    payment: {
      ...inv.payment,
      bankAccounts: accounts,
    },
  };
}

export function createNewInvoice(): Invoice {
  const today = getTodayJalali();
  const dueDate = addDaysToJalali(today, 14);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const businessPreset = getSavedBusinessProfile();

  const defaultBusiness: BusinessInfo = businessPreset || {
    name: 'شرکت فناوری و توسعه نمونه',
    subtitle: 'ارائه‌دهنده راهکارهای نوین نرم‌افزاری و ابری',
    economicCode: '411122334455',
    nationalId: '10101234567',
    registrationNumber: '54321',
    phone: '021-88776655',
    email: 'info@example.com',
    website: 'www.example.com',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۱۰۰، واحد ۴',
    postalCode: '1987654321',
  };

  const sampleItems: LineItem[] = [
    {
      id: 'item-1',
      description: 'طراحی رابط کاربری و تجربه کاربری (UI/UX)',
      itemCode: 'PRD-101',
      quantity: 1,
      unit: 'پروژه',
      unitPrice: 18000000,
      discount: 1000000,
      discountType: 'fixed',
      taxRate: 10,
    },
    {
      id: 'item-2',
      description: 'توسعه فرانت‌اند وب‌سایت با ری‌اکت و تایپ‌اسکریپت',
      itemCode: 'PRD-102',
      quantity: 1,
      unit: 'پروژه',
      unitPrice: 32000000,
      discount: 0,
      discountType: 'percentage',
      taxRate: 10,
    },
    {
      id: 'item-3',
      description: 'پشتیبانی فنی و نگهداری ماهانه سرور',
      itemCode: 'SRV-201',
      quantity: 3,
      unit: 'ماه',
      unitPrice: 4000000,
      discount: 5,
      discountType: 'percentage',
      taxRate: 10,
    },
  ];

  return {
    id: 'inv-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title: 'فاکتور فروش کالا و خدمات',
    invoiceNumber: `INV-${randomNum}`,
    issueDate: today,
    dueDate: dueDate,
    status: 'unpaid',
    currency: 'toman',
    digitType: 'persian',
    calendarType: 'jalali',
    templateId: 'modern',
    taxEnabled: true,
    discountEnabled: true,
    defaultTaxRate: 10,
    business: defaultBusiness,
    client: {
      name: 'شرکت تجارت الکترونیک پارس',
      contactPerson: 'جناب آقای محمدی',
      economicCode: '422233445566',
      nationalId: '14009876543',
      phone: '021-22334455',
      email: 'finance@pars-commerce.ir',
      province: 'تهران',
      city: 'تهران',
      address: 'تهران، خیابان آزادی، تقاطع نواب، مجتمع تجاری آزادی، طبقه ۵',
      postalCode: '1455667788',
    },
    items: sampleItems,
    payment: {
      bankAccounts: [
        {
          id: 'acc-1',
          bankName: 'بانک پاسارگاد',
          accountHolder: 'شرکت فناوری و توسعه نمونه',
          accountNumber: '290-8000-1234567-1',
          cardNumber: '5022-2910-1234-5678',
          iban: 'IR000570029080001234567001',
        },
        {
          id: 'acc-2',
          bankName: 'بانک ملت',
          accountHolder: 'شرکت فناوری و توسعه نمونه',
          accountNumber: '4820-123456',
          cardNumber: '6104-3378-9876-5432',
          iban: 'IR880120000000004820123456',
        },
      ],
      notes: 'لطفاً پس از واریز، شماره پیگیری را به واحد مالی اطلاع دهید.',
      terms: 'مهلت پرداخت حداکثر ۱۴ روز پس از تاریخ صدور فاکتور می‌باشد. خدمات پس از تسویه کامل ارائه خواهد شد.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getSavedInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVOICES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeInvoice);
  } catch {
    return [];
  }
}

export function saveInvoiceToStorage(invoice: Invoice): Invoice[] {
  const list = getSavedInvoices();
  const existingIndex = list.findIndex((item) => item.id === invoice.id);
  const updatedInvoice = { ...normalizeInvoice(invoice), updatedAt: new Date().toISOString() };

  let updatedList: Invoice[];
  if (existingIndex >= 0) {
    updatedList = [...list];
    updatedList[existingIndex] = updatedInvoice;
  } else {
    updatedList = [updatedInvoice, ...list];
  }

  localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(updatedList));
  return updatedList;
}

export function deleteInvoiceFromStorage(id: string): Invoice[] {
  const list = getSavedInvoices();
  const updatedList = list.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(updatedList));
  return updatedList;
}

export function duplicateInvoiceInStorage(sourceInvoice: Invoice): Invoice {
  const duplicated: Invoice = {
    ...JSON.parse(JSON.stringify(sourceInvoice)),
    id: 'inv-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    invoiceNumber: `${sourceInvoice.invoiceNumber}-COPY`,
    issueDate: getTodayJalali(),
    dueDate: addDaysToJalali(getTodayJalali(), 14),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveInvoiceToStorage(duplicated);
  return duplicated;
}

export function getSavedBusinessProfile(): BusinessInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUSINESS_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBusinessProfile(business: BusinessInfo): void {
  localStorage.setItem(STORAGE_KEY_BUSINESS_PROFILE, JSON.stringify(business));
}

export function getSavedTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(STORAGE_KEY_THEME);
    return theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}
