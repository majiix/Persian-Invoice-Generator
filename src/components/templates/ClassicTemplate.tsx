import React from 'react';
import { CURRENCY_LABELS, Invoice } from '../../types/invoice';
import { calculateInvoiceTotals, calculateLineItemTotal } from '../../utils/calculations';
import { formatAmount } from '../../utils/persianDigits';
import { amountToWordsWithCurrency } from '../../utils/numberToWords';

interface TemplateProps {
  invoice: Invoice;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ invoice }) => {
  const isPersianDigits = invoice.digitType === 'persian';
  const currencyName = CURRENCY_LABELS[invoice.currency] || invoice.currency;
  const totals = calculateInvoiceTotals(invoice);
  const bankAccounts = invoice.payment.bankAccounts || [];

  return (
    <div className="invoice-sheet-container template-classic">
      {/* Header */}
      <div className="classic-header">
        <div className="classic-logo-box">
          {invoice.business.logo ? (
            <img src={invoice.business.logo} alt="لوگوی شرکت" />
          ) : (
            <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>محل لوگو</div>
          )}
        </div>

        <div className="classic-title-center">
          <h2>{invoice.title || 'صورتحساب فروش کالا و خدمات'}</h2>
          {invoice.business.subtitle && (
            <p style={{ fontSize: '12px', color: '#4b5563' }}>{invoice.business.subtitle}</p>
          )}
        </div>

        <div className="classic-meta-right">
          <div className="classic-meta-row">
            <span>شماره:</span>
            <strong>{invoice.invoiceNumber}</strong>
          </div>
          <div className="classic-meta-row">
            <span>تاریخ:</span>
            <strong>{invoice.issueDate}</strong>
          </div>
          {invoice.dueDate && (
            <div className="classic-meta-row">
              <span>سررسید:</span>
              <span>{invoice.dueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Seller & Buyer Official Tables */}
      <table className="classic-party-table">
        <thead>
          <tr>
            <th colSpan={4}>مشخصات فروشنده</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ width: '15%', fontWeight: 700 }}>فروشنده:</td>
            <td style={{ width: '35%' }}>{invoice.business.name}</td>
            <td style={{ width: '15%', fontWeight: 700 }}>شناسه ملی / ثبت:</td>
            <td style={{ width: '35%' }}>
              {invoice.business.nationalId || invoice.business.registrationNumber || '-'}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700 }}>کد اقتصادی:</td>
            <td>{invoice.business.economicCode || '-'}</td>
            <td style={{ fontWeight: 700 }}>تلفن / فکس:</td>
            <td>{invoice.business.phone || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700 }}>نشانی کامل:</td>
            <td colSpan={3}>
              {invoice.business.address}
              {invoice.business.postalCode && ` - کد پستی: ${invoice.business.postalCode}`}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="classic-party-table">
        <thead>
          <tr>
            <th colSpan={4}>مشخصات خریدار</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ width: '15%', fontWeight: 700 }}>خریدار:</td>
            <td style={{ width: '35%' }}>{invoice.client.name}</td>
            <td style={{ width: '15%', fontWeight: 700 }}>شناسه ملی:</td>
            <td style={{ width: '35%' }}>{invoice.client.nationalId || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700 }}>کد اقتصادی:</td>
            <td>{invoice.client.economicCode || '-'}</td>
            <td style={{ fontWeight: 700 }}>شماره تماس:</td>
            <td>{invoice.client.phone || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700 }}>نشانی کامل:</td>
            <td colSpan={3}>
              {invoice.client.address || '-'}
              {invoice.client.postalCode && ` - کد پستی: ${invoice.client.postalCode}`}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table className="classic-items-table">
        <thead>
          <tr>
            <th style={{ width: '6%' }}>ردیف</th>
            <th style={{ width: '38%' }}>شرح کالا یا خدمات</th>
            <th style={{ width: '10%' }}>تعداد/مقدار</th>
            <th style={{ width: '15%' }}>مبلغ واحد ({currencyName})</th>
            {invoice.discountEnabled && <th style={{ width: '10%' }}>تخفیف</th>}
            {invoice.taxEnabled && invoice.taxType === 'per_item' && (
              <th style={{ width: '10%' }}>مالیات</th>
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
                <td style={{ textAlign: 'center' }}>{formatAmount(index + 1, isPersianDigits)}</td>
                <td>
                  <strong>{item.description}</strong>
                  {item.itemCode && (
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>کد: {item.itemCode}</div>
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
                {invoice.taxEnabled && invoice.taxType === 'per_item' && (
                  <td style={{ textAlign: 'center' }}>
                    {formatAmount(itemCalc.taxAmount, isPersianDigits)}
                  </td>
                )}
                <td style={{ textAlign: 'center', fontWeight: 700 }}>
                  {formatAmount(itemCalc.rowTotal, isPersianDigits)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary and Words */}
      <div className="classic-summary-section">
        <div className="classic-words-box">
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>مبلغ به حروف:</div>
          <div style={{ color: '#1e3a8a', fontWeight: 600 }}>
            {amountToWordsWithCurrency(totals.grandTotal, currencyName)}
          </div>

          {/* Multiple Bank Accounts */}
          {bankAccounts.length > 0 && (
            <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e5e7eb', fontSize: '11px' }}>
              <strong>اطلاعات حساب‌های بانکی: </strong>
              {bankAccounts.map((acc, idx) => (
                <div key={acc.id || idx} style={{ marginTop: '3px' }}>
                  {acc.bankName && <span style={{ fontWeight: 600 }}>{acc.bankName}: </span>}
                  {acc.accountHolder && `به نام ${acc.accountHolder} `}
                  {acc.cardNumber && `| کارت: ${acc.cardNumber} `}
                  {acc.accountNumber && `| حساب: ${acc.accountNumber} `}
                  {acc.iban && `| شبا: ${acc.iban}`}
                </div>
              ))}
            </div>
          )}

          {invoice.payment.terms && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#4b5563' }}>
              <strong>شرایط پرداخت: </strong>
              {invoice.payment.terms}
            </div>
          )}
        </div>

        <table className="classic-totals-table">
          <tbody>
            <tr>
              <td>جمع کل اقلام:</td>
              <td style={{ textAlign: 'left', fontWeight: 600 }}>
                {formatAmount(totals.subtotal, isPersianDigits)} {currencyName}
              </td>
            </tr>
            {invoice.discountEnabled && (
              <tr>
                <td>مجموع تخفیف:</td>
                <td style={{ textAlign: 'left', color: '#b91c1c' }}>
                  {formatAmount(totals.totalDiscount, isPersianDigits)} {currencyName}
                </td>
              </tr>
            )}
            {invoice.taxEnabled && (
              <tr>
                <td>مجموع مالیات و عوارض:</td>
                <td style={{ textAlign: 'left' }}>
                  {formatAmount(totals.totalTax, isPersianDigits)} {currencyName}
                </td>
              </tr>
            )}
            <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 800 }}>
              <td>مبلغ قابل پرداخت:</td>
              <td style={{ textAlign: 'left', fontSize: '13px' }}>
                {formatAmount(totals.grandTotal, isPersianDigits)} {currencyName}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      {(invoice.showSellerSignature || invoice.showBuyerSignature) && (
        <div
          className="classic-signatures-row"
          style={{
            gridTemplateColumns:
              invoice.showSellerSignature && invoice.showBuyerSignature ? '1fr 1fr' : '1fr',
          }}
        >
          {invoice.showSellerSignature && (
            <div className="classic-sign-box">
              <span>مهر و امضای فروشنده:</span>
              {invoice.signatureImage && (
                <img
                  src={invoice.signatureImage}
                  alt="امضا"
                  style={{ maxHeight: '45px', objectFit: 'contain' }}
                />
              )}
            </div>
          )}
          {invoice.showBuyerSignature && (
            <div className="classic-sign-box">
              <span>مهر و امضای خریدار:</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
