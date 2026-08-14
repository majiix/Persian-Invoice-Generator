import React from 'react';
import { Save } from 'lucide-react';
import { CURRENCY_LABELS, Invoice } from '../../types/invoice';
import { calculateInvoiceTotals } from '../../utils/calculations';
import { formatAmount } from '../../utils/persianDigits';
import { amountToWordsWithCurrency } from '../../utils/numberToWords';

interface Props {
  invoice: Invoice;
  onSave: () => void;
}

export const InvoiceSummaryCard: React.FC<Props> = ({ invoice, onSave }) => {
  const isPersianDigits = invoice.digitType === 'persian';
  const currencyLabel = CURRENCY_LABELS[invoice.currency] || invoice.currency;
  const totals = calculateInvoiceTotals(invoice);
  const words = amountToWordsWithCurrency(totals.grandTotal, currencyLabel);

  return (
    <div className="card summary-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>خلاصه مبالغ و صدور</h3>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          title="ذخیره فاکتور در حافظه مرورگر"
        >
          <Save size={16} />
          <span>ذخیره فاکتور</span>
        </button>
      </div>

      <div className="summary-row">
        <span>مجموع قیمت اقلام (پایه):</span>
        <span>{formatAmount(totals.subtotal, isPersianDigits)} {currencyLabel}</span>
      </div>

      {invoice.discountEnabled && (
        <div className="summary-row" style={{ color: 'var(--danger-500)' }}>
          <span>مجموع کل تخفیف‌ها:</span>
          <span>- {formatAmount(totals.totalDiscount, isPersianDigits)} {currencyLabel}</span>
        </div>
      )}

      {invoice.taxEnabled && (
        <div className="summary-row">
          <span>مجموع مالیات بر ارزش افزوده:</span>
          <span>{formatAmount(totals.totalTax, isPersianDigits)} {currencyLabel}</span>
        </div>
      )}

      <div className="summary-row grand-total">
        <span>مبلغ نهایی قابل پرداخت:</span>
        <span>{formatAmount(totals.grandTotal, isPersianDigits)} {currencyLabel}</span>
      </div>

      <div className="amount-words-badge">
        <strong>مبلغ نهایی به حروف: </strong>
        <span>{words}</span>
      </div>
    </div>
  );
};
