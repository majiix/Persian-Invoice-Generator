import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Props {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<Props> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container no-print">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <CheckCircle2 size={18} />}
          {t.type === 'error' && <AlertCircle size={18} />}
          {t.type === 'info' && <Info size={18} />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
