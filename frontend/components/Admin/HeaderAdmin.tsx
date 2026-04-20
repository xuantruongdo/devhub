"use client";

import { Menu } from "lucide-react";
import { LanguageToggle } from "../LanguageToggle";
import { ModeToggle } from "../ModeToggle";
import { UserDropdownAdmin } from "./UserDropdownAdmin";

interface HeaderAdminProps {
  onToggleSidebar: () => void;
}

export function HeaderAdmin({ onToggleSidebar }: HeaderAdminProps) {
  return (
    <header className="border-b border-border bg-background px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="text-sm md:text-base font-semibold text-foreground"></div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <LanguageToggle />
        <ModeToggle />
        <UserDropdownAdmin />
      </div>
    </header>
  );
}
