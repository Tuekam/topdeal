export type AuthAccount = {
  status: "active" | "suspended";
  profileComplete: boolean;
};

export interface AuthUserRepository {
  findByExternalIdentity(externalId: string): Promise<AuthAccount | null>;
  isEmailAlreadyUsed(email: string): Promise<boolean>;
  createProfileForExternalIdentity(profile: NewAuthProfile): Promise<"created" | "conflict">;
}

export type NewAuthProfile = {
  externalId: string;
  email: string;
  givenName: string;
  familyName: string;
  telephone: string;
  birthDate: string;
};
