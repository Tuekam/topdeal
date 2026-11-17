export type SignInCredentials =
  | { method: "google" }
  | { method: "email_password"; email: string; password: string };

export interface AuthSignInProvider {
  getIdentityToken(credentials: SignInCredentials): Promise<string>;
  createEmailPasswordIdentity(email: string, password: string): Promise<void>;
  getCurrentIdentityToken(): Promise<string | null>;
  refreshCurrentIdentity(): Promise<{ identityToken: string; emailVerified: boolean } | null>;
  hasEmailPasswordCredential(): boolean;
  linkEmailPasswordCredential(password: string): Promise<void>;
  sendEmailVerification(): Promise<void>;
  clearIdentity(): Promise<void>;
}
