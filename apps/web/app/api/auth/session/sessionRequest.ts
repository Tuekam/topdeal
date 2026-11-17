import { isBoundedString, readAuthJsonBody } from "../requestBody";

type SessionRequestResult =
  | { status: "valid"; identityToken: string }
  | { status: "invalid" }
  | { status: "too_large" };

function getIdentityToken(value: unknown): string | null {
  if (
    typeof value !== "object" || value === null || Array.isArray(value) ||
    !("identityToken" in value) || Object.keys(value).length !== 1
  ) return null;

  return isBoundedString(value.identityToken) ? value.identityToken : null;
}

export async function parseSessionRequest(request: Request): Promise<SessionRequestResult> {
  const body = await readAuthJsonBody(request);
  if (body.status === "too_large") return body;
  const identityToken = body.status === "valid" ? getIdentityToken(body.value) : null;
  return identityToken ? { status: "valid", identityToken } : { status: "invalid" };
}
