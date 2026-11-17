import {
  browserPopupRedirectResolver,
  EmailAuthProvider,
  GoogleAuthProvider,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  linkWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification as sendFirebaseEmailVerification,
  signOut,
  type Auth,
} from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";
import { AuthSignInFailure } from "../../core/models/AuthSignInFailure";
import type { AuthSignInProvider, SignInCredentials } from "../../core/repositories/AuthSignInProvider";

const APP_NAME = "topdeal-web-auth";
let authInstance: Auth | null = null;

function getSafeFirebaseErrorCode(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? error.code
      : null;
  return typeof code === "string" && /^auth\/[a-z0-9-]+$/.test(code)
    ? code
    : "auth/unknown";
}

function getRequiredPublicEnvironmentVariable(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is required for Firebase Web Auth.`);
  return value;
}

function getEmailCredentialFailure(error: unknown): AuthSignInFailure | null {
  const code = getSafeFirebaseErrorCode(error);
  if (code === "auth/email-already-in-use" || code === "auth/credential-already-in-use") {
    return new AuthSignInFailure("email_already_associated");
  }
  if (code === "auth/weak-password") return new AuthSignInFailure("weak_password");
  return null;
}

function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;

  const app = getApps().some((item) => item.name === APP_NAME)
    ? getApp(APP_NAME)
    : initializeApp(
        {
          apiKey: getRequiredPublicEnvironmentVariable("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
          authDomain: getRequiredPublicEnvironmentVariable("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
          projectId: getRequiredPublicEnvironmentVariable("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
          appId: getRequiredPublicEnvironmentVariable("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
        },
        APP_NAME,
      );

  try {
    authInstance = initializeAuth(app, {
      persistence: inMemoryPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      error.code !== "auth/already-initialized"
    ) {
      throw error;
    }
    authInstance = getAuth(app);
  }
  return authInstance;
}

export class FirebaseWebSignInProvider implements AuthSignInProvider {
  async createEmailPasswordIdentity(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    } catch (error) {
      const failure = getEmailCredentialFailure(error);
      if (failure) throw failure;
      throw error;
    }
  }

  async getIdentityToken(credentials: SignInCredentials): Promise<string> {
    try {
      const auth = getFirebaseAuth();
      const credential = credentials.method === "google"
        ? await signInWithPopup(auth, new GoogleAuthProvider())
        : await signInWithEmailAndPassword(auth, credentials.email.trim(), credentials.password);
      return credential.user.getIdToken();
    } catch (error) {
      const code = getSafeFirebaseErrorCode(error);
      if (process.env.NODE_ENV === "development") {
        console.error("[TopDeal Auth] Firebase sign-in failed:", code);
      }
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        throw new AuthSignInFailure("invalid_credentials");
      }
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        throw new AuthSignInFailure("cancelled");
      }
      throw error;
    }
  }

  async getCurrentIdentityToken(): Promise<string | null> {
    const user = getFirebaseAuth().currentUser;
    return user ? user.getIdToken() : null;
  }

  async refreshCurrentIdentity(): Promise<{ identityToken: string; emailVerified: boolean } | null> {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    await currentUser.reload();
    const refreshedUser = auth.currentUser;
    if (!refreshedUser) return null;

    return {
      identityToken: await refreshedUser.getIdToken(true),
      emailVerified: refreshedUser.emailVerified,
    };
  }

  async sendEmailVerification(): Promise<void> {
    const user = getFirebaseAuth().currentUser;
    if (!user?.email) throw new AuthSignInFailure("identity_unavailable");
    await sendFirebaseEmailVerification(user);
  }

  hasEmailPasswordCredential(): boolean {
    return getFirebaseAuth().currentUser?.providerData.some(
      (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID,
    ) ?? false;
  }

  async linkEmailPasswordCredential(password: string): Promise<void> {
    const user = getFirebaseAuth().currentUser;
    if (!user?.email || !user.emailVerified) {
      throw new AuthSignInFailure("identity_unavailable");
    }

    let linkedUser = user;
    try {
      const linkedCredential = await linkWithCredential(
        user,
        EmailAuthProvider.credential(user.email, password),
      );
      linkedUser = linkedCredential.user;
    } catch (error) {
      const code = getSafeFirebaseErrorCode(error);
      if (code !== "auth/provider-already-linked") {
        const failure = getEmailCredentialFailure(error);
        if (failure) throw failure;
        throw error;
      }
    }

    await linkedUser.getIdToken(true);
  }

  async clearIdentity(): Promise<void> {
    await signOut(getFirebaseAuth());
  }
}
