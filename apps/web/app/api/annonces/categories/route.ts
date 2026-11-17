import { resolveGetActiveAnnonceCategoriesUseCase } from "../../../../di/container";

export async function GET(): Promise<Response> {
  const categories = await resolveGetActiveAnnonceCategoriesUseCase().execute();
  return Response.json(categories, {
    headers: { "Cache-Control": "no-store" },
  });
}
