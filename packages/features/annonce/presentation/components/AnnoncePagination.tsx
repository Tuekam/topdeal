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
    <nav aria-label={label} className="mt-10 flex items-center justify-between border-t border-border pt-5">
      {previousPageHref ? (
        <a className="td-button td-button--secondary" href={previousPageHref} rel="prev">
          Précédent
        </a>
      ) : <span />}
      <span aria-current="page" className="text-sm text-text-secondary">Page {currentPage}</span>
      {nextPageHref ? (
        <a className="td-button td-button--secondary" href={nextPageHref} rel="next">
          Suivant
        </a>
      ) : <span />}
    </nav>
  );
}
