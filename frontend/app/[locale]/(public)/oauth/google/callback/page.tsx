"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import authService from "@/services/auth";
import { useAppDispatch } from "@/redux/hooks";
import { Loader2 } from "lucide-react";
import { getGoogleTokens, getGoogleUserProfile } from "@/lib/google";
import { setCurrentUser } from "@/redux/reducers/currentUser";
import { toastSuccess } from "@/lib/toast";
import { useTranslation } from "@/hooks/useTranslation";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { t, locale, ready } = useTranslation();

  useEffect(() => {
    if (!ready) return;
    const code = searchParams.get("code");

    const handleGoogleCallback = async () => {
      if (!code) return;

      try {
        const tokenResponse = await getGoogleTokens(code);
        const profile = await getGoogleUserProfile(tokenResponse.access_token);

        const { name, email, picture } = profile;

        const { data } = await authService.loginGoogle({
          fullName: name,
          email,
          avatar: picture,
        });

        dispatch(setCurrentUser(data.user));
        localStorage.setItem("accessToken", data.accessToken);

        toastSuccess(t("auth.login.success.title"));
        router.push(`/${locale}`);
      } catch {
        router.push(`/${locale}/login?error=google`);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, dispatch, ready]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-black dark:to-zinc-900 z-50">
      <div className="flex flex-col items-center justify-center gap-5 text-center">
        <div className="relative w-14 h-14 animate-pulse">
          <Image
            src="/images/google.webp"
            alt="Google"
            fill
            className="object-contain"
          />
        </div>

        <p className="text-base font-medium text-gray-800 dark:text-white">
          Signing you in with Google...
        </p>

        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    </div>
  );
}
