import React from 'react';
import { Invoice } from '../../types/invoice';
import { formatAmount } from '../../utils/persianDigits';

interface Props {
  invoice: Invoice;
}

interface AttachmentPage {
  pageNumber: number; // 2, 3, 4...
  totalPages: number; // e.g. 3
  paragraphs: string[];
  isFirstAttachmentPage: boolean;
  isLastAttachmentPage: boolean;
}

/**
 * Splits attachment content into multiple A4-sized pages cleanly,
 * filling the page naturally without excessive whitespace.
 */
function paginateAttachmentContent(
  rawContent: string,
  hasSignatures: boolean
): AttachmentPage[] {
  const cleaned = rawContent && rawContent.trim().length > 0
    ? rawContent
    : 'توضیحات و مشخصات تکمیلی برای این فاکتور ثبت نشده است.';

  // 1. Break by explicit line breaks
  const rawParagraphs = cleaned.split('\n').filter((p) => p.trim().length > 0);
  const atoms: string[] = [];

  for (const p of rawParagraphs) {
    const trimmed = p.trim();
    // Only break if a single paragraph alone is huge (over 800 chars)
    if (trimmed.length > 800) {
      const sentences = trimmed.split(/(?<=[.؟!؛])\s+/);
      for (const s of sentences) {
        if (s.trim()) atoms.push(s.trim());
      }
    } else {
      atoms.push(trimmed);
    }
  }

  // Calculate lines for each atom
  // An A4 page line with 13px font holds ~85 Persian characters
  const getAtomWeight = (text: string): number => {
    const lines = Math.max(1, Math.ceil(text.length / 85));
    return lines + 0.3; // +0.3 line equivalent for margin gap
  };

  // Realistic page capacities in text lines (A4 has ~1050px printable space)
  const FIRST_PAGE_CAPACITY_NO_SIG = 34;
  const FIRST_PAGE_CAPACITY_WITH_SIG = 27;
  const MIDDLE_PAGE_CAPACITY = 38;
  const LAST_PAGE_CAPACITY_WITH_SIG = 30;

  // Let's pack into pages
  const pagesParagraphs: string[][] = [];
  let currentPage: string[] = [];
  let currentWeight = 0;

  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i];
    const weight = getAtomWeight(atom);
    
    // First page capacity depends on whether it will be the only page and has signatures
    const isFirstPage = pagesParagraphs.length === 0;
    const maxCap = isFirstPage
      ? (hasSignatures ? FIRST_PAGE_CAPACITY_WITH_SIG : FIRST_PAGE_CAPACITY_NO_SIG)
      : (hasSignatures ? LAST_PAGE_CAPACITY_WITH_SIG : MIDDLE_PAGE_CAPACITY);

    if (currentWeight + weight > maxCap && currentPage.length > 0) {
      // Push current page and start next
      pagesParagraphs.push(currentPage);
      currentPage = [atom];
      currentWeight = weight;
    } else {
      currentPage.push(atom);
      currentWeight += weight;
    }
  }

  if (currentPage.length > 0) {
    pagesParagraphs.push(currentPage);
  }

  // If last page with signatures exceeds capacity, balance it cleanly
  if (pagesParagraphs.length > 1 && hasSignatures) {
    const lastIdx = pagesParagraphs.length - 1;
    const lastPageWeight = pagesParagraphs[lastIdx].reduce((sum, a) => sum + getAtomWeight(a), 0);
    if (lastPageWeight > LAST_PAGE_CAPACITY_WITH_SIG && pagesParagraphs[lastIdx].length > 1) {
      const popped = pagesParagraphs[lastIdx].pop()!;
      pagesParagraphs.push([popped]);
    }
  }

  const totalAttachmentPages = Math.max(1, pagesParagraphs.length);
  const totalInvoicePages = 1 + totalAttachmentPages; // 1 (main invoice) + attachment pages

  return pagesParagraphs.map((paras, idx) => ({
    pageNumber: 2 + idx,
    totalPages: totalInvoicePages,
    paragraphs: paras,
    isFirstAttachmentPage: idx === 0,
    isLastAttachmentPage: idx === pagesParagraphs.length - 1,
  }));
}

