import React from 'react';
import { Copy, Minus, Plus, Trash2 } from 'lucide-react';
import { CURRENCY_LABELS, Invoice, LineItem } from '../../types/invoice';
import { calculateLineItemTotal } from '../../utils/calculations';
import { formatAmount, parseNumberInput } from '../../utils/persianDigits';

interface Props {
  invoice: Invoice;
  onChangeItems: (items: LineItem[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const UNIT_OPTIONS = ['عدد', 'ساعت', 'روز', 'ماه', 'پروژه', 'کیلوگرم', 'متر', 'بسته', 'جلسه', 'دوره', 'دستگاه', 'مورد'];

export const LineItemsSection: React.FC<Props> = ({ invoice, onChangeItems, onShowToast }) => {
  const isPersianDigits = invoice.digitType === 'persian';
  const currencyLabel = CURRENCY_LABELS[invoice.currency] || invoice.currency;

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: 'item-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      description: '',
      itemCode: '',
      quantity: 1,
      unit: 'عدد',
      unitPrice: 0,
      discount: 0,
      discountType: 'percentage',
      taxRate: invoice.taxEnabled ? invoice.defaultTaxRate : 0,
    };
    onChangeItems([...invoice.items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<LineItem>) => {
    const updated = invoice.items.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    onChangeItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (invoice.items.length <= 1) {
      onShowToast('حداقل یک ردیف کالا یا خدمات باید در فاکتور وجود داشته باشد.', 'info');
      return;
    }
    const updated = invoice.items.filter((item) => item.id !== id);
    onChangeItems(updated);
  };

  const handleDuplicateItem = (item: LineItem) => {
    const duplicated: LineItem = {
      ...item,
      id: 'item-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      description: item.description ? `${item.description} (کپی)` : '',
    };
    onChangeItems([...invoice.items, duplicated]);
    onShowToast('ردیف با موفقیت تکثیر شد.', 'success');
  };

  const handleClearAllItems = () => {
    if (window.confirm('آیا از پاک کردن تمام اقلام فاکتور مطمئن هستید؟')) {
      const singleEmpty: LineItem = {
        id: 'item-' + Date.now().toString(36),
        description: '',
        quantity: 1,
        unit: 'عدد',
        unitPrice: 0,
        discount: 0,
        discountType: 'percentage',
        taxRate: invoice.taxEnabled ? invoice.defaultTaxRate : 0,
      };
      onChangeItems([singleEmpty]);
      onShowToast('تمام اقلام پاک‌سازی شدند.', 'info');
    }
  };

  const adjustQuantity = (id: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0.01, +(currentQty + delta).toFixed(2));
    handleUpdateItem(id, { quantity: newQty });
  };

  return (
    <div className="form-section-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          جدول کالاها، خدمات و محاسبات ردیف‌ها
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleClearAllItems}
            title="حذف همه اقلام"
          >
            پاک‌سازی جدول
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleAddItem}
          >
            <Plus size={14} />
            <span>افزودن ردیف جدید</span>
          </button>
        </div>
      </div>

      <div className="line-items-wrapper">
        <table className="line-items-table">
          <thead>
            <tr>
              <th style={{ width: '35px', textAlign: 'center' }}>#</th>
              <th style={{ minWidth: '200px' }}>شرح کالا یا خدمات *</th>
              <th style={{ width: '120px', minWidth: '120px', textAlign: 'center' }}>تعداد</th>
              <th style={{ width: '110px', minWidth: '110px' }}>واحد</th>
              <th style={{ width: '140px', minWidth: '130px' }}>قیمت واحد ({currencyLabel})</th>
              {invoice.discountEnabled && <th style={{ width: '110px', minWidth: '105px' }}>تخفیف</th>}
              {invoice.taxEnabled && <th style={{ width: '85px', minWidth: '80px', textAlign: 'center' }}>مالیات (%)</th>}
              <th style={{ width: '130px', minWidth: '120px', textAlign: 'center' }}>مبلغ کل</th>
              <th style={{ width: '75px', textAlign: 'center' }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const itemCalc = calculateLineItemTotal(item);
              return (
                <tr key={item.id}>
                  {/* Row Number */}
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {formatAmount(index + 1, isPersianDigits)}
                  </td>

                  {/* Description & Item Code */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                        placeholder="نام کالا یا شرح خدمات..."
                        style={{ fontSize: '13px' }}
                        required
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={item.itemCode || ''}
                        onChange={(e) => handleUpdateItem(item.id, { itemCode: e.target.value })}
                        placeholder="کد کالا (اختیاری)"
                        style={{ fontSize: '11px', color: 'var(--text-muted)', minHeight: '30px', padding: '4px 8px' }}
                      />
                    </div>
                  </td>

                  {/* Quantity with Stepper */}
                  <td>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="qty-stepper-btn"
                        onClick={() => adjustQuantity(item.id, item.quantity || 0, -1)}
                        title="کاهش تعداد"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        className="qty-stepper-input"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                        }
                      />
                      <button
                        type="button"
                        className="qty-stepper-btn"
                        onClick={() => adjustQuantity(item.id, item.quantity || 0, 1)}
                        title="افزایش تعداد"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Unit */}
                  <td>
                    <select
                      className="form-select"
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                      style={{ fontSize: '13px' }}
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Unit Price */}
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      value={formatAmount(item.unitPrice, false)}
                      onChange={(e) =>
                        handleUpdateItem(item.id, { unitPrice: parseNumberInput(e.target.value) })
                      }
                      placeholder="0"
                      style={{ textAlign: 'left', direction: 'ltr', fontWeight: 600 }}
                    />
                  </td>

                  {/* Discount */}
                  {invoice.discountEnabled && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={item.discount === 0 ? '' : formatAmount(item.discount, false)}
                          onChange={(e) =>
                            handleUpdateItem(item.id, { discount: parseNumberInput(e.target.value) })
                          }
                          placeholder="0"
                          style={{ textAlign: 'left', direction: 'ltr', flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateItem(item.id, {
                              discountType: item.discountType === 'percentage' ? 'fixed' : 'percentage',
                            })
                          }
                          style={{
                            border: '1px solid var(--border-color)',
                            background: item.discountType === 'percentage' ? 'var(--primary-50)' : 'var(--bg-surface-subtle)',
                            color: item.discountType === 'percentage' ? 'var(--primary-600)' : 'var(--text-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            height: '38px',
                            minWidth: '32px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={item.discountType === 'percentage' ? 'درصدی (%)' : 'مبلغ ثابت'}
                        >
                          {item.discountType === 'percentage' ? '%' : currencyLabel.substring(0, 1)}
                        </button>
                      </div>
                    </td>
                  )}

                  {/* Tax */}
                  {invoice.taxEnabled && (
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-input"
                        value={item.taxRate}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { taxRate: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="10"
                        style={{ textAlign: 'center', direction: 'ltr' }}
                      />
                    </td>
                  )}

                  {/* Row Total */}
                  <td className="line-item-row-total" style={{ textAlign: 'center' }}>
                    {formatAmount(itemCalc.rowTotal, isPersianDigits)}
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn btn-icon btn-secondary"
                        onClick={() => handleDuplicateItem(item)}
                        title="تکثیر این ردیف"
                        style={{ padding: '6px' }}
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-danger"
                        onClick={() => handleDeleteItem(item.id)}
                        title="حذف این ردیف"
                        style={{ padding: '6px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
