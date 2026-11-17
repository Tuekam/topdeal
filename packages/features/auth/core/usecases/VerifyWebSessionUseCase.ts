export type VerifyWebSessionResult =
  | { status: "authenticated"; userId: string }
  | { status: "unauthenticated" }
  | { status: "profile_required" }
  | { status: "account_unavailable" };

export interface VerifyWebSessionUseCase {
  execute(sessionCookie: string | null): Promise<VerifyWebSessionResult>;
}
