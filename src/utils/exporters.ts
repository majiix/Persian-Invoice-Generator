import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
  HeadingLevel,
  PageBreak,
  BorderStyle,
  TableLayoutType,
  VerticalAlign,
} from 'docx';
import { saveAs } from 'file-saver';
import { CURRENCY_LABELS, Invoice, STATUS_LABELS } from '../types/invoice';
import { calculateInvoiceTotals, calculateLineItemTotal } from './calculations';
import { formatAmount } from './persianDigits';
import { amountToWordsWithCurrency } from './numberToWords';

/**
 * Helper to sanitize Persian text in cloned DOM before html2canvas rendering.
 * html2canvas has a known bug where Zero-Width Non-Joiner (ZWNJ / \u200C)
 * causes adjacent characters to overlap and render corrupted text.
 */
function fixClonedPersianText(root: any): void {
  try {
    const doc = root.ownerDocument || (root.createTreeWalker ? root : document);
    const walker = doc.createTreeWalker(
      root.body || root,
      NodeFilter.SHOW_TEXT,
      null
    );
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && /[\u200C\u200D]/.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(/[\u200C\u200D]/g, ' ');
      }
    }
  } catch (err) {
    console.warn('Error sanitizing cloned Persian text:', err);
  }
}

/**
 * Exports the rendered invoice HTML node to a high-resolution A4 PDF.
 */
