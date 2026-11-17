import type { NewAuthProfile } from "../repositories/AuthUserRepository";

export type CompleteAuthProfileInput = Omit<NewAuthProfile, "externalId" | "email"> & {
  identityToken: string;
};

export type CompleteAuthProfileResult =
  | { status: "authenticated"; sessionCookie: string }
  | { status: "unauthenticated" | "email_unverified" | "invalid_profile" | "profile_conflict" };

export interface CompleteAuthProfileUseCase {
  execute(input: CompleteAuthProfileInput): Promise<CompleteAuthProfileResult>;
}
