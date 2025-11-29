import { jsx as _jsx } from "react/jsx-runtime";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
const Toaster = ({ ...props }) => {
    const { theme } = useTheme();
    const toasterTheme = theme === "dark" ? "dark" : "light";
    return (_jsx(Sonner, { theme: toasterTheme, className: "toaster group", style: {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
        }, ...props }));
};
export { Toaster };
