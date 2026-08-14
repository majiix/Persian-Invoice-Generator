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
} from 'docx';
import { saveAs } from 'file-saver';
import { CURRENCY_LABELS, Invoice, STATUS_LABELS } from '../types/invoice';
import { calculateInvoiceTotals, calculateLineItemTotal } from './calculations';
import { formatAmount } from './persianDigits';
import { amountToWordsWithCurrency } from './numberToWords';

/**
 * Exports the rendered invoice HTML node to a high-resolution A4 PDF.
 */
export async function exportToPDF(element: HTMLElement, fileName: string): Promise<boolean> {
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
        const clonedEl = clonedDoc.getElementById('invoice-preview-sheet');
        if (clonedEl) {
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0';
          clonedEl.style.transform = 'none';
          clonedEl.style.borderRadius = '0';
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
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
        const clonedEl = clonedDoc.getElementById('invoice-preview-sheet');
        if (clonedEl) {
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0';
          clonedEl.style.borderRadius = '0';
        }
      },
    });

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${fileName}.png`);
      }
    }, 'image/png');

    return true;
  } catch (error) {
    console.error('Error generating Image:', error);
    throw error;
  }
}

/**
 * Generates and downloads a Microsoft Word (.docx) file with proper RTL alignment.
 */
export async function exportToWord(invoice: Invoice, fileName: string): Promise<boolean> {
  try {
    const isPersianDigits = invoice.digitType === 'persian';
    const currencyName = CURRENCY_LABELS[invoice.currency] || invoice.currency;
    const totals = calculateInvoiceTotals(invoice);
    const bankAccounts = invoice.payment.bankAccounts || [];

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children: [
            // Title & Invoice Header
            new Paragraph({
              text: invoice.title || 'فاکتور فروش کالا و خدمات',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              spacing: { after: 200 },
            }),

            // Meta Info (Invoice Number, Date, Status)
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'شماره فاکتور: ', bold: true }),
                            new TextRun({ text: invoice.invoiceNumber }),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'تاریخ صدور: ', bold: true }),
                            new TextRun({ text: invoice.issueDate }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.LEFT,
                          children: [
                            new TextRun({ text: 'وضعیت: ', bold: true }),
                            new TextRun({ text: STATUS_LABELS[invoice.status]?.label || invoice.status }),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.LEFT,
                          children: [
                            new TextRun({ text: 'تاریخ سررسید: ', bold: true }),
                            new TextRun({ text: invoice.dueDate || '-' }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { after: 200 } }),

            // Seller & Buyer Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    // Seller
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'مشخصات فروشنده', bold: true })],
                          alignment: AlignmentType.RIGHT,
                          bidirectional: true,
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'نام شرکت/شخص: ' }),
                            new TextRun({ text: invoice.business.name, bold: true }),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'تلفن: ' }),
                            new TextRun({ text: invoice.business.phone || '-' }),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'شناسه ملی/اقتصادی: ' }),
                            new TextRun({ text: invoice.business.nationalId || invoice.business.economicCode || '-' }),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'نشانی: ' }),
                            new TextRun({ text: invoice.business.address || '-' }),
                          ],
                        }),
                      ],
                    }),
                    // Buyer
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'مشخصات خریدار', bold: true })],
                          alignment: AlignmentType.RIGHT,
                          bidirectional: true,
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'نام شرکت/شخص: ' }),
                            new TextRun({ text: invoice.client.name, bold: true }),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'تلفن: ' }),
                            new TextRun({ text: invoice.client.phone || '-' }),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'شناسه ملی/اقتصادی: ' }),
                            new TextRun({ text: invoice.client.nationalId || invoice.client.economicCode || '-' }),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({ text: 'نشانی: ' }),
                            new TextRun({ text: invoice.client.address || '-' }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { after: 200 } }),

            // Items Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Table Header
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'ردیف', bold: true })], alignment: AlignmentType.CENTER, bidirectional: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'شرح کالا یا خدمات', bold: true })], alignment: AlignmentType.RIGHT, bidirectional: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'تعداد', bold: true })], alignment: AlignmentType.CENTER, bidirectional: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: `قیمت واحد (${currencyName})`, bold: true })], alignment: AlignmentType.CENTER, bidirectional: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'تخفیف', bold: true })], alignment: AlignmentType.CENTER, bidirectional: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'مالیات', bold: true })], alignment: AlignmentType.CENTER, bidirectional: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: `مبلغ کل (${currencyName})`, bold: true })], alignment: AlignmentType.CENTER, bidirectional: true })],
                    }),
                  ],
                }),
                // Table Rows
                ...invoice.items.map((item, index) => {
                  const itemCalc = calculateLineItemTotal(item);
                  return new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ text: formatAmount(index + 1, isPersianDigits), alignment: AlignmentType.CENTER, bidirectional: true })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: item.description, alignment: AlignmentType.RIGHT, bidirectional: true })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: `${formatAmount(item.quantity, isPersianDigits)} ${item.unit || ''}`, alignment: AlignmentType.CENTER, bidirectional: true })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: formatAmount(item.unitPrice, isPersianDigits), alignment: AlignmentType.CENTER, bidirectional: true })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: formatAmount(itemCalc.discountAmount, isPersianDigits), alignment: AlignmentType.CENTER, bidirectional: true })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: formatAmount(itemCalc.taxAmount, isPersianDigits), alignment: AlignmentType.CENTER, bidirectional: true })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: formatAmount(itemCalc.rowTotal, isPersianDigits), alignment: AlignmentType.CENTER, bidirectional: true })],
                      }),
                    ],
                  });
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { after: 200 } }),

            // Totals Summary Block
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({ text: 'جمع کل اقلام: ', bold: true }),
                new TextRun({ text: `${formatAmount(totals.subtotal, isPersianDigits)} ${currencyName}` }),
              ],
            }),
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({ text: 'مجموع تخفیف: ', bold: true }),
                new TextRun({ text: `${formatAmount(totals.totalDiscount, isPersianDigits)} ${currencyName}` }),
              ],
            }),
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({ text: 'مجموع مالیات و عوارض: ', bold: true }),
                new TextRun({ text: `${formatAmount(totals.totalTax, isPersianDigits)} ${currencyName}` }),
              ],
            }),
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({ text: 'مبلغ نهایی قابل پرداخت: ', bold: true, size: 24 }),
                new TextRun({ text: `${formatAmount(totals.grandTotal, isPersianDigits)} ${currencyName}`, bold: true, size: 24 }),
              ],
            }),
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.RIGHT,
              spacing: { before: 100, after: 200 },
              children: [
                new TextRun({ text: 'مبلغ به حروف: ', bold: true }),
                new TextRun({ text: amountToWordsWithCurrency(totals.grandTotal, currencyName) }),
              ],
            }),

            // Payment & Multiple Bank Accounts
            ...(bankAccounts.length > 0
              ? [
                  new Paragraph({
                    children: [new TextRun({ text: 'اطلاعات حساب‌های بانکی و واریز وجه:', bold: true })],
                    alignment: AlignmentType.RIGHT,
                    bidirectional: true,
                    spacing: { before: 200, after: 100 },
                  }),
                  ...bankAccounts.map(
                    (acc) =>
                      new Paragraph({
                        bidirectional: true,
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `${acc.bankName ? 'بانک ' + acc.bankName + ' | ' : ''}${acc.accountHolder ? 'به نام: ' + acc.accountHolder + ' | ' : ''}${acc.cardNumber ? 'شماره کارت: ' + acc.cardNumber + ' | ' : ''}${acc.accountNumber ? 'شماره حساب: ' + acc.accountNumber + ' | ' : ''}${acc.iban ? 'شماره شبا: ' + acc.iban : ''}`,
                          }),
                        ],
                      })
                  ),
                ]
              : []),

            ...(invoice.payment.terms || invoice.payment.notes
              ? [
                  new Paragraph({
                    children: [new TextRun({ text: 'توضیحات و شرایط:', bold: true })],
                    alignment: AlignmentType.RIGHT,
                    bidirectional: true,
                    spacing: { before: 150, after: 100 },
                  }),
                  new Paragraph({
                    bidirectional: true,
                    alignment: AlignmentType.RIGHT,
                    text: `${invoice.payment.terms || ''} ${invoice.payment.notes || ''}`.trim(),
                  }),
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
