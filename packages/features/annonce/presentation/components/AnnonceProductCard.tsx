import type { ReactNode } from "react";

export type AnnonceProductCardItem = {
  id: string;
  titre: string;
  prix: string;
  etat: "NEUF" | "OCCASION";
  trocAccepte: boolean;
  quartier: string | null;
  photoUrl: string | null;
};

type AnnonceProductCardProps = {
  annonce: AnnonceProductCardItem;
  linkDisabled?: boolean;
  favoriteControl?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  imageActions?: ReactNode;
};

function formatPrice(value: string): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function AnnonceProductCard({ annonce, linkDisabled = false, favoriteControl, status, actions, imageActions }: AnnonceProductCardProps) {
  return (
    <article className="relative overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-input-border">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-image-tile">
        {annonce.photoUrl ? (
          <img alt={annonce.titre + ", photo du produit"} className="h-full w-full object-cover" height="240" loading="lazy" src={annonce.photoUrl} width="320" />
        ) : (
          <svg aria-hidden="true" className="text-text-secondary" fill="none" height="60" viewBox="0 0 64 64" width="60" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <rect height="40" rx="3" width="48" x="8" y="12" />
            <circle cx="22" cy="25" r="4" />
            <path d="m12 48 15-15 9 9 7-7 9 13" />
          </svg>
        )}
        {annonce.trocAccepte && <span className="pointer-events-none absolute left-3 top-3 z-[1] max-w-[calc(100%-24px)] truncate rounded-[6px] border border-border bg-surface px-[9px] py-[3px] text-xs font-medium text-text max-[440px]:left-1 max-[440px]:top-1 max-[440px]:max-w-[calc(100%-44px)] max-[440px]:px-1.5 max-[440px]:text-[10px]">Troc accepté</span>}
        {imageActions && <div className="absolute right-3 top-3 z-[2] flex items-center gap-2 max-[440px]:right-1 max-[440px]:top-1 max-[440px]:flex-col max-[440px]:gap-1">{imageActions}</div>}
        {status && <span className="pointer-events-none absolute bottom-3 left-3 z-[1] max-w-[calc(100%-24px)] truncate rounded-[6px] border border-border bg-surface px-[9px] py-[3px] text-xs font-medium text-text max-[440px]:bottom-1 max-[440px]:left-1 max-[440px]:max-w-[calc(100%-8px)] max-[440px]:px-1.5 max-[440px]:text-[10px]">{status}</span>}
        {favoriteControl}
      </div>
      <div className="p-3 sm:p-4">
        <div className="break-words tabular-nums text-base font-semibold tracking-tight text-text sm:text-lg">{formatPrice(annonce.prix)}</div>
        {linkDisabled ? (
          <span className="mt-0.5 block truncate text-[15px] text-text" title={annonce.titre}>{annonce.titre}</span>
        ) : (
          <a className="after:absolute after:inset-0 mt-0.5 block truncate text-[15px] text-text" href={"/annonces/" + annonce.id} title={annonce.titre}>{annonce.titre}</a>
        )}
        <div className="mt-2.5 flex min-w-0 items-center gap-2 text-xs text-text-secondary sm:gap-3.5 sm:text-[13px]">
          <span className="shrink-0">{annonce.etat === "NEUF" ? "Neuf" : "Occasion"}</span>
          <span className="flex min-w-0 items-center gap-1 truncate">
            <svg aria-hidden="true" className="shrink-0" fill="none" height="13" viewBox="0 0 24 24" width="13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
              <path d="M12 21s6-5.6 6-10a6 6 0 0 0-12 0c0 4.4 6 10 6 10Z" />
              <circle cx="12" cy="11" r="2" />
            </svg>
            {annonce.quartier ?? "Bafoussam"}
          </span>
        </div>
        {actions && <div className="relative z-[2] mt-3">{actions}</div>}
      </div>
    </article>
  );
}
