import React, { useRef } from 'react';
import { CreditCard, FileSignature, Plus, Trash2, Upload } from 'lucide-react';
import { BankAccount, Invoice, PaymentInfo } from '../../types/invoice';

interface Props {
  invoice: Invoice;
  onChangePayment: (payment: Partial<PaymentInfo>) => void;
  onChangeSignature: (signatureImage?: string) => void;
  onChangeSignaturesVisibility: (updates: { showSellerSignature?: boolean; showBuyerSignature?: boolean }) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const PRESET_TERMS = [
  'مهلت پرداخت حداکثر ۱۴ روز پس از تاریخ صدور فاکتور می‌باشد.',
  'تسویه حساب به صورت نقدی در زمان تحویل کالا / ارائه خدمت.',
  'واریز ۵۰٪ مبلغ به عنوان پیش‌پرداخت و مابقی پس از تأیید نهایی.',
  'در صورت تأخیر در پرداخت، خسارت دیرکرد روزانه لحاظ خواهد شد.',
];

export const PaymentAndNotesSection: React.FC<Props> = ({
  invoice,
  onChangePayment,
  onChangeSignature,
  onChangeSignaturesVisibility,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bankAccounts = invoice.payment.bankAccounts || [];

  const handleAddBankAccount = () => {
    const newAccount: BankAccount = {
      id: 'acc-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      bankName: '',
      accountHolder: invoice.business.name || '',
      accountNumber: '',
      cardNumber: '',
      iban: '',
    };
    onChangePayment({ bankAccounts: [...bankAccounts, newAccount] });
    onShowToast('حساب بانکی جدید افزوده شد.', 'info');
  };

  const handleUpdateAccount = (id: string, updates: Partial<BankAccount>) => {
    const updated = bankAccounts.map((acc) => {
      if (acc.id === id) {
        return { ...acc, ...updates };
      }
      return acc;
    });
    onChangePayment({ bankAccounts: updated });
  };

  const handleDeleteAccount = (id: string) => {
    const updated = bankAccounts.filter((acc) => acc.id !== id);
    onChangePayment({ bankAccounts: updated });
    onShowToast('حساب بانکی حذف گردید.', 'info');
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onShowToast('حجم تصویر امضا نباید بیشتر از ۲ مگابایت باشد.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChangeSignature(reader.result as string);
      onShowToast('تصویر مهر و امضا با موفقیت بارگذاری شد.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    onChangeSignature(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="form-section-body">
      {/* Bank Account Info Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CreditCard size={16} />
          <span>اطلاعات حساب‌های بانکی و واریز وجه ({bankAccounts.length})</span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={handleAddBankAccount}
        >
          <Plus size={14} />
          <span>افزودن حساب جدید</span>
        </button>
      </div>

      {/* Bank Accounts List */}
      {bankAccounts.length === 0 ? (
        <div style={{ padding: '16px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          هیچ حساب بانکی ثبت نشده است. با کلیک بر روی «افزودن حساب جدید» می‌توانید شماره کارت و شبای خود را اضافه کنید.
        </div>
      ) : (
        bankAccounts.map((account, index) => (
          <div
            key={account.id}
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-600)' }}>
                حساب بانکی #{index + 1} {account.bankName ? `(${account.bankName})` : ''}
              </span>
              <button
                type="button"
                className="btn btn-icon btn-danger btn-sm"
                onClick={() => handleDeleteAccount(account.id)}
                title="حذف این حساب"
                style={{ padding: '3px 6px' }}
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">نام بانک</label>
                <input
                  type="text"
                  className="form-input"
                  value={account.bankName}
                  onChange={(e) => handleUpdateAccount(account.id, { bankName: e.target.value })}
                  placeholder="مثال: بانک ملت / پاسارگاد / سامان"
                />
              </div>

              <div className="form-group">
                <label className="form-label">نام صاحب حساب</label>
                <input
                  type="text"
                  className="form-input"
                  value={account.accountHolder || ''}
                  onChange={(e) => handleUpdateAccount(account.id, { accountHolder: e.target.value })}
                  placeholder="مثال: شرکت داده‌ورزان پیشرو"
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">شماره حساب</label>
                <input
                  type="text"
                  className="form-input"
                  value={account.accountNumber || ''}
                  onChange={(e) => handleUpdateAccount(account.id, { accountNumber: e.target.value })}
                  placeholder="290-8000-1234567-1"
                  style={{ direction: 'ltr', textAlign: 'right' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">شماره کارت (۱۶ رقمی)</label>
                <input
                  type="text"
                  className="form-input"
                  value={account.cardNumber || ''}
                  onChange={(e) => handleUpdateAccount(account.id, { cardNumber: e.target.value })}
                  placeholder="6037-9918-1234-5678"
                  style={{ direction: 'ltr', textAlign: 'right' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">شماره شبا (IBAN)</label>
                <input
                  type="text"
                  className="form-input"
                  value={account.iban || ''}
                  onChange={(e) => handleUpdateAccount(account.id, { iban: e.target.value })}
                  placeholder="IR000000000000000000000000"
                  style={{ direction: 'ltr', textAlign: 'right' }}
                />
              </div>
            </div>
          </div>
        ))
      )}

      {/* Terms & Notes */}
      <div className="form-group" style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label">شرایط و قوانین پرداخت (توضیحات فاکتور)</label>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>انتخاب متن آماده:</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
          {PRESET_TERMS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                const current = invoice.payment.terms || '';
                onChangePayment({ terms: current ? `${current}\n${preset}` : preset });
              }}
              style={{ fontSize: '11px', padding: '2px 6px' }}
            >
              + {preset.substring(0, 30)}...
            </button>
          ))}
        </div>
        <textarea
          className="form-textarea"
          value={invoice.payment.terms || ''}
          onChange={(e) => onChangePayment({ terms: e.target.value })}
          placeholder="شرایط ضمانت، مهلت پرداخت، نحوه ارسال و..."
          rows={3}
        />
      </div>

      {/* Signature Visibility Toggles */}
      <div style={{ marginTop: '12px', padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileSignature size={16} />
          <span>تنظیمات بخش امضا و مهر فاکتور</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={invoice.showSellerSignature}
              onChange={(e) => onChangeSignaturesVisibility({ showSellerSignature: e.target.checked })}
            />
            <span>نمایش کادر مهر و امضای فروشنده (صادرکننده)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={invoice.showBuyerSignature}
              onChange={(e) => onChangeSignaturesVisibility({ showBuyerSignature: e.target.checked })}
            />
            <span>نمایش کادر امضا و تأیید خریدار</span>
          </label>
        </div>

        {/* Signature & Stamp Upload (Shown if seller signature is enabled) */}
        {invoice.showSellerSignature && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
            {invoice.signatureImage ? (
              <img
                src={invoice.signatureImage}
                alt="امضا"
                style={{ width: '80px', height: '50px', objectFit: 'contain', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              />
            ) : (
              <div style={{ width: '80px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                <FileSignature size={20} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                تصویر مهر یا امضای مجاز فروشنده (اختیاری)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                تصویر با پس‌زمینه شفاف در پایین برگه فاکتور نمایش داده خواهد شد.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleSignatureUpload}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} />
                  <span>{invoice.signatureImage ? 'تغییر تصویر امضا' : 'انتخاب تصویر امضا'}</span>
                </button>
                {invoice.signatureImage && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={handleRemoveSignature}
                  >
                    <Trash2 size={14} />
                    <span>حذف تصویر امضا</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
