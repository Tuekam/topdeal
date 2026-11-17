import type { ReactNode } from "react";
import { Suspense } from "react";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export default function AnnoncesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <main aria-busy="true" className="mx-auto min-h-[60vh] w-full max-w-content px-4 py-10 text-sm text-text-secondary sm:px-6">
            <p role="status">Chargement des annonces…</p>
          </main>
        }
      >
        {children}
      </Suspense>
      <SiteFooter />
    </>
  );
}
