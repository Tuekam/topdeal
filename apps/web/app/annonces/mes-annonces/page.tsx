import { redirect } from "next/navigation";
import { connection } from "next/server";
import { resolveGetOwnedAnnoncesUseCase } from "../../../di/container";
import { getVerifiedUserId } from "../../../security/verifiedSession";
import { OwnedAnnoncesPageClient } from "./OwnedAnnoncesPageClient";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getCursorHistory(value: string | string[] | undefined): string[] {
  const cursors = Array.isArray(value) ? value : value ? value.split(",") : [];
  return cursors.length <= 50 && cursors.every((value) => UUID_PATTERN.test(value)) ? cursors : [];
}

export default async function MyAnnoncesPage({ searchParams }: PageProps) {
  await connection();
  const userId = await getVerifiedUserId();
  if (!userId) redirect("/connexion");

  const params = await searchParams;
  const cursor = typeof params.cursor === "string" && UUID_PATTERN.test(params.cursor)
    ? params.cursor
    : null;
  const cursorHistory = getCursorHistory(params.cursorHistory);
  const result = await resolveGetOwnedAnnoncesUseCase().execute(userId, cursor);
  const currentPage = cursor ? cursorHistory.length + 2 : 1;
  const nextParams = new URLSearchParams();
  if (result.nextCursor) {
    nextParams.set("cursor", result.nextCursor);
    for (const historyCursor of [...cursorHistory, ...(cursor ? [cursor] : [])]) {
      nextParams.append("cursorHistory", historyCursor);
    }
  }
  const previousParams = new URLSearchParams();
  const previousCursor = cursorHistory.at(-1);
  if (previousCursor) {
    previousParams.set("cursor", previousCursor);
    for (const historyCursor of cursorHistory.slice(0, -1)) {
      previousParams.append("cursorHistory", historyCursor);
    }
  }

  return (
    <OwnedAnnoncesPageClient
      items={result.items}
      currentPage={currentPage}
      previousPageHref={cursor ? `/annonces/mes-annonces${previousParams.size ? `?${previousParams.toString()}` : ""}` : null}
      nextPageHref={result.nextCursor ? `/annonces/mes-annonces?${nextParams.toString()}` : null}
    />
  );
}
