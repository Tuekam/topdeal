import { cookies } from "next/headers";
import { resolveVerifyWebSessionUseCase } from "../di/container";
import { AUTH_SESSION_COOKIE_NAME } from "./sessionCookie";

export async function getVerifiedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const result = await resolveVerifyWebSessionUseCase().execute(
    cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value ?? null,
  );
  return result.status === "authenticated" ? result.userId : null;
}
