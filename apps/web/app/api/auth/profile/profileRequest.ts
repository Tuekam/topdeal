import { isBoundedString, readAuthJsonBody } from "../requestBody";

export type ProfileRequestResult =
  | {
      status: "valid";
      identityToken: string;
      givenName: string;
      familyName: string;
      telephone: string;
      birthDate: string;
    }
  | { status: "invalid" }
  | { status: "too_large" };

export async function parseProfileRequest(request: Request): Promise<ProfileRequestResult> {
  const body = await readAuthJsonBody(request);
  if (body.status === "too_large") return body;
  if (body.status !== "valid" || typeof body.value !== "object" || body.value === null || Array.isArray(body.value)) {
    return { status: "invalid" };
  }

  const value = body.value as Record<string, unknown>;
  const expectedKeys = ["identityToken", "givenName", "familyName", "telephone", "birthDate"];
  if (Object.keys(value).length !== expectedKeys.length || expectedKeys.some((key) => !(key in value))) {
    return { status: "invalid" };
  }

  if (
    !isBoundedString(value.identityToken) || !isBoundedString(value.givenName, 100) ||
    !isBoundedString(value.familyName, 100) || !isBoundedString(value.telephone, 30) ||
    !isBoundedString(value.birthDate, 10)
  ) return { status: "invalid" };

  return {
    status: "valid",
    identityToken: value.identityToken,
    givenName: value.givenName,
    familyName: value.familyName,
    telephone: value.telephone,
    birthDate: value.birthDate,
  };
}
