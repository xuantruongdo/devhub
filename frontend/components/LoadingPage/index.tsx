"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  const { t, ready } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold text-foreground">DevHub</span>
        </div>

        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />

        {ready && (
          <div className="text-center">
            <p className="text-sm text-foreground">{t("loading.title")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("loading.description")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
