import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnonceFavoriteButton, AnnoncePhotoGallery } from "@topdeal/feature-annonce/presentation";
import { AnnonceAffiliateLinkButton } from "@topdeal/feature-affiliation/presentation";
import { BackButton } from "@topdeal/ui";
import { resolveGetAnnonceAffiliatePriceUseCase, resolveGetPublicAnnonceUseCase } from "../../../di/container";

type AnnonceDetailsContentProps = {
  params: Promise<{ annonceId: string }>;
  searchParams: Promise<{ affiliation?: string | string[] }>;
};

function formatPrice(value: string): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatMemberSince(date: string): string {
  return new Intl.DateTimeFormat("fr-CM", { month: "long", year: "numeric" })
    .format(new Date(date));
}

export async function AnnonceDetailsContent({ params, searchParams }: AnnonceDetailsContentProps) {
  const [{ annonceId }, query] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(annonceId)) {
    notFound();
  }

  const annonce = await resolveGetPublicAnnonceUseCase().execute(annonceId);
  if (!annonce) notFound();
  const affiliationCode = typeof query.affiliation === "string" ? query.affiliation : null;
  const hasAffiliateQuery = query.affiliation !== undefined;
  const affiliatePrice = affiliationCode
    ? await resolveGetAnnonceAffiliatePriceUseCase().execute(annonceId, affiliationCode)
    : null;

  return (
    <main className="mx-auto w-full max-w-content bg-page px-4 py-6 pb-12 sm:px-6 sm:py-[30px] sm:pb-16">
      {/* Retour fixe vers le catalogue public; ne pas revenir via l’historique privé de l’apporteur. */}
      <BackButton className="mb-4 w-fit" href="/annonces">
        Retour au catalogue
      </BackButton>
      <nav aria-label="Fil d’Ariane" className="mb-6 flex flex-wrap items-center gap-2.5 text-sm text-text-secondary">
        <Link className="hover:text-text" href="/annonces">Accueil</Link>
        {annonce.categorie.parent && (
          <>
            <span aria-hidden="true" className="text-text-secondary">/</span>
            <Link className="hover:text-text" href={`/annonces?categorieId=${encodeURIComponent(annonce.categorie.parent.id)}`}>
              {annonce.categorie.parent.nom}
            </Link>
          </>
        )}
        <span aria-hidden="true" className="text-text-secondary">/</span>
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
          <p className="mb-[18px] text-[24px] font-semibold tracking-tight text-text sm:text-[25px]">{formatPrice(affiliatePrice ?? annonce.prix)}</p>
          {affiliatePrice && <p className="-mt-3 mb-[18px] text-sm text-text-secondary">Prix final fixe via lien de revente</p>}
          {affiliationCode && !affiliatePrice && <p className="-mt-3 mb-[18px] text-sm text-text-secondary">Ce lien de revente n’est plus actif. Le prix habituel est affiché.</p>}
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-[6px] border border-border px-[9px] py-[5px] text-[13px] text-text-secondary">{annonce.etat === "NEUF" ? "Neuf" : "Occasion"}</span>
            <span className="rounded-[6px] border border-border px-[9px] py-[5px] text-[13px] text-text-secondary">Quantité : {annonce.quantite}</span>
          </div>
          <p className="mb-[22px] text-sm text-text-secondary">Bafoussam{annonce.quartier ? `, quartier ${annonce.quartier}` : ""}</p>

          <div className="border-t border-border pt-[18px]">
            <h2 className="mb-[9px] text-[17px] font-semibold text-text">Description</h2>
            <p className="whitespace-pre-wrap break-words leading-[1.7] text-text">
              {annonce.description || "Aucune description n’a été ajoutée."}
            </p>
          </div>

          <div className="mt-6 border-t border-border pt-[18px]">
            <p className="break-words font-semibold text-text">Vendu par {annonce.vendeur.nomComplet}</p>
            <p className="mt-[3px] text-[13px] text-text-secondary">Membre depuis {formatMemberSince(annonce.vendeur.dateCreation)}</p>
          </div>

          <div className="mt-[22px] flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button className="td-button td-button--primary h-11 min-h-11 w-full px-5 sm:w-auto sm:min-w-[150px]" disabled title="La messagerie sera disponible prochainement" type="button">Discuter</button>
            {annonce.affiliationDisponible && !hasAffiliateQuery && <AnnonceAffiliateLinkButton annonceId={annonce.id} />}
            <AnnonceFavoriteButton annonceId={annonce.id} annonceTitle={annonce.titre} presentation="button" />
          </div>
        </div>
      </section>
    </main>
  );
}
