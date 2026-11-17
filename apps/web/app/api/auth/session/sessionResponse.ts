import { cookies } from "next/headers";
import { AUTH_SESSION_MAX_AGE_MS } from "@topdeal/feature-auth/core";
import type { CreateWebSessionResult } from "@topdeal/feature-auth/core";
import { AUTH_SESSION_COOKIE_NAME } from "../../../../security/sessionCookie";

export { AUTH_SESSION_COOKIE_NAME };

export async function createAuthenticatedSessionResponse(sessionCookie: string): Promise<Response> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE_NAME, sessionCookie, {
    expires: new Date(Date.now() + AUTH_SESSION_MAX_AGE_MS),
    httpOnly: true,
    maxAge: AUTH_SESSION_MAX_AGE_MS / 1000,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return Response.json(
    { status: "authenticated" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

type RejectedSessionResult = Exclude<
  CreateWebSessionResult,
  { status: "authenticated" }
>;

export function createRejectedSessionResponse(
  result: RejectedSessionResult,
): Response {
  switch (result.status) {
    case "unauthenticated":
      return Response.json(
        { code: "UNAUTHENTICATED" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    case "email_unverified":
      return Response.json(
        { code: "EMAIL_NOT_VERIFIED" },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    case "registration_required":
      return Response.json(
        { code: "REGISTRATION_REQUIRED" },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    case "profile_required":
      return Response.json(
        { code: "PROFILE_REQUIRED" },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    case "account_unavailable":
      return Response.json(
        { code: "ACCOUNT_UNAVAILABLE" },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
  }
}
