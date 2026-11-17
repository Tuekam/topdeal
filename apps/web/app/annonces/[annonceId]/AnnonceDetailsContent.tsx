import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnoncePhotoGallery } from "@topdeal/feature-annonce/presentation";
import { BackButton } from "@topdeal/ui";
import { resolveGetPublicAnnonceUseCase } from "../../../di/container";

type AnnonceDetailsContentProps = {
  params: Promise<{ annonceId: string }>;
};

function formatPrice(value: string): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatMemberSince(date: string): string {
  return new Intl.DateTimeFormat("fr-CM", { month: "long", year: "numeric" })
    .format(new Date(date));
}

export async function AnnonceDetailsContent({ params }: AnnonceDetailsContentProps) {
  const { annonceId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(annonceId)) {
    notFound();
  }

  const annonce = await resolveGetPublicAnnonceUseCase().execute(annonceId);
  if (!annonce) notFound();

  return (
    <main className="mx-auto w-full max-w-content bg-page px-4 py-6 pb-12 sm:px-6 sm:py-[30px] sm:pb-16">
      <BackButton className="mb-4 w-fit" href="/annonces">
        Retour aux annonces
      </BackButton>
      <nav aria-label="Fil d’Ariane" className="mb-6 flex flex-wrap items-center gap-2.5 text-sm text-text-secondary">
        <Link className="hover:text-text" href="/annonces">Accueil</Link>
        {annonce.categorie.parent && (
          <>
            <span aria-hidden="true" className="text-[#A39A91]">/</span>
            <Link className="hover:text-text" href={`/annonces?categorieId=${encodeURIComponent(annonce.categorie.parent.id)}`}>
              {annonce.categorie.parent.nom}
            </Link>
          </>
        )}
        <span aria-hidden="true" className="text-[#A39A91]">/</span>
        <Link className="hover:text-text" href={`/annonces?categorieId=${encodeURIComponent(annonce.categorie.id)}`}>
          {annonce.categorie.nom}
        </Link>
      </nav>

      <section aria-label="Fiche de l’annonce" className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-10">
        <div className="min-w-0">
          <AnnoncePhotoGallery annonceTitle={annonce.titre} photos={annonce.photos} />
        </div>

        <div className="min-w-0 pt-1">
          <h1 className="mb-3 break-words text-[26px] font-semibold leading-[1.25] tracking-tight text-text sm:text-[28px]">{annonce.titre}</h1>
          <p className="mb-[18px] text-[24px] font-semibold tracking-tight text-text sm:text-[25px]">{formatPrice(annonce.prix)}</p>
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-[6px] border border-border px-[9px] py-[5px] text-[13px] text-text-secondary">{annonce.etat === "NEUF" ? "Neuf" : "Occasion"}</span>
            <span className="rounded-[6px] border border-border px-[9px] py-[5px] text-[13px] text-text-secondary">Quantité : {annonce.quantite}</span>
          </div>
          <p className="mb-[22px] text-sm text-text-secondary">Bafoussam{annonce.quartier ? `, quartier ${annonce.quartier}` : ""}</p>

          <div className="border-t border-border pt-[18px]">
            <h2 className="mb-[9px] text-[17px] font-semibold text-text">Description</h2>
            <p className="whitespace-pre-wrap break-words leading-[1.7] text-[#514840]">
              {annonce.description || "Aucune description n’a été ajoutée."}
            </p>
          </div>

          <div className="mt-6 border-t border-border pt-[18px]">
            <p className="break-words font-semibold text-text">Vendu par {annonce.vendeur.nomComplet}</p>
            <p className="mt-[3px] text-[13px] text-text-secondary">Membre depuis {formatMemberSince(annonce.vendeur.dateCreation)}</p>
          </div>

          <div className="mt-[22px] flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button className="td-button td-button--primary h-11 min-h-11 w-full px-5 sm:w-auto sm:min-w-[150px]" disabled title="La messagerie sera disponible prochainement" type="button">Discuter</button>
            <button className="td-button td-button--secondary h-11 min-h-11 w-full px-5 sm:w-auto" disabled title="Les favoris seront disponibles prochainement" type="button">Ajouter aux favoris</button>
          </div>
        </div>
      </section>
    </main>
  );
}
