type AnnoncePaginationProps = {
  currentPage: number;
  previousPageHref: string | null;
  nextPageHref: string | null;
  label?: string;
};

export function AnnoncePagination({
  currentPage,
  previousPageHref,
  nextPageHref,
  label = "Pagination des annonces",
}: AnnoncePaginationProps) {
  if (!previousPageHref && !nextPageHref) return null;

  return (
    <nav aria-label={label} className="mt-10 flex min-w-0 items-center justify-between gap-2 border-t border-border pt-5">
      {previousPageHref ? (
        <a className="td-button td-button--secondary whitespace-nowrap max-[360px]:px-3 max-[360px]:text-xs" href={previousPageHref} rel="prev">
          Précédent
        </a>
      ) : <span />}
      <span aria-current="page" className="whitespace-nowrap text-center text-xs text-text-secondary sm:text-sm">Page {currentPage}</span>
      {nextPageHref ? (
        <a className="td-button td-button--secondary whitespace-nowrap max-[360px]:px-3 max-[360px]:text-xs" href={nextPageHref} rel="next">
          Suivant
        </a>
      ) : <span />}
    </nav>
  );
}
