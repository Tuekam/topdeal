export type VerifiedAuthIdentity = {
  externalId: string;
  email: string | null;
  emailVerified: boolean;
};

export interface AuthIdentityProvider {
  verifyIdentityToken(
    identityToken: string,
  ): Promise<VerifiedAuthIdentity | null>;
  createSessionCookie(
    identityToken: string,
    expiresInMilliseconds: number,
  ): Promise<string>;
  verifySessionCookie(sessionCookie: string): Promise<VerifiedAuthIdentity | null>;
}
