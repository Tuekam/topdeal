import { resolveSetAnnonceFavoriteUseCase } from "../../../../../di/container";
import { getAuthAppOrigin, isAllowedAuthMutation } from "../../../../../security/authRequest";
import { getVerifiedUserForApi } from "../../../../../security/verifiedSession";
import { ANNONCE_API_ERROR_CODES as ERROR } from "../../errorCodes";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ annonceId: string }> };

export async function POST(request: Request, { params }: RouteContext): Promise<Response> {
  if (!isAllowedAuthMutation(request, getAuthAppOrigin())) {
    return Response.json({ code: ERROR.INVALID_REQUEST }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const verifiedUser = await getVerifiedUserForApi();
  if (verifiedUser.status !== "authenticated") return verifiedUser.response;
  const { userId } = verifiedUser;

  const { annonceId } = await params;
  if (!UUID_PATTERN.test(annonceId)) {
    return Response.json({ code: ERROR.INVALID_FAVORITE_REQUEST }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 1024) {
    return Response.json({ code: ERROR.INVALID_FAVORITE_REQUEST }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ code: ERROR.INVALID_FAVORITE_REQUEST }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (typeof body !== "object" || body === null || !("isFavorite" in body) || typeof body.isFavorite !== "boolean") {
    return Response.json({ code: ERROR.INVALID_FAVORITE_REQUEST }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const saved = await resolveSetAnnonceFavoriteUseCase().execute(userId, annonceId, body.isFavorite);
  if (body.isFavorite && !saved) {
    return Response.json({ code: ERROR.FAVORITE_ANNONCE_UNAVAILABLE }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json({ isFavorite: saved }, { headers: { "Cache-Control": "private, no-store" } });
}
