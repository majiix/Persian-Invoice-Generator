import React, { useState } from 'react';
import {
  Copy,
  FileText,
  FolderOpen,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { CURRENCY_LABELS, Invoice, STATUS_LABELS } from '../../types/invoice';
import { calculateInvoiceTotals } from '../../utils/calculations';
import { formatAmount } from '../../utils/persianDigits';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onNewInvoice: () => void;
  digitType: 'persian' | 'english';
}

export const SavedInvoicesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  invoices,
  onSelectInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onNewInvoice,
  digitType,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPersianDigits = digitType === 'persian';

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.business.name && inv.business.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    onDeleteInvoice(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>فاکتورهای ذخیره شده من</h3>
            <span className="badge" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}>
              {isPersianDigits ? invoices.length.toLocaleString('fa-IR') : invoices.length} فاکتور
            </span>
          </div>
          <button
            type="button"
            className="btn btn-icon btn-secondary"
            onClick={onClose}
            title="بستن پنجره"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو بر اساس شماره، نام مشتری یا عنوان..."
                style={{ paddingRight: '32px' }}
              />
            </div>

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="draft">پیش‌نویس‌ها</option>
              <option value="unpaid">پرداخت نشده</option>
              <option value="paid">پرداخت شده</option>
              <option value="overdue">سررسید گذشته</option>
            </select>
          </div>

          {/* Invoices List */}
          {filteredInvoices.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <FileText size={40} style={{ opacity: 0.4 }} />
              <div>هیچ فاکتوری با این مشخصات یافت نشد.</div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onNewInvoice();
                  onClose();
                }}
              >
                <Plus size={14} />
                <span>ایجاد اولین فاکتور</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '50vh', overflowY: 'auto' }}>
              {filteredInvoices.map((inv) => {
                const totals = calculateInvoiceTotals(inv);
                const statusMeta = STATUS_LABELS[inv.status] || STATUS_LABELS.unpaid;
                const currency = CURRENCY_LABELS[inv.currency] || inv.currency;

                return (
                  <div
                    key={inv.id}
                    className="card"
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => {
                      onSelectInvoice(inv);
                      onClose();
                    }}
                  >
                    {/* Left details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className="badge"
                          style={{ backgroundColor: statusMeta.bg, color: statusMeta.color, fontSize: '11px' }}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        مشتری: <strong>{inv.client.name || 'بدون نام'}</strong> | تاریخ: {inv.issueDate}
                      </div>
                    </div>

                    {/* Right details & action buttons */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary-600)', fontSize: '14px' }}>
                          {formatAmount(totals.grandTotal, isPersianDigits)} {currency}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {inv.items.length} قلم کالا
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary btn-icon"
                          onClick={() => onDuplicateInvoice(inv)}
                          title="ایجاد کپی از این فاکتور"
                        >
                          <Copy size={15} />
                        </button>

                        {confirmDeleteId === inv.id ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(inv.id)}
                              style={{ padding: '2px 6px', fontSize: '11px' }}
                            >
                              تأیید حذف
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => setConfirmDeleteId(null)}
                              style={{ padding: '2px 6px', fontSize: '11px' }}
                            >
                              انصراف
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger btn-icon"
                            onClick={() => setConfirmDeleteId(inv.id)}
                            title="حذف فاکتور"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            بستن
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onNewInvoice();
              onClose();
            }}
          >
            <Plus size={16} />
            <span>ایجاد فاکتور جدید</span>
          </button>
        </div>
      </div>
    </div>
  );
};
