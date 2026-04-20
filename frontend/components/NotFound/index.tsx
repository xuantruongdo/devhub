"use client";

import Link from "next/link";
import { SearchX, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function NotFound() {
  const { t, locale, ready } = useTranslation();

  if (!ready) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-5 rounded-full bg-muted">
            <SearchX className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-4xl font-bold">
          {t("notFound.title") || "404 Not Found"}
        </h1>

        <p className="text-sm text-muted-foreground">
          {t("notFound.description") ||
            "The page you are looking for does not exist."}
        </p>

        <div className="flex justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("notFound.backHome") || "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
