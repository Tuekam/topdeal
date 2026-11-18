import { Suspense } from "react";
import { connection } from "next/server";
import { resolveGetActiveAnnonceCategoriesUseCase } from "../../../di/container";
import { CreateAnnoncePageClient } from "./CreateAnnoncePageClient";

export default function NewAnnoncePage() {
  return (
    <Suspense fallback={<main aria-busy="true" className="mx-auto min-h-[60vh] w-full max-w-content px-4 py-10 text-sm text-text-secondary sm:px-6"><p role="status">Chargement du formulaire…</p></main>}>
      <NewAnnonceContent />
    </Suspense>
  );
}

async function NewAnnonceContent() {
  await connection();
  const categories = await resolveGetActiveAnnonceCategoriesUseCase().execute();
  return <CreateAnnoncePageClient categories={categories} />;
}
