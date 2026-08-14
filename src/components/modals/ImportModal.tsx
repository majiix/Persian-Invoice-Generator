import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileCode, Upload, X } from 'lucide-react';
import { Invoice } from '../../types/invoice';
import { validateAndParseInvoiceJSON } from '../../utils/exporters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedInvoice: Invoice) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsedData, setParsedData] = useState<Invoice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    setParsedData(null);

    if (!file.name.endsWith('.json')) {
      setErrorMessage('لطفاً یک فایل با پسوند .json انتخاب نمایید.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = validateAndParseInvoiceJSON(text);

      if (result.success && result.data) {
        setParsedData(result.data);
      } else {
        setErrorMessage(result.error || 'ساختار فایل JSON معتبر نیست.');
      }
    };
    reader.onerror = () => {
      setErrorMessage('خطا در خواندن فایل از روی حافظه دستگاه.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData) {
      onImportSuccess(parsedData);
      onShowToast('اطلاعات فاکتور از فایل JSON با موفقیت بارگذاری گردید.', 'success');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>بارگذاری و بازیابی از فایل JSON</h3>
          </div>
          <button
            type="button"
            className="btn btn-icon btn-secondary"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            شما می‌توانید فایلی که قبلاً از طریق دکمه «خروجی JSON» دانلود کرده‌اید را در اینجا بارگذاری نمایید تا تمام فیلدها و اقلام فاکتور مجدداً بازنشانی شوند.
          </p>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--primary-500)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: dragOver ? 'var(--primary-50)' : 'var(--bg-surface-subtle)',
              padding: '30px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />
            <FileCode size={40} color="var(--primary-600)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              کلیک کنید یا فایل JSON را اینجا رها کنید
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              فقط فایل‌های دارای ساختار استاندارد فاکتور آنلاین
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--danger-50)',
                color: 'var(--danger-600)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedData && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: 'var(--success-50)',
                border: '1px solid rgba(22, 163, 74, 0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-600)', fontWeight: 700, fontSize: '13px' }}>
                <CheckCircle2 size={18} />
                <span>فایل فاکتور با موفقیت اعتبارسنجی شد</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                شماره فاکتور: <strong>{parsedData.invoiceNumber}</strong> | مشتری: <strong>{parsedData.client?.name || '-'}</strong> | تعداد اقلام: {parsedData.items?.length || 0}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            انصراف
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirmImport}
            disabled={!parsedData}
          >
            <span>اعمال و بازنشانی فاکتور</span>
          </button>
        </div>
      </div>
    </div>
  );
};