export async function exportToPDF(element: HTMLElement, fileName: string): Promise<boolean> {
  try {
    if (document.fonts) {
      await document.fonts.ready;
    }

    const pageElements = Array.from(element.querySelectorAll<HTMLElement>('.invoice-page-sheet'));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    if (pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const pageEl = pageElements[i];
        const canvas = await html2canvas(pageEl, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (clonedDoc) => {
            fixClonedPersianText(clonedDoc);
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }
    } else {
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          fixClonedPersianText(clonedDoc);
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Exports the invoice as a PNG image file.
 */
export async function exportToImage(element: HTMLElement, fileName: string): Promise<boolean> {
  try {
    if (document.fonts) {
      await document.fonts.ready;
    }

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        fixClonedPersianText(clonedDoc);
        const clonedEl = clonedDoc.getElementById('invoice-preview-sheet');
        if (clonedEl) {
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0';
          clonedEl.style.transform = 'none';
          clonedEl.style.borderRadius = '0';
        }
      },
    });

    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (error) {
    console.error('Error generating Image:', error);
    throw error;
  }
}

/**
 * Generates and downloads a beautifully styled, high-end Microsoft Word (.docx) file with full RTL support.
 */
export async function exportToWord(invoice: Invoice, fileName: string): Promise<boolean> {
  try {
    const isPersianDigits = invoice.digitType === 'persian';
    const currencyName = CURRENCY_LABELS[invoice.currency] || invoice.currency;
    const totals = calculateInvoiceTotals(invoice);
    const bankAccounts = invoice.payment.bankAccounts || [];

    const FONT_NAME = 'Vazirmatn';

    const lightBorder = {
      style: BorderStyle.SINGLE,
      size: 1,
      color: 'CBD5E1',
    };

    const cellBorders = {
      top: lightBorder,
      bottom: lightBorder,
      left: lightBorder,
      right: lightBorder,
    };

    const dashedBorder = {
      style: BorderStyle.DASHED,
      size: 1,
      color: '94A3B8',
    };

    const cellMargins = { top: 120, bottom: 120, left: 140, right: 140 };

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: FONT_NAME,
              size: 21, // 10.5pt
              rightToLeft: true,
              color: '1E293B',
            },
            paragraph: {
              alignment: AlignmentType.RIGHT,
              spacing: { line: 280, before: 40, after: 40 },
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 in
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children: [
            // Title
            new Paragraph({
              text: invoice.title || 'فاکتور فروش کالا و خدمات',
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              spacing: { before: 100, after: 180 },
              children: [
                new TextRun({
                  text: invoice.title || 'فاکتور فروش کالا و خدمات',
                  bold: true,
                  size: 32, // 16pt
                  color: '1E3A8A',
                  font: FONT_NAME,
                  rightToLeft: true,
                }),
              ],
            }),

            // Meta Info Table (Invoice Number, Date, Due Date, Status)
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              visuallyRightToLeft: true,
              layout: TableLayoutType.FIXED,
              margins: cellMargins,
              borders: {
                top: lightBorder,
                bottom: lightBorder,
                left: lightBorder,
                right: lightBorder,
                insideHorizontal: lightBorder,
                insideVertical: lightBorder,
              },
              rows: [
                new TableRow({
                  children: [
                    // Column 1 (Right): Number & Issue Date
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      shading: { fill: 'F8FAFC' },
                      borders: cellBorders,
                      children: [
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'شماره فاکتور: ', bold: true, color: '475569', font: FONT_NAME, rightToLeft: true }),
                            new TextRun({ text: invoice.invoiceNumber, bold: true, color: '0F172A', font: FONT_NAME, rightToLeft: true }),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'تاریخ صدور: ', bold: true, color: '475569', font: FONT_NAME, rightToLeft: true }),
                            new TextRun({ text: invoice.issueDate, color: '0F172A', font: FONT_NAME, rightToLeft: true }),
                          ],
                        }),
                      ],
                    }),

                    // Column 2 (Left): Due Date & Status
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      shading: { fill: 'F8FAFC' },
                      borders: cellBorders,
                      children: [
                        ...(invoice.dueDate
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'تاریخ سررسید: ', bold: true, color: '475569', font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({ text: invoice.dueDate, color: '0F172A', font: FONT_NAME, rightToLeft: true }),
                                ],
                              }),
                            ]
                          : []),
                        ...(invoice.showStatusBadge
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'وضعیت پرداخت: ', bold: true, color: '475569', font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({
                                    text: STATUS_LABELS[invoice.status]?.label || invoice.status,
                                    bold: true,
                                    color: invoice.status === 'paid' ? '15803D' : invoice.status === 'unpaid' ? 'B45309' : '475569',
                                    font: FONT_NAME,
                                    rightToLeft: true,
                                  }),
                                ],
                              }),
                            ]
                          : []),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { before: 120, after: 120 } }),

            // Seller & Buyer Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              visuallyRightToLeft: true,
              layout: TableLayoutType.FIXED,
              margins: cellMargins,
              borders: {
                top: lightBorder,
                bottom: lightBorder,
                left: lightBorder,
                right: lightBorder,
                insideHorizontal: lightBorder,
                insideVertical: lightBorder,
              },
              rows: [
                // Headers Row
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      shading: { fill: 'E2E8F0' },
                      borders: cellBorders,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          bidirectional: true,
                          children: [
                            new TextRun({ text: 'مشخصات فروشنده (صادرکننده)', bold: true, color: '0F172A', font: FONT_NAME, rightToLeft: true }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      shading: { fill: 'E2E8F0' },
                      borders: cellBorders,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          bidirectional: true,
                          children: [
                            new TextRun({ text: 'مشخصات خریدار (مشتری)', bold: true, color: '0F172A', font: FONT_NAME, rightToLeft: true }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),

                // Content Row
                new TableRow({
                  children: [
                    // Seller Details
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: cellBorders,
                      children: [
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'نام شرکت/شخص: ', bold: true, font: FONT_NAME, rightToLeft: true }),
                            new TextRun({ text: invoice.business.name || '-', font: FONT_NAME, rightToLeft: true }),
                          ],
                        }),
                        ...(invoice.business.economicCode || invoice.business.nationalId
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'شناسه ملی/اقتصادی: ', bold: true, font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({ text: invoice.business.nationalId || invoice.business.economicCode || '-', font: FONT_NAME, rightToLeft: true }),
                                ],
                              }),
                            ]
                          : []),
                        ...(invoice.business.phone
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'تلفن تماس: ', bold: true, font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({ text: invoice.business.phone, font: FONT_NAME, rightToLeft: true }),
                                ],
                              }),
                            ]
                          : []),
                        ...(invoice.business.address
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'نشانی: ', bold: true, font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({ text: invoice.business.address, font: FONT_NAME, rightToLeft: true }),
                                ],
                              }),
                            ]
                          : []),
                      ],
                    }),

                    // Buyer Details
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: cellBorders,
                      children: [
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'نام شرکت/شخص: ', bold: true, font: FONT_NAME, rightToLeft: true }),
                            new TextRun({ text: invoice.client.name || '-', font: FONT_NAME, rightToLeft: true }),
                          ],
                        }),
                        ...(invoice.client.economicCode || invoice.client.nationalId
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'شناسه ملی/اقتصادی: ', bold: true, font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({ text: invoice.client.nationalId || invoice.client.economicCode || '-', font: FONT_NAME, rightToLeft: true }),
                                ],
                              }),
                            ]
                          : []),
                        ...(invoice.client.phone
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'تلفن تماس: ', bold: true, font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({ text: invoice.client.phone, font: FONT_NAME, rightToLeft: true }),
                                ],
                              }),
                            ]
                          : []),
                        ...(invoice.client.address
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'نشانی: ', bold: true, font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({ text: invoice.client.address, font: FONT_NAME, rightToLeft: true }),
                                ],
                              }),
                            ]
                          : []),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { before: 140, after: 140 } }),

            // Line Items Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              visuallyRightToLeft: true,
              layout: TableLayoutType.FIXED,
              margins: cellMargins,
              borders: {
                top: lightBorder,
                bottom: lightBorder,
                left: lightBorder,
                right: lightBorder,
                insideHorizontal: lightBorder,
                insideVertical: lightBorder,
              },
              rows: [
                // Header Row
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 6, type: WidthType.PERCENTAGE },
                      shading: { fill: '1E293B' },
                      borders: cellBorders,
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          bidirectional: true,
                          children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF', font: FONT_NAME, rightToLeft: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 36, type: WidthType.PERCENTAGE },
                      shading: { fill: '1E293B' },
                      borders: cellBorders,
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          bidirectional: true,
                          children: [new TextRun({ text: 'شرح کالا یا خدمات', bold: true, color: 'FFFFFF', font: FONT_NAME, rightToLeft: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 12, type: WidthType.PERCENTAGE },
                      shading: { fill: '1E293B' },
                      borders: cellBorders,
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          bidirectional: true,
                          children: [new TextRun({ text: 'تعداد / واحد', bold: true, color: 'FFFFFF', font: FONT_NAME, rightToLeft: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 16, type: WidthType.PERCENTAGE },
                      shading: { fill: '1E293B' },
                      borders: cellBorders,
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          bidirectional: true,
                          children: [new TextRun({ text: `قیمت واحد (${currencyName})`, bold: true, color: 'FFFFFF', font: FONT_NAME, rightToLeft: true })],
                        }),
                      ],
                    }),
                    ...(invoice.discountEnabled
                      ? [
                          new TableCell({
                            width: { size: 10, type: WidthType.PERCENTAGE },
                            shading: { fill: '1E293B' },
                            borders: cellBorders,
                            verticalAlign: VerticalAlign.CENTER,
                            children: [
                              new Paragraph({
                                alignment: AlignmentType.CENTER,
                                bidirectional: true,
                                children: [new TextRun({ text: 'تخفیف', bold: true, color: 'FFFFFF', font: FONT_NAME, rightToLeft: true })],
                              }),
                            ],
                          }),
                        ]
                      : []),
                    ...(invoice.taxEnabled && invoice.taxType === 'per_item'
                      ? [
                          new TableCell({
                            width: { size: 8, type: WidthType.PERCENTAGE },
                            shading: { fill: '1E293B' },
                            borders: cellBorders,
                            verticalAlign: VerticalAlign.CENTER,
                            children: [
                              new Paragraph({
                                alignment: AlignmentType.CENTER,
                                bidirectional: true,
                                children: [new TextRun({ text: 'مالیات', bold: true, color: 'FFFFFF', font: FONT_NAME, rightToLeft: true })],
                              }),
                            ],
                          }),
                        ]
                      : []),
                    new TableCell({
                      width: { size: 18, type: WidthType.PERCENTAGE },
                      shading: { fill: '1E293B' },
                      borders: cellBorders,
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          bidirectional: true,
                          children: [new TextRun({ text: `مبلغ کل (${currencyName})`, bold: true, color: 'FFFFFF', font: FONT_NAME, rightToLeft: true })],
                        }),
                      ],
                    }),
                  ],
                }),

                // Items Rows
                ...invoice.items.map((item, index) => {
                  const itemCalc = calculateLineItemTotal(item, {
                    discountEnabled: invoice.discountEnabled,
                    taxEnabled: invoice.taxEnabled,
                    taxType: invoice.taxType,
                  });
                  const isEven = index % 2 === 1;
                  const rowBg = isEven ? 'F8FAFC' : 'FFFFFF';

                  return new TableRow({
                    children: [
                      new TableCell({
                        shading: { fill: rowBg },
                        borders: cellBorders,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            bidirectional: true,
                            children: [new TextRun({ text: formatAmount(index + 1, isPersianDigits), font: FONT_NAME, rightToLeft: true })],
                          }),
                        ],
                      }),
                      new TableCell({
                        shading: { fill: rowBg },
                        borders: cellBorders,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            bidirectional: true,
                            children: [
                              new TextRun({ text: item.description, bold: true, font: FONT_NAME, rightToLeft: true }),
                              ...(item.itemCode ? [new TextRun({ text: ` (کد: ${item.itemCode})`, size: 18, color: '64748B', font: FONT_NAME, rightToLeft: true })] : []),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        shading: { fill: rowBg },
                        borders: cellBorders,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            bidirectional: true,
                            children: [new TextRun({ text: `${formatAmount(item.quantity, isPersianDigits)} ${item.unit || ''}`, font: FONT_NAME, rightToLeft: true })],
                          }),
                        ],
                      }),
                      new TableCell({
                        shading: { fill: rowBg },
                        borders: cellBorders,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            bidirectional: true,
                            children: [new TextRun({ text: formatAmount(item.unitPrice, isPersianDigits), font: FONT_NAME, rightToLeft: true })],
                          }),
                        ],
                      }),
                      ...(invoice.discountEnabled
                        ? [
                            new TableCell({
                              shading: { fill: rowBg },
                              borders: cellBorders,
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  bidirectional: true,
                                  children: [new TextRun({ text: formatAmount(itemCalc.discountAmount, isPersianDigits), color: 'DC2626', font: FONT_NAME, rightToLeft: true })],
                                }),
                              ],
                            }),
                          ]
                        : []),
                      ...(invoice.taxEnabled && invoice.taxType === 'per_item'
                        ? [
                            new TableCell({
                              shading: { fill: rowBg },
                              borders: cellBorders,
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.CENTER,
                                  bidirectional: true,
                                  children: [new TextRun({ text: formatAmount(itemCalc.taxAmount, isPersianDigits), font: FONT_NAME, rightToLeft: true })],
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new TableCell({
                        shading: { fill: rowBg },
                        borders: cellBorders,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            bidirectional: true,
                            children: [new TextRun({ text: formatAmount(itemCalc.rowTotal, isPersianDigits), bold: true, font: FONT_NAME, rightToLeft: true })],
                          }),
                        ],
                      }),
                    ],
                  });
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { before: 120, after: 120 } }),

            // Summary & Totals Box
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              visuallyRightToLeft: true,
              layout: TableLayoutType.FIXED,
              margins: cellMargins,
              borders: {
                top: lightBorder,
                bottom: lightBorder,
                left: lightBorder,
                right: lightBorder,
                insideHorizontal: lightBorder,
                insideVertical: lightBorder,
              },
              rows: [
                new TableRow({
                  children: [
                    // Right: Amount in Words
                    new TableCell({
                      width: { size: 55, type: WidthType.PERCENTAGE },
                      shading: { fill: 'F8FAFC' },
                      borders: cellBorders,
                      children: [
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'مبلغ به حروف: ', bold: true, color: '475569', font: FONT_NAME, rightToLeft: true }),
                            new TextRun({
                              text: amountToWordsWithCurrency(totals.grandTotal, currencyName),
                              bold: true,
                              color: '1E3A8A',
                              font: FONT_NAME,
                              rightToLeft: true,
                            }),
                          ],
                        }),
                      ],
                    }),

                    // Left: Totals Calculation
                    new TableCell({
                      width: { size: 45, type: WidthType.PERCENTAGE },
                      borders: cellBorders,
                      children: [
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'جمع کل اقلام: ', font: FONT_NAME, rightToLeft: true }),
                            new TextRun({ text: `${formatAmount(totals.subtotal, isPersianDigits)} ${currencyName}`, bold: true, font: FONT_NAME, rightToLeft: true }),
                          ],
                        }),
                        ...(invoice.discountEnabled
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'مجموع تخفیف: ', color: 'DC2626', font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({ text: `- ${formatAmount(totals.totalDiscount, isPersianDigits)} ${currencyName}`, bold: true, color: 'DC2626', font: FONT_NAME, rightToLeft: true }),
                                ],
                              }),
                            ]
                          : []),
                        ...(invoice.taxEnabled
                          ? [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: 'مالیات و عوارض: ', font: FONT_NAME, rightToLeft: true }),
                                  new TextRun({ text: `${formatAmount(totals.totalTax, isPersianDigits)} ${currencyName}`, bold: true, font: FONT_NAME, rightToLeft: true }),
                                ],
                              }),
                            ]
                          : []),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          spacing: { before: 80 },
                          children: [
                            new TextRun({ text: 'مبلغ نهایی قابل پرداخت: ', bold: true, color: '1E3A8A', size: 24, font: FONT_NAME, rightToLeft: true }),
                            new TextRun({ text: `${formatAmount(totals.grandTotal, isPersianDigits)} ${currencyName}`, bold: true, color: '1E3A8A', size: 24, font: FONT_NAME, rightToLeft: true }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Bank Accounts Section
            ...(bankAccounts.length > 0
              ? [
                  new Paragraph({ text: '', spacing: { before: 120 } }),
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    visuallyRightToLeft: true,
                    layout: TableLayoutType.FIXED,
                    margins: cellMargins,
                    borders: {
                      top: lightBorder,
                      bottom: lightBorder,
                      left: lightBorder,
                      right: lightBorder,
                      insideHorizontal: lightBorder,
                      insideVertical: lightBorder,
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            shading: { fill: 'F8FAFC' },
                            borders: cellBorders,
                            children: [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [new TextRun({ text: 'اطلاعات حساب‌های بانکی و واریز وجه:', bold: true, color: '1E3A8A', font: FONT_NAME, rightToLeft: true })],
                              }),
                              ...bankAccounts.map(
                                (acc) =>
                                  new Paragraph({
                                    bidirectional: true,
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { before: 40, after: 40 },
                                    children: [
                                      new TextRun({ text: `• ${acc.bankName ? 'بانک ' + acc.bankName + ' | ' : ''}`, bold: true, font: FONT_NAME, rightToLeft: true }),
                                      new TextRun({ text: `${acc.accountHolder ? 'به نام: ' + acc.accountHolder + ' | ' : ''}`, font: FONT_NAME, rightToLeft: true }),
                                      new TextRun({ text: `${acc.cardNumber ? 'شماره کارت: ' + acc.cardNumber + ' | ' : ''}`, font: FONT_NAME, rightToLeft: true }),
                                      new TextRun({ text: `${acc.accountNumber ? 'شماره حساب: ' + acc.accountNumber + ' | ' : ''}`, font: FONT_NAME, rightToLeft: true }),
                                      new TextRun({ text: `${acc.iban ? 'شماره شبا: ' + acc.iban : ''}`, font: FONT_NAME, rightToLeft: true }),
                                    ],
                                  })
                              ),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ]
              : []),

            // Payment Terms & Notes
            ...(invoice.payment.terms || invoice.payment.notes
              ? [
                  new Paragraph({ text: '', spacing: { before: 100 } }),
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    visuallyRightToLeft: true,
                    layout: TableLayoutType.FIXED,
                    margins: cellMargins,
                    borders: {
                      top: lightBorder,
                      bottom: lightBorder,
                      left: lightBorder,
                      right: lightBorder,
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            borders: cellBorders,
                            children: [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [new TextRun({ text: 'شرایط و توضیحات فاکتور:', bold: true, color: '475569', font: FONT_NAME, rightToLeft: true })],
                              }),
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({
                                    text: `${invoice.payment.terms || ''} ${invoice.payment.notes || ''}`.trim(),
                                    font: FONT_NAME,
                                    rightToLeft: true,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ]
              : []),

            // Signatures Table
            ...(invoice.showSellerSignature || invoice.showBuyerSignature
              ? [
                  new Paragraph({ text: '', spacing: { before: 200 } }),
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    visuallyRightToLeft: true,
                    layout: TableLayoutType.FIXED,
                    margins: { top: 200, bottom: 200, left: 140, right: 140 },
                    borders: {
                      top: dashedBorder,
                      bottom: dashedBorder,
                      left: dashedBorder,
                      right: dashedBorder,
                      insideHorizontal: dashedBorder,
                      insideVertical: dashedBorder,
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            width: { size: 50, type: WidthType.PERCENTAGE },
                            borders: { top: dashedBorder, bottom: dashedBorder, left: dashedBorder, right: dashedBorder },
                            children: [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.CENTER,
                                children: [
                                  new TextRun({
                                    text: invoice.showSellerSignature ? 'مهر و امضای فروشنده (صادرکننده)' : '',
                                    bold: true,
                                    color: '64748B',
                                    font: FONT_NAME,
                                    rightToLeft: true,
                                  }),
                                ],
                              }),
                              new Paragraph({ text: '', spacing: { before: 300 } }),
                            ],
                          }),
                          new TableCell({
                            width: { size: 50, type: WidthType.PERCENTAGE },
                            borders: { top: dashedBorder, bottom: dashedBorder, left: dashedBorder, right: dashedBorder },
                            children: [
                              new Paragraph({
                                bidirectional: true,
                                alignment: AlignmentType.CENTER,
                                children: [
                                  new TextRun({
                                    text: invoice.showBuyerSignature ? 'امضا و تأیید خریدار' : '',
                                    bold: true,
                                    color: '64748B',
                                    font: FONT_NAME,
                                    rightToLeft: true,
                                  }),
                                ],
                              }),
                              new Paragraph({ text: '', spacing: { before: 300 } }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ]
              : []),

            // Second Page (پیوست و توضیحات تکمیلی)
            ...(invoice.enableSecondPage
              ? [
                  new Paragraph({
                    children: [new PageBreak()],
                  }),
                  new Paragraph({
                    text: invoice.secondPageTitle || 'پیوست / شرایط و توضیحات تکمیلی',
                    heading: HeadingLevel.HEADING_2,
                    alignment: AlignmentType.CENTER,
                    bidirectional: true,
                    spacing: { before: 100, after: 150 },
                    children: [
                      new TextRun({
                        text: invoice.secondPageTitle || 'پیوست / شرایط و توضیحات تکمیلی',
                        bold: true,
                        size: 28,
                        color: '1E3A8A',
                        font: FONT_NAME,
                        rightToLeft: true,
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    bidirectional: true,
                    spacing: { after: 200 },
                    children: [
                      new TextRun({
                        text: `پیوست فاکتور شماره ${invoice.invoiceNumber} | تاریخ: ${invoice.issueDate}`,
                        color: '64748B',
                        font: FONT_NAME,
                        rightToLeft: true,
                      }),
                    ],
                  }),
                  ...(invoice.secondPageContent || '')
                    .split('\n')
                    .filter((line) => line.trim().length > 0)
                    .map(
                      (line) =>
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          bidirectional: true,
                          spacing: { after: 100 },
                          children: [
                            new TextRun({
                              text: line,
                              font: FONT_NAME,
                              rightToLeft: true,
                            }),
                          ],
                        })
                    ),
                  ...(invoice.secondPageSignatures && (invoice.showSellerSignature || invoice.showBuyerSignature)
                    ? [
                        new Paragraph({ text: '', spacing: { before: 300 } }),
                        new Table({
                          width: { size: 100, type: WidthType.PERCENTAGE },
                          visuallyRightToLeft: true,
                          layout: TableLayoutType.FIXED,
                          margins: { top: 200, bottom: 200, left: 140, right: 140 },
                          borders: {
                            top: dashedBorder,
                            bottom: dashedBorder,
                            left: dashedBorder,
                            right: dashedBorder,
                            insideHorizontal: dashedBorder,
                            insideVertical: dashedBorder,
                          },
                          rows: [
                            new TableRow({
                              children: [
                                new TableCell({
                                  borders: { top: dashedBorder, bottom: dashedBorder, left: dashedBorder, right: dashedBorder },
                                  children: [
                                    new Paragraph({
                                      bidirectional: true,
                                      alignment: AlignmentType.CENTER,
                                      children: [
                                        new TextRun({
                                          text: invoice.showSellerSignature ? 'مهر و امضای فروشنده' : '',
                                          bold: true,
                                          color: '64748B',
                                          font: FONT_NAME,
                                          rightToLeft: true,
                                        }),
                                      ],
                                    }),
                                    new Paragraph({ text: '', spacing: { before: 300 } }),
                                  ],
                                }),
                                new TableCell({
                                  borders: { top: dashedBorder, bottom: dashedBorder, left: dashedBorder, right: dashedBorder },
                                  children: [
                                    new Paragraph({
                                      bidirectional: true,
                                      alignment: AlignmentType.CENTER,
                                      children: [
                                        new TextRun({
                                          text: invoice.showBuyerSignature ? 'امضا و تأیید خریدار' : '',
                                          bold: true,
                                          color: '64748B',
                                          font: FONT_NAME,
                                          rightToLeft: true,
                                        }),
                                      ],
                                    }),
                                    new Paragraph({ text: '', spacing: { before: 300 } }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ]
                    : []),
                ]
              : []),
          ],
        },
      ],
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `${fileName}.docx`);
    return true;
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
}

/**
 * Downloads the full invoice data as a JSON file.
 */
export function exportToJSON(invoice: Invoice, fileName: string): void {
  const jsonString = JSON.stringify(invoice, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${fileName}.json`);
}

/**
 * Validates and parses an uploaded JSON file into an Invoice object.
 */
export function validateAndParseInvoiceJSON(jsonText: string): { success: boolean; data?: Invoice; error?: string } {
  try {
    const data = JSON.parse(jsonText);

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'فایل JSON نامعتبر است.' };
    }

    if (!data.invoiceNumber || !data.items || !Array.isArray(data.items)) {
      return { success: false, error: 'ساختار فایل فاکتور معتبر نمی‌باشد (فیلدهای ضروری یافت نشدند).' };
    }

    if (!data.business || !data.client) {
      return { success: false, error: 'اطلاعات فروشنده یا خریدار در فایل موجود نیست.' };
    }

    if (!data.id) {
      data.id = 'inv-' + Date.now().toString(36);
    }

    data.showStatusBadge = data.showStatusBadge ?? true;
    data.showSellerSignature = data.showSellerSignature ?? true;
    data.showBuyerSignature = data.showBuyerSignature ?? true;
    data.taxType = data.taxType || 'overall';
    data.overallTaxRate = data.overallTaxRate ?? data.defaultTaxRate ?? 10;
    data.enableSecondPage = data.enableSecondPage ?? false;
    data.secondPageTitle = data.secondPageTitle || 'پیوست / شرایط و توضیحات تکمیلی قرارداد';
    data.secondPageContent = data.secondPageContent || '';
    data.secondPageSignatures = data.secondPageSignatures ?? true;

    // Normalize bank accounts array
    let accounts = [];
    if (Array.isArray(data.payment?.bankAccounts)) {
      accounts = data.payment.bankAccounts;
    } else if (data.payment?.bankName || data.payment?.cardNumber || data.payment?.iban) {
      accounts = [
        {
          id: 'acc-1',
          bankName: data.payment.bankName || '',
          accountHolder: data.payment.accountHolder || '',
          accountNumber: data.payment.accountNumber || '',
          cardNumber: data.payment.cardNumber || '',
          iban: data.payment.iban || '',
        },
      ];
    }
    data.payment = { ...data.payment, bankAccounts: accounts };

    data.items = data.items.map((item: any, index: number) => ({
      id: item.id || `item-${index}-${Date.now()}`,
      description: item.description || '',
      itemCode: item.itemCode || '',
      quantity: Number(item.quantity) || 1,
      unit: item.unit || 'عدد',
      unitPrice: Number(item.unitPrice) || 0,
      discount: Number(item.discount) || 0,
      discountType: item.discountType === 'fixed' ? 'fixed' : 'percentage',
      taxRate: Number(item.taxRate) || 0,
    }));

    return { success: true, data: data as Invoice };
  } catch {
    return { success: false, error: 'خطا در خواندن فایل: فرمت JSON صحیح نیست.' };
  }
}
