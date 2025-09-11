'use client';

import { useToastStore } from '@/stores/toast';
import Toast from './Toast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
