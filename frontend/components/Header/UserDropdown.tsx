"use client";

import {
  Bell,
  Languages,
  LogOut,
  MessageCircle,
  Moon,
  Settings,
} from "lucide-react";
import { ModeToggle } from "../ModeToggle";
import { LanguageToggle } from "../LanguageToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CurrentUserResponse } from "@/types/auth";
import Link from "next/link";
export function UserDropdown({
  user,
  onLogout,
  unreadNotifs,
  unreadMsgs,
}: {
  user: CurrentUserResponse;
  onLogout: () => void;
  unreadNotifs: number;
  unreadMsgs: number;
}) {
  const router = useRouter();
  const { t, locale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar size="lg" className="cursor-pointer">
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
        <DropdownMenuItem asChild className="block">
          <Link
            href={`/${locale}/${user.username}`}
            className="px-3 py-2 cursor-pointer block"
          >
            <p className="text-sm font-semibold">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </Link>
        </DropdownMenuItem>

        <div className="sm:hidden">
          <DropdownMenuItem
            onClick={() => router.push(`/${locale}/notifications`)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>

              <span>{t("header.notification.title")}</span>
            </div>

            {unreadNotifs > 0 && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full !bg-primary !text-primary-foreground font-medium">
                {unreadNotifs}
              </span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(`/${locale}/messages`)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageCircle className="h-4 w-4" />
                {unreadMsgs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>

              <span>{t("header.message.title")}</span>
            </div>

            {unreadMsgs > 0 && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full !bg-primary !text-primary-foreground font-medium">
                {unreadMsgs}
              </span>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <LanguageToggle
            trigger={
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Languages className="w-4 h-4" />
                <span>{t("header.language.title")}</span>
              </DropdownMenuItem>
            }
          />

          <ModeToggle
            trigger={
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Moon className="w-4 h-4" />
                <span>{t("header.theme.title")}</span>
              </DropdownMenuItem>
            }
          />

          <DropdownMenuSeparator />
        </div>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          {t("header.settings")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-500 focus:text-red-500"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("header.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
