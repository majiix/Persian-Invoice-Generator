import React, { useEffect, useState } from 'react';
import { Edit3, Eye } from 'lucide-react';
import { DigitType, Invoice } from './types/invoice';
import {
  createNewInvoice,
  deleteInvoiceFromStorage,
  duplicateInvoiceInStorage,
  getSavedInvoices,
  getSavedTheme,
  saveInvoiceToStorage,
  saveTheme,
} from './utils/storage';
import { Header } from './components/Header';
import { InvoiceEditor } from './components/editor/InvoiceEditor';
import { PreviewPane } from './components/preview/PreviewPane';
import { SavedInvoicesModal } from './components/modals/SavedInvoicesModal';
import { ImportModal } from './components/modals/ImportModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getSavedTheme());

  // Saved Invoices list
  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>(() => getSavedInvoices());

  // Current active invoice
  const [invoice, setInvoice] = useState<Invoice>(() => {
    const list = getSavedInvoices();
    return list.length > 0 ? list[0] : createNewInvoice();
  });

  // Mobile navigation tab ('editor' | 'preview')
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Modals state
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark/light theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleDigitType = () => {
    const nextType: DigitType = invoice.digitType === 'persian' ? 'english' : 'persian';
    setInvoice((prev) => ({ ...prev, digitType: nextType }));
    showToast(
      nextType === 'persian' ? 'ارقام به حالت فارسی (۱۲۳) تغییر یافت.' : 'ارقام به حالت انگلیسی (123) تغییر یافت.',
      'info'
    );
  };

  const handleNewInvoice = () => {
    const fresh = createNewInvoice();
    setInvoice(fresh);
    showToast('فاکتور جدید ایجاد گردید.', 'success');
  };

  const handleResetToSample = () => {
    const fresh = createNewInvoice();
    setInvoice(fresh);
    showToast('نمونه آزمایشی فاکتور بارگذاری شد.', 'info');
  };

  const handleSaveInvoice = () => {
    const updatedList = saveInvoiceToStorage(invoice);
    setSavedInvoices(updatedList);
    showToast(`فاکتور ${invoice.invoiceNumber} با موفقیت در سیستم ذخیره گردید.`, 'success');
  };

  const handleSelectInvoice = (selected: Invoice) => {
    setInvoice(selected);
    showToast(`فاکتور ${selected.invoiceNumber} بارگذاری شد.`, 'info');
  };

  const handleDuplicateInvoice = (source: Invoice) => {
    const duplicated = duplicateInvoiceInStorage(source);
    setSavedInvoices(getSavedInvoices());
    setInvoice(duplicated);
    showToast(`کپی جدید از فاکتور (${duplicated.invoiceNumber}) ایجاد شد.`, 'success');
  };

  const handleDeleteInvoice = (id: string) => {
    const updatedList = deleteInvoiceFromStorage(id);
    setSavedInvoices(updatedList);
    if (invoice.id === id) {
      if (updatedList.length > 0) {
        setInvoice(updatedList[0]);
      } else {
        setInvoice(createNewInvoice());
      }
    }
    showToast('فاکتور با موفقیت حذف گردید.', 'info');
  };

  const handleImportSuccess = (imported: Invoice) => {
    setInvoice(imported);
    saveInvoiceToStorage(imported);
    setSavedInvoices(getSavedInvoices());
  };

  const handleUpdateInvoice = (updates: Partial<Invoice>) => {
    setInvoice((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        digitType={invoice.digitType}
        onToggleDigitType={handleToggleDigitType}
        onNewInvoice={handleNewInvoice}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        savedCount={savedInvoices.length}
        onResetToSample={handleResetToSample}
      />

      {/* Mobile Tab Switcher */}
      <div className="mobile-view-tabs no-print">
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileTab('editor')}
        >
          <Edit3 size={16} />
          <span>ویرایشگر فرم</span>
        </button>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileTab('preview')}
        >
          <Eye size={16} />
          <span>پیش‌نمایش زنده و خروجی</span>
        </button>
      </div>

      {/* Main Dual-Pane Content */}
      <main className="main-content">
        <InvoiceEditor
          invoice={invoice}
          onChange={handleUpdateInvoice}
          onSave={handleSaveInvoice}
          onShowToast={showToast}
          className={mobileTab !== 'editor' ? 'hidden-on-mobile' : ''}
        />

        <PreviewPane
          invoice={invoice}
          onShowToast={showToast}
          className={mobileTab !== 'preview' ? 'hidden-on-mobile' : ''}
        />
      </main>

      {/* Modals */}
      <SavedInvoicesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        invoices={savedInvoices}
        onSelectInvoice={handleSelectInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onNewInvoice={handleNewInvoice}
        digitType={invoice.digitType}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        onShowToast={showToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
};
