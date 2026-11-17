import { resolveUpdateAnnonceUseCase } from "../../../../../di/container";
import { getAuthAppOrigin, isAllowedAuthMutation } from "../../../../../security/authRequest";
import { getVerifiedUserId } from "../../../../../security/verifiedSession";
import { ANNONCE_API_ERROR_CODES as ERROR } from "../../errorCodes";

type RouteContext = {
  params: Promise<{ annonceId: string }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  if (!isAllowedAuthMutation(request, getAuthAppOrigin())) {
    return Response.json({ code: ERROR.INVALID_REQUEST }, { status: 403 });
  }

  const userId = await getVerifiedUserId();
  if (!userId) return Response.json({ code: ERROR.UNAUTHENTICATED }, { status: 401 });

  const { annonceId } = await context.params;
  if (!UUID_PATTERN.test(annonceId)) {
    return Response.json({ code: ERROR.ANNONCE_NOT_FOUND }, { status: 404 });
  }

  const length = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(length) || length <= 0 || length > 1024) {
    return Response.json({ code: ERROR.INVALID_REQUEST_BODY }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ code: ERROR.INVALID_REQUEST_BODY }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || !("prix" in body) || !("quantite" in body)) {
    return Response.json({ code: ERROR.INVALID_REQUEST_BODY }, { status: 400 });
  }

  const { prix, quantite } = body;
  if (typeof prix !== "string" || typeof quantite !== "number") {
    return Response.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  const result = await resolveUpdateAnnonceUseCase().execute({
    annonceId,
    userId,
    prix,
    quantite,
  });
  if (result === "invalid_input") {
    return Response.json({ code: ERROR.INVALID_ANNONCE_UPDATE }, { status: 400 });
  }
  if (result === "not_found") {
    return Response.json({ code: ERROR.ANNONCE_NOT_FOUND }, { status: 404 });
  }

  return Response.json({ status: "updated" }, { headers: { "Cache-Control": "no-store" } });
}
