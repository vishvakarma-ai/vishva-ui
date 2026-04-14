"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Store,
  History,
  Settings,
  Zap,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/agents", icon: Bot, label: "Agents" },
  { href: "/marketplace", icon: Store, label: "Marketplace" },
  { href: "/history", icon: History, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-800">
        <div className="w-7 h-7 rounded-lg bg-vishva-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-sm">Vishvakarma</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-vishva-900/60 text-vishva-300 border border-vishva-800/50"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Version */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600">Vishvakarma v0.1.0</p>
        <p className="text-xs text-gray-700">AI Agent OS</p>
      </div>
    </aside>
  );
}
