export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-5 px-4 py-[22px] text-[13px] text-text-secondary sm:px-6">
        <div className="flex items-baseline gap-2">
          <strong className="text-base font-bold text-text">TopDeal</strong>
          <span>· Bafoussam Cameroun</span>
        </div>
        <nav aria-label="Informations" className="flex flex-wrap gap-x-[22px] gap-y-2">
          <a className="hover:text-text" href="#">Aide</a>
          <a className="hover:text-text" href="#">Contact</a>
          <a className="hover:text-text" href="#">Conditions d&apos;utilisation</a>
          <a className="hover:text-text" href="#">Confidentialité</a>
        </nav>
      </div>
    </footer>
  );
}
