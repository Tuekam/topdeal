import { resolveCompleteAuthProfileUseCase } from "../../../../di/container";
import { getAuthAppOrigin, isAllowedAuthMutation } from "../../../../security/authRequest";
import { parseProfileRequest } from "./profileRequest";
import { createAuthenticatedSessionResponse } from "../session/sessionResponse";

export async function POST(request: Request): Promise<Response> {
  if (!isAllowedAuthMutation(request, getAuthAppOrigin())) {
    return Response.json({ code: "INVALID_AUTH_REQUEST" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const body = await parseProfileRequest(request);
  if (body.status === "too_large") {
    return Response.json({ code: "REQUEST_TOO_LARGE" }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }
  if (body.status !== "valid") {
    return Response.json({ code: "INVALID_REQUEST_BODY" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const result = await resolveCompleteAuthProfileUseCase().execute({
    identityToken: body.identityToken,
    givenName: body.givenName,
    familyName: body.familyName,
    telephone: body.telephone,
    birthDate: body.birthDate,
  });

  switch (result.status) {
    case "authenticated":
      return createAuthenticatedSessionResponse(result.sessionCookie);
    case "unauthenticated":
      return Response.json({ code: "UNAUTHENTICATED" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    case "email_unverified":
      return Response.json({ code: "EMAIL_NOT_VERIFIED" }, { status: 403, headers: { "Cache-Control": "no-store" } });
    case "invalid_profile":
      return Response.json({ code: "INVALID_PROFILE" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    case "profile_conflict":
      return Response.json({ code: "PROFILE_CONFLICT" }, { status: 409, headers: { "Cache-Control": "no-store" } });
  }
}
