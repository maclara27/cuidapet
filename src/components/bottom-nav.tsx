"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawPrint, Syringe, Utensils, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Início",
    href: "/dashboard",
    icon: PawPrint,
  },
  {
    label: "Vacinas",
    href: "/vacinas",
    icon: Syringe,
  },
  {
    label: "Nutrição",
    href: "/nutricao",
    icon: Utensils,
  },
  {
    label: "Assistente IA",
    href: "/assistente",
    icon: Sparkles,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-all relative group",
                isActive
                  ? "text-primary font-bold"
                  : "text-gray-400 hover:text-emerald-700 font-medium"
              )}
            >
              {isActive && (
                <span className="absolute top-1.5 w-8 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-200" />
              )}
              <div
                className={cn(
                  "p-1 rounded-xl transition-all",
                  isActive
                    ? "bg-emerald-50 text-primary scale-110"
                    : "group-hover:bg-gray-100"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                  )}
                />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

