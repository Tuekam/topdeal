import { cookies } from "next/headers";
import { resolveVerifyWebSessionUseCase } from "../di/container";
import { AUTH_SESSION_COOKIE_NAME } from "./sessionCookie";

export type VerifiedWebSession =
  | { status: "authenticated"; userId: string }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function verifyCurrentWebSession(): Promise<VerifiedWebSession> {
  try {
    const cookieStore = await cookies();
    const result = await resolveVerifyWebSessionUseCase().execute(
      cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value ?? null,
    );
    return result.status === "authenticated"
      ? { status: "authenticated", userId: result.userId }
      : { status: "unauthenticated" };
  } catch (error) {
    console.error("[TopDeal Auth] Session verification is unavailable.", error);
    return { status: "unavailable" };
  }
}

export async function getVerifiedUserForApi(): Promise<
  | { status: "authenticated"; userId: string }
  | { status: "unauthenticated" | "unavailable"; response: Response }
> {
  const session = await verifyCurrentWebSession();
  if (session.status === "authenticated") return session;

  const unavailable = session.status === "unavailable";
  return {
    status: unavailable ? "unavailable" : "unauthenticated",
    response: Response.json(
      { code: unavailable ? "AUTH_SERVICE_UNAVAILABLE" : "UNAUTHENTICATED" },
      {
        status: unavailable ? 503 : 401,
        headers: { "Cache-Control": "no-store" },
      },
    ),
  };
}
