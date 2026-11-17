import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { AuthIdentityProvider } from "../../core/repositories/AuthIdentityProvider";

const FIREBASE_APP_NAME = "topdeal-auth";
const INVALID_TOKEN_ERROR_CODES = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-id-token",
  "auth/user-disabled",
]);

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for Firebase Admin.`);
  }

  return value;
}

function getFirebaseAuth() {
  const existingApp = getApps().find((app) => app.name === FIREBASE_APP_NAME);
  const app =
    existingApp ??
    initializeApp(
      {
        credential: cert({
          projectId: getRequiredEnvironmentVariable("FIREBASE_PROJECT_ID"),
          clientEmail: getRequiredEnvironmentVariable("FIREBASE_CLIENT_EMAIL"),
          privateKey: getRequiredEnvironmentVariable(
            "FIREBASE_PRIVATE_KEY",
          ).replace(/\\n/g, "\n"),
        }),
      },
      FIREBASE_APP_NAME,
    );

  return getAuth(app);
}

function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  return typeof error.code === "string" ? error.code : null;
}

export class FirebaseAdminIdentityProvider implements AuthIdentityProvider {
  async verifyIdentityToken(identityToken: string) {
    try {
      const decodedToken = await getFirebaseAuth().verifyIdToken(
        identityToken,
        true,
      );

      return {
        externalId: decodedToken.uid,
        email: decodedToken.email ?? null,
        emailVerified: decodedToken.email_verified === true,
      };
    } catch (error) {
      const code = getErrorCode(error);

      if (code && INVALID_TOKEN_ERROR_CODES.has(code)) {
        return null;
      }

      throw error;
    }
  }

  async createSessionCookie(
    identityToken: string,
    expiresInMilliseconds: number,
  ): Promise<string> {
    return getFirebaseAuth().createSessionCookie(identityToken, {
      expiresIn: expiresInMilliseconds,
    });
  }
}
