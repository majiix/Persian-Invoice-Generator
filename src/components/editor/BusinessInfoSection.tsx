import React, { useRef } from 'react';
import { BookmarkCheck, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { BusinessInfo } from '../../types/invoice';
import { getSavedBusinessProfile, saveBusinessProfile } from '../../utils/storage';

interface Props {
  business: BusinessInfo;
  onChange: (updates: Partial<BusinessInfo>) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BusinessInfoSection: React.FC<Props> = ({ business, onChange, onShowToast }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onShowToast('حجم لوگو نباید بیشتر از ۲ مگابایت باشد.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({ logo: reader.result as string });
      onShowToast('لوگوی کسب‌وکار با موفقیت بارگذاری شد.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onChange({ logo: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveAsDefault = () => {
    saveBusinessProfile(business);
    onShowToast('اطلاعات فروشنده به عنوان پیش‌فرض ذخیره گردید.', 'success');
  };

  const handleLoadDefault = () => {
    const saved = getSavedBusinessProfile();
    if (saved) {
      onChange(saved);
      onShowToast('اطلاعات پیش‌فرض بارگذاری شد.', 'info');
    } else {
      onShowToast('هنوز اطلاعات پیش‌فرضی ذخیره نشده است.', 'error');
    }
  };

  return (
    <div className="form-section-body">
      {/* Quick Preset Actions & Logo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          مشخصات شخص یا شرکت ارائه‌دهنده کالا و خدمات
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleLoadDefault}
            title="بارگذاری مشخصات پیش‌فرض ذخیره شده"
          >
            بازیابی پیش‌فرض
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={handleSaveAsDefault}
            title="ذخیره این مشخصات به عنوان الگوی همیشگی"
          >
            <BookmarkCheck size={14} />
            <span>ذخیره به عنوان پیش‌فرض من</span>
          </button>
        </div>
      </div>

      {/* Logo Upload Box */}
      <div className="logo-upload-box">
        {business.logo ? (
          <img src={business.logo} alt="لوگوی شرکت" className="logo-preview-img" />
        ) : (
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px dashed var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <ImageIcon size={24} />
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            لوگوی شرکت / کسب‌وکار
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            فرمت‌های PNG، JPG، SVG (حداکثر ۲ مگابایت)
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} />
              <span>{business.logo ? 'تغییر لوگو' : 'انتخاب لوگو'}</span>
            </button>
            {business.logo && (
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleRemoveLogo}
                title="حذف لوگو"
              >
                <Trash2 size={14} />
                <span>حذف</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Business Details Fields */}
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">نام شرکت / فروشنده *</label>
          <input
            type="text"
            className="form-input"
            value={business.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="مثال: شرکت داده‌ورزان پیشرو"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">شعار / زمینه فعالیت</label>
          <input
            type="text"
            className="form-input"
            value={business.subtitle || ''}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="مثال: خدمات مهندسی و توسعه نرم‌افزار"
          />
        </div>
      </div>

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">شماره تماس / تلفن *</label>
          <input
            type="text"
            className="form-input"
            value={business.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="مثال: 021-88997766"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">پست الکترونیک (ایمیل)</label>
          <input
            type="email"
            className="form-input"
            value={business.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="info@company.com"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">وب‌سایت</label>
          <input
            type="text"
            className="form-input"
            value={business.website || ''}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="www.company.com"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>
      </div>

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">شناسه ملی / کد ملی</label>
          <input
            type="text"
            className="form-input"
            value={business.nationalId || ''}
            onChange={(e) => onChange({ nationalId: e.target.value })}
            placeholder="10101234567"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">کد اقتصادی</label>
          <input
            type="text"
            className="form-input"
            value={business.economicCode || ''}
            onChange={(e) => onChange({ economicCode: e.target.value })}
            placeholder="411122334455"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">شماره ثبت</label>
          <input
            type="text"
            className="form-input"
            value={business.registrationNumber || ''}
            onChange={(e) => onChange({ registrationNumber: e.target.value })}
            placeholder="54321"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">نشانی کامل پستی</label>
          <input
            type="text"
            className="form-input"
            value={business.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="استان، شهر، خیابان، پلاک، واحد"
          />
        </div>

        <div className="form-group">
          <label className="form-label">کد پستی ۱۰ رقمی</label>
          <input
            type="text"
            className="form-input"
            value={business.postalCode || ''}
            onChange={(e) => onChange({ postalCode: e.target.value })}
            placeholder="1987654321"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>
      </div>
    </div>
  );
};
