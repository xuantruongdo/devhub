"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function Forbidden() {
  const { t, locale, ready } = useTranslation();

  if (!ready) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-5 rounded-full bg-destructive/10">
            <ShieldX className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          {t("forbidden.title") || "403 Forbidden"}
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("forbidden.description") ||
            "You do not have permission to access this page."}
        </p>

        <div className="flex justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("forbidden.backHome") || "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
