import { jsx as _jsx } from "react/jsx-runtime";
import Toast, { useToast } from './Toast';
export default function ToastContainer() {
    const { toasts } = useToast();
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none", children: toasts.map((toast) => (_jsx("div", { className: "pointer-events-auto", children: _jsx(Toast, { message: toast.message, type: toast.type, duration: toast.duration }) }, toast.id))) }));
}
