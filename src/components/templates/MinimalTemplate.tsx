import React from 'react';
import { CURRENCY_LABELS, Invoice } from '../../types/invoice';
import { calculateInvoiceTotals, calculateLineItemTotal } from '../../utils/calculations';
import { formatAmount } from '../../utils/persianDigits';
import { amountToWordsWithCurrency } from '../../utils/numberToWords';

interface TemplateProps {
  invoice: Invoice;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ invoice }) => {
  const isPersianDigits = invoice.digitType === 'persian';
  const currencyName = CURRENCY_LABELS[invoice.currency] || invoice.currency;
  const totals = calculateInvoiceTotals(invoice);
  const bankAccounts = invoice.payment.bankAccounts || [];

  return (
    <div className="invoice-sheet-container template-minimal">
      {/* Header */}
      <div className="minimal-header">
        <div className="minimal-title">
          <h2>{invoice.title || 'صورتحساب'}</h2>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            {invoice.business.name}
          </div>
        </div>

        <div className="minimal-invoice-meta">
          <div>
            <strong>شماره: </strong> {invoice.invoiceNumber}
          </div>
          <div>
            <strong>تاریخ صدور: </strong> {invoice.issueDate}
          </div>
          {invoice.dueDate && (
            <div>
              <strong>سررسید: </strong> {invoice.dueDate}
            </div>
          )}
        </div>
      </div>

      {/* Parties */}
      <div className="minimal-parties-section">
        <div className="minimal-party-col">
          <h4>صادرکننده (فروشنده)</h4>
          <div className="party-name">{invoice.business.name}</div>
          {invoice.business.phone && <p>تلفن: {invoice.business.phone}</p>}
          {invoice.business.email && <p>ایمیل: {invoice.business.email}</p>}
          {invoice.business.address && <p>{invoice.business.address}</p>}
          {invoice.business.nationalId && <p>شناسه ملی: {invoice.business.nationalId}</p>}
        </div>

        <div className="minimal-party-col">
          <h4>مشتری (خریدار)</h4>
          <div className="party-name">{invoice.client.name}</div>
          {invoice.client.contactPerson && <p>نام رابط: {invoice.client.contactPerson}</p>}
          {invoice.client.phone && <p>تلفن: {invoice.client.phone}</p>}
          {invoice.client.email && <p>ایمیل: {invoice.client.email}</p>}
          {invoice.client.address && <p>{invoice.client.address}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="minimal-items-table">
        <thead>
          <tr>
            <th style={{ width: '6%' }}>#</th>
            <th style={{ width: '42%', textAlign: 'right' }}>شرح</th>
            <th style={{ width: '10%' }}>تعداد</th>
            <th style={{ width: '14%' }}>قیمت واحد ({currencyName})</th>
            {invoice.discountEnabled && <th style={{ width: '10%' }}>تخفیف</th>}
            {invoice.taxEnabled && <th style={{ width: '10%' }}>مالیات</th>}
            <th style={{ width: '18%', textAlign: 'left' }}>جمع ({currencyName})</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => {
            const itemCalc = calculateLineItemTotal(item);
            return (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>
                  {formatAmount(index + 1, isPersianDigits)}
                </td>
                <td>
                  <strong>{item.description}</strong>
                  {item.itemCode && (
                    <span style={{ fontSize: '11px', color: '#9ca3af', marginRight: '6px' }}>
                      ({item.itemCode})
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {formatAmount(item.quantity, isPersianDigits)} {item.unit || ''}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {formatAmount(item.unitPrice, isPersianDigits)}
                </td>
                {invoice.discountEnabled && (
                  <td style={{ textAlign: 'center' }}>
                    {formatAmount(itemCalc.discountAmount, isPersianDigits)}
                  </td>
                )}
                {invoice.taxEnabled && (
                  <td style={{ textAlign: 'center' }}>
                    {formatAmount(itemCalc.taxAmount, isPersianDigits)}
                  </td>
                )}
                <td style={{ textAlign: 'left', fontWeight: 600 }}>
                  {formatAmount(itemCalc.rowTotal, isPersianDigits)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Bottom Summary Grid */}
      <div className="minimal-summary-grid">
        <div className="minimal-notes-area">
          {invoice.payment.terms && (
            <div style={{ marginBottom: '8px' }}>
              <strong>شرایط: </strong>
              <span>{invoice.payment.terms}</span>
            </div>
          )}

          {/* Multiple Bank Accounts */}
          {bankAccounts.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <strong>شماره‌های حساب و واریز: </strong>
              {bankAccounts.map((acc, idx) => (
                <div key={acc.id || idx} style={{ marginTop: '2px', fontSize: '11.5px' }}>
                  {acc.bankName && <span>بانک {acc.bankName} </span>}
                  {acc.cardNumber && <span>| کارت: {acc.cardNumber} </span>}
                  {acc.accountNumber && <span>| حساب: {acc.accountNumber} </span>}
                  {acc.iban && <span>| شبا: {acc.iban}</span>}
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: '11px', color: '#111827', marginTop: '6px' }}>
            مبلغ به حروف: {amountToWordsWithCurrency(totals.grandTotal, currencyName)}
          </div>
        </div>

        <div className="minimal-totals-box">
          <div className="minimal-total-line">
            <span>مجموع اقلام:</span>
            <span>{formatAmount(totals.subtotal, isPersianDigits)} {currencyName}</span>
          </div>

          {invoice.discountEnabled && (
            <div className="minimal-total-line">
              <span>تخفیف:</span>
              <span>- {formatAmount(totals.totalDiscount, isPersianDigits)} {currencyName}</span>
            </div>
          )}

          {invoice.taxEnabled && (
            <div className="minimal-total-line">
              <span>مالیات:</span>
              <span>{formatAmount(totals.totalTax, isPersianDigits)} {currencyName}</span>
            </div>
          )}

          <div className="minimal-grand-line">
            <span>مبلغ نهایی:</span>
            <span>{formatAmount(totals.grandTotal, isPersianDigits)} {currencyName}</span>
          </div>
        </div>
      </div>

      {/* Minimal Signature Footer */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-start', paddingTop: '20px' }}>
        {invoice.signatureImage && (
          <div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>امضای مجاز:</div>
            <img src={invoice.signatureImage} alt="امضا" style={{ maxHeight: '42px', objectFit: 'contain' }} />
          </div>
        )}
      </div>
    </div>
  );
};
