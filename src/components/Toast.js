import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);
    if (!isVisible)
        return null;
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
    return (_jsxs("div", { className: `fixed bottom-4 right-4 max-w-sm border rounded-lg shadow-lg p-4 flex items-start gap-3 ${bgColor[type]} z-50 animate-in slide-in-from-bottom-4`, children: [_jsx(Icon, { className: `flex-shrink-0 mt-0.5 ${iconColor[type]}`, size: 20 }), _jsx("p", { className: `flex-1 text-sm font-medium ${textColor[type]}`, children: message }), _jsx("button", { onClick: () => setIsVisible(false), className: `flex-shrink-0 ${textColor[type]} hover:opacity-70`, children: _jsx(X, { size: 18 }) })] }));
}
// Toast Manager Hook
let toastId = 0;
let toastListeners = [];
let toastList = [];
export function useToast() {
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        const listener = (newToasts) => {
            setToasts(newToasts);
        };
        toastListeners.push(listener);
        return () => {
            toastListeners = toastListeners.filter((l) => l !== listener);
        };
    }, []);
    const show = (message, type = 'info', duration = 3000) => {
        const id = toastId++;
        const newToast = { id, message, type, duration };
        toastList = [newToast, ...toastList];
        toastListeners.forEach((listener) => listener(toastList));
        setTimeout(() => {
            toastList = toastList.filter((t) => t.id !== id);
            toastListeners.forEach((listener) => listener(toastList));
        }, duration);
    };
    return { toasts, show };
}
