"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeType } from "@/constants";
import { useTranslation } from "@/hooks/useTranslation";

export function ModeToggle({ trigger }: { trigger?: React.ReactNode }) {
  const { setTheme, theme } = useTheme();
  const { t } = useTranslation();

  const themeConfig: Record<
    ThemeType,
    { label: string; icon: React.ReactNode }
  > = {
    [ThemeType.LIGHT]: {
      label: t("header.theme.light"),
      icon: <Sun className="w-4 h-4" />,
    },
    [ThemeType.DARK]: {
      label: t("header.theme.dark"),
      icon: <Moon className="w-4 h-4" />,
    },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="icon" className="relative">
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {Object.values(ThemeType).map((themeItem) => {
          const config = themeConfig[themeItem];

          return (
            <DropdownMenuItem
              key={themeItem}
              onClick={() => setTheme(themeItem)}
              className={`flex items-center gap-2 ${
                theme === themeItem ? "font-semibold text-primary" : ""
              }`}
            >
              {config.icon}
              <span>{config.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
