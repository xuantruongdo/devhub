"use client";

import {
  Home,
  Compass,
  Mail,
  Bookmark,
  MoreHorizontal,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAppSelector } from "@/redux/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import authService from "@/services/auth";
import { toastError } from "@/lib/toast";
import { useTranslation } from "@/hooks/useTranslation";

export default function LeftSidebar() {
  const user = useAppSelector((state) => state.currentUser);
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale, ready } = useTranslation();

  const menuItems = [
    {
      icon: Home,
      label: t("leftSidebar.home"),
      href: `/${locale}`,
    },
    {
      icon: Compass,
      label: t("leftSidebar.explore"),
      href: `/${locale}/explore`,
    },
    {
      icon: Mail,
      label: t("leftSidebar.messages"),
      href: `/${locale}/messages`,
    },
    {
      icon: Bookmark,
      label: t("leftSidebar.saved"),
      href: `/${locale}/saved`,
    },
  ];

  const onLogout = async () => {
    try {
      await authService.logout();
      router.push(`/${locale}/login`);
    } catch (error) {
      toastError(error);
    }
  };

  if (!ready) return null;

  return (
    <aside className="hidden lg:flex w-72 border-r border-border bg-card flex-col sticky h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-2 p-6">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${locale}` && pathname.startsWith(item.href));

          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-4 px-6 py-3 rounded-full transition font-semibold text-lg ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <Button className="w-full mt-6 py-6 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-lg transition">
          {t("leftSidebar.post")}
        </Button>
      </nav>

      <div className="mt-auto p-6 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition">
              <div className="flex items-center gap-3 flex-1">
                <Avatar size="lg">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                  ) : (
                    <AvatarFallback>
                      {user.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-left min-w-0">
                  <p className="font-bold text-foreground truncate">
                    {user.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username}
                  </p>
                </div>
              </div>
              <MoreHorizontal className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b">
              <p className="text-sm font-semibold text-foreground">
                {user.fullName}
              </p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
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
    </aside>
  );
}
