"use client";

import { Bell, LogOut, MessageCircle, Search, Settings } from "lucide-react";
import { ModeToggle } from "../ModeToggle";
import { LanguageToggle } from "../LanguageToggle";
import { useAppSelector } from "@/redux/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toastError } from "@/lib/toast";
import authService from "@/services/auth";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";

export default function Header() {
  const user = useAppSelector((state) => state.currentUser);
  const router = useRouter();
  const { t, locale } = useTranslation();

  const onLogout = async () => {
    try {
      await authService.logout();
      router.push(`/${locale}/login`);
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground hidden sm:block">
            DevHub
          </h1>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-5 rounded-full bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="p-2 hover:bg-secondary rounded-full transition"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
          </button>
          <button
            className="p-2 hover:bg-secondary rounded-full transition"
            title="Messages"
          >
            <MessageCircle className="h-5 w-5 text-foreground" />
          </button>
          <LanguageToggle />
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar size="lg">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                ) : (
                  <AvatarFallback>
                    {user.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-semibold text-foreground">
                  {user.fullName}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{user.username}
                </p>
              </div>

              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                {t("header.settings")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-500"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("header.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
