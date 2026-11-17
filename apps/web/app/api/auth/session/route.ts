import { resolveCreateWebSessionUseCase } from "../../../../di/container";
import {
  getAuthAppOrigin,
  isAllowedAuthMutation,
} from "../../../../security/authRequest";
import { parseSessionRequest } from "./sessionRequest";
import {
  createAuthenticatedSessionResponse,
  createRejectedSessionResponse,
} from "./sessionResponse";

export async function POST(request: Request): Promise<Response> {
  if (!isAllowedAuthMutation(request, getAuthAppOrigin())) {
    return Response.json(
      { code: "INVALID_AUTH_REQUEST" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const body = await parseSessionRequest(request);

  if (body.status === "too_large") {
    return Response.json(
      { code: "REQUEST_TOO_LARGE" },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (body.status !== "valid") {
    return Response.json(
      { code: "INVALID_REQUEST_BODY" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const createWebSessionUseCase = resolveCreateWebSessionUseCase();
  const result = await createWebSessionUseCase.execute({
    identityToken: body.identityToken,
  });

  if (result.status !== "authenticated") {
    return createRejectedSessionResponse(result);
  }

  return createAuthenticatedSessionResponse(result.sessionCookie);
}
