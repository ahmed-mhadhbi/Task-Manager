"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Trello } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Projects", icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-2">
          <Trello className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Blue Matrix</p>
            <p className="text-xs text-slate-500">Task Manager</p>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-blue-50",
                  isActive ? "text-blue-600" : "text-slate-600",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name || user?.email}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <Button variant="ghost" className="gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

