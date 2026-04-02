import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale, isValidLocale, locales } from "./lib/i18n";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  let locale = defaultLocale;
  const acceptLanguage = request.headers.get("accept-language");

  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(",")[0].split("-")[0];
    if (isValidLocale(preferredLocale)) {
      locale = preferredLocale;
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  url.search = request.nextUrl.search;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*|public).*)"],
};
