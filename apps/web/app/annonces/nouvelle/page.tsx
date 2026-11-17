import { resolveGetActiveAnnonceCategoriesUseCase } from "../../../di/container";
import { CreateAnnoncePageClient } from "./CreateAnnoncePageClient";

export default async function NewAnnoncePage() {
  const categories = await resolveGetActiveAnnonceCategoriesUseCase().execute();
  return <CreateAnnoncePageClient categories={categories} />;
}
