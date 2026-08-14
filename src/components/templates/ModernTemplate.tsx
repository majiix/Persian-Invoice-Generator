import React from 'react';
import { CURRENCY_LABELS, Invoice, STATUS_LABELS } from '../../types/invoice';
import { calculateInvoiceTotals, calculateLineItemTotal } from '../../utils/calculations';
import { formatAmount } from '../../utils/persianDigits';
import { amountToWordsWithCurrency } from '../../utils/numberToWords';

interface TemplateProps {
  invoice: Invoice;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ invoice }) => {
  const isPersianDigits = invoice.digitType === 'persian';
  const currencyName = CURRENCY_LABELS[invoice.currency] || invoice.currency;
  const totals = calculateInvoiceTotals(invoice);
  const statusInfo = STATUS_LABELS[invoice.status] || STATUS_LABELS.unpaid;
  const bankAccounts = invoice.payment.bankAccounts || [];

  return (
    <div className="invoice-sheet-container template-modern">
      {/* Header Bar */}
      <div className="modern-top-bar">
        <div className="modern-brand-info">
          {invoice.business.logo && (
            <div className="modern-logo">
              <img src={invoice.business.logo} alt="لوگو" />
            </div>
          )}
          <div className="modern-brand-text">
            <h2>{invoice.business.name}</h2>
            {invoice.business.subtitle && <p>{invoice.business.subtitle}</p>}
          </div>
        </div>

        <div className="modern-invoice-title-block">
          {invoice.showStatusBadge && (
            <div
              className="modern-badge-status"
              style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
            >
              {statusInfo.label}
            </div>
          )}
          <div className="modern-meta-card">
            <div>
              <strong>شماره فاکتور: </strong>
              <span>{invoice.invoiceNumber}</span>
            </div>
            <div>
              <strong>تاریخ صدور: </strong>
              <span>{invoice.issueDate}</span>
            </div>
            {invoice.dueDate && (
              <div>
                <strong>سررسید: </strong>
                <span>{invoice.dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seller and Buyer Cards */}
      <div className="modern-parties-grid">
        <div className="modern-party-card seller">
          <div className="modern-card-title">اطلاعات فروشنده</div>
          <div className="modern-card-content">
            <div>
              <strong>{invoice.business.name}</strong>
            </div>
            {invoice.business.phone && <div>تلفن: {invoice.business.phone}</div>}
            {invoice.business.email && <div>ایمیل: {invoice.business.email}</div>}
            {invoice.business.nationalId && <div>شناسه ملی: {invoice.business.nationalId}</div>}
            {invoice.business.address && <div>نشانی: {invoice.business.address}</div>}
          </div>
        </div>

        <div className="modern-party-card buyer">
          <div className="modern-card-title">اطلاعات خریدار</div>
          <div className="modern-card-content">
            <div>
              <strong>{invoice.client.name}</strong>
            </div>
            {invoice.client.contactPerson && <div>شخص رابط: {invoice.client.contactPerson}</div>}
            {invoice.client.phone && <div>تلفن: {invoice.client.phone}</div>}
            {invoice.client.email && <div>ایمیل: {invoice.client.email}</div>}
            {invoice.client.address && <div>نشانی: {invoice.client.address}</div>}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <table className="modern-items-table">
        <thead>
          <tr>
            <th style={{ width: '6%' }}>#</th>
            <th style={{ width: '40%', textAlign: 'right' }}>شرح کالا یا خدمات</th>
            <th style={{ width: '10%' }}>تعداد</th>
            <th style={{ width: '15%' }}>قیمت واحد ({currencyName})</th>
            {invoice.discountEnabled && <th style={{ width: '10%' }}>تخفیف</th>}
            {invoice.taxEnabled && invoice.taxType === 'per_item' && (
              <th style={{ width: '9%' }}>مالیات</th>
            )}
            <th style={{ width: '16%' }}>مبلغ کل ({currencyName})</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => {
            const itemCalc = calculateLineItemTotal(item, {
              discountEnabled: invoice.discountEnabled,
              taxEnabled: invoice.taxEnabled,
              taxType: invoice.taxType,
            });
            return (
              <tr key={item.id}>
                <td style={{ textAlign: 'center', color: '#64748b' }}>
                  {formatAmount(index + 1, isPersianDigits)}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.description}</div>
                  {item.itemCode && (
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>کد: {item.itemCode}</div>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {formatAmount(item.quantity, isPersianDigits)} {item.unit || ''}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {formatAmount(item.unitPrice, isPersianDigits)}
                </td>
                {invoice.discountEnabled && (
                  <td style={{ textAlign: 'center', color: '#dc2626' }}>
                    {formatAmount(itemCalc.discountAmount, isPersianDigits)}
                  </td>
                )}
                {invoice.taxEnabled && invoice.taxType === 'per_item' && (
                  <td style={{ textAlign: 'center', color: '#475569' }}>
                    {formatAmount(itemCalc.taxAmount, isPersianDigits)}
                  </td>
                )}
                <td style={{ textAlign: 'center', fontWeight: 700, color: '#1e293b' }}>
                  {formatAmount(itemCalc.rowTotal, isPersianDigits)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Bottom Layout: Notes/Terms & Totals */}
      <div className="modern-bottom-layout">
        <div className="modern-terms-card">
          <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            شرایط و توضیحات فاکتور:
          </div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}>
            {invoice.payment.terms || 'تسویه حساب مطابق توافق طرفین انجام خواهد شد.'}
          </p>

          {/* Multiple Bank Accounts */}
          {bankAccounts.length > 0 && (
            <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>اطلاعات حساب‌های بانکی:</strong>
              {bankAccounts.map((acc, idx) => (
                <div key={acc.id || idx} style={{ marginBottom: '4px', fontSize: '11px', color: '#334155' }}>
                  <span style={{ fontWeight: 700 }}>{acc.bankName ? `بانک ${acc.bankName}: ` : `حساب ${idx + 1}: `}</span>
                  {acc.accountHolder && <span>به نام {acc.accountHolder} | </span>}
                  {acc.cardNumber && <span style={{ fontFamily: 'var(--font-mono)' }}>کارت: {acc.cardNumber} </span>}
                  {acc.accountNumber && <span style={{ fontFamily: 'var(--font-mono)' }}>| حساب: {acc.accountNumber} </span>}
                  {acc.iban && <span style={{ fontFamily: 'var(--font-mono)' }}>| شبا: {acc.iban}</span>}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '10px', fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>
            مبلغ به حروف: {amountToWordsWithCurrency(totals.grandTotal, currencyName)}
          </div>
        </div>

        <div className="modern-totals-card">
          <div className="modern-total-row">
            <span>مجموع اقلام:</span>
            <span>{formatAmount(totals.subtotal, isPersianDigits)} {currencyName}</span>
          </div>

          {invoice.discountEnabled && (
            <div className="modern-total-row" style={{ color: '#dc2626' }}>
              <span>مجموع تخفیف:</span>
              <span>- {formatAmount(totals.totalDiscount, isPersianDigits)} {currencyName}</span>
            </div>
          )}

          {invoice.taxEnabled && (
            <div className="modern-total-row">
              <span>مالیات بر ارزش افزوده:</span>
              <span>{formatAmount(totals.totalTax, isPersianDigits)} {currencyName}</span>
            </div>
          )}

          <div className="modern-grand-total">
            <span>مبلغ نهایی:</span>
            <span>{formatAmount(totals.grandTotal, isPersianDigits)} {currencyName}</span>
          </div>
        </div>
      </div>

      {/* Signature Area */}
      {(invoice.showSellerSignature || invoice.showBuyerSignature) && (
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', paddingTop: '16px' }}>
          {invoice.showSellerSignature ? (
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '8px' }}>مهر و امضای صادرکننده</div>
              {invoice.signatureImage && (
                <img src={invoice.signatureImage} alt="امضا" style={{ maxHeight: '48px', objectFit: 'contain' }} />
              )}
            </div>
          ) : <div />}

          {invoice.showBuyerSignature ? (
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '8px' }}>امضا و تأیید خریدار</div>
            </div>
          ) : <div />}
        </div>
      )}
    </div>
  );
};
