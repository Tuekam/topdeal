import { resolveGetOwnedAnnonceForEditUseCase, resolveUpdateAnnonceUseCase } from "../../../../../di/container";
import { getAuthAppOrigin, isAllowedAuthMutation } from "../../../../../security/authRequest";
import { getVerifiedUserForApi } from "../../../../../security/verifiedSession";
import { ANNONCE_API_ERROR_CODES as ERROR } from "../../errorCodes";

type RouteContext = {
  params: Promise<{ annonceId: string }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_REQUEST_SIZE_BYTES = 32 * 1024 * 1024;
const AFFILIATE_REWARD_PATTERN = /^[1-9]\d{0,9}$/;

function invalidRequest(code: string, status: number): Response {
  return Response.json({ code }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const verifiedUser = await getVerifiedUserForApi();
  if (verifiedUser.status !== "authenticated") return verifiedUser.response;
  const { userId } = verifiedUser;

  const { annonceId } = await context.params;
  if (!UUID_PATTERN.test(annonceId)) return invalidRequest(ERROR.ANNONCE_NOT_FOUND, 404);

  const annonce = await resolveGetOwnedAnnonceForEditUseCase().execute(annonceId, userId);
  if (!annonce) return invalidRequest(ERROR.ANNONCE_NOT_FOUND, 404);
  return Response.json(annonce, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  if (!isAllowedAuthMutation(request, getAuthAppOrigin(), ["multipart/form-data"], ["PATCH"])) {
    return invalidRequest(ERROR.INVALID_REQUEST, 403);
  }

  const verifiedUser = await getVerifiedUserForApi();
  if (verifiedUser.status !== "authenticated") return verifiedUser.response;
  const { userId } = verifiedUser;

  const { annonceId } = await context.params;
  if (!UUID_PATTERN.test(annonceId)) {
    return invalidRequest(ERROR.ANNONCE_NOT_FOUND, 404);
  }

  const length = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(length) || length <= 0) {
    return invalidRequest(ERROR.CONTENT_LENGTH_REQUIRED, 411);
  }
  if (length > MAX_REQUEST_SIZE_BYTES) return invalidRequest(ERROR.REQUEST_TOO_LARGE, 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return invalidRequest(ERROR.INVALID_MULTIPART_BODY, 400);
  }

  const text = (key: string): string | null => {
    const value = form.get(key);
    return typeof value === "string" ? value : null;
  };
  const titre = text("titre");
  const description = text("description");
  const etat = text("etat");
  const categorieId = text("categorieId");
  const prix = text("prix");
  const quantite = Number(text("quantite"));
  const quartier = text("quartier");
  const trocValue = text("trocAccepte");
  const affiliationValue = text("affiliationActive");
  const affiliationActive = affiliationValue === "true";
  const remunerationAffiliation = text("remunerationAffiliation") ?? "0";
  const categorieSouhaiteeId = text("categorieSouhaiteeId") || null;
  const souhaitEchangeDescription = text("souhaitEchangeDescription") || null;
  const retainedPhotoIds = form.getAll("retainedPhotoIds");
  const photoEntries = form.getAll("photos");

  if (
    titre === null || description === null ||
    (etat !== "NEUF" && etat !== "OCCASION") ||
    categorieId === null || prix === null || !Number.isSafeInteger(quantite) ||
    quartier === null || (trocValue !== "true" && trocValue !== "false") ||
    (affiliationValue !== null && affiliationValue !== "true" && affiliationValue !== "false") ||
    (affiliationActive && !AFFILIATE_REWARD_PATTERN.test(remunerationAffiliation)) ||
    !(categorieSouhaiteeId === null || UUID_PATTERN.test(categorieSouhaiteeId)) ||
    retainedPhotoIds.some((id) => typeof id !== "string" || !UUID_PATTERN.test(id)) ||
    photoEntries.some((entry) => !(entry instanceof File))
  ) return invalidRequest(ERROR.INVALID_REQUEST_BODY, 400);

  let photos;
  try {
    photos = await Promise.all(photoEntries.map(async (entry) => {
      const file = entry as File;
      return {
        originalName: (file.name.split(/[\\/]/).pop() ?? "photo").replace(/[\u0000-\u001f]/g, "").trim().slice(0, 255) || "photo",
        contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
        content: new Uint8Array(await file.arrayBuffer()),
      };
    }));
  } catch {
    return invalidRequest(ERROR.INVALID_MULTIPART_BODY, 400);
  }

  let result: "updated" | "invalid_input" | "not_found" | "locked";
  try {
    result = await resolveUpdateAnnonceUseCase().execute({
      annonceId,
      userId,
      titre,
      description,
      etat,
      categorieId,
      prix,
      quantite,
      quartier,
      trocAccepte: trocValue === "true",
      categorieSouhaiteeId,
      souhaitEchangeDescription,
      affiliationActive,
      remunerationAffiliation,
      retainedPhotoIds: retainedPhotoIds as string[],
      photos,
    });
  } catch (error) {
    const errorCode = typeof error === "object" && error !== null && "name" in error && typeof error.name === "string"
      ? error.name
      : "unknown";
    console.error("[TopDeal Annonce] Update failed", { errorCode });
    return invalidRequest(ERROR.ANNONCE_UPDATE_FAILED, 500);
  }
  if (result === "invalid_input") return invalidRequest(ERROR.INVALID_ANNONCE_UPDATE, 400);
  if (result === "not_found") return invalidRequest(ERROR.ANNONCE_NOT_FOUND, 404);
  if (result === "locked") return invalidRequest(ERROR.ANNONCE_UPDATE_LOCKED, 409);

  return Response.json({ status: "updated" }, { headers: { "Cache-Control": "no-store" } });
}
