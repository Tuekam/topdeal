import { resolveCheckAuthRegistrationEligibilityUseCase } from "../../../../../di/container";
import { getAuthAppOrigin, isAllowedAuthMutation } from "../../../../../security/authRequest";
import { parseSessionRequest } from "../../session/sessionRequest";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function POST(request: Request): Promise<Response> {
  if (!isAllowedAuthMutation(request, getAuthAppOrigin())) {
    return Response.json({ code: "INVALID_AUTH_REQUEST" }, { status: 403, headers: noStoreHeaders });
  }

  const body = await parseSessionRequest(request);
  if (body.status === "too_large") {
    return Response.json({ code: "REQUEST_TOO_LARGE" }, { status: 413, headers: noStoreHeaders });
  }
  if (body.status !== "valid") {
    return Response.json({ code: "INVALID_REQUEST_BODY" }, { status: 400, headers: noStoreHeaders });
  }

  const result = await resolveCheckAuthRegistrationEligibilityUseCase().execute(body.identityToken);
  switch (result.status) {
    case "registration_eligible":
      return Response.json({ status: result.status }, { headers: noStoreHeaders });
    case "unauthenticated":
      return Response.json({ code: "UNAUTHENTICATED" }, { status: 401, headers: noStoreHeaders });
    case "email_unverified":
      return Response.json({ code: "EMAIL_NOT_VERIFIED" }, { status: 403, headers: noStoreHeaders });
    case "email_already_in_use":
      return Response.json({ code: "EMAIL_ALREADY_IN_USE" }, { status: 409, headers: noStoreHeaders });
  }
}
