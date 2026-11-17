import type {
  CompleteProfileData,
  RegistrationEligibilityResult,
  WebSessionGateway,
  WebSessionResult,
} from "../../core/repositories/WebSessionGateway";

const AUTH_ERROR_CODE_TO_STATUS = {
  UNAUTHENTICATED: "unauthenticated",
  EMAIL_NOT_VERIFIED: "email_unverified",
  EMAIL_ALREADY_IN_USE: "email_already_in_use",
  REGISTRATION_REQUIRED: "registration_required",
  PROFILE_REQUIRED: "profile_required",
  ACCOUNT_UNAVAILABLE: "account_unavailable",
  INVALID_PROFILE: "invalid_profile",
  PROFILE_CONFLICT: "profile_conflict",
} as const;

type AuthErrorStatus = (typeof AUTH_ERROR_CODE_TO_STATUS)[keyof typeof AUTH_ERROR_CODE_TO_STATUS];

export class FetchWebSessionGateway implements WebSessionGateway {
  async create(identityToken: string): Promise<WebSessionResult> {
    const response = await postAuthJson("/api/auth/session", { identityToken });
    return response ? readAuthResponse(response) : { status: "request_failed" };
  }

  async completeProfile(
    identityToken: string,
    profile: CompleteProfileData,
  ): Promise<WebSessionResult> {
    const response = await postAuthJson("/api/auth/profile", { identityToken, ...profile });
    return response ? readAuthResponse(response) : { status: "request_failed" };
  }

  async checkRegistrationEligibility(
    identityToken: string,
  ): Promise<RegistrationEligibilityResult> {
    const response = await postAuthJson("/api/auth/registration/eligibility", { identityToken });
    if (!response) return { status: "request_failed" };

    const body = await readResponseBody(response);
    if (isRecord(body) && body.status === "registration_eligible") {
      return { status: "registration_eligible" };
    }

    const status = getAuthErrorStatus(body);
    if (
      status === "unauthenticated" ||
      status === "email_unverified" ||
      status === "email_already_in_use"
    ) {
      return { status };
    }

    return { status: "request_failed" };
  }
}

async function postAuthJson(path: string, body: unknown): Promise<Response | null> {
  try {
    return await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-Topdeal-Request": "1",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getAuthErrorStatus(body: unknown): AuthErrorStatus | null {
  if (!isRecord(body) || typeof body.code !== "string") return null;
  if (!Object.prototype.hasOwnProperty.call(AUTH_ERROR_CODE_TO_STATUS, body.code)) return null;
  return AUTH_ERROR_CODE_TO_STATUS[body.code as keyof typeof AUTH_ERROR_CODE_TO_STATUS];
}

async function readAuthResponse(response: Response): Promise<WebSessionResult> {
  const body = await readResponseBody(response);
  if (isRecord(body) && body.status === "authenticated") return { status: "authenticated" };

  const status = getAuthErrorStatus(body);
  if (status && status !== "email_already_in_use") return { status };
  return { status: "request_failed" };
}
