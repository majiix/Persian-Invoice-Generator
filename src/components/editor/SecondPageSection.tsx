import React from 'react';
import { FilePlus, Sparkles } from 'lucide-react';
import { Invoice } from '../../types/invoice';

interface Props {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
}

const PRESET_CONTRACT_TERMS = [
  {
    title: 'پشتیبانی و ضمانت',
    text: `• کلیه خدمات/کالاهای موضوع این فاکتور دارای ۳ ماه گارانتی رفع نقص و پشتیبانی فنی می‌باشد.\n• در طول مدت پشتیبانی، رفع خطاهای احتمالی بر عهده مجری خواهد بود.`,
  },
  {
    title: 'تعهدات پرداخت و دیرکرد',
    text: `• خریدار موظف است مبالغ صورتحساب را در موعد مقرر تسویه نماید.\n• در صورت تأخیر در پرداخت، به ازای هر روز دیرکرد معادل ۱٪ مبلغ کل به عنوان خسارت لحاظ می‌گردد.`,
  },
  {
    title: 'محرمانگی اطلاعات (NDA)',
    text: `• طرفین متعهد می‌گردند اطلاعات تجاری، فنی و مالی یکدیگر را محرمانه تلقی نموده و از افشای آن به اشخاص ثالث خودداری نمایند.`,
  },
  {
    title: 'تحویل و بازبینی کار',
    text: `• مهلت بررسی و تأیید نهایی خدمات از سوی کارفرما حداکثر ۷ روز کاری پس از تحویل نسخه نهایی می‌باشد. پس از انقضای این مدت، کار تحویل قطعی تلقی می‌گردد.`,
  },
];

export const SecondPageSection: React.FC<Props> = ({ invoice, onChange }) => {
  const handleInsertPreset = (text: string) => {
    const current = invoice.secondPageContent || '';
    const updated = current ? `${current}\n\n${text}` : text;
    onChange({ secondPageContent: updated });
  };

  return (
    <div className="form-section-body">
      {/* Enable Toggle Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: invoice.enableSecondPage ? 'var(--primary-50)' : 'var(--bg-surface-subtle)',
          border: `1px solid ${invoice.enableSecondPage ? 'var(--primary-500)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FilePlus size={20} color={invoice.enableSecondPage ? 'var(--primary-600)' : 'var(--text-secondary)'} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              ایجاد برگه دوم (صفحه پیوست و توضیحات)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              مناسب برای اضافه کردن مفاد قرارداد، شرایط تحویل، بندهای فنی و حقوقی به فاکتور
            </div>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={invoice.enableSecondPage}
            onChange={(e) => onChange({ enableSecondPage: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </label>
      </div>

      {invoice.enableSecondPage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
          {/* Second Page Title */}
          <div className="form-group">
            <label className="form-label">عنوان برگه دوم</label>
            <input
              type="text"
              className="form-input"
              value={invoice.secondPageTitle || ''}
              onChange={(e) => onChange({ secondPageTitle: e.target.value })}
              placeholder="مثال: پیوست شماره ۱ - شرایط و توضیحات تکمیلی"
            />
          </div>

          {/* Preset Buttons */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} color="var(--primary-600)" />
              <span>افزودن بندهای آماده حقوقی و فنی به متن پیوست:</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_CONTRACT_TERMS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleInsertPreset(item.text)}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  + {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Multiline Content Textarea */}
          <div className="form-group">
            <label className="form-label">متن کامل توضیحات و بندهای پیوست *</label>
            <textarea
              className="form-textarea"
              value={invoice.secondPageContent || ''}
              onChange={(e) => onChange({ secondPageContent: e.target.value })}
              placeholder="متن توضیحات، تعهدات طرفین، نحوه پرداخت مرحله‌ای، ضمانت‌نامه، آدرس انبار تحویل و..."
              rows={8}
              style={{ lineHeight: 1.7, fontSize: '13px' }}
            />
          </div>

          {/* Signature on Second Page Option */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', marginTop: '4px' }}>
            <input
              type="checkbox"
              checked={invoice.secondPageSignatures ?? true}
              onChange={(e) => onChange({ secondPageSignatures: e.target.checked })}
            />
            <span>نمایش کادر امضا و مهر در انتهای برگه دوم</span>
          </label>
        </div>
      )}
    </div>
  );
};
