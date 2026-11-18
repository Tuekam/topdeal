import {
  resolveGetAnnonceFavoriteIdsUseCase,
  resolveGetFavoriteAnnoncesUseCase,
} from "../../../../di/container";
import { getVerifiedUserForApi } from "../../../../security/verifiedSession";
import { ANNONCE_API_ERROR_CODES as ERROR } from "../errorCodes";
import { DEFAULT_ANNONCE_SORT, isAnnonceSort } from "@topdeal/feature-annonce/core";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;

export async function GET(request: Request): Promise<Response> {
  const verifiedUser = await getVerifiedUserForApi();
  if (verifiedUser.status !== "authenticated") return verifiedUser.response;
  const { userId } = verifiedUser;

  const query = new URL(request.url).searchParams;
  const idsValue = query.get("ids");
  if (idsValue !== null) {
    const ids = idsValue ? idsValue.split(",") : [];
    if (ids.length > 24 || ids.some((id) => !UUID_PATTERN.test(id))) {
      return Response.json({ code: ERROR.INVALID_FAVORITE_REQUEST }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const favoriteIds = await resolveGetAnnonceFavoriteIdsUseCase().execute(userId, ids);
    return Response.json({ favoriteIds }, { headers: { "Cache-Control": "private, no-store" } });
  }

  const cursor = query.get("cursor");
  const sort = query.get("sort");
  const searchText = (query.get("q") ?? "").trim();
  const etat = query.get("etat");
  const troc = query.get("trocAccepte");
  const categorieId = query.get("categorieId");
  const prixMin = query.get("prixMin");
  const prixMax = query.get("prixMax");
  const quartier = query.get("quartier")?.trim() || null;
  if (cursor !== null && !UUID_PATTERN.test(cursor)) {
    return Response.json({ code: ERROR.INVALID_CURSOR }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (searchText.length > 200 ||
    (sort !== null && !isAnnonceSort(sort)) ||
    (etat !== null && etat !== "NEUF" && etat !== "OCCASION") ||
    (troc !== null && troc !== "true" && troc !== "false") ||
    (categorieId !== null && !UUID_PATTERN.test(categorieId)) ||
    (prixMin !== null && !PRICE_PATTERN.test(prixMin)) ||
    (prixMax !== null && !PRICE_PATTERN.test(prixMax)) ||
    (prixMin !== null && prixMax !== null && Number(prixMin) > Number(prixMax)) ||
    (quartier !== null && quartier.length > 150)) {
    return Response.json({ code: ERROR.INVALID_FAVORITE_REQUEST }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const page = await resolveGetFavoriteAnnoncesUseCase().execute(userId, {
    query: searchText,
    categorieId,
    etat: etat === "NEUF" || etat === "OCCASION" ? etat : null,
    prixMin,
    prixMax,
    quartier,
    trocAccepte: troc === null ? null : troc === "true",
    sort: isAnnonceSort(sort) ? sort : DEFAULT_ANNONCE_SORT,
  }, cursor);
  return Response.json(page, { headers: { "Cache-Control": "private, no-store" } });
}
