import { resolveGetPublicAnnonceUseCase } from "../../../../di/container";
import { ANNONCE_API_ERROR_CODES as ERROR } from "../errorCodes";

type RouteContext = {
  params: Promise<{ annonceId: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { annonceId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(annonceId)) {
    return Response.json(
      { code: ERROR.ANNONCE_NOT_FOUND },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  const annonce = await resolveGetPublicAnnonceUseCase().execute(annonceId);

  if (!annonce) {
    return Response.json(
      { code: ERROR.ANNONCE_NOT_FOUND },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(annonce, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
