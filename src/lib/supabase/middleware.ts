import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { HOME_AFTER_LOGIN, isProtectedPath } from "@/lib/utils";

/** Refreshes the Supabase session cookie and guards protected pages. Called from src/proxy.ts. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Must run before anything else: validates the JWT and refreshes it if needed.
  const { data } = await supabase.auth.getClaims();
  const loggedIn = !!data?.claims;
  const { pathname, search } = request.nextUrl;

  if (!loggedIn && isProtectedPath(pathname)) {
    return redirectKeepingCookies(request, response, `/login?next=${encodeURIComponent(pathname + search)}`);
  }
  if (loggedIn && (pathname === "/login" || pathname === "/signup")) {
    return redirectKeepingCookies(request, response, HOME_AFTER_LOGIN);
  }
  return response;
}

function redirectKeepingCookies(request: NextRequest, response: NextResponse, to: string) {
  const redirect = NextResponse.redirect(new URL(to, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
