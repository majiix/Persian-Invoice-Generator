import React from 'react';
import { LayoutDashboard, Sparkles, Table2 } from 'lucide-react';
import { TemplateId } from '../../types/invoice';

interface Props {
  selectedTemplate: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}

export const TemplateSelector: React.FC<Props> = ({ selectedTemplate, onSelectTemplate }) => {
  const templates: Array<{
    id: TemplateId;
    title: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'modern',
      title: 'مدرن و سازمانی',
      description: 'طراحی شیک با کارت‌های تفکیک شده، وضعیت رنگی و هدر جذاب',
      icon: <Sparkles size={24} />,
    },
    {
      id: 'classic',
      title: 'رسمی و مالیاتی',
      description: 'جدول‌بندی استاندارد دارایی، فرمت رسمی فروشنده و خریدار',
      icon: <Table2 size={24} />,
    },
    {
      id: 'minimal',
      title: 'مینیمال و تایپوگرافی',
      description: 'ساده، ظریف، تمرکز بر خوانایی بالا و خطوط سیاه و سفید',
      icon: <LayoutDashboard size={24} />,
    },
  ];

  return (
    <div className="form-section-body">
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        قالب بصری مورد نظر خود را برای نمایش و چاپ فاکتور انتخاب نمایید:
      </div>

      <div className="template-grid">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className={`template-card-choice ${selectedTemplate === tpl.id ? 'active' : ''}`}
            onClick={() => onSelectTemplate(tpl.id)}
          >
            <div className="template-card-icon">{tpl.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>
              {tpl.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {tpl.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
