import { NextRequest, NextResponse } from "next/server";

const LOCALE_COOKIE = "pryzr_locale";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const preferredLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (preferredLocale === "en" || preferredLocale === "es") {
    return NextResponse.next();
  }

  const acceptedLanguages = request.headers.get("accept-language") ?? "";
  const usesSpanish = acceptedLanguages
    .toLowerCase()
    .split(",")
    .some((language) => language.trim().startsWith("es"));

  if (!usesSpanish) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/es";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/"],
};
