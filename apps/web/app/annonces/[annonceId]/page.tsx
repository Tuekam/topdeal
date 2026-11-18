import { Suspense } from "react";
import { AnnonceDetailsContent } from "./AnnonceDetailsContent";

type PageProps = {
  params: Promise<{ annonceId: string }>;
  searchParams: Promise<{ affiliation?: string | string[] }>;
};

function AnnonceDetailsFallback() {
  return (
    <main
      aria-busy="true"
      className="mx-auto min-h-[60vh] w-full max-w-content px-4 py-10 text-sm text-text-secondary sm:px-6"
    >
      <p role="status">Chargement de l’annonce…</p>
    </main>
  );
}

export default function AnnonceDetailsPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<AnnonceDetailsFallback />}>
      <AnnonceDetailsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
