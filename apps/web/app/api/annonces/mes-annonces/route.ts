import { resolveGetOwnedAnnoncesUseCase } from "../../../../di/container";
import { getVerifiedUserId } from "../../../../security/verifiedSession";
import { ANNONCE_API_ERROR_CODES as ERROR } from "../errorCodes";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request): Promise<Response> {
  const userId = await getVerifiedUserId();
  if (!userId) {
    return Response.json(
      { code: ERROR.UNAUTHENTICATED },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const cursor = new URL(request.url).searchParams.get("cursor");
  if (cursor !== null && !UUID_PATTERN.test(cursor)) {
    return Response.json(
      { code: ERROR.INVALID_CURSOR },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await resolveGetOwnedAnnoncesUseCase().execute(userId, cursor);
  return Response.json(result, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
