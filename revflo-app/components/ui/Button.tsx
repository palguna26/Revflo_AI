import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", loading, icon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-[var(--accent)] text-white border-[rgba(255,255,255,0.1)] hover:bg-[var(--accent-hover)]",
      secondary: "bg-transparent text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]",
      ghost: "bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
      danger: "bg-transparent text-[var(--status-error)] border-[var(--border-default)] hover:bg-[rgba(201,74,74,0.1)] hover:border-[var(--status-error)]",
    };

    const sizes = {
      sm: "h-[24px] px-2 text-[11px] gap-1.5 rounded",
      md: "h-[28px] px-[10px] text-[13px] gap-[6px] rounded-md",
      lg: "h-[32px] px-3 text-[14px] gap-2 rounded-md",
    };

    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-100 active:scale-[0.98] border select-none disabled:opacity-50 disabled:pointer-events-none";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === "sm" ? 12 : 14} />
        ) : icon ? (
          <span className="flex shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
