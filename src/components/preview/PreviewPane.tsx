import React, { useRef, useState } from 'react';
import {
  FileCode,
  FileDown,
  FileType,
  Image as ImageIcon,
  Loader2,
  Printer,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Invoice } from '../../types/invoice';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { exportToImage, exportToJSON, exportToPDF, exportToWord } from '../../utils/exporters';

interface Props {
  invoice: Invoice;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  className?: string;
}

export const PreviewPane: React.FC<Props> = ({ invoice, onShowToast, className = '' }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const getSafeFileName = () => {
    const num = invoice.invoiceNumber ? invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_') : 'invoice';
    const client = invoice.client.name ? `_${invoice.client.name.replace(/\s+/g, '_')}` : '';
    return `فاکتور_${num}${client}`;
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExportingPDF(true);
    try {
      await exportToPDF(previewRef.current, getSafeFileName());
      onShowToast('فایل PDF با موفقیت دانلود شد.', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('خطا در تولید فایل PDF. لطفاً مجدداً تلاش نمایید.', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      await exportToWord(invoice, getSafeFileName());
      onShowToast('فایل Word (.docx) با موفقیت دانلود شد.', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('خطا در تولید فایل Word.', 'error');
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleExportImage = async () => {
    if (!previewRef.current) return;
    setIsExportingImage(true);
    try {
      await exportToImage(previewRef.current, getSafeFileName());
      onShowToast('تصویر با کیفیت PNG با موفقیت ذخیره شد.', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('خطا در ذخیره تصویر.', 'error');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(invoice, getSafeFileName());
      onShowToast('اطلاعات فاکتور در قالب فایل JSON ذخیره گردید.', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('خطا در خروجی JSON.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={`invoice-preview-pane ${className}`}>
      {/* Top Action & Export Toolbar */}
      <div className="preview-toolbar no-print">
        <div className="preview-export-group">
          {/* PDF */}
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            title="دانلود فایل PDF آماده چاپ"
          >
            {isExportingPDF ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            <span>{isExportingPDF ? 'درحال ساخت PDF...' : 'خروجی PDF'}</span>
          </button>

          {/* Word */}
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleExportWord}
            disabled={isExportingWord}
            title="دانلود فایل Microsoft Word (.docx) با چیدمان راست‌به‌چپ"
          >
            {isExportingWord ? <Loader2 size={14} className="animate-spin" /> : <FileType size={14} />}
            <span>خروجی Word</span>
          </button>

          {/* Image */}
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleExportImage}
            disabled={isExportingImage}
            title="دانلود تصویر با کیفیت PNG"
          >
            {isExportingImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
            <span>خروجی تصویر</span>
          </button>

          {/* JSON */}
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleExportJSON}
            title="دانلود فایل داده JSON جهت پشتیبان‌گیری و استفاده مجدد"
          >
            <FileCode size={14} />
            <span>خروجی JSON</span>
          </button>

          {/* Print */}
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handlePrint}
            title="چاپ مستقیم فاکتور از طریق مرورگر"
          >
            <Printer size={14} />
            <span>چاپ (Print)</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            className="btn btn-icon btn-secondary btn-sm"
            onClick={handleZoomOut}
            title="کوچک‌نمایی"
          >
            <ZoomOut size={14} />
          </button>
          <span
            onClick={handleResetZoom}
            style={{ fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: '2px 6px', color: 'var(--text-secondary)' }}
            title="بازنشانی اندازه به ۱۰۰٪"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="btn btn-icon btn-secondary btn-sm"
            onClick={handleZoomIn}
            title="بزرگ‌نمایی"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Sheet Display Area */}
      <div className="preview-scroll-container">
        <div className="invoice-paper-wrapper" style={{ transform: `scale(${zoom})` }}>
          <div id="invoice-preview-sheet" ref={previewRef}>
            <TemplateRenderer invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  );
};
