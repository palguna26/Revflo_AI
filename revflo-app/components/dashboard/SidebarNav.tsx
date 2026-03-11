"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Circle, 
  Database, 
  Layers, 
  Settings, 
  Terminal, 
  Zap,
  ChevronDown
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: Layers },
      { href: "/dashboard/insights", label: "Insights", icon: Zap },
      { href: "/dashboard/analysis", label: "Build Decisions", icon: Terminal },
      { href: "/dashboard/decision-log", label: "Decision Log", icon: Circle },
    ]
  },
  {
    label: "Workspace",
    items: [
      { href: "/dashboard/integrations", label: "Integrations", icon: Database },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]
  }
];

export function SidebarNav({ userEmail }: { userEmail: string }) {
  const path = usePathname();

  return (
    <aside className="w-[220px] shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col h-screen select-none">
      {/* Workspace Switcher Header */}
      <div className="h-[44px] flex items-center px-4 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors group">
        <div className="w-[18px] h-[18px] rounded bg-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-white mr-2.5 shadow-sm">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <span className="text-[13px] font-medium text-[var(--text-primary)] flex-1 truncate">
          RevFlo Workspace
        </span>
        <ChevronDown size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {NAV_GROUPS.map((group, idx) => (
          <div key={group.label} className={idx > 0 ? "mt-6" : ""}>
            <div className="px-2 mb-1.5 text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
              {group.label}
            </div>
            <div className="space-y-[1px]">
              {group.items.map((item) => {
                const active = path === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2.5 px-2.5 h-[30px] rounded-md text-[13px] transition-all duration-100 group
                      ${active 
                        ? "bg-[var(--bg-active)] text-[var(--text-primary)]" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      }
                    `}
                  >
                    <Icon 
                      size={14} 
                      className={`
                        ${active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"}
                      `}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / User Section */}
      <div className="p-2 border-t border-[var(--border-subtle)]">
        <Link 
          href="/dashboard/settings?tab=profile"
          className="flex items-center gap-2.5 px-2.5 h-[36px] rounded-md hover:bg-[var(--bg-hover)] transition-colors group"
        >
          <div className="w-5 h-5 rounded-full bg-[var(--bg-active)] border border-[var(--border-default)] flex items-center justify-center text-[10px] font-medium text-[var(--text-secondary)]">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <p className="text-[12px] font-medium text-[var(--text-primary)] leading-none mb-0.5">{userEmail.split('@')[0]}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] leading-none truncate">{userEmail}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
