"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/types/i18n";
import { LocaleType } from "@/constants";
import { useTranslation } from "@/hooks/useTranslation";

export function LanguageToggle({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as Locale) ?? LocaleType.EN;
  const { t } = useTranslation();

  const LOCALE_CONFIG: Record<string, { label: string; flag: string }> = {
    en: {
      label: t("header.language.en"),
      flag: "/images/en_flag.png",
    },
    vi: {
      label: t("header.language.vi"),
      flag: "/images/vi_flag.png",
    },
  };

  const switchLocale = (locale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  };

  const currentFlag = LOCALE_CONFIG[currentLocale]?.flag;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="icon">
            {currentFlag && (
              <Image
                src={currentFlag}
                alt={currentLocale}
                width={20}
                height={20}
                className="object-cover"
              />
            )}
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {locales.map((locale) => {
          const config = LOCALE_CONFIG[locale];

          return (
            <DropdownMenuItem
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`flex items-center gap-2 ${
                currentLocale === locale ? "font-semibold text-primary" : ""
              }`}
            >
              <Image
                src={config.flag}
                alt={locale}
                width={18}
                height={18}
                className="object-cover"
              />
              <span>{config.label ?? locale.toUpperCase()}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
