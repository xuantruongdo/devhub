"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SidebarAdmin({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { t, locale } = useTranslation();

  const segments = pathname.split("/").filter(Boolean);
  const hasLocale = /^[a-z]{2}$/.test(segments[0]);

  const pathWithoutLocale = hasLocale
    ? "/" + segments.slice(1).join("/")
    : pathname;

  const links = [
    {
      href: "/admin",
      label: t("admin.sidebar.dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: "/admin/users",
      label: t("admin.sidebar.users"),
      icon: Users,
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/admin") {
      return pathWithoutLocale === "/admin";
    }

    return (
      pathWithoutLocale === href || pathWithoutLocale.startsWith(href + "/")
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6">
          <Link href={`/${locale}`}>
            <h1 className="text-2xl font-bold text-foreground">DevHub</h1>
          </Link>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2 px-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.href);

            return (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
