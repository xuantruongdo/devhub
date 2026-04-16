"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import authService from "@/services/auth";
import { VerifyEmailStatus } from "@/constants";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale, ready } = useTranslation();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyEmailStatus>(
    VerifyEmailStatus.LOADING,
  );

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        if (isMounted) setStatus(VerifyEmailStatus.ERROR);
        return;
      }

      try {
        setStatus(VerifyEmailStatus.LOADING);

        await authService.verifyEmail({ token });

        if (!isMounted) return;

        setStatus(VerifyEmailStatus.SUCCESS);

        setTimeout(() => {
          if (isMounted) router.push(`/${locale}/login`);
        }, 1500);
      } catch {
        if (isMounted) setStatus(VerifyEmailStatus.ERROR);
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, router, ready]);

  const renderContent = () => {
    switch (status) {
      case VerifyEmailStatus.LOADING:
        return (
          <>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-foreground">
                DevHub
              </span>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>

            <p className="text-sm text-muted-foreground">
              {t("verifyEmail.loading")}
            </p>
          </>
        );

      case VerifyEmailStatus.SUCCESS:
        return (
          <>
            <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              {t("verifyEmail.success.title")}
            </h2>

            <p className="text-sm text-muted-foreground">
              {t("verifyEmail.success.desc")}
            </p>
          </>
        );

      case VerifyEmailStatus.ERROR:
        return (
          <>
            <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              {t("verifyEmail.error.title")}
            </h2>

            <p className="text-sm text-muted-foreground">
              {t("verifyEmail.error.desc")}
            </p>

            <Link
              href={`/${locale}/register`}
              className="mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              {t("verifyEmail.error.back")}
            </Link>
          </>
        );

      default:
        return null;
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-lg p-6">
        <div className="flex flex-col items-center text-center gap-5">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
