import React from 'react';
import { Invoice } from '../../types/invoice';

interface Props {
  invoice: Invoice;
}

export const SecondPageSheet: React.FC<Props> = ({ invoice }) => {
  if (!invoice.enableSecondPage) return null;

  const paragraphs = (invoice.secondPageContent || 'توضیحاتی ثبت نشده است.')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  return (
    <div className={`invoice-sheet-container second-page-sheet template-${invoice.templateId}`}>
      {/* Header of Second Page */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: invoice.templateId === 'classic' ? '2px solid #111827' : invoice.templateId === 'modern' ? '3px solid #2563eb' : '1px solid #e5e7eb',
          paddingBottom: '14px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            {invoice.secondPageTitle || 'پیوست / شرایط و توضیحات تکمیلی'}
          </h2>
          <div style={{ fontSize: '12px', color: '#4b5563' }}>
            پیوست فاکتور شماره <strong>{invoice.invoiceNumber}</strong> | تاریخ صدور: {invoice.issueDate}
          </div>
        </div>

        <div style={{ textAlign: 'left', fontSize: '12px' }}>
          <div style={{ fontWeight: 700, color: '#111827' }}>{invoice.business.name}</div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>صفحه ۲ از ۲</div>
        </div>
      </div>

      {/* Parties Quick Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          fontSize: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <span style={{ color: '#64748b' }}>صادرکننده (فروشنده): </span>
          <strong>{invoice.business.name}</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>مشتری (خریدار): </span>
          <strong>{invoice.client.name}</strong>
        </div>
      </div>

      {/* Main Comments & Terms Content */}
      <div
        className="second-page-content-box"
        style={{
          flex: 1,
          fontSize: '13px',
          lineHeight: 1.8,
          color: '#1e293b',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {paragraphs.map((para, idx) => (
          <p key={idx} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {para}
          </p>
        ))}
      </div>

      {/* Signatures on Second Page */}
      {invoice.secondPageSignatures && (invoice.showSellerSignature || invoice.showBuyerSignature) && (
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '20px',
            borderTop: '1px dashed #cbd5e1',
            display: 'grid',
            gridTemplateColumns: invoice.showSellerSignature && invoice.showBuyerSignature ? '1fr 1fr' : '1fr',
            gap: '24px',
          }}
        >
          {invoice.showSellerSignature && (
            <div style={{ textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: '4px', padding: '8px', minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', color: '#475569' }}>مهر و امضای فروشنده</span>
              {invoice.signatureImage && (
                <img
                  src={invoice.signatureImage}
                  alt="امضا"
                  style={{ maxHeight: '42px', objectFit: 'contain', margin: '0 auto' }}
                />
              )}
            </div>
          )}

          {invoice.showBuyerSignature && (
            <div style={{ textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: '4px', padding: '8px', minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', color: '#475569' }}>امضا و تأیید خریدار</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
