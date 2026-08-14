import React from 'react';
import {
  FileText,
  PlusCircle,
  FolderOpen,
  Upload,
  Sun,
  Moon,
  Hash,
  RotateCcw,
} from 'lucide-react';
import { DigitType } from '../types/invoice';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  digitType: DigitType;
  onToggleDigitType: () => void;
  onNewInvoice: () => void;
  onOpenSavedModal: () => void;
  onOpenImportModal: () => void;
  savedCount: number;
  onResetToSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  digitType,
  onToggleDigitType,
  onNewInvoice,
  onOpenSavedModal,
  onOpenImportModal,
  savedCount,
  onResetToSample,
}) => {
  return (
    <header className="app-header no-print">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <FileText size={22} />
        </div>
        <div className="brand-title-group">
          <h1>فاکتور آنلاین</h1>
          <p>صدور، پیش‌نمایش و مدیریت فاکتور رسمی و اختصاصی</p>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNewInvoice}
          title="ایجاد فاکتور جدید"
        >
          <PlusCircle size={16} />
          <span>فاکتور جدید</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenSavedModal}
          title="مشاهده فاکتورهای ذخیره شده"
        >
          <FolderOpen size={16} />
          <span>فاکتورهای من</span>
          {savedCount > 0 && (
            <span className="badge" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
              {digitType === 'persian' ? savedCount.toLocaleString('fa-IR') : savedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenImportModal}
          title="بارگذاری و بازیابی از فایل JSON"
        >
          <Upload size={16} />
          <span>بارگذاری JSON</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={onResetToSample}
          title="بارگذاری نمونه آزمایشی"
        >
          <RotateCcw size={18} />
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={onToggleDigitType}
          title={digitType === 'persian' ? 'تغییر ارقام به انگلیسی (123)' : 'تغییر ارقام به فارسی (۱۲۳)'}
        >
          <Hash size={18} />
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
            {digitType === 'persian' ? '۱۲۳' : '123'}
          </span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'فعال‌سازی حالت تاریک' : 'فعال‌سازی حالت روشن'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};
