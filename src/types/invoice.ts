export type CurrencyType = 'toman' | 'rial' | 'usd' | 'eur' | 'aed';
export type DigitType = 'persian' | 'english';
export type CalendarType = 'jalali' | 'gregorian';
export type InvoiceStatus = 'draft' | 'paid' | 'unpaid' | 'overdue';
export type TemplateId = 'classic' | 'modern' | 'minimal';
export type TaxType = 'overall' | 'per_item';

export interface BusinessInfo {
  name: string;
  subtitle?: string;
  logo?: string;
  economicCode?: string;
  nationalId?: string;
  registrationNumber?: string;
  phone: string;
  email?: string;
  website?: string;
  province?: string;
  city?: string;
  address: string;
  postalCode?: string;
}

export interface ClientInfo {
  name: string;
  contactPerson?: string;
  economicCode?: string;
  nationalId?: string;
  phone: string;
  email?: string;
  province?: string;
  city?: string;
  address: string;
  postalCode?: string;
}

export interface LineItem {
  id: string;
  description: string;
  itemCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number; // in percentage or fixed amount
  discountType: 'percentage' | 'fixed';
  taxRate: number; // percentage, e.g. 10% VAT
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder?: string;
  accountNumber?: string;
  cardNumber?: string;
  iban?: string; // شماره شبا
}

export interface PaymentInfo {
  bankAccounts: BankAccount[];
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  cardNumber?: string;
  iban?: string;
  notes?: string;
  terms?: string;
}

export interface InvoiceCalculations {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  totalTax: number;
  grandTotal: number;
}

export interface Invoice {
  id: string;
  title: string;
  invoiceNumber: string;
  issueDate: string; // e.g. 1403/05/24 or 2024-08-14
  dueDate: string;
  status: InvoiceStatus;
  showStatusBadge: boolean;
  currency: CurrencyType;
  digitType: DigitType;
  calendarType: CalendarType;
  templateId: TemplateId;
  taxEnabled: boolean;
  taxType: TaxType; // 'overall' | 'per_item'
  overallTaxRate: number; // e.g. 10%
  discountEnabled: boolean;
  defaultTaxRate: number;
  
  showSellerSignature: boolean;
  showBuyerSignature: boolean;
  
  // Second page (توضیحات و شرایط پیوست)
  enableSecondPage: boolean;
  secondPageTitle?: string;
  secondPageContent?: string;
  secondPageSignatures?: boolean;
  
  business: BusinessInfo;
  client: ClientInfo;
  items: LineItem[];
  payment: PaymentInfo;
  
  signatureImage?: string;
  stampImage?: string;
  
  createdAt: string;
  updatedAt: string;
}

export const CURRENCY_LABELS: Record<CurrencyType, string> = {
  toman: 'تومان',
  rial: 'ریال',
  usd: 'دلار ($)',
  eur: 'یورو (€)',
  aed: 'درهم امارات',
};

export const STATUS_LABELS: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'پیش‌نویس', color: 'var(--color-neutral-700)', bg: 'var(--color-neutral-100)' },
  unpaid: { label: 'پرداخت نشده', color: '#b45309', bg: '#fef3c7' },
  paid: { label: 'پرداخت شده', color: '#15803d', bg: '#dcfce7' },
  overdue: { label: 'سررسید گذشته', color: '#b91c1c', bg: '#fee2e2' },
};