export const SecondPageSheet: React.FC<Props> = ({ invoice }) => {
  if (!invoice.enableSecondPage) return null;

  const isPersianDigits = invoice.digitType === 'persian';
  const hasSignatures = Boolean(
    invoice.secondPageSignatures && (invoice.showSellerSignature || invoice.showBuyerSignature)
  );

  const pages = paginateAttachmentContent(
    invoice.secondPageContent || '',
    hasSignatures
  );

  return (
    <>
      {pages.map((page) => {
        const pageLabel = `صفحه ${formatAmount(page.pageNumber, isPersianDigits)} از ${formatAmount(page.totalPages, isPersianDigits)}`;

        return (
          <div
            key={`attachment-page-${page.pageNumber}`}
            className="invoice-page-sheet"
            style={{ marginBottom: '24px' }}
          >
            <div className={`invoice-sheet-container second-page-sheet template-${invoice.templateId}`}>
              {/* Header */}
              {page.isFirstAttachmentPage ? (
                // Full Header on First Attachment Page
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom:
                        invoice.templateId === 'classic'
                          ? '2px solid #111827'
                          : invoice.templateId === 'modern'
                          ? '3px solid #2563eb'
                          : '1px solid #e5e7eb',
                      paddingBottom: '12px',
                      marginBottom: '14px',
                    }}
                  >
                    <div>
                      <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                        {invoice.secondPageTitle || 'پیوست / شرایط و توضیحات تکمیلی'}
                      </h2>
                      <div style={{ fontSize: '11.5px', color: '#4b5563' }}>
                        پیوست فاکتور شماره <strong>{invoice.invoiceNumber}</strong> | تاریخ صدور: {invoice.issueDate}
                      </div>
                    </div>

                    <div style={{ textAlign: 'left', fontSize: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{invoice.business.name}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{pageLabel}</div>
                    </div>
                  </div>

                  {/* Parties Quick Summary */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11.5px',
                      marginBottom: '14px',
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
                </>
              ) : (
                // Compact Header on Subsequent Pages
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '8px',
                    marginBottom: '14px',
                    fontSize: '11.5px',
                    color: '#64748b',
                  }}
                >
                  <div>
                    <strong>{invoice.secondPageTitle || 'پیوست فاکتور'}</strong> (ادامه) - شماره:{' '}
                    <strong>{invoice.invoiceNumber}</strong>
                  </div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{pageLabel}</div>
                </div>
              )}

              {/* Main Comments & Terms Content (Right aligned, strictly NO justify to avoid broken Persian text) */}
              <div
                className="second-page-content-box"
                style={{
                  flex: 1,
                  fontSize: '12.5px',
                  lineHeight: 1.75,
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  textAlign: 'right',
                  direction: 'rtl',
                  letterSpacing: '0px',
                  wordBreak: 'normal',
                  overflowWrap: 'break-word',
                }}
              >
                {page.paragraphs.map((para, pIdx) => (
                  <p key={pIdx} style={{ margin: 0, whiteSpace: 'pre-wrap', textAlign: 'right', letterSpacing: '0px' }}>
                    {para}
                  </p>
                ))}
              </div>

              {/* Signatures on the FINAL Page */}
              {page.isLastAttachmentPage && hasSignatures && (
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '14px',
                    borderTop: '1px dashed #cbd5e1',
                    display: 'grid',
                    gridTemplateColumns:
                      invoice.showSellerSignature && invoice.showBuyerSignature ? '1fr 1fr' : '1fr',
                    gap: '16px',
                  }}
                >
                  {invoice.showSellerSignature && (
                    <div
                      style={{
                        textAlign: 'center',
                        border: '1px dashed #d1d5db',
                        borderRadius: '4px',
                        padding: '6px',
                        minHeight: '70px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#475569' }}>مهر و امضای صادرکننده</span>
                      {invoice.signatureImage && (
                        <img
                          src={invoice.signatureImage}
                          alt="امضا"
                          style={{ maxHeight: '36px', objectFit: 'contain', margin: '0 auto' }}
                        />
                      )}
                    </div>
                  )}

                  {invoice.showBuyerSignature && (
                    <div
                      style={{
                        textAlign: 'center',
                        border: '1px dashed #d1d5db',
                        borderRadius: '4px',
                        padding: '6px',
                        minHeight: '70px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#475569' }}>امضا و تأیید خریدار</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
