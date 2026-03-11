"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Plus } from "lucide-react";

export function Topbar() {
  const path = usePathname();
  
  // Format title from pathname
  const getTitle = () => {
    if (path === "/dashboard") return "Overview";
    const segments = path.split("/");
    const last = segments[segments.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="h-[44px] shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-[14px] font-semibold text-[var(--text-primary)]">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="h-[28px] w-[28px] flex items-center justify-center rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
          <Search size={15} />
        </button>
        <button className="h-[28px] w-[28px] flex items-center justify-center rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--accent)] rounded-full border border-[var(--bg-primary)]"></span>
        </button>
        <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1"></div>
        <button className="linear-button-primary">
          <Plus size={14} />
          <span>New Analysis</span>
        </button>
      </div>
    </header>
  );
}
