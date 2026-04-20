"use client";

import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import authService from "@/services/auth";
import { toastError } from "@/lib/toast";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

export function UserDropdownAdmin() {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.currentUser);
  const { t, locale } = useTranslation();

  const onLogout = async () => {
    try {
      await authService.logout();
      router.push(`/${locale}/login`);
      localStorage.removeItem("accessToken");
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar size="lg">
          {currentUser.avatar ? (
            <AvatarImage src={currentUser.avatar} />
          ) : (
            <AvatarFallback>{currentUser.fullName.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <Link
          href={`/${locale}/${currentUser.username}`}
          className="px-3 py-2 cursor-pointer block"
        >
          <p className="text-sm font-semibold">{currentUser.fullName}</p>
          <p className="text-xs text-muted-foreground">
            @{currentUser.username}
          </p>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("admin.header.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
