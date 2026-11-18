import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { AUTH_SESSION_COOKIE_NAME } from "../../security/sessionCookie";

async function SessionAwareSiteHeader() {
  const cookieStore = await cookies();
  return <SiteHeader isAuthenticated={Boolean(cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value)} />;
}

export default function AnnoncesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<SiteHeader isAuthenticated={null} />}>
        <SessionAwareSiteHeader />
      </Suspense>
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
