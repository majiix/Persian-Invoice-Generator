import React from 'react';
import { ClientInfo } from '../../types/invoice';

interface Props {
  client: ClientInfo;
  onChange: (updates: Partial<ClientInfo>) => void;
}

export const ClientInfoSection: React.FC<Props> = ({ client, onChange }) => {
  return (
    <div className="form-section-body">
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        مشخصات خریدار کالا، کارفرما یا دریافت‌کننده خدمات
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">نام شرکت / شخص خریدار *</label>
          <input
            type="text"
            className="form-input"
            value={client.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="مثال: شرکت بازرگانی کاسپین / علی رضایی"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">نام نماینده / شخص رابط</label>
          <input
            type="text"
            className="form-input"
            value={client.contactPerson || ''}
            onChange={(e) => onChange({ contactPerson: e.target.value })}
            placeholder="مثال: مهندس حسینی"
          />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">شماره تماس / همراه *</label>
          <input
            type="text"
            className="form-input"
            value={client.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="09123456789 یا 021-33445566"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">پست الکترونیک (ایمیل)</label>
          <input
            type="email"
            className="form-input"
            value={client.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="client@example.com"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">شناسه ملی / کد ملی خریدار</label>
          <input
            type="text"
            className="form-input"
            value={client.nationalId || ''}
            onChange={(e) => onChange({ nationalId: e.target.value })}
            placeholder="14001234567"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">کد اقتصادی</label>
          <input
            type="text"
            className="form-input"
            value={client.economicCode || ''}
            onChange={(e) => onChange({ economicCode: e.target.value })}
            placeholder="422233445566"
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
            value={client.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="استان، شهر، خیابان، پلاک"
          />
        </div>

        <div className="form-group">
          <label className="form-label">کد پستی ۱۰ رقمی</label>
          <input
            type="text"
            className="form-input"
            value={client.postalCode || ''}
            onChange={(e) => onChange({ postalCode: e.target.value })}
            placeholder="1455667788"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
        </div>
      </div>
    </div>
  );
};
