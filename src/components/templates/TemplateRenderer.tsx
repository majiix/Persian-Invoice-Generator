import React from 'react';
import { Invoice } from '../../types/invoice';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';

interface Props {
  invoice: Invoice;
}

export const TemplateRenderer: React.FC<Props> = ({ invoice }) => {
  switch (invoice.templateId) {
    case 'classic':
      return <ClassicTemplate invoice={invoice} />;
    case 'minimal':
      return <MinimalTemplate invoice={invoice} />;
    case 'modern':
    default:
      return <ModernTemplate invoice={invoice} />;
  }
};
