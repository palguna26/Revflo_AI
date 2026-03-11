import React from "react";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info" | "accent";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    default: "bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
    success: "bg-[rgba(77,154,107,0.1)] text-[var(--status-success)] border-[rgba(77,154,107,0.2)]",
    warning: "bg-[rgba(201,120,58,0.1)] text-[var(--status-warning)] border-[rgba(201,120,58,0.2)]",
    error: "bg-[rgba(201,74,74,0.1)] text-[var(--status-error)] border-[rgba(201,74,74,0.2)]",
    info: "bg-[rgba(74,127,201,0.1)] text-[var(--status-info)] border-[rgba(74,127,201,0.2)]",
    accent: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[rgba(94,106,210,0.2)]",
  };

  return (
    <span className={`
      inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border h-4 select-none
      ${variants[variant]}
      ${className || ""}
    `}>
      {children}
    </span>
  );
}
