export type AuthAccount = {
  userId: string;
  status: "active" | "suspended";
  profileComplete: boolean;
};

export type NewAuthProfile = {
  externalId: string;
  email: string;
  givenName: string;
  familyName: string;
  telephone: string;
  birthDate: string;
};

export interface AuthUserRepository {
  findByExternalIdentity(externalId: string): Promise<AuthAccount | null>;
  isEmailAlreadyUsed(email: string): Promise<boolean>;
  createProfileForExternalIdentity(profile: NewAuthProfile): Promise<"created" | "conflict">;
}
