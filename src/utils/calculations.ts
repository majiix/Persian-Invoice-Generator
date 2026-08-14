import { Invoice, InvoiceCalculations, LineItem } from '../types/invoice';

/**
 * Calculates a single row's total, taking discount and tax into account.
 */
export function calculateLineItemTotal(item: LineItem): {
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  rowTotal: number;
} {
  const baseAmount = Math.max(0, (item.quantity || 0) * (item.unitPrice || 0));
  
  let discountAmount = 0;
  if (item.discountType === 'percentage') {
    discountAmount = (baseAmount * Math.max(0, item.discount || 0)) / 100;
  } else {
    discountAmount = Math.max(0, item.discount || 0);
  }
  // Discount cannot exceed base amount
  discountAmount = Math.min(discountAmount, baseAmount);

  const taxableAmount = baseAmount - discountAmount;
  const taxAmount = (taxableAmount * Math.max(0, item.taxRate || 0)) / 100;
  const rowTotal = taxableAmount + taxAmount;

  return {
    baseAmount,
    discountAmount,
    taxAmount,
    rowTotal,
  };
}

/**
 * Computes all summary totals for an invoice
 */
export function calculateInvoiceTotals(invoice: Invoice): InvoiceCalculations {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let grandTotal = 0;

  for (const item of invoice.items) {
    const itemCalc = calculateLineItemTotal(item);
    subtotal += itemCalc.baseAmount;
    totalDiscount += itemCalc.discountAmount;
    totalTax += itemCalc.taxAmount;
    grandTotal += itemCalc.rowTotal;
  }

  return {
    subtotal,
    totalDiscount,
    totalTax,
    grandTotal,
  };
}
