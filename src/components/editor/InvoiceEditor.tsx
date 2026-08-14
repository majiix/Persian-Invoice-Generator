import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileSpreadsheet,
  FileText,
  LayoutTemplate,
  User,
} from 'lucide-react';
import { BusinessInfo, ClientInfo, Invoice, LineItem, PaymentInfo, TemplateId } from '../../types/invoice';
import { InvoiceMetaSection } from './InvoiceMetaSection';
import { BusinessInfoSection } from './BusinessInfoSection';
import { ClientInfoSection } from './ClientInfoSection';
import { LineItemsSection } from './LineItemsSection';
import { PaymentAndNotesSection } from './PaymentAndNotesSection';
import { TemplateSelector } from './TemplateSelector';
import { InvoiceSummaryCard } from './InvoiceSummaryCard';

interface Props {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
  onSave: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  className?: string;
}

export const InvoiceEditor: React.FC<Props> = ({
  invoice,
  onChange,
  onSave,
  onShowToast,
  className = '',
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    meta: true,
    business: true,
    client: true,
    items: true,
    payment: false,
    templates: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateBusiness = (updates: Partial<BusinessInfo>) => {
    onChange({ business: { ...invoice.business, ...updates } });
  };

  const handleUpdateClient = (updates: Partial<ClientInfo>) => {
    onChange({ client: { ...invoice.client, ...updates } });
  };

  const handleUpdateItems = (items: LineItem[]) => {
    onChange({ items });
  };

  const handleUpdatePayment = (payment: Partial<PaymentInfo>) => {
    onChange({ payment: { ...invoice.payment, ...payment } });
  };

  const handleUpdateSignature = (signatureImage?: string) => {
    onChange({ signatureImage });
  };

  const handleSelectTemplate = (templateId: TemplateId) => {
    onChange({ templateId });
  };

  return (
    <div className={`invoice-editor-pane ${className}`}>
      {/* Section 1: Meta & Dates */}
      <div className={`form-section ${openSections.meta ? 'open' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('meta')}>
          <div className="section-title-group">
            <div className="section-icon">
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>اطلاعات و تنظیمات کلی فاکتور</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                شماره، تاریخ‌ها، واحد پول و نوع تقویم
              </p>
            </div>
          </div>
          {openSections.meta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {openSections.meta && <InvoiceMetaSection invoice={invoice} onChange={onChange} />}
      </div>

      {/* Section 2: Business Info */}
      <div className={`form-section ${openSections.business ? 'open' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('business')}>
          <div className="section-title-group">
            <div className="section-icon">
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>مشخصات فروشنده / صادرکننده</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {invoice.business.name || 'نام و لوگوی کسب‌وکار شما'}
              </p>
            </div>
          </div>
          {openSections.business ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {openSections.business && (
          <BusinessInfoSection
            business={invoice.business}
            onChange={handleUpdateBusiness}
            onShowToast={onShowToast}
          />
        )}
      </div>

      {/* Section 3: Client Info */}
      <div className={`form-section ${openSections.client ? 'open' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('client')}>
          <div className="section-title-group">
            <div className="section-icon">
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>مشخصات خریدار / مشتری</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {invoice.client.name || 'نام شرکت یا شخص خریدار'}
              </p>
            </div>
          </div>
          {openSections.client ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {openSections.client && (
          <ClientInfoSection client={invoice.client} onChange={handleUpdateClient} />
        )}
      </div>

      {/* Section 4: Line Items */}
      <div className={`form-section ${openSections.items ? 'open' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('items')}>
          <div className="section-title-group">
            <div className="section-icon">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>اقلام، خدمات و ردیف‌ها</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {invoice.items.length} ردیف کالا / خدمات ثبت شده
              </p>
            </div>
          </div>
          {openSections.items ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {openSections.items && (
          <LineItemsSection
            invoice={invoice}
            onChangeItems={handleUpdateItems}
            onShowToast={onShowToast}
          />
        )}
      </div>

      {/* Section 5: Payment & Terms */}
      <div className={`form-section ${openSections.payment ? 'open' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('payment')}>
          <div className="section-title-group">
            <div className="section-icon">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>اطلاعات حساب و شرایط پرداخت</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                شماره شبا، کارت بانکی، شرایط تسویه و امضا
              </p>
            </div>
          </div>
          {openSections.payment ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {openSections.payment && (
          <PaymentAndNotesSection
            invoice={invoice}
            onChangePayment={handleUpdatePayment}
            onChangeSignature={handleUpdateSignature}
            onShowToast={onShowToast}
          />
        )}
      </div>

      {/* Section 6: Template Choice */}
      <div className={`form-section ${openSections.templates ? 'open' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('templates')}>
          <div className="section-title-group">
            <div className="section-icon">
              <LayoutTemplate size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>قالب ظاهری فاکتور</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                انتخاب استایل و طراحی برگه
              </p>
            </div>
          </div>
          {openSections.templates ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {openSections.templates && (
          <TemplateSelector
            selectedTemplate={invoice.templateId}
            onSelectTemplate={handleSelectTemplate}
          />
        )}
      </div>

      {/* Summary & Save */}
      <InvoiceSummaryCard invoice={invoice} onSave={onSave} />
    </div>
  );
};
