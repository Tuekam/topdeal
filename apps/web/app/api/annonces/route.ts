import {
  resolveCreateAnnonceUseCase,
  resolveSearchAnnoncesUseCase,
} from "../../../di/container";
import type { CreateAnnonceInput } from "@topdeal/feature-annonce/core";
import { getAuthAppOrigin, isAllowedAuthMutation } from "../../../security/authRequest";
import { getVerifiedUserId } from "../../../security/verifiedSession";
import { ANNONCE_API_ERROR_CODES as ERROR } from "./errorCodes";

const MAX_REQUEST_SIZE_BYTES = 32 * 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;

function invalidRequest(code: string, status: number): Response {
  return Response.json({ code }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function sanitizeOriginalName(name: string): string {
  return (name.split(/[\\/]/).pop() ?? "photo")
    .replace(/[\u0000-\u001f]/g, "")
    .trim()
    .slice(0, 255) || "photo";
}

function getRequiredText(form: FormData, key: string): string | null {
  const value = form.get(key);
  return typeof value === "string" ? value : null;
}

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams;
  const etatValue = query.get("etat");
  const trocValue = query.get("trocAccepte");
  const categorieId = query.get("categorieId");
  const cursor = query.get("cursor");
  const prixMin = query.get("prixMin");
  const prixMax = query.get("prixMax");
  const queryText = (query.get("q") ?? "").trim();
  const quartier = query.get("quartier")?.trim() || null;

  if (
    (etatValue !== null && etatValue !== "NEUF" && etatValue !== "OCCASION") ||
    (trocValue !== null && trocValue !== "true" && trocValue !== "false") ||
    (categorieId !== null && !UUID_PATTERN.test(categorieId)) ||
    (cursor !== null && !UUID_PATTERN.test(cursor)) ||
    (prixMin !== null && !PRICE_PATTERN.test(prixMin)) ||
    (prixMax !== null && !PRICE_PATTERN.test(prixMax)) ||
    (prixMin !== null && prixMax !== null && Number(prixMin) > Number(prixMax)) ||
    (quartier !== null && quartier.length > 150) ||
    queryText.length > 200
  ) {
    return invalidRequest(ERROR.INVALID_SEARCH_FILTER, 400);
  }

  const result = await resolveSearchAnnoncesUseCase().execute({
    query: queryText,
    categorieId,
    etat: etatValue === "NEUF" || etatValue === "OCCASION" ? etatValue : null,
    prixMin,
    prixMax,
    quartier,
    trocAccepte: trocValue === null ? null : trocValue === "true",
    cursor,
  });

  return Response.json(result, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!isAllowedAuthMutation(request, getAuthAppOrigin(), ["multipart/form-data"])) {
    return invalidRequest(ERROR.INVALID_REQUEST, 403);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(contentLength) || contentLength <= 0) {
    return invalidRequest(ERROR.CONTENT_LENGTH_REQUIRED, 411);
  }
  if (contentLength > MAX_REQUEST_SIZE_BYTES) {
    return invalidRequest(ERROR.REQUEST_TOO_LARGE, 413);
  }

  const userId = await getVerifiedUserId();
  if (!userId) return invalidRequest(ERROR.UNAUTHENTICATED, 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return invalidRequest(ERROR.INVALID_MULTIPART_BODY, 400);
  }

  const titre = getRequiredText(form, "titre");
  const description = getRequiredText(form, "description");
  const etat = getRequiredText(form, "etat");
  const prix = getRequiredText(form, "prix");
  const quantite = Number(getRequiredText(form, "quantite"));
  const quartier = getRequiredText(form, "quartier");
  const categorieId = getRequiredText(form, "categorieId");
  const categorieSouhaiteeId = getRequiredText(form, "categorieSouhaiteeId") || null;
  const souhaitEchangeDescription =
    getRequiredText(form, "souhaitEchangeDescription") || null;
  const trocAccepte = getRequiredText(form, "trocAccepte") === "true";
  const photoEntries = form.getAll("photos");

  if (
    titre === null || description === null ||
    (etat !== "NEUF" && etat !== "OCCASION") || prix === null ||
    quartier === null || categorieId === null ||
    !Number.isSafeInteger(quantite) ||
    photoEntries.some((entry) => !(entry instanceof File))
  ) {
    return invalidRequest(ERROR.INVALID_REQUEST_BODY, 400);
  }
  if (
    !UUID_PATTERN.test(categorieId) ||
    (categorieSouhaiteeId !== null && !UUID_PATTERN.test(categorieSouhaiteeId))
  ) {
    return invalidRequest(ERROR.INVALID_REQUEST_BODY, 400);
  }

  let photos: CreateAnnonceInput["photos"];
  try {
    photos = await Promise.all(
      photoEntries.map(async (entry) => {
        const file = entry as File;
        return {
          originalName: sanitizeOriginalName(file.name),
          contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
          content: new Uint8Array(await file.arrayBuffer()),
        };
      }),
    );
  } catch {
    return invalidRequest(ERROR.INVALID_MULTIPART_BODY, 400);
  }

  const input: CreateAnnonceInput = {
    titre,
    description,
    etat,
    prix,
    quantite,
    quartier,
    categorieId,
    categorieSouhaiteeId,
    souhaitEchangeDescription,
    trocAccepte,
    photos,
  };

  try {
    const result = await resolveCreateAnnonceUseCase().execute(userId, input);
    if (result.status === "invalid_input") {
      return invalidRequest(ERROR.INVALID_ANNONCE, 400);
    }

    return Response.json(
      { id: result.annonceId },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const errorCode =
      typeof error === "object" && error !== null && "name" in error &&
      typeof error.name === "string"
        ? error.name
        : "unknown";
    console.error("[TopDeal Annonce] Creation failed", { errorCode });
    return invalidRequest(ERROR.ANNONCE_CREATION_FAILED, 500);
  }
}
