import type { RegistrationEligibilityResult, WebSessionGateway, WebSessionResult } from "../../domain/interfaces/WebSessionGateway";

export class FetchWebSessionGateway implements WebSessionGateway {
  async create(identityToken: string): Promise<WebSessionResult> {
    let response: Response;
    try {
      response = await fetch("/api/auth/session", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Topdeal-Request": "1",
        },
        body: JSON.stringify({ identityToken }),
      });
    } catch {
      return { status: "request_failed" };
    }

    return readAuthResponse(response);
  }

  async completeProfile(
    identityToken: string,
    profile: { givenName: string; familyName: string; telephone: string; birthDate: string },
  ): Promise<WebSessionResult> {
    let response: Response;
    try {
      response = await fetch("/api/auth/profile", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Topdeal-Request": "1",
        },
        body: JSON.stringify({ identityToken, ...profile }),
      });
    } catch {
      return { status: "request_failed" };
    }

    return readAuthResponse(response);
  }

  async checkRegistrationEligibility(identityToken: string): Promise<RegistrationEligibilityResult> {
    let response: Response;
    try {
      response = await fetch("/api/auth/registration/eligibility", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Topdeal-Request": "1",
        },
        body: JSON.stringify({ identityToken }),
      });
    } catch {
      return { status: "request_failed" };
    }

    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null) {
        if ("status" in body && body.status === "registration_eligible") {
          return { status: "registration_eligible" };
        }
        if ("code" in body && typeof body.code === "string") {
          const codeToStatus: Record<string, Exclude<RegistrationEligibilityResult["status"], "registration_eligible" | "request_failed">> = {
            UNAUTHENTICATED: "unauthenticated",
            EMAIL_NOT_VERIFIED: "email_unverified",
            EMAIL_ALREADY_IN_USE: "email_already_in_use",
          };
          const status = codeToStatus[body.code];
          if (status) return { status };
        }
      }
    } catch {
      // Le client ne reçoit aucun détail interne en cas de réponse invalide.
    }
    return { status: "request_failed" };
  }
}

async function readAuthResponse(response: Response): Promise<WebSessionResult> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null) {
      if ("status" in body && body.status === "authenticated") return { status: "authenticated" };
      if ("code" in body && typeof body.code === "string") {
        const codeToStatus: Record<string, Exclude<WebSessionResult["status"], "request_failed" | "authenticated">> = {
          UNAUTHENTICATED: "unauthenticated",
          EMAIL_NOT_VERIFIED: "email_unverified",
          REGISTRATION_REQUIRED: "registration_required",
          PROFILE_REQUIRED: "profile_required",
          ACCOUNT_UNAVAILABLE: "account_unavailable",
          INVALID_PROFILE: "invalid_profile",
          PROFILE_CONFLICT: "profile_conflict",
        };
        const status = codeToStatus[body.code];
        if (status) return { status };
      }
    }
  } catch {
    // Retour générique si le serveur ne fournit pas une réponse JSON valide.
  }
  return { status: "request_failed" };
}
