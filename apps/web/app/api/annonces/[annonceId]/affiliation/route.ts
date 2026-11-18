import { resolveCreateAnnonceAffiliateLinkUseCase } from "../../../../../di/container";
import { getAuthAppOrigin, isAllowedAuthMutation } from "../../../../../security/authRequest";
import { getVerifiedUserForApi } from "../../../../../security/verifiedSession";
import { ANNONCE_API_ERROR_CODES as ERROR } from "../../errorCodes";

type RouteContext = { params: Promise<{ annonceId: string }> };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  if (!isAllowedAuthMutation(request, getAuthAppOrigin())) {
    return Response.json({ code: ERROR.INVALID_REQUEST }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const verifiedUser = await getVerifiedUserForApi();
  if (verifiedUser.status !== "authenticated") return verifiedUser.response;

  const { annonceId } = await context.params;
  if (!UUID_PATTERN.test(annonceId)) {
    return Response.json({ code: ERROR.ANNONCE_NOT_FOUND }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const code = await resolveCreateAnnonceAffiliateLinkUseCase().execute(annonceId, verifiedUser.userId);
    if (!code) {
      return Response.json({ code: ERROR.AFFILIATE_LINK_UNAVAILABLE }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    return Response.json({ code }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const errorCode = typeof error === "object" && error !== null && "name" in error && typeof error.name === "string"
      ? error.name
      : "unknown";
    console.error("[TopDeal Affiliate] Link creation failed", { errorCode });
    return Response.json({ code: ERROR.AFFILIATE_LINK_FAILED }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
