export type CreateWebSessionInput = {
  identityToken: string;
};

export type CreateWebSessionResult =
  | { status: "authenticated"; sessionCookie: string }
  | { status: "unauthenticated" }
  | { status: "email_unverified" }
  | { status: "registration_required" }
  | { status: "profile_required" }
  | { status: "account_unavailable" };

export interface CreateWebSessionUseCase {
  execute(input: CreateWebSessionInput): Promise<CreateWebSessionResult>;
}
