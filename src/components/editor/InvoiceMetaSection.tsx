import React from 'react';
import { RefreshCw } from 'lucide-react';
import { CURRENCY_LABELS, CurrencyType, Invoice, InvoiceStatus } from '../../types/invoice';
import { addDaysToJalali, getTodayGregorian, getTodayJalali } from '../../utils/jalaliDate';

interface Props {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
}

export const InvoiceMetaSection: React.FC<Props> = ({ invoice, onChange }) => {
  const handleGenerateInvoiceNumber = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    onChange({ invoiceNumber: `INV-${num}` });
  };

  const handleSetTodayIssueDate = () => {
    if (invoice.calendarType === 'jalali') {
      const today = getTodayJalali();
      onChange({ issueDate: today, dueDate: addDaysToJalali(today, 14) });
    } else {
      const today = getTodayGregorian();
      onChange({ issueDate: today });
    }
  };

  const handleAddDueDays = (days: number) => {
    if (invoice.calendarType === 'jalali') {
      const newDue = addDaysToJalali(invoice.issueDate || getTodayJalali(), days);
      onChange({ dueDate: newDue });
    }
  };

  const toggleCalendar = (type: 'jalali' | 'gregorian') => {
    if (type === invoice.calendarType) return;
    if (type === 'jalali') {
      onChange({
        calendarType: 'jalali',
        issueDate: getTodayJalali(),
        dueDate: addDaysToJalali(getTodayJalali(), 14),
      });
    } else {
      onChange({
        calendarType: 'gregorian',
        issueDate: getTodayGregorian(),
        dueDate: '',
      });
    }
  };

  return (
    <div className="form-section-body">
      {/* Title and Invoice Number */}
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">عنوان فاکتور / سند</label>
          <input
            type="text"
            className="form-input"
            value={invoice.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="مثال: صورتحساب فروش کالا و خدمات"
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">شماره فاکتور</label>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleGenerateInvoiceNumber}
              title="تولید شماره تصادفی"
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              <RefreshCw size={12} />
              <span>شماره جدید</span>
            </button>
          </div>
          <input
            type="text"
            className="form-input"
            value={invoice.invoiceNumber}
            onChange={(e) => onChange({ invoiceNumber: e.target.value })}
            placeholder="مثال: INV-1001"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>
      </div>

      {/* Calendar Switcher & Dates */}
      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">نوع تقویم</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn btn-sm ${invoice.calendarType === 'jalali' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => toggleCalendar('jalali')}
            >
              شمسی (جلالی)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${invoice.calendarType === 'gregorian' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => toggleCalendar('gregorian')}
            >
              میلادی
            </button>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">تاریخ صدور</label>
            <button
              type="button"
              onClick={handleSetTodayIssueDate}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-600)',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              امروز
            </button>
          </div>
          <input
            type="text"
            className="form-input"
            value={invoice.issueDate}
            onChange={(e) => onChange({ issueDate: e.target.value })}
            placeholder={invoice.calendarType === 'jalali' ? '1403/05/24' : '2024-08-14'}
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">تاریخ سررسید / مهلت</label>
            {invoice.calendarType === 'jalali' && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <span
                  onClick={() => handleAddDueDays(7)}
                  style={{ fontSize: '10px', color: 'var(--primary-600)', cursor: 'pointer', fontWeight: 600 }}
                >
                  +۷ روز
                </span>
                <span
                  onClick={() => handleAddDueDays(14)}
                  style={{ fontSize: '10px', color: 'var(--primary-600)', cursor: 'pointer', fontWeight: 600 }}
                >
                  +۱۴ روز
                </span>
              </div>
            )}
          </div>
          <input
            type="text"
            className="form-input"
            value={invoice.dueDate}
            onChange={(e) => onChange({ dueDate: e.target.value })}
            placeholder={invoice.calendarType === 'jalali' ? '1403/06/07' : '2024-08-28'}
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>
      </div>

      {/* Currency & Status & Toggles */}
      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">واحد پول</label>
          <select
            className="form-select"
            value={invoice.currency}
            onChange={(e) => onChange({ currency: e.target.value as CurrencyType })}
          >
            {Object.entries(CURRENCY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">وضعیت فاکتور</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={invoice.showStatusBadge}
                onChange={(e) => onChange({ showStatusBadge: e.target.checked })}
              />
              <span>نمایش در برگه فاکتور</span>
            </label>
          </div>
          <select
            className="form-select"
            value={invoice.status}
            onChange={(e) => onChange({ status: e.target.value as InvoiceStatus })}
          >
            <option value="draft">پیش‌نویس (Draft)</option>
            <option value="unpaid">پرداخت نشده (Unpaid)</option>
            <option value="paid">پرداخت شده (Paid)</option>
            <option value="overdue">سررسید گذشته (Overdue)</option>
          </select>
        </div>

        <div className="form-group" style={{ justifyContent: 'center' }}>
          <label className="form-label">تنظیمات مالیات و تخفیف</label>
          <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={invoice.taxEnabled}
                onChange={(e) => onChange({ taxEnabled: e.target.checked })}
              />
              <span>محاسبه مالیات ارزش افزوده</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={invoice.discountEnabled}
                onChange={(e) => onChange({ discountEnabled: e.target.checked })}
              />
              <span>ستون تخفیف</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
