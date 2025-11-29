import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  };

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  };

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm border rounded-lg shadow-lg p-4 flex items-start gap-3 ${bgColor[type]} z-50 animate-in slide-in-from-bottom-4`}>
      <Icon className={`flex-shrink-0 mt-0.5 ${iconColor[type]}`} size={20} />
      <p className={`flex-1 text-sm font-medium ${textColor[type]}`}>{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className={`flex-shrink-0 ${textColor[type]} hover:opacity-70`}
      >
        <X size={18} />
      </button>
    </div>
  );
}

// Toast Manager Hook
let toastId = 0;

interface ToastItem extends ToastProps {
  id: number;
}

let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toastList: ToastItem[] = [];

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastItem[]) => {
      setToasts(newToasts);
    };

    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = toastId++;
    const newToast: ToastItem = { id, message, type, duration };

    toastList = [newToast, ...toastList];
    toastListeners.forEach((listener) => listener(toastList));

    setTimeout(() => {
      toastList = toastList.filter((t) => t.id !== id);
      toastListeners.forEach((listener) => listener(toastList));
    }, duration);
  };

  return { toasts, show };
}
