"use client";

import { useRouter } from "next/navigation";
import { CreateAnnonceScreen } from "@topdeal/feature-annonce/presentation";
import type { AnnonceCategory } from "@topdeal/feature-annonce/core";

type CreateAnnoncePageClientProps = {
  categories: AnnonceCategory[];
};

export function CreateAnnoncePageClient({ categories }: CreateAnnoncePageClientProps) {
  const router = useRouter();
  return (
    <CreateAnnonceScreen
      categories={categories}
      onCancel={() => router.push("/annonces")}
      onCreated={(annonceId) => router.push(`/annonces/${annonceId}`)}
    />
  );
}
