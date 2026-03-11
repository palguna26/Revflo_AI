import React from "react";

interface ListItemProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ListItem({ title, subtitle, icon, meta, active, onClick, className }: ListItemProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        min-h-[36px] px-4 py-2 border-b border-[var(--border-subtle)] flex items-start gap-[12px] transition-colors duration-100 cursor-pointer select-none group
        ${active ? "bg-[var(--bg-active)]" : "hover:bg-[var(--bg-hover)]"}
        ${className || ""}
      `}
    >
      {icon && (
        <div className={`mt-0.5 shrink-0 ${active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"}`}>
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">
            {title}
          </div>
          {meta && (
            <div className="shrink-0 text-[11px] text-[var(--text-tertiary)]">
              {meta}
            </div>
          )}
        </div>
        
        {subtitle && (
          <div className="text-[12px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
