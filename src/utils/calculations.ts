import { Invoice, InvoiceCalculations, LineItem } from '../types/invoice';

/**
 * Calculates a single row's total, strictly respecting whether discount and per-item tax are enabled.
 */
export function calculateLineItemTotal(
  item: LineItem,
  options?: { discountEnabled?: boolean; taxEnabled?: boolean; taxType?: 'overall' | 'per_item' }
): {
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  rowTotal: number;
} {
  const baseAmount = Math.max(0, (item.quantity || 0) * (item.unitPrice || 0));
  
  const isDiscountEnabled = options ? Boolean(options.discountEnabled) : true;
  const isTaxEnabled = options ? Boolean(options.taxEnabled) : true;
  const taxType = options?.taxType ?? 'overall';

  let discountAmount = 0;
  if (isDiscountEnabled) {
    if (item.discountType === 'percentage') {
      discountAmount = (baseAmount * Math.max(0, item.discount || 0)) / 100;
    } else {
      discountAmount = Math.max(0, item.discount || 0);
    }
    discountAmount = Math.min(discountAmount, baseAmount);
  }

  const taxableAmount = baseAmount - discountAmount;
  
  // Tax on single line item is only calculated if taxEnabled AND taxType is 'per_item'
  const taxAmount = isTaxEnabled && taxType === 'per_item'
    ? (taxableAmount * Math.max(0, item.taxRate || 0)) / 100
    : 0;

  const rowTotal = taxableAmount + taxAmount;

  return {
    baseAmount,
    discountAmount,
    taxAmount,
    rowTotal,
  };
}

/**
 * Computes all summary totals for an invoice strictly based on invoice.discountEnabled and invoice.taxEnabled.
 */
export function calculateInvoiceTotals(invoice: Invoice): InvoiceCalculations {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const isDiscountEnabled = Boolean(invoice.discountEnabled);
  const isTaxEnabled = Boolean(invoice.taxEnabled);
  const taxType = invoice.taxType || 'overall';
  const overallRate = Math.max(0, invoice.overallTaxRate ?? invoice.defaultTaxRate ?? 10);

  for (const item of invoice.items) {
    const itemCalc = calculateLineItemTotal(item, {
      discountEnabled: isDiscountEnabled,
      taxEnabled: isTaxEnabled,
      taxType: taxType,
    });
    subtotal += itemCalc.baseAmount;
    totalDiscount += itemCalc.discountAmount;
    if (taxType === 'per_item') {
      totalTax += itemCalc.taxAmount;
    }
  }

  const taxableAmount = Math.max(0, subtotal - totalDiscount);

  // If tax is overall, calculate on the net taxable amount
  if (isTaxEnabled && taxType === 'overall') {
    totalTax = (taxableAmount * overallRate) / 100;
  }

  const grandTotal = taxableAmount + totalTax;

  return {
    subtotal,
    totalDiscount,
    taxableAmount,
    totalTax,
    grandTotal,
  };
}
