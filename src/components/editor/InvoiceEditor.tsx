import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ChevronsDownUp,
  ChevronsUpDown,
  FilePlus,
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
import { SecondPageSection } from './SecondPageSection';
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
  // All sections collapsed on initial page load
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    meta: false,
    business: false,
    client: false,
    items: false,
    payment: false,
    secondPage: false,
    templates: false,
  });

  const allCollapsed = Object.values(openSections).every((v) => !v);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleAll = () => {
    const nextState = allCollapsed;
    setOpenSections({
      meta: nextState,
      business: nextState,
      client: nextState,
      items: nextState,
      payment: nextState,
      secondPage: nextState,
      templates: nextState,
    });
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
      {/* Top Editor Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-4px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          بخش‌های فرم صدور فاکتور
        </div>
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={handleToggleAll}
          style={{ fontSize: '11px', padding: '3px 8px' }}
        >
          {allCollapsed ? (
            <>
              <ChevronsUpDown size={14} />
              <span>باز کردن همه بخش‌ها</span>
            </>
          ) : (
            <>
              <ChevronsDownUp size={14} />
              <span>بستن همه بخش‌ها</span>
            </>
          )}
        </button>
      </div>

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
                شماره: {invoice.invoiceNumber} | تاریخ: {invoice.issueDate}
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
                {invoice.payment.bankAccounts?.length || 0} حساب بانکی ثبت شده | شرایط تسویه و امضا
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
            onChangeSignaturesVisibility={(updates) => onChange(updates)}
            onShowToast={onShowToast}
          />
        )}
      </div>

      {/* Section 6: Second Page (پیوست و توضیحات تکمیلی) */}
      <div className={`form-section ${openSections.secondPage ? 'open' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('secondPage')}>
          <div className="section-title-group">
            <div className="section-icon">
              <FilePlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>برگه دوم (صفحه توضیحات و پیوست)</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {invoice.enableSecondPage ? 'فعال - برگه دوم در پیش‌نمایش و خروجی‌ها ایجاد می‌شود' : 'غیرفعال'}
              </p>
            </div>
          </div>
          {openSections.secondPage ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {openSections.secondPage && (
          <SecondPageSection invoice={invoice} onChange={onChange} />
        )}
      </div>

      {/* Section 7: Template Choice */}
      <div className={`form-section ${openSections.templates ? 'open' : ''}`}>
        <div className="form-section-header" onClick={() => toggleSection('templates')}>
          <div className="section-title-group">
            <div className="section-icon">
              <LayoutTemplate size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>قالب ظاهری فاکتور</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                قالب فعلی: {invoice.templateId === 'classic' ? 'رسمی و مالیاتی' : invoice.templateId === 'minimal' ? 'مینیمال' : 'مدرن و سازمانی'}
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
